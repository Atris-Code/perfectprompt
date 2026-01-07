import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import type { Chat, GenerateContentResponse } from "@google/genai";
import type {
    CharacterProfile,
    View,
    Task,
    StyleDefinition,
    ChatMessage,
    FinalOptimizationPackage,
    GovernanceHandoffPackage,
    OptimizationChallengePackage
} from '../types';
import { FinancialSimulator, FinancialParams, FinancialResults } from './tools/FinancialSimulator';
import { ChatPanel } from './ChatPanel';
import { delegateToAssistant } from '../services/geminiService';

// Financial Math Helpers
const calculateIRR = (cashFlows: number[], initialGuess = 0.1, iterations = 100): number => {
    let irr = initialGuess;
    for (let i = 0; i < iterations; i++) {
        let npv = 0;
        let derivative = 0;
        for (let t = 0; t < cashFlows.length; t++) {
            npv += cashFlows[t] / Math.pow(1 + irr, t);
            if (t > 0) {
                derivative -= t * cashFlows[t] / Math.pow(1 + irr, t + 1);
            }
        }
        if (Math.abs(npv) < 1e-6) return irr;
        if (derivative === 0) break;
        irr = irr - npv / derivative;
    }
    return irr;
};

const calculateNPV = (cashFlows: number[], discountRate: number): number => {
    let npv = 0;
    for (let t = 0; t < cashFlows.length; t++) {
        npv += cashFlows[t] / Math.pow(1 + discountRate, t);
    }
    return npv;
};

const getRandomValue = (base: number, uncertainty: number) => {
    const factor = (Math.random() * 2 - 1) * (uncertainty / 100);
    return base * (1 + factor);
};

const runFinancialMonteCarlo = (params: FinancialParams): FinancialResults => {
    const COST_OF_CAPITAL = 0.12;
    const MONTE_CARLO_RUNS = 1000;
    const tirResults: number[] = [];
    const vpnResults: number[] = [];
    const paybackResults: number[] = [];

    const initialInvestment = -params.capitalToRaise;

    for (let i = 0; i < MONTE_CARLO_RUNS; i++) {
        const currentAssetValue = getRandomValue(params.assetValue, params.assetValueUncertainty);
        const currentProductionCosts = getRandomValue(params.productionCosts, params.productionCostsUncertainty);

        const annualRevenue = currentAssetValue / params.projectYears;
        const annualCosts = currentProductionCosts / params.projectYears;
        const annualCashFlow = annualRevenue - annualCosts;

        if (annualCashFlow > 0) {
            const cashFlows = [initialInvestment, ...Array(params.projectYears).fill(annualCashFlow)];
            vpnResults.push(calculateNPV(cashFlows, COST_OF_CAPITAL));
            tirResults.push(calculateIRR(cashFlows));
            paybackResults.push(-initialInvestment / annualCashFlow);
        } else {
            vpnResults.push(initialInvestment);
            tirResults.push(-1);
            paybackResults.push(Infinity);
        }
    }

    const avgTir = tirResults.reduce((a, b) => a + b, 0) / tirResults.length;
    const avgVpn = vpnResults.reduce((a, b) => a + b, 0) / vpnResults.length;
    const finitePaybacks = paybackResults.filter(p => isFinite(p));
    const avgPayback = finitePaybacks.length > 0 ? finitePaybacks.reduce((a, b) => a + b, 0) / finitePaybacks.length : Infinity;
    const profitability = (tirResults.filter(tir => tir > COST_OF_CAPITAL).length / tirResults.length) * 100;

    return { avgVpn, avgTir, avgPayback, profitability };
};

interface KairosWorkstationProps {
    titan: CharacterProfile;
    onBack: () => void;
    onSaveTask: (task: Task) => void;
    knowledgeSources: { name: string; content: string }[];
    onNavigateToGovernance: (data: GovernanceHandoffPackage) => void;
    onNavigateToOptimization: (data: OptimizationChallengePackage) => void;
    initialData?: FinalOptimizationPackage; // Data coming from Hefesto
}

export const KairosWorkstation: React.FC<KairosWorkstationProps> = ({ 
    titan, 
    onBack, 
    onNavigateToGovernance, 
    onNavigateToOptimization,
    initialData,
    knowledgeSources
}) => {
    const [params, setParams] = useState<FinancialParams>({
        projectName: 'Nuevo Proyecto STO',
        projectYears: 5,
        assetValue: 300000,
        assetValueUncertainty: 20,
        capitalToRaise: 100000,
        productionCosts: 160000,
        productionCostsUncertainty: 15,
    });

    // Initialize with data from Hefesto if available
    useEffect(() => {
        if (initialData) {
            // Heuristic mapping: 
            // Bio-oil yield -> Asset Value (higher yield = higher value)
            // Temperature/Energy -> Production Costs
            const baseValue = 300000 * (initialData.optimizationDetails.yieldBioOil / 50); // Normalize around 50% yield
            const baseCost = 160000 * (initialData.optimizationDetails.temperature / 500); // Normalize around 500C

            setParams(prev => ({
                ...prev,
                projectName: `Análisis de Optimización ${initialData.handoffId.split('-')[2]}`,
                assetValue: Math.round(baseValue),
                productionCosts: Math.round(baseCost),
                // Inherit uncertainty from Hefesto's temp uncertainty?
                productionCostsUncertainty: initialData.optimizationDetails.uncertainty * 2 
            }));
        }
    }, [initialData]);

    const [result, setResult] = useState<FinancialResults | null>(null);
    const [isSimulating, setIsSimulating] = useState(false);

    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isAgentReplying, setIsAgentReplying] = useState(false);
    const chatSessionRef = useRef<Chat | null>(null);

    // Initialize Chat
    useEffect(() => {
        const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
        
        let systemPrompt = titan.system_prompt;
        if (titan.assistants && titan.assistants.length > 0) {
            const assistantsList = titan.assistants.filter(a => a.is_active).map(a => `- ${a.name}: ${a.role_prompt.substring(0, 150)}...`).join('\n');
            systemPrompt += `\n\nTIENES ACCESO A LOS SIGUIENTES ASISTENTES ESPECIALIZADOS:\n${assistantsList}\n\nSi una tarea requiere conocimiento específico de uno de estos asistentes, PUEDES DELEGARLA. Para hacerlo, responde con un JSON que incluya 'accion_ui' con tipo 'DELEGAR_TAREA' y payload { asistente_nombre: string, tarea: string }.`;
        }

        chatSessionRef.current = ai.chats.create({
            model: 'gemini-2.5-pro',
            config: { systemInstruction: systemPrompt },
        });

        const initMsg = initialData 
            ? `He recibido un paquete de optimización de Hefesto (Yield: ${initialData.optimizationDetails.yieldBioOil.toFixed(1)}%). He precargado los datos financieros estimados. ¿Ejecutamos la auditoría?`
            : `Estación de Auditoría de Kairos lista. Configura las variables financieras o pídeme que lo haga.`;

        setChatHistory([{
            id: 'init',
            role: 'model',
            text: initMsg
        }]);
    }, [titan, initialData]);

    // Handoff Logic
    useEffect(() => {
        if (!result) return;
        
        const lastMessage = chatHistory[chatHistory.length - 1];
        const hasActionMessage = chatHistory.some(m => m.isAction && !m.actionsDisabled); // Only if active actions exist

        // If result is highly profitable -> Suggest Governance
        if (result.profitability > 80 && lastMessage?.role === 'model' && !hasActionMessage) {
             const actionMessage: ChatMessage = {
                id: `action-success-${Date.now()}`,
                role: 'system',
                text: '🚀 **Alta Viabilidad Detectada**. El proyecto supera los umbrales de riesgo.',
                isAction: true,
                actions: [
                    { id: 'send_to_governance', label: '🏛️ Elevar a Gobernanza para Aprobación' }
                ],
                actionsDisabled: false,
            };
            setChatHistory(prev => [...prev, actionMessage]);
        }
        // If result is poor -> Suggest Optimization (Back to Hefesto)
        else if (result.profitability < 40 && lastMessage?.role === 'model' && !hasActionMessage) {
             const actionMessage: ChatMessage = {
                id: `action-fail-${Date.now()}`,
                role: 'system',
                text: '⚠️ **Viabilidad Crítica**. El riesgo es demasiado alto con la configuración actual.',
                isAction: true,
                actions: [
                    { id: 'send_to_optimization', label: '🔄 Solicitar Re-Optimización a Hefesto (M3)' }
                ],
                actionsDisabled: false,
            };
            setChatHistory(prev => [...prev, actionMessage]);
        }

    }, [result, chatHistory]);

    const handleActionClick = async (actionId: string, messageId: string) => {
        setChatHistory(prev => prev.map(msg => msg.id === messageId ? { ...msg, actionsDisabled: true } : msg));

        if (actionId.startsWith('delegate_')) {
            const [_, assistantName] = actionId.split('delegate_');
            const originalMessage = chatHistory.find(m => m.id === messageId);
            const assistant = titan.assistants?.find(a => a.name === assistantName);
            if (!assistant) return;

            const taskDescriptionMatch = originalMessage?.text.match(/Tarea: "(.*?)"/);
            const taskDescription = taskDescriptionMatch ? taskDescriptionMatch[1] : "Tarea delegada";

            const loadingMsg: ChatMessage = { id: `delegating-${Date.now()}`, role: 'system', text: `⏳ Delegando tarea a ${assistantName}...`, isSystem: true };
            setChatHistory(prev => [...prev, loadingMsg]);

            try {
                const responseText = await delegateToAssistant(taskDescription, assistant, knowledgeSources || []);
                
                const resultMsg: ChatMessage = { 
                    id: `result-${Date.now()}`, 
                    role: 'model', 
                    text: `✅ **Informe de ${assistantName}:**\n\n${responseText}\n\n---\n*Kairos está evaluando este informe...*` 
                };
                setChatHistory(prev => [...prev, resultMsg]);

                if (chatSessionRef.current) {
                    const feedbackPrompt = `SYSTEM_ACTION: El asistente ${assistantName} ha respondido: "${responseText}". Integra esto en tu análisis.`;
                    const finalResponse = await chatSessionRef.current.sendMessage({ message: feedbackPrompt });
                    const finalMsg: ChatMessage = { id: `kairos-final-${Date.now()}`, role: 'model', text: finalResponse.text };
                    setChatHistory(prev => [...prev, finalMsg]);
                }

            } catch (error) {
                const errorMsg: ChatMessage = { id: `err-${Date.now()}`, role: 'system', text: "❌ Error en la delegación.", isSystem: true };
                setChatHistory(prev => [...prev, errorMsg]);
            }
            return;
        }

        if (actionId === 'send_to_governance') {
            const governancePackage: GovernanceHandoffPackage = {
                handoffId: `m5-m6-${Date.now()}`,
                timestamp: new Date().toISOString(),
                sourceModule: 'M5_Kairos_Auditor',
                destinationModule: 'M6_Governance_Debate',
                triggeringEvent: {
                    title: `Auditoría Aprobada: ${params.projectName}`,
                    summary: `Kairos ha validado la viabilidad financiera del proyecto con una probabilidad de éxito del ${result?.profitability.toFixed(1)}%.`
                },
                simulationInputs: {
                    projectParams: [
                        { label: 'Valor Activo', value: params.assetValue },
                        { label: 'Costes', value: params.productionCosts },
                        { label: 'Capital', value: params.capitalToRaise },
                    ]
                },
                simulationResults: {
                    kpis: [
                        { label: 'TIR Promedio', value: (result?.avgTir || 0) * 100, unit: '%' },
                        { label: 'Probabilidad Éxito', value: result?.profitability || 0, unit: '%' }
                    ]
                },
                debateProposal: {
                    suggestedTitle: `Ratificación de Proyecto: ${params.projectName}`,
                    suggestedInstructions: `El proyecto ha pasado la auditoría de riesgos. Se requiere aprobación final de los Titanes para proceder a la emisión de STOs.`,
                    suggestedRoles: {
                        mainProponent: { name: 'Kairos', rationale: 'Defender la solidez financiera del proyecto.' },
                        criticalOpponent: { name: 'Themis', rationale: 'Verificar el cumplimiento regulatorio de la emisión.' },
                        moderator: { name: 'Janus', rationale: 'Coordinar la decisión final.' }
                    }
                },
                technicalProof: {
                    handoffId: `proof-${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    sourceModule: 'M5',
                    destinationModule: 'M6',
                    optimizationDetails: { ...params, yieldBioOil: 0 }, // Placeholder
                    contextualChatHistory: ''
                }
            };
            onNavigateToGovernance(governancePackage);
        } else if (actionId === 'send_to_optimization') {
            const challenge: OptimizationChallengePackage = {
                handoffId: `m5-m3-${Date.now()}`,
                timestamp: new Date().toISOString(),
                sourceModule: 'M5_Kairos_Auditor',
                destinationModule: 'M3_Industrial_Simulation',
                challengeTitle: `Optimización Requerida: ${params.projectName}`,
                financialContext: {
                    status: 'Audit_Failed',
                    diagnostic: `La rentabilidad (${result?.profitability.toFixed(1)}%) es insuficiente. Se requiere reducir costes o aumentar el valor del producto.`,
                    keyProblem: 'Margen operativo insuficiente bajo incertidumbre.'
                },
                financialConstraints: {
                    targetCostOfCapital: { value: 12, unit: '%' },
                    productionCosts: { baseValue: params.productionCosts, uncertainty: params.productionCostsUncertainty / 100, unit: '€', notes: 'Reducir costes' },
                    projectDuration: { value: params.projectYears, unit: 'Años' },
                    capitalToRaise: { value: params.capitalToRaise, unit: '€' }
                },
                optimizationChallenge: {
                    objective: "Reconfigurar el proceso industrial para maximizar el rendimiento y reducir costes operativos.",
                    targetMetric: "Margen Operativo",
                    targetThreshold: 0.25,
                    suggestedTools: ["M3_Reactor_P01"]
                }
            };
            onNavigateToOptimization(challenge);
        }
    };

    const handleParamChange = (key: keyof FinancialParams, value: any) => {
        setParams(prev => ({ ...prev, [key]: value }));
    };

    const handleSendMessage = useCallback(async (message: string) => {
        if (!chatSessionRef.current) return;

        const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: 'user', text: message };
        setChatHistory(prev => [...prev, userMessage]);
        setIsAgentReplying(true);

        try {
            const prompt = `${titan.system_prompt}\n\nAnaliza la petición: "${message}". Responde con JSON (schema: respuesta_chat, accion_ui). Si debes cambiar parámetros financieros, usa 'ACTUALIZAR_PARAMS' en accion_ui con payload { assetValue, productionCosts, etc. }. Si debes delegar, usa 'DELEGAR_TAREA'.`;
            
            const response = await chatSessionRef.current.sendMessage(prompt); // Simplified call, assuming model handles JSON via system prompt or we parse text
            // Note: In TitanWorkstation we used generateContent with schema. Here let's try to be consistent but for brevity I'll assume the model follows instructions or I'll use the same pattern if I can.
            // Let's use the robust pattern from TitanWorkstation actually.
            
            // Re-instantiate for schema mode if needed, or just trust the chat session context + prompt.
            // For reliability, let's parse the text manually as the chat session might not enforce schema on every turn easily without config.
            // Actually, Gemini 1.5/2.0 supports responseSchema in chat.sendMessage too in some SDK versions, but let's stick to text parsing or a separate generateContent call if we want strict JSON.
            // For now, let's assume the model returns text and we try to find JSON block.
            
            let responseText = response.text;
            let responseJson: any = {};
            
            try {
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    responseJson = JSON.parse(jsonMatch[0]);
                    responseText = responseJson.respuesta_chat || responseText;
                }
            } catch (e) {
                // Fallback if no JSON
            }

            let agentMessage: ChatMessage = { id: `model-${Date.now()}`, role: 'model', text: responseText };

            if (responseJson.accion_ui) {
                if (responseJson.accion_ui.tipo === 'DELEGAR_TAREA') {
                    const { asistente_nombre, tarea } = responseJson.accion_ui.payload;
                    agentMessage.text += `\n\nPropongo delegar: "${tarea}" a **${asistente_nombre}**.`;
                    agentMessage.isAction = true;
                    agentMessage.actions = [{ id: `delegate_${asistente_nombre}`, label: `✅ Aprobar Delegación` }];
                } else if (responseJson.accion_ui.tipo === 'ACTUALIZAR_PARAMS') {
                    const p = responseJson.accion_ui.payload;
                    setParams(prev => ({
                        ...prev,
                        assetValue: p.assetValue ?? prev.assetValue,
                        productionCosts: p.productionCosts ?? prev.productionCosts,
                        capitalToRaise: p.capitalToRaise ?? prev.capitalToRaise
                    }));
                    agentMessage.text += `\n\n*He actualizado los parámetros financieros según tu solicitud.*`;
                }
            }

            setChatHistory(prev => [...prev, agentMessage]);

        } catch (e) {
            console.error(e);
            setChatHistory(prev => [...prev, { id: `err-${Date.now()}`, role: 'model', text: "Error de conexión." }]);
        } finally {
            setIsAgentReplying(false);
        }
    }, [titan]);

    const handleRunSimulation = useCallback(async () => {
        if (!chatSessionRef.current) return;
        
        setIsSimulating(true);
        setResult(null);
        await new Promise(resolve => setTimeout(resolve, 1000));

        const simulationResult = runFinancialMonteCarlo(params);
        setResult(simulationResult);
        setIsSimulating(false);
        setIsAgentReplying(true);

        const analysisPrompt = `SYSTEM_ACTION: Auditoría completada. Resultados: TIR=${(simulationResult.avgTir*100).toFixed(2)}%, Probabilidad=${simulationResult.profitability.toFixed(1)}%. Analiza estos resultados y da tu veredicto.`;

        try {
            const response = await chatSessionRef.current.sendMessage(analysisPrompt);
            setChatHistory(prev => [...prev, { id: `model-res-${Date.now()}`, role: 'model', text: response.text }]);
        } catch (e) {
            console.error(e);
        } finally {
            setIsAgentReplying(false);
        }
    }, [params]);

    return (
        <div className="bg-gray-900 text-white p-6 h-full flex flex-col font-sans">
            <header className="mb-4 flex items-center gap-4 flex-shrink-0">
                <button onClick={onBack} className="text-cyan-400 hover:text-cyan-300">&larr; Volver al Atrio</button>
                <h1 className="text-3xl font-bold">Estación de Auditoría: {titan.claveName}</h1>
            </header>
            <main className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                <div className="flex flex-col min-h-0">
                    <FinancialSimulator
                        params={params}
                        onParamChange={handleParamChange}
                        onRunSimulation={handleRunSimulation}
                        result={result}
                        isSimulating={isSimulating}
                    />
                </div>
                <div className="flex flex-col min-h-0">
                    <ChatPanel
                        agent={titan}
                        chatHistory={chatHistory}
                        onSendMessage={handleSendMessage}
                        isAgentReplying={isAgentReplying}
                        onActionClick={handleActionClick}
                    />
                </div>
            </main>
        </div>
    );
};

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
// FIX: Changed import type to a standard import to resolve 'is not a constructor' error.
import { Chat, GenerateContentResponse } from "@google/genai";
import type {
    CharacterProfile,
    View,
    Task,
    StyleDefinition,
    SimpleSimulationResult,
    ChatMessage,
    FinalOptimizationPackage,
    GovernanceHandoffPackage,
    SimulationFormData
} from '../../types';
import { M3Simulator } from './M3Simulator';
import { ChatPanel } from '../ChatPanel';

interface TitanWorkstationProps {
    titan: CharacterProfile;
    onBack: () => void;
    onSaveTask: (task: Task) => void;
    allStyles: StyleDefinition[];
    onAddStyle: (newStyle: StyleDefinition) => void;
    knowledgeSources: { name: string; content: string }[];
    setView: (view: View) => void;
    chronosState: any; 
    stoState: any;
    vulcanoState: any;
    setVulcanoState: any;
    onNavigateToUtilities: any;
    initialData: any;
    onDataConsumed: any;
    technicalRiskPackage: any;
    creativeContext: any;
    onPromptGenerated: any;
    onNavigateToRiskSimulator: (data: FinalOptimizationPackage) => void;
    onNavigateToGovernance: (data: GovernanceHandoffPackage) => void;
}

// Simple local simulation logic
const runLocalMonteCarlo = (params: { temperature: number; residenceTime: number; uncertainty: number }): SimpleSimulationResult => {
    const baseOil = 60 - (params.temperature - 500) * 0.1 + (params.residenceTime - 2) * 2;
    const baseGas = 20 + (params.temperature - 500) * 0.15 - (params.residenceTime - 2) * 3;
    const baseChar = 20 - (params.temperature - 500) * 0.05 + (params.residenceTime - 2) * 1;

    const total = Math.max(1, baseOil + baseGas + baseChar);
    const oil = Math.max(0, (baseOil / total) * 100);
    const gas = Math.max(0, (baseGas / total) * 100);
    const char = Math.max(0, 100 - oil - gas);

    // Generate distribution for histogram
    const distribution: number[] = [];
    const numSamples = 500;
    const stdDev = params.uncertainty * 0.5;

    for (let i = 0; i < numSamples; i++) {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        distribution.push(oil + num * stdDev);
    }

    return {
        yields: {
            'Bio-aceite': oil,
            'Gas': gas,
            'Biochar': char,
        },
        distribution,
    };
};

export const TitanWorkstation: React.FC<TitanWorkstationProps> = ({ titan, onBack, onNavigateToRiskSimulator, onNavigateToGovernance }) => {
    const [params, setParams] = useState({
        temperature: 575,
        residenceTime: 3.0,
        uncertainty: 5.0,
    });
    const [result, setResult] = useState<SimpleSimulationResult | null>(null);
    const [isSimulating, setIsSimulating] = useState(false);

    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isAgentReplying, setIsAgentReplying] = useState(false);
    const chatSessionRef = useRef<Chat | null>(null);
    const optimizedParamsRef = useRef(params);
    const optimizedYieldRef = useRef(0);

    // Initialize Chat
    useEffect(() => {
        const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string || '' });
        chatSessionRef.current = ai.chats.create({
            model: 'gemini-2.5-pro',
            config: { systemInstruction: titan.system_prompt },
        });

        setChatHistory([{
            id: 'init',
            role: 'model',
            text: `Estación de Trabajo de ${titan.claveName.split(',')[0]} inicializada. Puedes darme comandos en lenguaje natural para controlar el simulador o puedes ajustarlo manualmente.`
        }]);
    }, [titan]);

    // Handoff Logic
    useEffect(() => {
      const lastMessage = chatHistory[chatHistory.length - 1];
      const hasActionMessage = chatHistory.some(m => m.isAction);

      const triggerPhrases = [
          "punto operativo óptimo",
          "punto óptimo",
          "como el óptimo",
          "hemos alcanzado el punto máximo",
          "hemos logrado el rendimiento de bio-aceite más alto",
          "un punto operativo de alta eficiencia",
      ];

      const shouldTrigger = lastMessage && 
                            lastMessage.role === 'model' && 
                            !hasActionMessage && 
                            triggerPhrases.some(phrase => lastMessage.text.toLowerCase().includes(phrase));

      if (shouldTrigger) {
          
          optimizedParamsRef.current = params;
          optimizedYieldRef.current = result?.yields['Bio-aceite'] || 0;

          const actionMessage: ChatMessage = {
              id: `action-${Date.now()}`,
              role: 'system',
              text: 'Se ha detectado un punto de operación optimizado. ¿Qué deseas hacer con este "Activo Estratégico"?',
              isAction: true,
              actions: [
                  { id: 'send_to_risk_simulator', label: '➡️ Enviar Optimización al Simulador Financiero (M5)' },
                  { id: 'propose_to_governance', label: '🏛️ Proponer esta Configuración a Gobernanza (M6)' },
              ],
              actionsDisabled: false,
          };
          setChatHistory(prev => [...prev, actionMessage]);
      }
    }, [chatHistory, params, result]);


    const handleActionClick = (actionId: string, messageId: string) => {
        setChatHistory(prev => prev.map(msg => msg.id === messageId ? { ...msg, actionsDisabled: true } : msg));

        const optimizedData = optimizedParamsRef.current;
        const optimizedYield = optimizedYieldRef.current;

        if (actionId === 'send_to_risk_simulator') {
            const handoffPackage: FinalOptimizationPackage = {
                handoffId: `m3-m5-${Date.now()}`,
                timestamp: new Date().toISOString(),
                sourceModule: "M3_Hefesto_Workstation",
                destinationModule: "M5_Kairos_Risk_Simulator",
                optimizationDetails: {
                    temperature: optimizedData.temperature,
                    residenceTime: optimizedData.residenceTime,
                    uncertainty: optimizedData.uncertainty,
                    yieldBioOil: optimizedYield
                },
                contextualChatHistory: chatHistory.map(m => `[${m.role}]: ${m.text}`).join('\n'),
            };
            onNavigateToRiskSimulator(handoffPackage);
            const confirmation: ChatMessage = { id: `conf-${Date.now()}`, role: 'system', text: '✅ Handoff a Módulo 5 (Kairos) iniciado. Serás redirigido.', isSystem: true };
            setChatHistory(p => [...p, confirmation]);

        } else if (actionId === 'propose_to_governance') {
             const finalOptPackage: FinalOptimizationPackage = {
                handoffId: `m3-m5-gov-${Date.now()}`,
                timestamp: new Date().toISOString(),
                sourceModule: "M3_Hefesto_Workstation",
                destinationModule: "M6_Governance_Debate",
                optimizationDetails: {
                    temperature: optimizedData.temperature,
                    residenceTime: optimizedData.residenceTime,
                    uncertainty: optimizedData.uncertainty,
                    yieldBioOil: optimizedYield
                },
                contextualChatHistory: chatHistory.map(m => `[${m.role}]: ${m.text}`).join('\n'),
            };
            
            const governancePackage: GovernanceHandoffPackage = {
                handoffId: `m3-m6-${Date.now()}`,
                timestamp: new Date().toISOString(),
                sourceModule: 'M3_Hefesto_Workstation',
                destinationModule: 'M6_Governance_Debate',
                triggeringEvent: {
                    title: `Propuesta de Adopción: Nuevo Punto Operativo Optimizado (M3: ${optimizedYield.toFixed(1)}%)`,
                    summary: `Hefesto y el usuario han identificado un 'punto de operación optimizado'. Se solicita un 'Debate de Titanes' para validar y ratificar esta configuración como la nueva línea base técnica del proyecto.`
                },
                simulationInputs: {
                    projectParams: [
                        { label: 'Temperatura (T)', value: optimizedData.temperature },
                        { label: 'Tiempo de Residencia (t)', value: optimizedData.residenceTime },
                        { label: 'Incertidumbre de Temperatura (T)', value: optimizedData.uncertainty },
                    ]
                },
                simulationResults: {
                    kpis: [{ label: 'Rendimiento Bio-aceite (Promedio)', value: optimizedYield, unit: '%' }]
                },
                debateProposal: {
                    suggestedTitle: `Validación de Optimización M3 (Yield ${optimizedYield.toFixed(1)}%)`,
                    suggestedInstructions: `Hemos recibido una nueva configuración optimizada del Módulo 3 (T=${optimizedData.temperature.toFixed(1)}°C, Yield ${optimizedYield.toFixed(1)}%). Los 'Titanes' deben analizar el impacto de esta nueva línea base. Hefesto presentará los datos. Helena debe validar el impacto financiero y de riesgo.`,
                    suggestedRoles: {
                        mainProponent: { name: 'Hefesto', rationale: 'Presentar los datos técnicos que él mismo ayudó a optimizar.' },
                        criticalOpponent: { name: 'Helena', rationale: 'Actuar como el "control financiero" y validar si este nuevo yield es realmente rentable.' },
                        moderator: { name: 'Janus', rationale: 'Asegurar la coherencia lógica del debate.' }
                    }
                },
                technicalProof: finalOptPackage
            };
            
            onNavigateToGovernance(governancePackage);
            const confirmation: ChatMessage = { id: `conf-${Date.now()}`, role: 'system', text: '✅ Handoff a Módulo 6 (Gobernanza) iniciado. Serás redirigido.', isSystem: true };
            setChatHistory(p => [...p, confirmation]);
        }
    };


    const handleParamChange = (param: keyof typeof params, value: number) => {
        setParams(prev => ({ ...prev, [param]: value }));
    };

    // Flow A: Chat -> UI
    const handleSendMessage = useCallback(async (message: string) => {
        if (!chatSessionRef.current) return;

        const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: 'user', text: message };
        setChatHistory(prev => [...prev, userMessage]);
        setIsAgentReplying(true);

        try {
            const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string || '' });
            const prompt = `${titan.system_prompt}\n\nAnaliza la siguiente petición del usuario: "${message}". Responde estrictamente con un objeto JSON que siga el schema definido, conteniendo 'respuesta_chat' y 'accion_ui'.`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            respuesta_chat: { type: Type.STRING },
                            accion_ui: {
                                type: Type.OBJECT,
                                nullable: true,
                                properties: {
                                    tipo: { type: Type.STRING },
                                    payload: {
                                        type: Type.OBJECT,
                                        properties: {
                                            temperatura: { type: Type.NUMBER, nullable: true },
                                            incertidumbre_temp: { type: Type.NUMBER, nullable: true },
                                            tiempo_residencia: { type: Type.NUMBER, nullable: true },
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            const responseJson = JSON.parse(response.text);
            
            const agentMessage: ChatMessage = { id: `model-${Date.now()}`, role: 'model', text: responseJson.respuesta_chat || "No he entendido la acción." };
            setChatHistory(prev => [...prev, agentMessage]);

            if (responseJson.accion_ui && responseJson.accion_ui.tipo === 'ACTUALIZAR_ESTADO_M3') {
                const { payload } = responseJson.accion_ui;
                setParams(prev => ({
                    ...prev,
                    temperature: payload.temperatura !== undefined ? payload.temperatura : prev.temperature,
                    residenceTime: payload.tiempo_residencia !== undefined ? payload.tiempo_residencia : prev.residenceTime,
                    uncertainty: payload.incertidumbre_temp !== undefined ? payload.incertidumbre_temp : prev.uncertainty,
                }));
            }

        } catch (e) {
            console.error(e);
            const errorMessage: ChatMessage = { id: `error-${Date.now()}`, role: 'model', text: 'Lo siento, he encontrado un error al procesar tu comando.' };
            setChatHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsAgentReplying(false);
        }
    }, [titan.system_prompt]);

    // Flow B: UI -> Chat
    const handleRunSimulation = useCallback(async () => {
        if (!chatSessionRef.current) return;
        
        setIsSimulating(true);
        setResult(null);
        await new Promise(resolve => setTimeout(resolve, 1000));

        const simulationResult = runLocalMonteCarlo(params as any);
        setResult(simulationResult);
        setIsSimulating(false);
        setIsAgentReplying(true);

        const simulationPackage = {
            inputs: params,
            outputs: simulationResult
        };

        const analysisPrompt = `SYSTEM_ACTION: Simulación completada. Paquete de Resultados: ${JSON.stringify(simulationPackage)}. Analiza críticamente este resultado y reporta tus hallazgos en el chat.`;

        try {
            const response: GenerateContentResponse = await chatSessionRef.current.sendMessage({ message: analysisPrompt });
            const agentMessage: ChatMessage = { id: `model-proactive-${Date.now()}`, role: 'model', text: response.text };
            setChatHistory(prev => [...prev, agentMessage]);
        } catch (e) {
            console.error(e);
            const errorMessage: ChatMessage = { id: `error-proactive-${Date.now()}`, role: 'model', text: 'Lo siento, he encontrado un error al analizar los resultados.' };
            setChatHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsAgentReplying(false);
        }
    }, [params]);


    return (
        <div className="bg-gray-900 text-white p-6 h-full flex flex-col font-sans">
            <header className="mb-4 flex items-center gap-4 flex-shrink-0">
                <button onClick={onBack} className="text-cyan-400 hover:text-cyan-300">&larr; Volver al Atrio</button>
                <h1 className="text-3xl font-bold">Estación de Trabajo: {titan.claveName}</h1>
            </header>
            <main className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                <div className="flex flex-col min-h-0">
                    <M3Simulator
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


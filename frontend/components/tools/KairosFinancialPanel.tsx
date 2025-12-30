import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import type { View, Task, OptimizationChallengePackage } from '../../types';
import { ContentType, EventType } from '../../types';
import { FormInput } from '../form/FormControls';
import TaskModal from '../TaskModal';

// IRR calculation using iterative approach (simplified Newton-Raphson)
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
        if (Math.abs(npv) < 1e-6) {
            return irr;
        }
        if (derivative === 0) break;
        irr = irr - npv / derivative;
    }
    return irr; // Return as a decimal
};

const calculateNPV = (cashFlows: number[], discountRate: number): number => {
    let npv = 0;
    for (let t = 0; t < cashFlows.length; t++) {
        npv += cashFlows[t] / Math.pow(1 + discountRate, t);
    }
    return npv;
};

interface KairosFinancialPanelProps {
    setView: (view: View) => void;
    onSaveTask: (task: Task) => void;
    challengePackage: OptimizationChallengePackage | null;
    setChallengePackage: (pkg: OptimizationChallengePackage | null) => void;
}


const Panel: React.FC<React.PropsWithChildren<{ title: string; }>> = ({ title, children }) => (
    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h3 className="text-lg font-bold text-cyan-400 mb-4 border-b border-slate-700 pb-2">{title}</h3>
        <div className="space-y-4">{children}</div>
    </div>
);

const Indicator: React.FC<{ label: string; value: string | number; unit?: string; valueClassName?: string; isLoading?: boolean }> = ({ label, value, unit, valueClassName, isLoading }) => (
    <div className="flex justify-between items-baseline py-2 border-b border-slate-700/50">
        <span className="text-slate-400">{label}</span>
        {isLoading ? (
            <div className="h-6 bg-slate-700 rounded w-24 animate-pulse"></div>
        ) : (
            <span className={`font-mono font-semibold text-white text-xl ${valueClassName}`}>
                {value}
                {unit && <span className="text-slate-400 text-sm ml-1.5">{unit}</span>}
            </span>
        )}
    </div>
);

const InputWithUncertaintySlider: React.FC<{
    label: string;
    id: string;
    value: number;
    onValueChange: (value: number) => void;
    uncertainty: number;
    onUncertaintyChange: (value: number) => void;
}> = ({ label, id, value, onValueChange, uncertainty, onUncertaintyChange }) => (
    <div>
        <label htmlFor={id} className="text-sm font-medium text-slate-300 mb-1 block">{label}</label>
        <input id={id} type="number" value={value} onChange={e => onValueChange(Number(e.target.value))} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md" />
        <div className="mt-2">
            <label htmlFor={`${id}-uncertainty`} className="text-xs text-slate-400 flex justify-between">
                <span>Incertidumbre</span>
                <span>± {uncertainty}%</span>
            </label>
            <input id={`${id}-uncertainty`} type="range" min="0" max="50" step="1" value={uncertainty} onChange={e => onUncertaintyChange(Number(e.target.value))} className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-500" />
        </div>
    </div>
);


export const KairosFinancialPanel: React.FC<KairosFinancialPanelProps> = ({ setView, onSaveTask, setChallengePackage }) => {
    // Project Inputs
    const [assetValue, setAssetValue] = useState(300000);
    const [assetValueUncertainty, setAssetValueUncertainty] = useState(20);
    const [capitalToRaise, setCapitalToRaise] = useState(100000);
    const [productionCosts, setProductionCosts] = useState(160000);
    const [productionCostsUncertainty, setProductionCostsUncertainty] = useState(15);
    const [projectName, setProjectName] = useState('Nuevo Proyecto STO');
    const [projectYears, setProjectYears] = useState(5);

    // Financial Config
    const COST_OF_CAPITAL = 0.12; // 12%

    // Calculated Metrics
    const [results, setResults] = useState<{
        avgVpn: number;
        avgTir: number;
        avgPayback: number;
        profitability: number;
    } | null>(null);

    // AI Verdict
    const [verdict, setVerdict] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

    const getRandomValue = (base: number, uncertainty: number) => {
        const factor = (Math.random() * 2 - 1) * (uncertainty / 100);
        return base * (1 + factor);
    };

    const handleRunAudit = useCallback(async () => {
        setIsLoading(true);
        setError('');
        setVerdict('');
        setResults(null);

        // Allow UI to update to loading state
        await new Promise(resolve => setTimeout(resolve, 50));

        try {
            // 1. Monte Carlo Simulation (1000 iterations)
            const MONTE_CARLO_RUNS = 1000;
            const tirResults: number[] = [];
            const vpnResults: number[] = [];
            const paybackResults: number[] = [];

            const initialInvestment = -capitalToRaise;
            if (capitalToRaise <= 0) {
                throw new Error("El capital a recaudar debe ser un valor positivo.");
            }

            for (let i = 0; i < MONTE_CARLO_RUNS; i++) {
                const currentAssetValue = getRandomValue(assetValue, assetValueUncertainty);
                const currentProductionCosts = getRandomValue(productionCosts, productionCostsUncertainty);

                const annualRevenue = currentAssetValue / projectYears;
                const annualCosts = currentProductionCosts / projectYears;
                const annualCashFlow = annualRevenue - annualCosts;

                if (annualCashFlow > 0) {
                    const cashFlows = [initialInvestment, ...Array(projectYears).fill(annualCashFlow)];
                    vpnResults.push(calculateNPV(cashFlows, COST_OF_CAPITAL));
                    tirResults.push(calculateIRR(cashFlows));
                    paybackResults.push(-initialInvestment / annualCashFlow);
                } else {
                    // If cash flow is negative, project is not profitable
                    vpnResults.push(initialInvestment); // NPV is just the initial loss
                    tirResults.push(-1); // Represents a loss
                    paybackResults.push(Infinity); // Never pays back
                }
            }

            const avgTir = tirResults.reduce((a, b) => a + b, 0) / tirResults.length;
            const avgVpn = vpnResults.reduce((a, b) => a + b, 0) / vpnResults.length;
            const finitePaybacks = paybackResults.filter(p => isFinite(p));
            const avgPayback = finitePaybacks.length > 0 ? finitePaybacks.reduce((a, b) => a + b, 0) / finitePaybacks.length : Infinity;
            const profitability = (tirResults.filter(tir => tir > COST_OF_CAPITAL).length / tirResults.length) * 100;

            const simulationResults = { avgVpn, avgTir, avgPayback, profitability };
            setResults(simulationResults);

            // 2. Generate AI Verdict
            const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string || '' });
            const systemInstruction = `Eres Kairos, un Auditor de Viabilidad de STO (Security Token Offering). Eres analítico, data-driven y ofreces diagnósticos estratégicos claros en español.`;

            const isViable = simulationResults.profitability > 50 && (simulationResults.avgTir * 100) > (COST_OF_CAPITAL * 100);

            const userPrompt = `
                Analiza los resultados de una simulación de Monte Carlo para el proyecto '${projectName}'.
                
                Resultados de Simulación (1000 iteraciones):
                - TIR Promedio: ${(simulationResults.avgTir * 100).toFixed(2)}%
                - Probabilidad de Rentabilidad: ${simulationResults.profitability.toFixed(1)}%
                - Nuestro coste de capital es del ${(COST_OF_CAPITAL * 100)}%.
                - Valor del Activo (base): ${assetValue}
                - Costes de Producción (base): ${productionCosts}

                Tarea:
                1. Escribe un **VEREDICTO ESTRATÉGICO**. Comienza con "¡Auditoría Exitosa!" si es viable (probabilidad > 50% y TIR > 12%), o "¡Auditoría Fallida!" si no lo es.
                2. Justifica tu veredicto de forma concisa con los datos de la simulación. Sé específico. Si la probabilidad es marginal (ej. 52.1%), menciónalo.
                3. Si la auditoría es fallida porque el proyecto no genera valor (ej. probabilidad de rentabilidad muy baja o 0%), añade una sección titulada "**RECOMENDACIÓN DE SINERGIA**" y sugiere enviar el problema al "Módulo 3: Simulación Industrial" para que el "Asistente de Laboratorio" diseñe una configuración que genere un Valor del Activo (ej. bio-aceite) superior a los Costes de Producción.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: userPrompt,
                config: { systemInstruction }
            });

            setVerdict(response.text);

        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : "Ocurrió un error al generar el veredicto.");
        } finally {
            setIsLoading(false);
        }
    }, [assetValue, assetValueUncertainty, capitalToRaise, productionCosts, productionCostsUncertainty, projectName, projectYears]);

    const handleSaveTask = (title: string) => {
        const task: Task = {
            id: `kairos-audit-${Date.now()}`,
            title: title,
            createdAt: Date.now(),
            status: 'Completado',
            contentType: ContentType.Texto,
            eventType: 'ViabilityAnalysis',
            formData: {
                // Save all inputs
                objective: `Análisis de viabilidad para ${projectName}`,
                specifics: {
                    [ContentType.Texto]: {
                        rawData: JSON.stringify({
                            inputs: {
                                projectName,
                                assetValue,
                                assetValueUncertainty,
                                capitalToRaise,
                                productionCosts,
                                productionCostsUncertainty,
                                projectYears,
                            },
                            results: results,
                            verdict: verdict,
                        }, null, 2),
                    },
                    [ContentType.Imagen]: {}, [ContentType.Video]: {}, [ContentType.Audio]: {}, [ContentType.Codigo]: {}
                }
            },
            result: { text: verdict },
        };
        onSaveTask(task);
        setIsTaskModalOpen(false);
    };

    const handleSendToM3 = () => {
        if (!results) return;

        const diagnosticText = verdict.split('**RECOMENDACIÓN DE SINERGIA**')[0].replace('**VEREDICTO ESTRATÉGICO**', '').trim();

        const challenge: OptimizationChallengePackage = {
            handoffId: `challenge-m5-m3-uuid-${Date.now()}`,
            timestamp: new Date().toISOString(),
            sourceModule: 'M5_Finance_Kairos_Auditor',
            destinationModule: 'M3_Industrial_Simulation',
            challengeTitle: `Desafío de Optimización Técnica (Auditoría Fallida para ${projectName})`,
            financialContext: {
                status: 'Audit_Failed',
                diagnostic: diagnosticText,
                keyProblem: `El 'Valor del Activo' generado por M3 debe ser consistentemente superior a los 'Costes de Producción' en la simulación.`
            },
            financialConstraints: {
                targetCostOfCapital: { value: COST_OF_CAPITAL * 100, unit: '%', notes: 'El TIR del nuevo escenario debe superar este 12%.' },
                productionCosts: { baseValue: productionCosts, uncertainty: productionCostsUncertainty / 100, unit: '€/año', notes: `El 'Valor del Activo' generado por M3 debe superar este coste.` },
                projectDuration: { value: projectYears, unit: 'Años' },
                capitalToRaise: { value: capitalToRaise, unit: '€' }
            },
            optimizationChallenge: {
                objective: "Identifica una nueva configuración de variables (costes, precios, demanda, etc.) que permita diseñar un escenario base donde el 'Valor del Activo' sea consistentemente superior a los 'Costes de Producción'.",
                targetMetric: 'Valor del Activo (Anual)',
                targetThreshold: productionCosts / projectYears,
                suggestedTools: ["M3_Reactor_P01", "M3_Phoenix"]
            }
        };

        setChallengePackage(challenge);
        setView('process-optimizer');
    };

    return (
        <div className="bg-slate-900 text-white p-8 rounded-lg min-h-full font-sans">
            {isTaskModalOpen && <TaskModal onClose={() => setIsTaskModalOpen(false)} onSave={handleSaveTask} />}
            <header className="text-center mb-8">
                <h1 className="text-4xl font-bold">Panel de Proyección de Kairos</h1>
                <p className="text-slate-400 mt-2">Auditoría de Viabilidad STO con Monte Carlo</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Panel title="Configuración del Proyecto">
                    <FormInput
                        id="project-name"
                        label="Nombre del Proyecto"
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                    />
                    <FormInput
                        id="project-years"
                        label="Duración del Proyecto (años)"
                        type="number"
                        value={projectYears}
                        onChange={(e) => setProjectYears(Number(e.target.value))}
                    />
                    <FormInput
                        id="capital-raise"
                        label="Capital a Recaudar (€)"
                        type="number"
                        value={capitalToRaise}
                        onChange={(e) => setCapitalToRaise(Number(e.target.value))}
                    />
                </Panel>

                <Panel title="Parámetros Financieros">
                    <InputWithUncertaintySlider
                        label="Valor del Activo (€)"
                        id="asset-value"
                        value={assetValue}
                        onValueChange={setAssetValue}
                        uncertainty={assetValueUncertainty}
                        onUncertaintyChange={setAssetValueUncertainty}
                    />
                    <InputWithUncertaintySlider
                        label="Costes de Producción (€)"
                        id="production-costs"
                        value={productionCosts}
                        onValueChange={setProductionCosts}
                        uncertainty={productionCostsUncertainty}
                        onUncertaintyChange={setProductionCostsUncertainty}
                    />
                </Panel>
            </div>

            <div className="text-center mb-6">
                <button
                    onClick={handleRunAudit}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white px-8 py-3 rounded-lg font-semibold transition-all"
                >
                    {isLoading ? 'Ejecutando Auditoría...' : 'Ejecutar Auditoría de Viabilidad'}
                </button>
            </div>

            {error && (
                <div className="bg-red-900/30 border border-red-700 text-red-300 p-4 rounded-lg mb-6">
                    <p className="font-semibold">Error:</p>
                    <p>{error}</p>
                </div>
            )}

            {results && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <Panel title="Resultados Financieros">
                        <Indicator
                            label="TIR Promedio"
                            value={(results.avgTir * 100).toFixed(2)}
                            unit="%"
                            valueClassName={results.avgTir > COST_OF_CAPITAL ? 'text-green-400' : 'text-red-400'}
                            isLoading={isLoading}
                        />
                        <Indicator
                            label="VPN Promedio"
                            value={`€${results.avgVpn.toFixed(0)}`}
                            valueClassName={results.avgVpn > 0 ? 'text-green-400' : 'text-red-400'}
                            isLoading={isLoading}
                        />
                        <Indicator
                            label="Payback Promedio"
                            value={isFinite(results.avgPayback) ? results.avgPayback.toFixed(2) : '∞'}
                            unit="años"
                            isLoading={isLoading}
                        />
                        <Indicator
                            label="Probabilidad de Rentabilidad"
                            value={results.profitability.toFixed(1)}
                            unit="%"
                            valueClassName={results.profitability > 50 ? 'text-green-400' : 'text-red-400'}
                            isLoading={isLoading}
                        />
                    </Panel>

                    <Panel title="Veredicto Estratégico">
                        {isLoading ? (
                            <div className="space-y-2">
                                <div className="h-4 bg-slate-700 rounded animate-pulse"></div>
                                <div className="h-4 bg-slate-700 rounded animate-pulse"></div>
                                <div className="h-4 bg-slate-700 rounded animate-pulse w-3/4"></div>
                            </div>
                        ) : (
                            <div className="prose prose-invert max-w-none">
                                <p className="whitespace-pre-wrap text-slate-300">{verdict}</p>
                            </div>
                        )}
                    </Panel>
                </div>
            )}

            {results && !isLoading && (
                <div className="flex gap-4 justify-center mt-6">
                    <button
                        onClick={() => setIsTaskModalOpen(true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-all"
                    >
                        💾 Guardar Auditoría
                    </button>
                    {results.profitability < 50 && (
                        <button
                            onClick={handleSendToM3}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-all"
                        >
                            🔬 Enviar a Simulación Industrial
                        </button>
                    )}
                </div>
            )}

            <div className="mt-8 text-center">
                <button
                    onClick={() => setView('home')}
                    className="text-slate-400 hover:text-white transition-colors"
                >
                    ← Volver al Menú Principal
                </button>
            </div>
        </div>
    );
};

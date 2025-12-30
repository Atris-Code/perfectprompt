import React, { useState, useMemo, useCallback } from 'react';
import { ContentType } from '../../types';
import type { Task, SimulationFormData, SimulationResult, PyrolysisMaterial, Catalyst, TechnicalRiskPackage } from '../../types';
import { SIMULATION_ENGINE, PYROLYSIS_MATERIALS } from '../../data/pyrolysisMaterials';
import { runMonteCarloSimulation } from '../../services/simulationService';
import { generateComparativeAnalysis } from '../../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Accordion } from '../form/Accordion';
import { FormInput, FormSelect } from '../form/FormControls';

// --- Reusable UI Components ---
const KpiCard: React.FC<{ title: string; value: string; unit?: string; colorClass?: string; description: string; }> = ({ title, value, unit, colorClass = 'text-blue-600', description }) => (
    <div className="bg-gray-100 p-4 rounded-lg border border-gray-200" title={description}>
        <h5 className="text-sm font-semibold text-gray-500">{title}</h5>
        <p className={`text-3xl font-bold font-mono mt-1 ${colorClass}`}>
            {value}
            {unit && <span className="text-lg text-gray-600 ml-1.5">{unit}</span>}
        </p>
    </div>
);

const ParameterSlider: React.FC<{ label: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; min: number; max: number; step: number; unit: string; name: string; disabled?: boolean }> = ({ label, value, onChange, min, max, step, unit, name, disabled }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 flex justify-between">
            <span>{label}</span>
            <span className="font-mono">{value.toLocaleString('de-DE')} {unit}</span>
        </label>
        <input type="range" id={name} name={name} min={min} max={max} step={step} value={value} onChange={onChange} disabled={disabled} className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:accent-gray-400 disabled:cursor-not-allowed" />
    </div>
);


const AiAnalysisCard: React.FC<{ title: string; content: string; icon: React.ReactNode }> = ({ title, content, icon }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-start gap-4">
        <div className="flex-shrink-0 text-blue-500 bg-blue-100 p-3 rounded-full">{icon}</div>
        <div>
            <h4 className="font-bold text-gray-800">{title}</h4>
            <p className="text-sm text-gray-600 mt-1" dangerouslySetInnerHTML={{ __html: content }}></p>
        </div>
    </div>
);


export const ComparativeScenariosLab: React.FC<{
    onSaveTask: (task: Task) => void;
    initialMaterialIds?: number[] | null;
    onDataConsumed: () => void;
}> = ({ onSaveTask }) => {
    
    const [formData, setFormData] = useState<SimulationFormData>({
        simulationMode: 'extremo',
        composition: { celulosa: 42.5, hemicellulosa: 26.0, lignina: 28.5 },
        simpleCatalystId: null,
        mixture: [{ materialId: 1, percentage: 100 }],
        advancedCatalystId: null,
        selectedBiomassModeId: 'mode_bio_oil',
        selectedHeatSourceId: 'hibrido',
        sensitivityChange: 0,
        temperatura: 700,
        tiempoResidencia: 2,
        oxigeno: 0,
        temperaturaRange: 5,
        tiempoResidenciaRange: 0.1,
        compositionUncertainty: 3,
    });
    
    const [result, setResult] = useState<SimulationResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [simulationRuns, setSimulationRuns] = useState(1000);
    const [isHandoffComplete, setIsHandoffComplete] = useState(false);


    const handleFormChange = (fieldName: keyof SimulationFormData, value: any) => {
        setFormData(prev => ({ ...prev, [fieldName]: value }));
    };

    const handleRunSimulation = () => {
        setIsLoading(true);
        setResult(null);
        setIsHandoffComplete(false);
        
        setTimeout(() => {
            const res = runMonteCarloSimulation(formData);
            setResult(res);
            setIsLoading(false);
        }, 500);
    };

    const handleHandoff = () => {
        // FIX: Changed 'results' to 'result' to match the state variable name.
        if (!result || !result.yieldDistribution || !result.yieldRawDistribution) return;

        // FIX: Changed 'results' to 'result' to match the state variable name.
        const { liquido, solido, gas } = result.yieldDistribution;
        // FIX: Changed 'results' to 'result' to match the state variable name.
        const { liquido: liquidoRaw } = result.yieldRawDistribution;
        
        const sortedLiquido = [...liquidoRaw].sort((a,b) => a-b);
        const lowIndex = Math.floor(sortedLiquido.length * 0.025);
        const highIndex = Math.ceil(sortedLiquido.length * 0.975);
        
        const outputDistributions: TechnicalRiskPackage['outputDistributions'] = [
            {
                product: 'Bio-aceite',
                unit: '% Rendimiento',
                distributionType: 'normal',
                mean: liquido.mean,
                stdDev: liquido.stdDev || 0,
                confidence95_low: sortedLiquido[lowIndex],
                confidence95_high: sortedLiquido[highIndex],
            },
            {
                product: 'Gas',
                unit: '% Rendimiento',
                distributionType: 'normal',
                mean: gas.mean,
                stdDev: gas.stdDev || 0,
                confidence95_low: gas.mean - 1.96 * (gas.stdDev || 0),
                confidence95_high: gas.mean + 1.96 * (gas.stdDev || 0),
            },
            {
                product: 'Coque (Biochar)',
                unit: '% Rendimiento',
                distributionType: 'normal',
                mean: solido.mean,
                stdDev: solido.stdDev || 0,
                confidence95_low: solido.mean - 1.96 * (solido.stdDev || 0),
                confidence95_high: solido.mean + 1.96 * (solido.stdDev || 0),
            }
        ];
        
        const minBucket = Math.floor(outputDistributions[0].confidence95_low);
        const maxBucket = Math.ceil(outputDistributions[0].confidence95_high);
        const bucketCount = 20;
        const bucketSize = (maxBucket - minBucket) / bucketCount;
        const buckets = Array.from({length: bucketCount + 1}, (_, i) => minBucket + i * bucketSize);
        const counts = Array(bucketCount).fill(0);
        for(const val of liquidoRaw) {
            const index = Math.floor((val - minBucket) / bucketSize);
            if(index >= 0 && index < bucketCount) {
                counts[index]++;
            }
        }

        const handoffPackage: TechnicalRiskPackage = {
            reportId: `sim-m3-${new Date().getTime().toString(16)}`,
            timestamp: new Date().toISOString(),
            sourceModule: 'M3_Technical_Risk_Simulator',
            projectContext: {
                projectName: 'Proyecto Nexo Sinérgico',
                // FIX: Changed 'results' to 'result' to match the state variable name.
                material: result.effectiveMaterial?.nombre || 'Biomasa de Pino',
            },
            inputs: {
                parameters: [
                    { name: 'Temperatura', baseValue: formData.temperatura, unit: '°C', uncertainty: formData.temperaturaRange || 0 },
                    { name: 'Tiempo de Residencia', baseValue: formData.tiempoResidencia, unit: 's', uncertainty: formData.tiempoResidenciaRange || 0 },
                    { name: 'Variabilidad de Materia Prima', baseValue: formData.compositionUncertainty || 0, unit: '%', uncertainty: 0.5 },
                ],
                simulationRuns: simulationRuns
            },
            outputDistributions,
            aiAnalysis: {
                // FIX: Changed 'results' to 'result' to match the state variable name.
                kineticAnalysis: result.aiAnalysis || `A ${formData.temperatura}°C, estás en un régimen dominado por reacciones secundarias.`,
                sensitivityAnalysis: {
                    // FIX: Changed 'results' to 'result' to match the state variable name.
                    primaryFactor: result.sensitivityAnalysis?.[0]?.variable || 'Temperatura',
                    // FIX: Changed 'results' to 'result' to match the state variable name.
                    message: result.sensitivityAnalysis?.[0]?.description || `La simulación muestra que una pequeña fluctuación en la Temperatura es más impactante que otras variables.`
                }
            },
            visualizationData: {
                bioOilHistogram: {
                    buckets: buckets,
                    counts: counts
                }
            }
        };
        
        const newTask: Task = {
            id: `task-m3-handoff-${Date.now()}`,
            title: `Propuesta de Contenido: Análisis de Riesgo Técnico del Proyecto Nexo Sinérgico`,
            createdAt: Date.now(),
            status: 'Por Hacer',
            contentType: ContentType.Texto,
            eventType: 'TitansDebate',
            formData: {
                objective: `Debatir las implicaciones estratégicas del perfil de riesgo técnico generado para el '${handoffPackage.projectContext.projectName}'.`,
                specifics: {
                    [ContentType.Texto]: {
                        originalData: handoffPackage,
                    },
                    [ContentType.Imagen]: {},
                    [ContentType.Video]: {},
                    [ContentType.Audio]: {},
                    [ContentType.Codigo]: {},
                }
            },
            isIntelligent: false,
        };
    
        onSaveTask(newTask);
        setIsHandoffComplete(true);
        alert('Perfil de Riesgo empaquetado como una tarea para el Debate de Titanes. Revisa el Gestor de Tareas.');
    };

    // FIX: The histogram logic was incorrect for this component. It has been updated to correctly process the bio-oil yield distribution from the simulation `result` state.
    const histogramData = useMemo(() => {
        if (!result || !result.yieldRawDistribution?.liquido) return [];
        const { liquido } = result.yieldRawDistribution;
        if (liquido.length === 0) return [];

        const min = Math.floor(Math.min(...liquido));
        const max = Math.ceil(Math.max(...liquido));
        const bucketCount = 20;
        const bucketSize = (max - min) / bucketCount || 1;
        const buckets = Array(bucketCount).fill(0);

        for (const val of liquido) {
            const index = Math.floor((val - min) / bucketSize);
            if (index >= 0 && index < bucketCount) {
                buckets[index]++;
            }
        }

        return buckets.map((count, i) => ({ name: `${(min + i * bucketSize).toFixed(1)}%`, Frecuencia: count }));
    }, [result]);

    const topSensitivityFactor = useMemo(() => {
        if (!result?.sensitivityAnalysis || result.sensitivityAnalysis.length === 0) {
            return "No hay datos de sensibilidad disponibles.";
        }
        const topFactor = result.sensitivityAnalysis[0];
        const otherFactors = result.sensitivityAnalysis.slice(1);
        if (otherFactors.length === 0) {
            return `El único factor de incertidumbre simulado fue la **${topFactor.variable}**. ${topFactor.description}`;
        }
        
        const topImpact = topFactor.impact;
        const nextImpact = otherFactors[0].impact;
        
        let comparison = '';
        if (nextImpact > 0) {
            const timesMoreImpactful = (topImpact / nextImpact).toFixed(1);
            if (parseFloat(timesMoreImpactful) > 1.2) {
                comparison = ` Es **${timesMoreImpactful} veces más impactante** que el siguiente factor (${otherFactors[0].variable}).`;
            }
        }

        return `Tu simulación de incertidumbre muestra que una fluctuación en la **${topFactor.variable}** es el factor más impactante para tu rendimiento.${comparison} Debes invertir en un mejor control de esta variable.`;
    }, [result]);

    return (
        <div className="bg-white p-8 rounded-lg">
            <header className="text-center mb-8">
                <h1 className="text-3xl font-bold">Módulo 3: Simulador de Riesgo Técnico</h1>
                <p className="text-gray-600 mt-2">Cuantifica la incertidumbre de producción para un modelo de viabilidad hiperrealista.</p>
            </header>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* --- INPUTS --- */}
                <div className="space-y-6">
                     <Accordion title="Sección 1: Parámetros del Reactor" defaultOpen>
                        <div className="space-y-4">
                            <ParameterSlider label="Temperatura (T)" unit="°C" value={formData.temperatura} onChange={(e) => handleFormChange('temperatura', e.target.value)} min={300} max={900} step={5} name="temperatura" />
                            <ParameterSlider label="Tiempo de Residencia (t)" unit="s" value={formData.tiempoResidencia} onChange={(e) => handleFormChange('tiempoResidencia', e.target.value)} min={0.5} max={10} step={0.1} name="tiempoResidencia"/>
                        </div>
                    </Accordion>
                     <Accordion title="Sección 2: Modo de Incertidumbre (Realismo)" defaultOpen>
                        <div className="space-y-4">
                           <ParameterSlider label="Incertidumbre de Temperatura" unit="± °C" value={formData.temperaturaRange || 0} onChange={(e) => handleFormChange('temperaturaRange', e.target.value)} min={0} max={50} step={1} name="temperaturaRange"/>
                           <ParameterSlider label="Incertidumbre de T. Residencia" unit="± s" value={formData.tiempoResidenciaRange || 0} onChange={(e) => handleFormChange('tiempoResidenciaRange', e.target.value)} min={0} max={2} step={0.1} name="tiempoResidenciaRange"/>
                           <ParameterSlider label="Variabilidad de Materia Prima" unit="± %" value={formData.compositionUncertainty || 0} onChange={(e) => handleFormChange('compositionUncertainty', e.target.value)} min={0} max={15} step={0.5} name="compositionUncertainty"/>
                           <FormInput label="Número de Iteraciones (Monte Carlo)" type="number" value={simulationRuns} onChange={(e) => setSimulationRuns(Number(e.target.value))} min="100" max="10000" step="100" />
                        </div>
                    </Accordion>
                    <button onClick={handleRunSimulation} disabled={isLoading} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                        {isLoading ? 'Ejecutando Simulación...' : 'Ejecutar Simulación de Riesgo Técnico'}
                    </button>
                </div>
                {/* --- OUTPUTS --- */}
                <div className="space-y-6">
                    {isLoading && <div className="text-center p-8">Calculando distribución de probabilidades...</div>}
                    {result && (
                        <>
                            <Accordion title="Sección 3: Distribución de Resultados" defaultOpen>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                    <KpiCard title="Rendimiento Promedio" value={result.yieldDistribution?.liquido.mean.toFixed(1) || 'N/A'} unit="%" description="Media del rendimiento de bio-aceite en todas las simulaciones." />
                                    <KpiCard title="Desv. Estándar (Riesgo)" value={result.yieldDistribution?.liquido.stdDev?.toFixed(2) || 'N/A'} unit="%" description="Volatilidad del rendimiento. Un valor más alto indica mayor riesgo/incertidumbre." />
                                    <KpiCard title="Rango (95% Confianza)" value={`${(result.yieldDistribution?.liquido.mean - 1.96 * (result.yieldDistribution?.liquido.stdDev || 0)).toFixed(1)}-${(result.yieldDistribution?.liquido.mean + 1.96 * (result.yieldDistribution?.liquido.stdDev || 0)).toFixed(1)}`} unit="%" description="Rango en el que se encontrará el rendimiento el 95% de las veces." />
                                </div>
                                <h4 className="font-semibold text-center mb-2">Distribución de Rendimiento de Bio-aceite</h4>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={histogramData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="Frecuencia" fill="#8884d8" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Accordion>
                             <Accordion title="Sección 4: Análisis del Asistente de IA (Crítico)" defaultOpen>
                                <div className="space-y-4">
                                    <AiAnalysisCard
                                        title="Análisis Cinético"
                                        content={result.aiAnalysis || "Las condiciones operativas se encuentran dentro de un régimen estándar para la producción de bio-aceite."}
                                        icon={<>🔬</>}
                                    />
                                    <AiAnalysisCard
                                        title="Análisis de Sensibilidad"
                                        content={topSensitivityFactor}
                                        icon={<>📈</>}
                                    />
                                </div>
                            </Accordion>
                            <button 
                                onClick={handleHandoff} 
                                disabled={isHandoffComplete}
                                className={`w-full text-white font-bold py-3 px-4 rounded-lg transition-colors ${
                                    isHandoffComplete 
                                    ? 'bg-gray-500 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700'
                                }`}
                            >
                                {isHandoffComplete ? 'Perfil de Riesgo Enviado ✓' : 'Empaquetar Riesgo y Enviar a Debate'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

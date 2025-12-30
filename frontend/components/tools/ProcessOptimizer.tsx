import React, { useState, useMemo } from 'react';
import { PYROLYSIS_MATERIALS } from '../../data/pyrolysisMaterials';
// FIX: Added Task and ContentType imports for saving task functionality.
import type { PyrolysisMaterial, OptimizationResult, SimulationResult, SimulationFormData, Task, OptimizationChallengePackage } from '../../types';
import { ContentType } from '../../types';
import { optimizeProcess } from '../../services/geminiService';
import { runSimulation } from '../../services/simulationService';

const KpiCard: React.FC<{ title: string; value: string; unit: string; }> = ({ title, value, unit }) => (
    <div className="bg-slate-700 p-4 rounded-lg text-center transform transition-all hover:scale-105 hover:bg-slate-600">
        <h5 className="text-sm font-semibold text-gray-400">{title}</h5>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
        <p className="text-xs text-gray-400">{unit}</p>
    </div>
);

const DonutChart: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
    const size = 180;
    const strokeWidth = 25;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    let accumulated = 0;
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);

    if (totalValue === 0) {
        return (
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke="#4b5563" // slate-600
                    strokeWidth={strokeWidth}
                />
            </svg>
        );
    }

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
            {data.map((item, index) => {
                if (item.value === 0) return null;
                const dashoffset = circumference * (1 - (accumulated / totalValue));
                const dasharray = (circumference * item.value) / totalValue;
                accumulated += item.value;
                return (
                    <circle
                        key={index}
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="transparent"
                        stroke={item.color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${dasharray} ${circumference}`}
                        strokeDashoffset={dashoffset}
                        className="transition-all duration-500 ease-in-out"
                    />
                );
            })}
        </svg>
    );
};

const OPTIMIZATION_GOALS = [
    "Maximizar rendimiento de bio-aceite",
    "Maximizar la calidad del bio-aceite (minimizar oxígeno)",
    "Maximizar producción de syngas (gas de síntesis)",
    "Maximizar producción de biochar (carbón vegetal)",
    "Minimizar coste del bio-aceite (€/GJ)",
    "Maximizar eficiencia energética total (%)",
    "Minimizar emisiones netas de CO₂ (kgCO₂/GJ)",
];

// FIX: Added onSaveTask to component props.
interface ProcessOptimizerProps {
    onSaveTask: (task: Task) => void;
    challengePackage: OptimizationChallengePackage | null;
    apiKey: string; // Gemini API key passed from parent
}

export const ProcessOptimizer: React.FC<ProcessOptimizerProps> = ({ onSaveTask, challengePackage, apiKey }) => {
    const [materialId, setMaterialId] = useState<number>(PYROLYSIS_MATERIALS[0].id);
    const [goal, setGoal] = useState<string>(OPTIMIZATION_GOALS[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
    const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);

    const selectedMaterial = useMemo(() => {
        return PYROLYSIS_MATERIALS.find(m => m.id === materialId);
    }, [materialId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMaterial) {
            setError('Por favor, selecciona un material válido.');
            return;
        }

        setIsLoading(true);
        setError('');
        setOptimizationResult(null);
        setSimulationResult(null);

        try {
            const optimalConditions = await optimizeProcess(selectedMaterial, goal, apiKey);
            setOptimizationResult(optimalConditions);

            // Now, run a simulation with these optimal conditions
            const formData: SimulationFormData = {
                simulationMode: 'avanzado',
                mixture: [{ materialId: selectedMaterial.id, percentage: 100 }],
                // FIX: Corrected typo 'hemicelulosa' to 'hemicellulosa'.
                composition: { celulosa: 0, hemicellulosa: 0, lignina: 0 },
                simpleCatalystId: null,
                advancedCatalystId: null, // For now, optimizer doesn't suggest catalysts
                selectedBiomassModeId: 'mode_bio_oil', // This will be overridden by conditions
                selectedHeatSourceId: 'hibrido', // Default heat source
                sensitivityChange: 0,
                // The optimized values
                temperatura: optimalConditions.temperatura,
                tiempoResidencia: optimalConditions.tiempoResidencia,
                oxigeno: optimalConditions.oxigeno,
            };

            const simResult = runSimulation(formData);
            setSimulationResult(simResult);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido durante la optimización.');
        } finally {
            setIsLoading(false);
        }
    };

    // FIX: Added function to handle saving the optimization result as a task.
    const handleSaveTask = () => {
        if (!optimizationResult || !selectedMaterial) return;

        const task: Task = {
            id: `task-optimization-${Date.now()}`,
            title: `Optimización: ${goal} para ${selectedMaterial.nombre}`,
            createdAt: Date.now(),
            status: 'Completado',
            contentType: ContentType.Texto,
            formData: {
                objective: `Resultado de optimización para ${selectedMaterial.nombre} con objetivo: ${goal}`,
                tone: 'Analítico',
                specifics: {
                    [ContentType.Texto]: {
                        type: 'Resultado de Simulación',
                        rawData: `Condiciones Óptimas:\n- Temperatura: ${optimizationResult.temperatura.toFixed(0)} °C\n- Tiempo Residencia: ${optimizationResult.tiempoResidencia.toFixed(1)} s\n- Oxígeno: ${optimizationResult.oxigeno.toFixed(1)} %\n\nJustificación IA: ${optimizationResult.justificacion}`
                    },
                    [ContentType.Imagen]: {},
                    [ContentType.Video]: {},
                    [ContentType.Audio]: {},
                    [ContentType.Codigo]: {},
                },
                activeAgents: []
            },
            result: { text: `**Condiciones Óptimas:**\n- Temperatura: ${optimizationResult.temperatura.toFixed(0)} °C\n- Tiempo de Residencia: ${optimizationResult.tiempoResidencia.toFixed(1)} s\n- Oxígeno: ${optimizationResult.oxigeno.toFixed(1)} %\n\n**Justificación de la IA:**\n${optimizationResult.justificacion}` }
        };
        onSaveTask(task);
        alert('Tarea de optimización guardada.');
    };

    return (
        <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-lg w-full mx-auto font-sans">
            <header className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-100">Optimizador de Procesos IA</h2>
                <p className="mt-2 text-md text-gray-400">Define tu objetivo y deja que la IA encuentre las condiciones óptimas para tu proceso de pirólisis.</p>
            </header>

            <div className="max-w-4xl mx-auto">
                <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-lg border border-slate-700 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="material-select" className="block text-sm font-medium text-gray-300 mb-1">Material de Entrada</label>
                            <select
                                id="material-select"
                                value={materialId}
                                onChange={e => setMaterialId(Number(e.target.value))}
                                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md text-white"
                            >
                                {PYROLYSIS_MATERIALS.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="goal-select" className="block text-sm font-medium text-gray-300 mb-1">Objetivo de Optimización</label>
                            <select
                                id="goal-select"
                                value={goal}
                                onChange={e => setGoal(e.target.value)}
                                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md text-white"
                            >
                                {OPTIMIZATION_GOALS.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center items-center bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-transform transform hover:scale-105"
                    >
                        {isLoading ? 'Optimizando...' : 'Iniciar Optimización IA'}
                    </button>
                </form>

                {error && <div className="mt-6 p-4 bg-red-900/50 text-red-300 border border-red-700 rounded-lg">{error}</div>}

                {isLoading && (
                    <div className="text-center p-8">
                        <svg className="animate-spin h-8 w-8 text-blue-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <p className="mt-4 text-gray-400 font-semibold">La IA está ejecutando microsimulaciones...</p>
                    </div>
                )}

                {optimizationResult && simulationResult && (
                    <div className="mt-8 bg-slate-800 border border-slate-700 rounded-lg p-8 animate-fade-in">
                        <h3 className="text-2xl font-bold mb-6 text-center">Resultados de la Optimización</h3>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Columna 1: Justificación y Condiciones */}
                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-semibold text-xl text-teal-300 mb-2">Justificación de la IA</h4>
                                    <p className="text-gray-300 bg-slate-700/50 p-4 rounded-md border border-slate-600">{optimizationResult.justificacion}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-xl text-teal-300 mb-2">Condiciones Óptimas</h4>
                                    <div className="space-y-2 text-lg">
                                        <p><strong>Temperatura:</strong> <span className="font-mono float-right">{optimizationResult.temperatura.toFixed(0)} °C</span></p>
                                        <p><strong>Tiempo de Residencia:</strong> <span className="font-mono float-right">{optimizationResult.tiempoResidencia.toFixed(1)} s</span></p>
                                        <p><strong>Oxígeno:</strong> <span className="font-mono float-right">{optimizationResult.oxigeno.toFixed(1)} %</span></p>
                                    </div>
                                </div>
                            </div>

                            {/* Columna 2: Rendimiento y KPIs */}
                            <div className="space-y-6">
                                {simulationResult.simulatedYield && (
                                    <div className="flex flex-col items-center">
                                        <h4 className="font-semibold text-xl text-teal-300 mb-2">Rendimiento Predicho</h4>
                                        <div className="relative">
                                            <DonutChart data={[
                                                { label: 'Líquido', value: simulationResult.simulatedYield.liquido, color: '#22d3ee' },
                                                { label: 'Sólido', value: simulationResult.simulatedYield.solido, color: '#f97316' },
                                                { label: 'Gas', value: simulationResult.simulatedYield.gas, color: '#a855f7' },
                                            ]} />
                                        </div>
                                        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 text-sm">
                                            <div className="flex items-center"><span className="h-3 w-3 rounded-full bg-cyan-400 mr-2"></span>Líquido: {simulationResult.simulatedYield.liquido.toFixed(1)}%</div>
                                            <div className="flex items-center"><span className="h-3 w-3 rounded-full bg-orange-500 mr-2"></span>Sólido: {simulationResult.simulatedYield.solido.toFixed(1)}%</div>
                                            <div className="flex items-center"><span className="h-3 w-3 rounded-full bg-purple-500 mr-2"></span>Gas: {simulationResult.simulatedYield.gas.toFixed(1)}%</div>
                                        </div>
                                    </div>
                                )}
                                {simulationResult.kpis && (
                                    <div>
                                        <h4 className="font-semibold text-xl text-teal-300 mb-2">KPIs Predichos</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <KpiCard title="Coste Bio-aceite" value={simulationResult.kpis.coste_bio_aceite.toFixed(2)} unit="€/GJ" />
                                            <KpiCard title="Eficiencia Carbono" value={simulationResult.kpis.eficiencia_carbono.toFixed(1)} unit="%" />
                                            <KpiCard title="Eficiencia Energética" value={simulationResult.kpis.eficiencia_energetica.toFixed(1)} unit="%" />
                                            <KpiCard title="Emisiones Netas" value={simulationResult.kpis.emisiones_netas.toFixed(1)} unit="kgCO₂/GJ" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* FIX: Added button to save optimization results as a task. */}
                        <div className="mt-8 pt-6 border-t border-slate-700">
                            <button onClick={handleSaveTask} className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700">
                                Guardar como Tarea
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
};

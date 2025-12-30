import React, { useState, useMemo, useCallback } from 'react';
// FIX: Import GroupKey and GroupData from global types.
// FIX: To ensure consistent module resolution, removed the .ts extension from the import path.
import type { CoPreset, ReactorState, GroupKey, GroupData } from '../../types';
import { simulateReactor, aggregateResultsByGroup, performStatisticalAnalysis, type GroupedExperimentResults, type StatisticalAnalysis } from '../../services/experimentEngine';
import { createPostExperimentManager } from '../../services/postExperimentManager';
import type { PostExperimentReport, Task } from '../../types';
import { ResultsTable } from '../innovation/ResultsTable';
import { PostExperimentPanel } from '../innovation/PostExperimentPanel';
import { createTaskFromPostExperiment } from '../../utils/taskCreator';

interface InnovationForgeProps {
    coPresets: CoPreset[];
    reactors: ReactorState[];
    addEvent: (message: string) => void;
    apiKey: string; // API key for Gemini simulations
    onSaveTask?: (task: Task) => void; // Callback to save tasks to Task Manager
}

const DraggablePreset: React.FC<{ preset: CoPreset, onDragStart: () => void }> = ({ preset, onDragStart }) => (
    <div
        draggable
        onDragStart={onDragStart}
        className="bg-slate-700 p-3 rounded-lg cursor-grab active:cursor-grabbing border border-slate-600 hover:border-cyan-500 transition-colors"
    >
        <h4 className="font-bold text-cyan-400 text-sm">{preset.name}</h4>
        <p className="text-xs text-slate-300 mt-1 italic">"{preset.cinematicDescription}"</p>
        <div className="flex justify-between text-xs mt-2 pt-2 border-t border-slate-600/50 font-mono text-slate-400">
            <span>T: {preset.targetTemp}°C</span>
            <span>R: {preset.residenceTime}s</span>
            <span>N₂: {preset.flowN2}</span>
        </div>
    </div>
);

const ReactorTag: React.FC<{ reactorId: string, onDragStart: () => void, isAssigned: boolean }> = ({ reactorId, onDragStart, isAssigned }) => (
    <div
        draggable
        onDragStart={onDragStart}
        className={`px-3 py-1.5 rounded-md font-mono font-semibold text-sm cursor-grab active:cursor-grabbing transition-all ${isAssigned
            ? 'bg-slate-600 text-white hover:bg-slate-500'
            : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600'
            }`}
    >
        {reactorId}
    </div>
);

const DroppedPreset: React.FC<{ preset: CoPreset, onRemove: () => void }> = ({ preset, onRemove }) => (
    <div className="relative bg-slate-700 p-2 rounded-md border border-slate-600 w-full mb-2 group">
        <h4 className="font-bold text-cyan-400 text-xs truncate">{preset.name}</h4>
        <p className="text-xs text-slate-400 truncate">"{preset.cinematicDescription}"</p>
        <button onClick={onRemove} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs leading-none opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold">&times;</button>
    </div>
);

// 🔧 FALLBACK DATA - Used when props arrive empty due to bundling issues
const DEFAULT_PRESETS: CoPreset[] = [
    {
        name: 'Pirólisis Rápida (Bio-aceite)',
        targetTemp: 500,
        residenceTime: 1.5,
        flowN2: 45,
        agentMode: 'Auto-Optimización (IA)',
        cinematicDescription: 'Proceso de alta intensidad para maximizar el rendimiento de bio-aceite.'
    },
    {
        name: 'Modo de Carbonización Gaia',
        targetTemp: 450,
        residenceTime: 1800,
        flowN2: 20,
        agentMode: 'Automático (PID)',
        cinematicDescription: 'Producción optimizada de biochar de alta calidad.'
    },
    {
        name: 'Cocción Lenta de Biochar',
        targetTemp: 400,
        residenceTime: 30,
        flowN2: 20,
        agentMode: 'Automático (PID)',
        cinematicDescription: 'Una escena lenta y deliberada. Enfocada en la calidad del sólido.'
    },
    {
        name: 'Gas-Synth Optimizado',
        targetTemp: 700,
        residenceTime: 3,
        flowN2: 60,
        agentMode: 'Auto-Optimización (IA)',
        cinematicDescription: 'Proceso de alta temperatura para maximizar volúmenes de syngas.'
    },
    {
        name: 'Torrefacción Leve',
        targetTemp: 280,
        residenceTime: 1800,
        flowN2: 15,
        agentMode: 'Automático (PID)',
        cinematicDescription: 'Tratamiento térmico suave para mejorar propiedades de la biomasa.'
    },
    {
        name: 'Pirólisis Flash',
        targetTemp: 650,
        residenceTime: 0.5,
        flowN2: 80,
        agentMode: 'Auto-Optimización (IA)',
        cinematicDescription: 'Conversión ultra-rápida con residencia mínima.'
    },
    {
        name: 'Carbonización Intermedia',
        targetTemp: 475,
        residenceTime: 15,
        flowN2: 30,
        agentMode: 'Automático (PID)',
        cinematicDescription: 'Punto medio optimizado para productos duales.'
    },
    {
        name: 'Alta Pureza Biochar',
        targetTemp: 550,
        residenceTime: 3600,
        flowN2: 10,
        agentMode: 'Automático (PID)',
        cinematicDescription: 'Proceso prolongado para biochar de pureza excepcional.'
    },
    {
        name: 'Modo Experimental',
        targetTemp: 425,
        residenceTime: 10,
        flowN2: 25,
        agentMode: 'Manual (Usuario)',
        cinematicDescription: 'Configuración base para experimentación personalizada.'
    }
];


const DEFAULT_REACTORS = [
    { id: 'R-001', status: 'off' },
    { id: 'R-002', status: 'off' },
    { id: 'R-003', status: 'off' },
    { id: 'R-004', status: 'off' },
    { id: 'R-005', status: 'off' },
    { id: 'R-006', status: 'off' },
] as any;

export const InnovationForge: React.FC<InnovationForgeProps> = ({ coPresets, reactors, addEvent, apiKey }) => {
    // Use fallback data if props are empty
    const activePresets = coPresets?.length > 0 ? coPresets : DEFAULT_PRESETS;
    const activeReactors = reactors?.length > 0 ? reactors : DEFAULT_REACTORS;

    console.log('🔧 InnovationForge Data:', {
        propsPresets: coPresets?.length || 0,
        propsReactors: reactors?.length || 0,
        activePresets: activePresets.length,
        activeReactors: activeReactors.length,
        usingFallback: coPresets?.length === 0 || !coPresets
    });

    const [groups, setGroups] = useState<Record<GroupKey, GroupData>>({
        A: { preset: null, reactors: [] },
        B: { preset: null, reactors: [] },
        C: { preset: null, reactors: [] },
    });
    const [draggedItem, setDraggedItem] = useState<{ type: 'preset' | 'reactor'; data: any } | null>(null);
    const [experimentName, setExperimentName] = useState('Comparativa de Materias Primas para Biochar');
    const [kpi, setKpi] = useState('Maximizar Pureza de Biochar');
    const [statusMessage, setStatusMessage] = useState('');

    // 🆕 Estados para ejecución de experimentos
    const [experimentStatus, setExperimentStatus] = useState<'configuring' | 'running' | 'analyzing' | 'completed'>('configuring');
    const [experimentResults, setExperimentResults] = useState<GroupedExperimentResults | null>(null);
    const [statisticalAnalysis, setStatisticalAnalysis] = useState<StatisticalAnalysis | null>(null);
    const [progress, setProgress] = useState(0);
    const [postExperimentReport, setPostExperimentReport] = useState<PostExperimentReport | null>(null);


    // 🔍 DEBUG: Verificar props
    console.log('InnovationForge Props:', {
        coPresetsLength: coPresets.length,
        reactorsLength: reactors.length,
        coPresets,
        reactors
    });



    const unassignedReactors = useMemo(() => {
        const allReactorIds = activeReactors.map(r => r.id);
        const assignedReactors = new Set<string>(
            // FIX: Explicitly type 'group' to resolve 'unknown' type from Object.values()
            Object.values(groups).flatMap((group: GroupData) => group.reactors)
        );
        return allReactorIds.filter(id => !assignedReactors.has(id)).sort();
    }, [activeReactors, groups]);

    const isConfigurationComplete = useMemo(() => {
        // FIX: Explicitly type 'group' to resolve 'unknown' type from Object.values()
        return Object.values(groups).some((group: GroupData) => group.preset && group.reactors.length > 0);
    }, [groups]);

    const handleDragStart = (type: 'preset' | 'reactor', data: any) => {
        setDraggedItem({ type, data });
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (targetGroupKey: GroupKey | 'unassigned') => {
        if (!draggedItem) return;

        if (draggedItem.type === 'preset' && targetGroupKey !== 'unassigned') {
            const preset = draggedItem.data as CoPreset;
            setGroups(prev => ({
                ...prev,
                [targetGroupKey]: { ...prev[targetGroupKey], preset }
            }));
        } else if (draggedItem.type === 'reactor') {
            const reactorId = draggedItem.data as string;

            setGroups(prevGroups => {
                let sourceGroup: GroupKey | null = null;
                for (const key of Object.keys(prevGroups) as GroupKey[]) {
                    if (prevGroups[key].reactors.includes(reactorId)) {
                        sourceGroup = key;
                        break;
                    }
                }

                if (sourceGroup === targetGroupKey) return prevGroups;

                // FIX: Replace unsafe JSON clone with a type-safe deep copy to prevent type loss of 'reactors' and 'preset' properties.
                const newGroups: Record<GroupKey, GroupData> = {
                    A: { preset: prevGroups.A.preset, reactors: [...prevGroups.A.reactors] },
                    B: { preset: prevGroups.B.preset, reactors: [...prevGroups.B.reactors] },
                    C: { preset: prevGroups.C.preset, reactors: [...prevGroups.C.reactors] },
                };

                if (sourceGroup) {
                    newGroups[sourceGroup].reactors = newGroups[sourceGroup].reactors.filter((id: string) => id !== reactorId);
                }

                if (targetGroupKey !== 'unassigned') {
                    newGroups[targetGroupKey].reactors.push(reactorId);
                    newGroups[targetGroupKey].reactors.sort();
                }

                return newGroups;
            });
        }
        setDraggedItem(null);
    };

    const handleRemovePreset = (groupKey: GroupKey) => {
        setGroups(prev => ({
            ...prev,
            [groupKey]: { ...prev[groupKey], preset: null }
        }));
    }

    const runExperiment = useCallback(async () => {
        if (!isConfigurationComplete) {
            console.warn('runExperiment called but configuration is incomplete.');
            return;
        }

        setExperimentStatus('running');
        setProgress(0);
        setStatusMessage('⏳ Ejecutando experimentos en reactores...');

        try {
            // Recopilar todas las simulaciones a ejecutar
            const simulationPromises: Promise<any>[] = [];
            const simulationMap: { reactorId: string; groupKey: GroupKey; presetName: string }[] = [];

            (['A', 'B', 'C'] as GroupKey[]).forEach(groupKey => {
                const group = groups[groupKey];
                if (!group.preset || group.reactors.length === 0) return;

                group.reactors.forEach(reactorId => {
                    simulationMap.push({
                        reactorId,
                        groupKey,
                        presetName: group.preset!.name
                    });

                    simulationPromises.push(
                        simulateReactor(reactorId, group.preset!, kpi, apiKey)
                    );
                });
            });

            // Ejecutar simulaciones
            addEvent(`Iniciando ${simulationPromises.length} simulaciones para experimento '${experimentName}'...`);
            const rawResults = await Promise.all(simulationPromises);

            // Combinar con metadata de grupos
            const enrichedResults = rawResults.map((result, index) => ({
                ...result,
                groupKey: simulationMap[index].groupKey,
                presetName: simulationMap[index].presetName
            }));

            setProgress(50);
            setStatusMessage('📊 Analizando resultados...');

            // Agrupar resultados
            const grouped = aggregateResultsByGroup(enrichedResults);
            setExperimentResults(grouped);

            // Análisis estadístico
            setExperimentStatus('analyzing');
            const stats = performStatisticalAnalysis(grouped);
            setStatisticalAnalysis(stats);

            // 🆕 Post-Experiment Intelligence
            try {
                console.log('🧠 Iniciando análisis post-experimental...');
                const postExpManager = await createPostExperimentManager();
                const report = await postExpManager.processResults({
                    experimentResults: grouped,
                    experimentName,
                    kpi
                });
                setPostExperimentReport(report);

                if (report.economic) {
                    addEvent(`💰 Análisis Económico: ${report.economic.financial_verdict}`);
                }
                if (report.academic) {
                    addEvent(`📚 Análisis Académico: p=${report.academic.p_value.toFixed(4)} (${report.academic.is_significant ? 'SIGNIFICATIVO' : 'NO SIGNIFICATIVO'})`);
                }

                // Crear tareas reales en el Task Manager si se identificaron oportunidades
                if (onSaveTask && report.triggered_tasks.length > 0) {
                    const context = {
                        experimentName,
                        kpi,
                        economicVerdict: report.economic?.financial_verdict,
                        academicSignificance: report.academic?.is_significant
                    };

                    report.triggered_tasks.forEach(taskString => {
                        try {
                            const task = createTaskFromPostExperiment(taskString, context);
                            onSaveTask(task);
                            console.log(`✅ Tarea creada en gestor: ${task.title}`);
                        } catch (err) {
                            console.error('Error creando tarea:', err);
                        }
                    });
                }
            } catch (error) {
                console.error('Error en análisis post-experimental:', error);
                // No bloqueamos el flujo si falla el post-analysis
            }

            setProgress(100);
            setExperimentStatus('completed');
            setStatusMessage('');

            addEvent(`Experimento '${experimentName}' completado. Ganador: Grupo ${stats.winner} (p=${stats.pValue.toFixed(4)})`);

        } catch (error) {
            console.error('Error ejecutando experimento:', error);
            setStatusMessage('❌ Error durante la ejecución del experimento');
            setExperimentStatus('configuring');
            addEvent(`Error en experimento '${experimentName}': ${error}`);
        }
    }, [isConfigurationComplete, groups, experimentName, kpi, apiKey, addEvent]);

    const groupDefs: { key: GroupKey; name: string }[] = [
        { key: 'A', name: 'Grupo A (Control)' },
        { key: 'B', name: 'Grupo B (Test 1)' },
        { key: 'C', name: 'Grupo C (Test 2)' },
    ];

    return (
        <div className="bg-slate-900 text-white p-8 rounded-lg min-h-full font-sans">
            <header className="text-center mb-8">
                <h1 className="text-4xl font-bold">Forja de Innovación: Diseño de Experimentos</h1>
                <p className="text-slate-400 mt-2">Arrastra y suelta para configurar tus grupos de reactores y asignarles presets de operación.</p>
            </header>

            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 mb-8">
                <h2 className="font-bold text-lg mb-4 text-cyan-300">Paso 1: Definición del Experimento</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="exp-name" className="block text-sm font-medium text-slate-300 mb-1">Nombre del Experimento</label>
                        <input
                            id="exp-name"
                            type="text"
                            value={experimentName}
                            onChange={e => setExperimentName(e.target.value)}
                            className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="exp-kpi" className="block text-sm font-medium text-slate-300 mb-1">KPI Principal a Optimizar</label>
                        <select
                            id="exp-kpi"
                            value={kpi}
                            onChange={e => setKpi(e.target.value)}
                            className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option>Maximizar Rendimiento de Bio-aceite</option>
                            <option>Maximizar Pureza de Biochar</option>
                            <option>Minimizar Consumo Energético</option>
                            <option>Maximizar Producción de Syngas</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8">
                <aside className="col-span-12 lg:col-span-3 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <h2 className="font-bold text-lg mb-4 text-cyan-300">Biblioteca de CO-PRESETS</h2>
                    <div className="space-y-3 h-[50vh] overflow-y-auto pr-2">
                        {activePresets.map(preset => (
                            <DraggablePreset
                                key={preset.name}
                                preset={preset}
                                onDragStart={() => handleDragStart('preset', preset)}
                            />
                        ))}
                    </div>
                </aside>

                <main className="col-span-12 lg:col-span-9">
                    <h2 className="font-bold text-lg mb-4 text-cyan-300">Paso 2: Lienzo de Flota</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {groupDefs.map(def => (
                            <div
                                key={def.key}
                                onDragOver={handleDragOver}
                                onDrop={() => handleDrop(def.key)}
                                className="bg-slate-800/50 p-4 rounded-lg border-2 border-dashed border-slate-700 min-h-[250px] flex flex-col transition-colors hover:border-cyan-500 hover:bg-slate-800"
                            >
                                <h3 className="font-semibold mb-3 text-slate-300">{def.name}</h3>
                                {groups[def.key].preset ? (
                                    <DroppedPreset preset={groups[def.key].preset!} onRemove={() => handleRemovePreset(def.key)} />
                                ) : (
                                    <div className="text-center text-xs text-slate-500 py-2">Arrastra un preset aquí</div>
                                )}
                                <div className="flex-grow flex flex-wrap gap-2 content-start pt-2 border-t border-slate-700">
                                    {groups[def.key].reactors.map(reactorId => (
                                        <ReactorTag
                                            key={reactorId}
                                            reactorId={reactorId}
                                            onDragStart={() => handleDragStart('reactor', reactorId)}
                                            isAssigned={true}
                                        />
                                    ))}
                                    {groups[def.key].reactors.length === 0 && (
                                        <div className="text-center text-xs text-slate-500 py-2 w-full">Arrastra reactores aquí</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop('unassigned')}
                        className="bg-slate-800/50 p-4 rounded-lg border-2 border-dashed border-slate-700 min-h-[120px]"
                    >
                        <h3 className="font-semibold mb-3 text-slate-300">Reactores Sin Asignar</h3>
                        <div className="flex flex-wrap gap-3">
                            {unassignedReactors.map(reactorId => (
                                <ReactorTag
                                    key={reactorId}
                                    reactorId={reactorId}
                                    onDragStart={() => handleDragStart('reactor', reactorId)}
                                    isAssigned={false}
                                />
                            ))}
                            {unassignedReactors.length === 0 && (
                                <p className="text-sm text-slate-500">Todos los reactores han sido asignados.</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end items-center mt-8 gap-4">
                        {statusMessage && (
                            <p className="text-green-400 font-semibold animate-pulse transition-opacity duration-300">
                                {statusMessage}
                            </p>
                        )}
                        {experimentStatus === 'running' && (
                            <div className="w-64 bg-slate-700 rounded-full h-2 overflow-hidden">
                                <div
                                    className="h-full bg-green-500 transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        )}
                        <button
                            onClick={runExperiment}
                            disabled={!isConfigurationComplete || experimentStatus === 'running' || experimentStatus === 'analyzing'}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-transform transform hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {experimentStatus === 'running' ? '⏳ EJECUTANDO...' :
                                experimentStatus === 'analyzing' ? '📊 ANALIZANDO...' :
                                    experimentStatus === 'completed' ? '🔄 EJECUTAR NUEVO EXPERIMENTO' :
                                        'INICIAR EXPERIMENTO'}
                        </button>
                    </div>

                    {/* 📊 Sección de Resultados */}
                    {experimentStatus === 'completed' && experimentResults && (
                        <div className="mt-8">
                            <ResultsTable results={experimentResults} kpiName={kpi} />

                            {/* 🧠 Post-Experiment Intelligence Panel */}
                            {postExperimentReport && (
                                <PostExperimentPanel report={postExperimentReport} />
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};
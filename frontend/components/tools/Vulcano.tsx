
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import type { View, VulcanoState, Task, UtilityDutyType, VulcanoMachineStatus } from '../../types';
import { ContentType } from '../../types';
import { useTranslations } from '../../contexts/LanguageContext';
import { Accordion } from '../form/Accordion';
import { generateCinematicImage, generateCinematicVideo } from '../../services/geminiService';


interface VulcanoProps {
    vulcanoState: VulcanoState;
    setVulcanoState: React.Dispatch<React.SetStateAction<VulcanoState>>;
    setView: (view: View) => void;
    onNavigateToUtilities: (context: { demands: { [key in UtilityDutyType]?: number }; tab: UtilityDutyType }) => void;
    onSaveTask: (task: Task) => void;
}

// --- Reusable UI Components (for consistency) ---
const Panel: React.FC<React.PropsWithChildren<{ title: string; className?: string }>> = ({ title, children, className }) => (
    <div className={`p-4 rounded-lg bg-slate-800 border border-slate-700 h-full flex flex-col text-slate-300 ${className}`}>
        <h4 className="text-lg font-bold mb-3 text-cyan-400">{title}</h4>
        <div className="space-y-3 flex-grow flex flex-col justify-around">
            {children}
        </div>
    </div>
);


const KpiGauge: React.FC<{ value: number; label: string; }> = ({ value, label }) => {
    const percentage = Math.min(100, Math.max(0, value));
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (percentage / 100) * circumference;
    const color = percentage >= 75 ? '#f87171' : percentage >= 40 ? '#facc15' : '#4ade80';

    return (
        <div className="flex flex-col items-center">
            <svg width="120" height="120" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#374151" strokeWidth="10" />
                <circle
                    cx="50" cy="50" r="45" fill="none"
                    stroke={color}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                    style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                />
                <text x="50" y="50" textAnchor="middle" dy=".3em" fontSize="24" fontWeight="bold" fill="white">
                    {value.toFixed(0)}
                </text>
            </svg>
            <span className="text-sm font-semibold mt-2 text-gray-400">{label}</span>
        </div>
    );
};

const ProgressBar: React.FC<{ value: number; max: number; label?: string; unit?: string }> = ({ value, max, label, unit = 'kg' }) => (
    <div>
        {label && <p className="text-xs text-slate-400">{label}</p>}
        <div className="w-full bg-slate-600 rounded-full h-4 relative overflow-hidden">
            <div className="bg-blue-500 h-4 rounded-full" style={{ width: `${(value / max) * 100}%` }}></div>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                {value.toFixed(1)} / {max.toLocaleString('de-DE')} {unit}
            </div>
        </div>
    </div>
);

const StatusBadge: React.FC<{ status: VulcanoMachineStatus }> = ({ status }) => {
    const { t } = useTranslations();
    const statusInfo: Record<VulcanoMachineStatus, { bg: string; key: string }> = {
        'OK': { bg: 'bg-green-500', key: 'ok' },
        'ATASCO': { bg: 'bg-yellow-500', key: 'jam' },
        'APAGADO': { bg: 'bg-red-500', key: 'off' },
    };
    const key = `vulcano.status.${statusInfo[status]?.key || 'off'}`;
    const info = statusInfo[status] || statusInfo['APAGADO'];
    return <span className={`px-2 py-1 text-xs font-bold rounded-full text-white ${info.bg}`}>{t(key)}</span>;
};


const getIcon = (machineKey: keyof VulcanoState['machines'], isJammed: boolean) => {
    const iconClasses = `h-10 w-10 transition-colors ${isJammed ? 'text-red-400' : 'text-slate-400'}`;
    // A generic icon is used as a placeholder for simplicity.
    return <svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547a2 2 0 00-.547 1.806l.477 2.387a6 6 0 00.517 3.86l.158.318a6 6 0 00.517 3.86l2.387.477a2 2 0 001.806-.547a2 2 0 00.547-1.806l-.477-2.387a6 6 0 00-.517-3.86l-.158-.318a6 6 0 00.517 3.86l2.387.477a2 2 0 001.806-.547a2 2 0 00.547-1.806l-.477-2.387a6 6 0 00-.517-3.86l-.158-.318a6 6 0 01-.517-3.86l.477-2.387a2 2 0 01.547-1.806z" /></svg>;
};

export const Vulcano: React.FC<VulcanoProps> = ({
    vulcanoState,
    setVulcanoState,
    setView,
    onNavigateToUtilities,
    onSaveTask,
}) => {
    const { t } = useTranslations();
    const [activeView, setActiveView] = useState<'dashboard' | 'cinematic'>('dashboard');

    // Cinematic View State
    const [sceneConfig, setSceneConfig] = useState({
        focus: 'generalView',
        state: 'normalOperation',
        elements: { tireFlow: true, maintenanceStaff: false, rubberDust: false, hefestosInterface: false }
    });
    const [cinematicPrompt, setCinematicPrompt] = useState('');
    const [cinematicResult, setCinematicResult] = useState<{ type: 'image' | 'video', url: string } | null>(null);
    const [isGeneratingCinematic, setIsGeneratingCinematic] = useState(false);
    const [cinematicError, setCinematicError] = useState('');
    const [videoProgress, setVideoProgress] = useState(0);
    const [videoStatusMessageKey, setVideoStatusMessageKey] = useState('');
    const [isVeoEnabled, setIsVeoEnabled] = useState(false);
    
    const VULCANO_ELECTRICAL_DEMAND_KW = 648;
    const { isRunning, hefestosLog } = vulcanoState;

     useEffect(() => {
        const checkApiKey = async () => {
            if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
                setIsVeoEnabled(true);
            }
        };
        checkApiKey();
    }, []);

    const handleToggleSystem = () => {
        setVulcanoState(p => {
            const newIsRunning = !p.isRunning;
            const newMachineStatus: VulcanoMachineStatus = newIsRunning ? 'OK' : 'APAGADO';
            
            const logEntry = `${new Date().toLocaleTimeString()}: Sistema ${newIsRunning ? 'iniciado' : 'detenido'}.`;

            return {
                ...p,
                isRunning: newIsRunning,
                machines: {
                    debeader: newMachineStatus,
                    primaryShredder: newMachineStatus,
                    rasperMill: newMachineStatus,
                    granulators: newMachineStatus,
                    magneticSeparators: newMachineStatus,
                    textileClassifiers: newMachineStatus,
                },
                processingRateTiresPerHour: newIsRunning ? 200 : 0,
                hefestosLog: [logEntry, ...(p.hefestosLog || [])].slice(0, 50),
            };
        });
    };

    const handleAnalyzeEnergy = () => {
        onNavigateToUtilities({ demands: { 'process-power': VULCANO_ELECTRICAL_DEMAND_KW }, tab: 'process-power' });
    };

    const handleCreateReport = () => {
        const task: Task = {
            id: `task-vulcano-report-${Date.now()}`,
            title: `Reporte de Producción Vulcano - ${new Date().toLocaleDateString()}`,
            createdAt: Date.now(),
            status: 'Por Hacer',
            contentType: ContentType.Texto,
            formData: {
                objective: "Generar un reporte de producción y viabilidad para el módulo Vulcano.",
                tone: 'Formal',
                specifics: {
                    [ContentType.Texto]: {
                        type: 'Informe Ejecutivo',
                        rawData: JSON.stringify({ ...vulcanoState, hefestosLog: (hefestosLog || []).slice(0,10) }, null, 2),
                    },
                     [ContentType.Imagen]: {}, [ContentType.Video]: {}, [ContentType.Audio]: {}, [ContentType.Codigo]: {},
                },
            },
            isIntelligent: true,
            agentId: 'Helena, la Estratega'
        };
        onSaveTask(task);
        alert('Tarea de reporte creada. Revisa el Gestor de Tareas.');
    };
    
     // --- Cinematic View Logic ---
    useEffect(() => {
        if (activeView !== 'cinematic') return;
        
        const { focus, state, elements } = sceneConfig;

        let base = `Cinematic, photorealistic, wide shot of the 'Vulcano' tire recycling plant. `;
        let mood = '';
        
        switch (focus) {
            case 'shreddingStage': base += `The central focus is the initial shredding area, with the Debeader and Primary Shredder machines. `; break;
            case 'granulationStage': base += `The focus is on the secondary reduction stage, with the Rasper Mill and Granulators working. `; break;
            case 'separationStage': base += `The focus is on the final separation line, showing the magnetic separators for steel and textile classifiers for fiber. `; break;
            default: base += `The view shows the entire processing line, from tire input to final product silos. `; break;
        }

        switch (state) {
            case 'minorJam': mood = `However, the mood is tense. A yellow flashing light indicates a minor jam in one of the machines. The material flow is slowed. `; break;
            case 'systemOverload': mood = `The mood is chaotic. The system is overloaded, with piles of shredded rubber accumulating between stations and alarms flashing. `; break;
            default: mood = `The mood is powerful and efficient. The machinery is running smoothly, processing a constant flow of tires. `; break;
        }

        let elementsDesc = '';
        if (elements.tireFlow) elementsDesc += `Whole used tires are visible on a conveyor belt at the start of the line. `;
        if (elements.maintenanceStaff) elementsDesc += `Maintenance staff in hard hats and high-visibility vests are monitoring the machinery. `;
        if (elements.hefestosInterface) elementsDesc += `A semi-transparent holographic interface, the 'Interfaz de Hefesto', hovers in the air, showing real-time machine status and throughput data. `;
        if (elements.rubberDust) elementsDesc += `The air is thick with rubber dust, caught in the beams of industrial lighting. `;

        const ending = `The atmosphere is industrial and loud. High detail, 8k, gritty cinematic style.`;
        
        setCinematicPrompt(`${base}${mood}${elementsDesc}${ending}`);

    }, [sceneConfig, activeView]);

    const handleGenerateImage = async () => {
        setIsGeneratingCinematic(true); setCinematicError(''); setCinematicResult(null);
        try {
            const imageData = await generateCinematicImage(cinematicPrompt);
            setCinematicResult({ type: 'image', url: `data:image/jpeg;base64,${imageData}` });
        } catch (error) { setCinematicError("Error al generar la imagen."); } 
        finally { setIsGeneratingCinematic(false); }
    };
    
    const handleGenerateVideo = async () => {
        setIsGeneratingCinematic(true); setCinematicError(''); setCinematicResult(null); setVideoProgress(0); setVideoStatusMessageKey('');
        const onProgress = (key: string, prog: number) => { setVideoStatusMessageKey(key); setVideoProgress(prog); };
        try {
            const videoUrl = await generateCinematicVideo(cinematicPrompt, onProgress);
            setCinematicResult({ type: 'video', url: videoUrl });
            setIsVeoEnabled(true);
        } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            if (msg.includes("Requested entity was not found")) {
                setIsVeoEnabled(false); setCinematicError(t('hmi.cinematicView.apiKeyError'));
            } else { setCinematicError(msg); }
        } finally { setIsGeneratingCinematic(false); }
    };

    const handleSaveToTasks = () => {
        if (!cinematicResult) return;
        const task: Task = {
            id: `task-vulcano-vis-${Date.now()}`,
            title: `Visualización Vulcano: ${sceneConfig.focus} (${sceneConfig.state})`,
            createdAt: Date.now(),
            status: 'Completado',
            contentType: cinematicResult.type === 'image' ? ContentType.Imagen : ContentType.Video,
            formData: { objective: cinematicPrompt },
            result: { text: cinematicPrompt },
            videoUrl: cinematicResult.type === 'video' ? cinematicResult.url : undefined,
        };
        onSaveTask(task);
        alert(`Tarea "${task.title}" creada en el Gestor de Tareas.`);
    };

    // --- End Cinematic View Logic ---

    return (
        <div className="bg-slate-900 text-white p-6 rounded-lg shadow-2xl">
            <header className="text-center mb-6 border-b border-slate-700 pb-4">
                <div className="flex justify-center items-center gap-4">
                    <h2 className="text-3xl font-bold">{t('vulcano.title')}</h2>
                    <div className="flex items-center gap-1 p-1 bg-slate-800 rounded-md border border-slate-700">
                        <button onClick={() => setActiveView('dashboard')} className={`px-3 py-1 text-sm rounded ${activeView === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}>{t('hmi.tabs.controlPanel')}</button>
                        <button onClick={() => setActiveView('cinematic')} className={`px-3 py-1 text-sm rounded ${activeView === 'cinematic' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}>{t('hmi.tabs.cinematicView')}</button>
                    </div>
                    <div className="flex items-center">
                        <input id="vulcano-toggle" type="checkbox" checked={isRunning} onChange={handleToggleSystem} className="sr-only" />
                        <label htmlFor="vulcano-toggle" className={`relative inline-flex items-center h-8 w-16 cursor-pointer rounded-full transition-colors ${isRunning ? 'bg-green-500' : 'bg-red-500'}`}>
                            <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${isRunning ? 'translate-x-9' : 'translate-x-1'}`}/>
                        </label>
                         <span className={`ml-3 font-bold text-lg ${isRunning ? 'text-green-400' : 'text-red-400'}`}>{isRunning ? 'OPERATIVO' : 'DETENIDO'}</span>
                    </div>
                </div>
                <p className="mt-2 text-md text-slate-400">{t('vulcano.subtitle')}</p>
            </header>
            
            {activeView === 'dashboard' && (
                <div className="space-y-6">
                    {/* Top Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Panel title={t('vulcano.receptionTitle')}>
                            <div>
                                <label className="text-sm">{t('vulcano.inputLabel')}</label>
                                <input type="number" value={vulcanoState.inputTonsPerDay} onChange={e => setVulcanoState(p => ({ ...p, inputTonsPerDay: Number(e.target.value) }))} className="w-full mt-1 p-2 bg-slate-700 border border-slate-600 rounded-md"/>
                            </div>
                            <ProgressBar value={vulcanoState.storageLevelTons} max={1000} label={t('vulcano.storageLevel')} unit="ton" />
                        </Panel>

                        <Panel title={t('vulcano.processingLineTitle')}>
                            <div className="text-center">
                                <p className="text-sm text-slate-400">{t('vulcano.processingRate')}</p>
                                <p className="text-4xl font-mono font-bold text-white">{vulcanoState.processingRateTiresPerHour.toFixed(0)} <span className="text-2xl text-slate-300">{t('vulcano.tiresPerHour')}</span></p>
                            </div>
                             <div className="grid grid-cols-2 gap-3">
                                {(Object.entries(vulcanoState.machines) as [keyof VulcanoState['machines'], VulcanoMachineStatus][]).map(([key, status]) => {
                                    const isJammed = status === 'ATASCO';
                                    return (
                                        <div key={key} className={`p-3 rounded-md flex items-center gap-3 transition-colors ${isJammed ? 'bg-red-900/50 border border-red-700' : 'bg-slate-700/50'}`}>
                                            {getIcon(key, isJammed)}
                                            <div>
                                                <p className="text-sm font-semibold">{t(`vulcano.${key}`)}</p>
                                                <StatusBadge status={status} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Panel>

                        <Panel title={t('vulcano.outputTitle')}>
                            <div className="space-y-2">
                                 <ProgressBar value={vulcanoState.siloLevelsKg.gcr} max={20000} label={`${t('vulcano.gcr')} Silo`} />
                                 <ProgressBar value={vulcanoState.siloLevelsKg.steel} max={10000} label={`${t('vulcano.steel')} Silo`} />
                                 <ProgressBar value={vulcanoState.siloLevelsKg.fiber} max={5000} label={`${t('vulcano.fiber')} Silo`} />
                            </div>
                        </Panel>
                    </div>

                    {/* Bottom Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Panel title={t('vulcano.storageKpisTitle')}>
                            <div className="flex justify-around items-center h-full">
                                <KpiGauge value={vulcanoState.fireRisk} label={t('vulcano.fireRisk')} />
                                <KpiGauge value={vulcanoState.sanitaryRisk} label={t('vulcano.sanitaryRisk')} />
                            </div>
                        </Panel>
                        <Panel title={t('vulcano.hefestosLog.title')}>
                            <div className="space-y-2 h-48 overflow-y-auto pr-2 bg-slate-900/50 rounded-md p-2 font-mono text-xs">
                                {hefestosLog && hefestosLog.length > 0 ? (
                                    hefestosLog.map((log, index) => <p key={index}>{log}</p>)
                                ) : (
                                    <p className="text-slate-500 italic">{t('vulcano.hefestosLog.noMessages')}</p>
                                )}
                            </div>
                        </Panel>
                         <Panel title="Análisis y Sinergias">
                            <button onClick={handleAnalyzeEnergy} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700">{t('vulcano.energyCost.analyzeButton')}</button>
                            <button onClick={handleCreateReport} className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700">{t('vulcano.reportButton')}</button>
                            <button onClick={() => setView('hyperion-9')} className="w-full bg-gray-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-700">Ir a SMC Hyperion-9</button>
                            <button onClick={() => setView('fleet-simulator')} className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-700">Usar GCR en Orquestador de Flota</button>
                            <button onClick={() => setView('circular-fleet')} className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700">Ir a Flota Circular</button>
                        </Panel>
                    </div>
                </div>
            )}
            {activeView === 'cinematic' && (
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-6">
                        <Panel title={t('vulcano.cinematic.title')}>
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-slate-300">{t('vulcano.cinematic.focus')}</label>
                                    <select value={sceneConfig.focus} onChange={e => setSceneConfig(p => ({ ...p, focus: e.target.value }))} className="w-full p-2 mt-1 bg-slate-700 border border-slate-600 rounded-md">
                                        <option value="generalView">{t('vulcano.cinematic.generalView')}</option>
                                        <option value="shreddingStage">{t('vulcano.cinematic.shreddingStage')}</option>
                                        <option value="granulationStage">{t('vulcano.cinematic.granulationStage')}</option>
                                        <option value="separationStage">{t('vulcano.cinematic.separationStage')}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-300">{t('vulcano.cinematic.state')}</label>
                                    <select value={sceneConfig.state} onChange={e => setSceneConfig(p => ({ ...p, state: e.target.value }))} className="w-full p-2 mt-1 bg-slate-700 border border-slate-600 rounded-md">
                                        <option value="normalOperation">{t('vulcano.cinematic.normalOperation')}</option>
                                        <option value="minorJam">{t('vulcano.cinematic.minorJam')}</option>
                                        <option value="systemOverload">{t('vulcano.cinematic.systemOverload')}</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <h5 className="text-sm font-semibold mb-2">{t('hmi.cinematicView.additionalElements')}</h5>
                                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                                        <label className="flex items-center gap-2 cursor-pointer text-xs"><input type="checkbox" checked={sceneConfig.elements.tireFlow} onChange={e => setSceneConfig(p => ({ ...p, elements: { ...p.elements, tireFlow: e.target.checked } }))} /><span>{t('vulcano.cinematic.tireFlow')}</span></label>
                                        <label className="flex items-center gap-2 cursor-pointer text-xs"><input type="checkbox" checked={sceneConfig.elements.maintenanceStaff} onChange={e => setSceneConfig(p => ({ ...p, elements: { ...p.elements, maintenanceStaff: e.target.checked } }))} /><span>{t('vulcano.cinematic.maintenanceStaff')}</span></label>
                                        <label className="flex items-center gap-2 cursor-pointer text-xs"><input type="checkbox" checked={sceneConfig.elements.rubberDust} onChange={e => setSceneConfig(p => ({ ...p, elements: { ...p.elements, rubberDust: e.target.checked } }))} /><span>{t('vulcano.cinematic.rubberDust')}</span></label>
                                        <label className="flex items-center gap-2 cursor-pointer text-xs"><input type="checkbox" checked={sceneConfig.elements.hefestosInterface} onChange={e => setSceneConfig(p => ({ ...p, elements: { ...p.elements, hefestosInterface: e.target.checked } }))} /><span>{t('vulcano.cinematic.hefestosInterface')}</span></label>
                                    </div>
                                </div>
                            </div>
                        </Panel>
                        <Panel title={t('hmi.cinematicView.cinematicCreation')}>
                            <textarea value={cinematicPrompt} readOnly rows={10} className="w-full p-3 bg-slate-900 border border-slate-600 rounded-md text-slate-200 font-mono text-xs"/>
                         {isVeoEnabled ? (
                            <div className="flex gap-4">
                                <button onClick={handleGenerateVideo} disabled={isGeneratingCinematic} className="w-full bg-purple-600 text-white font-bold py-2 rounded-lg hover:bg-purple-700 disabled:bg-slate-600">{t('hmi.cinematicView.createVideo')}</button>
                                <button onClick={handleGenerateImage} disabled={isGeneratingCinematic} className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg hover:bg-indigo-700 disabled:bg-slate-600">{t('hmi.cinematicView.generateImage')}</button>
                            </div>
                        ) : (
                             <button onClick={handleGenerateImage} disabled={isGeneratingCinematic} className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg hover:bg-indigo-700 disabled:bg-slate-600">{t('hmi.cinematicView.generateImage')}</button>
                        )}
                    </Panel>
                </div>
                 <Panel title={t('hmi.cinematicView.cinematicVisualization')}>
                    <div className="flex items-center justify-center bg-black rounded-md min-h-[300px] h-full">
                       {isGeneratingCinematic ? <p>Generando...</p> : cinematicError ? <p className="text-red-400">{cinematicError}</p> : cinematicResult ? (
                            <div className="w-full h-full flex flex-col gap-4">
                                {cinematicResult.type === 'image' ? <img src={cinematicResult.url} alt="Visualización Vulcano" className="max-h-full max-w-full rounded-md object-contain flex-grow" /> : <video src={cinematicResult.url} controls autoPlay loop className="max-h-full max-w-full rounded-md flex-grow" />}
                                <button onClick={handleSaveToTasks} className="w-full bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700">{t('vulcano.visualization.saveTask')}</button>
                            </div>
                       ) : <p className="text-slate-500">{t('hmi.cinematicView.visualizationPlaceholder')}</p>}
                    </div>
                </Panel>
            </div>
            )}
        </div>
    );
};

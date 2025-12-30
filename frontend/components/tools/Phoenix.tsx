import React, { useState, useMemo, useEffect } from 'react';
// FIX: Removed AIStudio from type imports as it is a global type and does not need to be explicitly imported.
import type { ArgusModel, PhoenixState, WasteComposition, Task, UtilityDutyType, View } from '../../types';
import { ContentType } from '../../types';
import { useUtilityCosts } from '../../contexts/UtilityCostContext';
import { PRESETS } from '../../data/presets';
import { useTranslations } from '../../contexts/LanguageContext';
import { generateCinematicImage, generateCinematicVideo } from '../../services/geminiService';
import { InsightCard, InsightCardData } from '../nexo/InsightCard';

// --- Reusable UI Components (for consistency) ---
const Panel: React.FC<React.PropsWithChildren<{ title: string; className?: string }>> = ({ title, children, className }) => (
    <div className={`p-4 rounded-lg bg-slate-800 border border-slate-700 h-full flex flex-col ${className}`}>
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
    const color = percentage > 90 ? '#4ade80' : percentage > 75 ? '#facc15' : '#f87171';

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
                <text x="50" y="50" textAnchor="middle" dy=".3em" fontSize="20" fontWeight="bold" fill="white">
                    {value.toFixed(1)}%
                </text>
            </svg>
            <span className="text-xs font-semibold mt-2 text-gray-400">{label}</span>
        </div>
    );
};

const MachineStatusIndicator: React.FC<{ name: string; status: 'OK' | 'ATASCO' | 'SOBRECALENTAMIENTO' }> = ({ name, status }) => {
    const color = status === 'OK' ? 'bg-green-500' : 'bg-red-500 animate-pulse';
    return (
        <div className="flex justify-between items-center p-2 bg-gray-700 rounded">
            <span className="text-sm font-medium text-gray-300">{name}</span>
            <div className="flex items-center gap-2">
                <span className="text-xs font-semibold">{status}</span>
                <div className={`w-3 h-3 rounded-full ${color}`}></div>
            </div>
        </div>
    );
};

const KpiCard: React.FC<{ title: string; value: string; unit: string; colorClass: string }> = ({ title, value, unit, colorClass }) => (
    <div className="bg-slate-700 p-3 rounded-lg text-center">
        <p className="text-xs text-slate-400">{title}</p>
        <p className={`text-2xl font-bold font-mono mt-1 ${colorClass}`}>
            {value}
            <span className="text-base text-slate-300 ml-1.5">{unit}</span>
        </p>
    </div>
);


interface PhoenixProps {
    phoenixState: PhoenixState;
    setPhoenixState: React.Dispatch<React.SetStateAction<PhoenixState>>;
    argusModel: ArgusModel;
    onNavigateToUtilities: (context: { demands: { [key in UtilityDutyType]?: number }; tab: UtilityDutyType }) => void;
    onSaveTask: (task: Task) => void;
}

// Fixed demands for Phoenix
const PHOENIX_ELECTRICAL_DEMAND_KW = 385;
const PHOENIX_PNEUMATIC_DEMAND_M3_H = 150;
const BASE_THERMAL_DEMAND_MW = 1.2;

export const Phoenix: React.FC<PhoenixProps> = ({ phoenixState, setPhoenixState, argusModel, onNavigateToUtilities, onSaveTask }) => {
    const { t } = useTranslations();
    const [inputHumidity, setInputHumidity] = useState(15);
    const [activeView, setActiveView] = useState<'dashboard' | 'cinematic'>('dashboard');

    // Cinematic View State
    const [sceneConfig, setSceneConfig] = useState({
        focus: 'general',
        state: 'normal',
        elements: { materialFlow: true, maintenance: false, argusInterface: false, ambience: false }
    });
    const [cinematicPrompt, setCinematicPrompt] = useState('');
    const [cinematicResult, setCinematicResult] = useState<{ type: 'image' | 'video', url: string } | null>(null);
    const [isGeneratingCinematic, setIsGeneratingCinematic] = useState(false);
    const [cinematicError, setCinematicError] = useState('');
    const [videoProgress, setVideoProgress] = useState(0);
    const [videoStatusMessageKey, setVideoStatusMessageKey] = useState('');
    const [isVeoEnabled, setIsVeoEnabled] = useState(false);

    // Nexo Sinérgico State
    const [insightCardData, setInsightCardData] = useState<InsightCardData | null>(null);
    const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
    const [insightError, setInsightError] = useState('');

    const { costs } = useUtilityCosts();
    const { isRunning, wasteComposition, argusKpis, continuousLearning, trituradorasStatus, secadorStatus, pelletProduction, pelletQuality, pelletSiloLevel } = phoenixState;

    useEffect(() => {
        const checkApiKey = async () => {
            if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
                setIsVeoEnabled(true);
            }
        };
        checkApiKey();
    }, []);

    const realTimeCalculations = useMemo(() => {
        if (!isRunning) {
            return { dynamicThermalDemandMW: 0, pneumaticPower_kW: 0, electricalCost: 0, thermalCost: 0, pneumaticCost: 0, totalCost: 0, energyIntensity: 0 };
        }
        const dynamicThermalDemandMW = BASE_THERMAL_DEMAND_MW * (1 + (inputHumidity - 15) * 0.05);

        const p1 = 1.01325; const n = 1.4; const R = 8.314; const T1 = 298.15;
        const p2 = 6 + p1;
        const work_j_mol = (n * R * T1 / (n - 1)) * (Math.pow(p2 / p1, (n - 1) / n) - 1);
        const flow_mol_s = (PHOENIX_PNEUMATIC_DEMAND_M3_H / 3600) * (p1 * 1e5) / (R * T1);
        const ideal_power_w = work_j_mol * flow_mol_s;
        const pneumaticPower_kW = (ideal_power_w / 1000) / 0.75;

        const electricalCost = PHOENIX_ELECTRICAL_DEMAND_KW * costs.gridElectricityPrice;
        const thermalCost = dynamicThermalDemandMW * 3.412 * costs.firedHeatPriceMMBtu;
        const pneumaticCost = pneumaticPower_kW * costs.compressedAirPriceKwh;
        const totalCost = electricalCost + thermalCost + pneumaticCost;

        const totalPowerDemand_kW = PHOENIX_ELECTRICAL_DEMAND_KW + (dynamicThermalDemandMW * 1000) + pneumaticPower_kW;
        const pelletProductionTonsPerHour = pelletProduction / 1000;
        const energyIntensity = pelletProductionTonsPerHour > 0 ? totalPowerDemand_kW / pelletProductionTonsPerHour : 0;

        return { dynamicThermalDemandMW, pneumaticPower_kW, electricalCost, thermalCost, pneumaticCost, totalCost, energyIntensity };
    }, [isRunning, inputHumidity, costs, pelletProduction]);

    const handleCompositionChange = (key: keyof WasteComposition, value: number) => {
        setPhoenixState(prevState => {
            const newComposition: WasteComposition = { ...prevState.wasteComposition, [key]: value };

            let total = Object.values(newComposition).reduce((sum, v) => sum + v, 0);

            if (total > 100) {
                const overflow = total - 100;
                const otherKeys = (Object.keys(newComposition) as Array<keyof WasteComposition>).filter(k => k !== key);
                let totalOther = otherKeys.reduce((sum, k) => sum + newComposition[k], 0);

                if (totalOther > 0) {
                    for (const otherKey of otherKeys) {
                        newComposition[otherKey] = Math.max(0, newComposition[otherKey] - overflow * (newComposition[otherKey] / totalOther));
                    }
                }
            }

            let finalTotal = Object.values(newComposition).reduce((sum, v) => sum + v, 0);
            if (finalTotal > 0 && finalTotal !== 100) {
                const scale = 100 / finalTotal;
                (Object.keys(newComposition) as Array<keyof WasteComposition>).forEach(k => { newComposition[k] = newComposition[k] * scale; });
            }

            let finalFinalTotal = Object.values(newComposition).reduce((a, b) => a + b, 0);
            let diff = 100 - finalFinalTotal;
            if (diff !== 0 && (Object.keys(newComposition) as Array<keyof WasteComposition>).length > 0) {
                const firstKey = (Object.keys(newComposition) as Array<keyof WasteComposition>)[0];
                newComposition[firstKey] += diff;
            }

            return { ...prevState, wasteComposition: newComposition };
        });
    };

    useEffect(() => {
        if (!isRunning) {
            // Reiniciar métricas cuando se detiene
            setPhoenixState(p => ({
                ...p,
                argusKpis: {
                    tasaClasificacion: 0,
                    purezaOrganico: 0,
                    eficienciaDeteccion: 0,
                },
                pelletProduction: 0,
                pelletQuality: {
                    purity: 0,
                    moisture: 0,
                },
                trituradorasStatus: 'OK',
                secadorStatus: 'OK',
            }));
            return;
        }

        const simulationInterval = setInterval(() => {
            setPhoenixState(prevState => {
                const newState = { ...prevState };

                // Simular fallos aleatorios de máquinas
                let machineFailure = false;
                if (Math.random() < 0.05) { // 5% de probabilidad de fallo por tick
                    newState.trituradorasStatus = Math.random() < 0.5 ? 'ATASCO' : 'SOBRECALENTAMIENTO';
                    machineFailure = true;
                } else {
                    newState.trituradorasStatus = 'OK';
                }
                if (Math.random() < 0.03) { // 3% de probabilidad de fallo del secador
                    newState.secadorStatus = 'SOBRECALENTAMIENTO';
                    machineFailure = true;
                } else {
                    newState.secadorStatus = 'OK';
                }

                if (machineFailure) {
                    // Si una máquina falla, la producción se detiene
                    newState.pelletProduction = 0;
                    newState.argusKpis.tasaClasificacion = 0;
                } else {
                    // Operación normal
                    const baseProduction = 2500; // kg/h
                    const organicPercentage = newState.wasteComposition.biomasaOrganica / 100;
                    const contaminantPercentage = (newState.wasteComposition.plasticosContaminantes + newState.wasteComposition.metales + newState.wasteComposition.inertes) / 100;

                    // La producción depende de la materia orgánica
                    newState.pelletProduction = baseProduction * organicPercentage * (1 - Math.random() * 0.1); // fluctuación de producción

                    // KPIs de Argus
                    const baseRate = 800; // items/min
                    newState.argusKpis.tasaClasificacion = baseRate * (1 - Math.random() * 0.15); // fluctuación de tasa
                    newState.argusKpis.eficienciaDeteccion = Math.max(85, argusModel.precision - contaminantPercentage * 10 - Math.random() * 2);
                    newState.argusKpis.purezaOrganico = Math.max(80, 99 - contaminantPercentage * 5 - Math.random() * 2);
                }

                // Calidad del pellet
                newState.pelletQuality.purity = newState.argusKpis.purezaOrganico;
                newState.pelletQuality.moisture = Math.max(5, inputHumidity / 2 - Math.random() * 2);

                // El nivel del silo aumenta con la producción
                const productionPerSecond = newState.pelletProduction / 3600;
                newState.pelletSiloLevel = Math.min(10000, prevState.pelletSiloLevel + productionPerSecond * 2); // El intervalo es de 2s

                return newState;
            });
        }, 2000); // Actualizar cada 2 segundos

        return () => clearInterval(simulationInterval);

    }, [isRunning, setPhoenixState, argusModel.precision, inputHumidity]);

    // --- Cinematic View Logic ---
    useEffect(() => {
        if (activeView !== 'cinematic') return;

        const { focus, state, elements } = sceneConfig;

        let base = `Cinematic, photorealistic, wide shot of the 'Phoenix' intelligent separation plant. `;
        let mood = '';

        switch (focus) {
            case 'classifier': base += `The central focus is the 'Argus' vision system, a complex array of high-speed cameras and sensors mounted over a conveyor belt. `; break;
            case 'preprocessing': base += `The focus is on the heavy machinery of the pre-processing line, specifically the T-101 and T-102 shredders and the D-102 band dryer. `; break;
            case 'pelletizing': base += `The focus is on the final stage, the pelletizing system, where purified organic material is densified into pellets. `; break;
            default: base += `The view encompasses the pre-processing line with shredders and dryers, leading into the Argus classification system. `; break;
        }

        switch (state) {
            case 'jam': mood = `However, the mood is tense. Red flashing maintenance lights in the background signal an 'ATASCO' (Jam) in the primary shredding unit. The main conveyor belt is unusually sparse with material, indicating a bottleneck upstream. `; break;
            case 'low_efficiency': mood = `The mood is slightly off. The system is running, but the Argus classifier seems to be misidentifying items, leading to a lower purity output. `; break;
            default: mood = `The mood is efficient and operational. Machinery hums steadily, and material flows smoothly through the system. `; break;
        }

        let elementsDesc = '';
        if (elements.materialFlow) elementsDesc += `The items on the belt—a mix of organic biomass, plastic fragments, and metal scraps—are scanned by laser light, representing the 'Flujo de Materiales'. `;
        if (elements.maintenance && state === 'jam') elementsDesc += `A maintenance crew in protective gear is working near the jammed shredder, adding a sense of urgency. `;
        if (elements.argusInterface) elementsDesc += `A semi-transparent holographic overlay, the 'Interfaz de Datos de Argus', hovers in the air, showing real-time classification data ${state === 'jam' ? 'and highlighting the reduced \'items/min\' rate due to the stoppage' : state === 'low_efficiency' ? 'with warning indicators on misclassified items' : ''}. `;
        if (elements.ambience) elementsDesc += `The atmosphere is filled with a light haze of dust from the shredders and steam from the dryer, caught in the industrial lighting. `;

        const ending = `The atmosphere is filled with the low hum of electronics${state === 'jam' ? ', contrasting with the absent roar of the jammed shredders' : ''}. High detail, 8k, industrial cinematic style.`;

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
            id: `task-phoenix-vis-${Date.now()}`,
            title: `Visualización Phoenix: ${sceneConfig.focus} (${sceneConfig.state})`,
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

    const handleToggleSystem = () => setPhoenixState(p => ({ ...p, isRunning: !p.isRunning }));

    const handleAnalyzeFootprint = () => {
        onNavigateToUtilities({
            demands: {
                'process-power': PHOENIX_ELECTRICAL_DEMAND_KW,
                'fired-heat': realTimeCalculations.dynamicThermalDemandMW,
                'compressed-air': PHOENIX_PNEUMATIC_DEMAND_M3_H,
            },
            tab: 'process-power'
        });
    };

    const handleGenerateInsight = async () => {
        setIsGeneratingInsight(true);
        setInsightError('');

        try {
            const nexoBackendUrl = import.meta.env.VITE_NEXO_BACKEND_URL || 'http://localhost:8000';

            const payload = {
                timestamp: new Date().toISOString(),
                source_module: 'PHOENIX_V1',
                project_id: null,
                data_context: {
                    inputs: {
                        demand_power_kw: PHOENIX_ELECTRICAL_DEMAND_KW,
                        purity_organic: argusKpis.purezaOrganico,
                        efficiency_detection: argusKpis.eficienciaDeteccion,
                        pellet_production_kg_h: pelletProduction,
                        input_humidity: inputHumidity
                    },
                    calculated_results: {
                        hourly_cost_eur: realTimeCalculations.totalCost,
                        thermal_demand_mw: realTimeCalculations.dynamicThermalDemandMW,
                        energy_intensity_kwh_kg: realTimeCalculations.energyIntensity,
                        pellet_quality_score: (pelletQuality.purity + (100 - pelletQuality.moisture)) / 2
                    }
                },
                user_intent: {
                    action: 'GENERATE_EFFICIENCY_REPORT',
                    target_audience: 'TECHNICAL_INVESTORS',
                    tone: 'ANALYTICAL_OPTIMISTIC'
                }
            };

            const response = await fetch(`${nexoBackendUrl}/api/nexo/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data: InsightCardData = await response.json();
            setInsightCardData(data);
        } catch (error) {
            console.error('Error generating insight:', error);
            setInsightError(
                error instanceof Error
                    ? error.message
                    : 'No se pudo conectar con el backend de Nexo. Asegúrate de que esté ejecutándose en http://localhost:8000'
            );
        } finally {
            setIsGeneratingInsight(false);
        }
    };

    const handleInsightAction = (actionId: string) => {
        console.log('Insight action:', actionId);
        // TODO: Implement actions (download PDF, share LinkedIn, regenerate)
        if (actionId === 'regenerate') {
            setInsightCardData(null);
            handleGenerateInsight();
        }
    };

    const handleCreateDatasheet = () => {
        const preset = PRESETS.find(p => p.name === "Ficha Técnica de Pellet");
        if (!preset?.data?.specifics?.[ContentType.Texto]?.rawData) return;

        let rawData = preset.data.specifics[ContentType.Texto].rawData
            .replace('{purity}', pelletQuality.purity.toFixed(2))
            .replace('{moisture}', pelletQuality.moisture.toFixed(2))
            .replace('{intensity}', realTimeCalculations.energyIntensity.toFixed(2));

        const task: Task = {
            id: `task-phoenix-datasheet-${Date.now()}`,
            title: `Ficha Técnica: Pellet Phoenix ${new Date().toLocaleDateString()}`,
            createdAt: Date.now(),
            status: 'Completado',
            contentType: ContentType.Texto,
            formData: {
                ...preset.data,
                objective: `Generar ficha técnica para pellet producido (Pureza: ${pelletQuality.purity.toFixed(1)}%).`,
                specifics: {
                    [ContentType.Texto]: { ...(preset.data.specifics?.[ContentType.Texto] || {}), rawData },
                    [ContentType.Imagen]: preset.data.specifics?.[ContentType.Imagen] || {},
                    [ContentType.Video]: preset.data.specifics?.[ContentType.Video] || {},
                    [ContentType.Audio]: preset.data.specifics?.[ContentType.Audio] || {},
                    [ContentType.Codigo]: preset.data.specifics?.[ContentType.Codigo] || {},
                },
            },
            result: { text: rawData },
            eventType: 'ExecutiveReport'
        };
        onSaveTask(task);
        alert('Tarea "Ficha Técnica de Pellet" creada en el Gestor de Tareas.');
    };

    return (
        <div className="bg-gray-900 text-white p-6 rounded-lg shadow-2xl">
            <style>{`.dot { transition: transform 0.3s ease; }`}</style>
            <header className="text-center mb-6 border-b border-gray-700 pb-4">
                <div className="flex justify-center items-center gap-4">
                    <h2 className="text-3xl font-bold">Módulo de Simulación "Phoenix"</h2>
                    <div className="flex items-center gap-1 p-1 bg-slate-800 rounded-md border border-slate-700">
                        <button onClick={() => setActiveView('dashboard')} className={`px-3 py-1 text-sm rounded ${activeView === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}>{t('hmi.tabs.controlPanel')}</button>
                        <button onClick={() => setActiveView('cinematic')} className={`px-3 py-1 text-sm rounded ${activeView === 'cinematic' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}>{t('hmi.tabs.cinematicView')}</button>
                    </div>
                    <div className="flex items-center">
                        <input id="system-toggle" type="checkbox" checked={isRunning} onChange={handleToggleSystem} className="sr-only" />
                        <label htmlFor="system-toggle" className={`relative inline-flex items-center h-8 w-16 cursor-pointer rounded-full transition-colors ${isRunning ? 'bg-green-500' : 'bg-red-500'}`}>
                            <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${isRunning ? 'translate-x-9' : 'translate-x-1'}`} />
                        </label>
                        <span className={`ml-3 font-bold text-lg ${isRunning ? 'text-green-400' : 'text-red-400'}`}>{isRunning ? 'OPERATIVO' : 'DETENIDO'}</span>
                    </div>
                </div>
                <p className="mt-2 text-md text-gray-400">Planta de Separación y Peletización Inteligente</p>
            </header>

            {activeView === 'dashboard' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-gray-800 p-4 rounded-lg">
                            <h3 className="font-bold mb-3 text-cyan-400">Panel de Configuración de Entrada</h3>
                            <div className="space-y-3">
                                {(Object.keys(wasteComposition) as Array<keyof WasteComposition>).map(key => (
                                    <div key={key}>
                                        <label htmlFor={key} className="text-sm flex justify-between">
                                            <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                                            <span className="font-mono">{Number(wasteComposition[key]).toFixed(1)}%</span>
                                        </label>
                                        <input id={key} type="range" min="0" max="100" step="0.1" value={Number(wasteComposition[key])} onChange={(e) => handleCompositionChange(key, parseFloat(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-gray-800 p-4 rounded-lg">
                            <h3 className="font-bold mb-3 text-cyan-400">Panel de Estado: Pre-procesamiento</h3>
                            <div className="space-y-2">
                                <MachineStatusIndicator name="Trituradora Primaria T-101" status={trituradorasStatus} />
                                <MachineStatusIndicator name="Trituradora Secundaria T-102" status={trituradorasStatus} />
                                <MachineStatusIndicator name="Secador de Banda D-102" status={secadorStatus} />
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1 bg-gray-800 p-4 rounded-lg flex flex-col items-center">
                        <h3 className="font-bold mb-4 text-center text-cyan-400">Panel de Clasificación (Argus)</h3>
                        <div className="text-center">
                            <p className="text-xs text-gray-400 uppercase">Tasa de Clasificación</p>
                            <p className="text-5xl font-mono font-bold">{argusKpis.tasaClasificacion.toFixed(0)}</p>
                            <p className="text-sm text-gray-500">items/min</p>
                        </div>
                        <div className="my-4 w-full h-48 bg-gray-900 rounded-lg flex items-center justify-center border border-cyan-500/30"><p className="text-sm text-cyan-300 animate-pulse">Cámara de Visión (Simulada)</p></div>
                        <div className="flex w-full justify-around mt-2">
                            <KpiGauge value={argusKpis.purezaOrganico} label="Pureza Orgánico" />
                            <KpiGauge value={argusKpis.eficienciaDeteccion} label="Eficiencia Detección" />
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-700 w-full">
                            <label htmlFor="continuous-learning-toggle" className="flex items-center justify-between cursor-pointer">
                                <span className="font-semibold text-gray-300">{t('phoenix.argus.continuousLearning')}</span>
                                <div className="relative">
                                    <input id="continuous-learning-toggle" type="checkbox" className="sr-only" checked={continuousLearning} onChange={() => setPhoenixState(p => ({ ...p, continuousLearning: !p.continuousLearning }))} />
                                    <div className={`block w-14 h-8 rounded-full ${continuousLearning ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${continuousLearning ? 'translate-x-6' : ''}`}></div>
                                </div>
                            </label>
                            <p className="text-xs text-gray-500 mt-1">{t('phoenix.argus.continuousLearningDesc')}</p>
                            {continuousLearning && <div className="mt-2 text-xs text-green-400 font-semibold animate-pulse">{t('phoenix.argus.learningActive')}</div>}
                        </div>
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-gray-800 p-4 rounded-lg">
                            <h3 className="font-bold mb-3 text-cyan-400">Panel de Salida (Almacén)</h3>
                            <div className="space-y-4">
                                <div className="p-3 bg-gray-700 rounded-lg"><p className="text-xs text-gray-400">Producción</p><p className="text-2xl font-mono font-bold">{pelletProduction.toFixed(0)} <span className="text-lg text-gray-300">kg/h</span></p></div>
                                <div className="p-3 bg-gray-700 rounded-lg"><p className="text-xs text-gray-400 mb-2">Calidad</p><div className="space-y-1 text-sm"><div className="flex justify-between"><span>Pureza:</span> <span className="font-mono">{pelletQuality.purity.toFixed(2)}%</span></div><div className="flex justify-between"><span>Humedad:</span> <span className="font-mono">{pelletQuality.moisture.toFixed(2)}%</span></div></div></div>
                                <div className="p-3 bg-gray-700 rounded-lg"><p className="text-xs text-gray-400 mb-1">Nivel del Silo</p><div className="w-full bg-gray-600 rounded-full h-4"><div className="bg-yellow-600 h-4 rounded-full" style={{ width: `${(pelletSiloLevel / 10000) * 100}%` }}></div></div><p className="text-right text-xs mt-1 font-mono">{pelletSiloLevel.toFixed(1)} / 10,000 kg</p></div>
                            </div>
                        </div>

                        <div className="bg-gray-800 p-4 rounded-lg">
                            <h3 className="font-bold mb-3 text-cyan-400">Costos Operativos en Tiempo Real</h3>
                            <div>
                                <label className="text-sm flex justify-between"><span>Humedad Biomasa de Entrada</span><span className="font-mono">{inputHumidity.toFixed(1)}%</span></label>
                                <input type="range" min="10" max="60" step="0.5" value={inputHumidity} onChange={e => setInputHumidity(parseFloat(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-4">
                                <KpiCard title="Costo Eléctrico" value={realTimeCalculations.electricalCost.toFixed(2)} unit="€/h" colorClass="text-blue-400" />
                                <KpiCard title="Costo Térmico" value={realTimeCalculations.thermalCost.toFixed(2)} unit="€/h" colorClass="text-orange-400" />
                                <KpiCard title="Costo Neumático" value={realTimeCalculations.pneumaticCost.toFixed(2)} unit="€/h" colorClass="text-purple-400" />
                                <KpiCard title="COSTO TOTAL" value={realTimeCalculations.totalCost.toFixed(2)} unit="€/h" colorClass="text-yellow-400" />
                            </div>
                        </div>

                        <div className="bg-gray-800 p-4 rounded-lg space-y-3">
                            <h3 className="font-bold text-cyan-400">Análisis Energético y Reportes</h3>
                            <button onClick={handleAnalyzeFootprint} className="w-full bg-blue-600 text-white font-bold py-2 px-3 rounded-lg text-sm hover:bg-blue-700">Analizar Huella Energética en Utilities</button>
                            <button
                                onClick={handleGenerateInsight}
                                disabled={isGeneratingInsight || !isRunning}
                                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-2 px-3 rounded-lg text-sm hover:from-cyan-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all"
                            >
                                {isGeneratingInsight ? '🔄 Generando Reporte Executive...' : '⚡ Generar Reporte Ejecutivo'}
                            </button>
                            {insightError && (
                                <div className="text-xs text-red-400 bg-red-900/20 p-2 rounded border border-red-800">
                                    {insightError}
                                </div>
                            )}
                            <button onClick={handleCreateDatasheet} className="w-full bg-purple-600 text-white font-bold py-2 px-3 rounded-lg text-sm hover:bg-purple-700">Generar Ficha Técnica de Producto</button>
                        </div>
                    </div>
                </div>
            )}
            {activeView === 'cinematic' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-6">
                        <Panel title={t('phoenix.cinematic.title')}>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-slate-300">{t('phoenix.cinematic.focus')}</label>
                                    <select value={sceneConfig.focus} onChange={e => setSceneConfig(p => ({ ...p, focus: e.target.value }))} className="w-full p-2 mt-1 bg-slate-700 border border-slate-600 rounded-md">
                                        <option value="general">Vista General de la Planta</option>
                                        <option value="classifier">Clasificador Inteligente (Argus)</option>
                                        <option value="preprocessing">Línea de Pre-procesamiento</option>
                                        <option value="pelletizing">Sistema de Peletización</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-300">{t('phoenix.cinematic.state')}</label>
                                    <select value={sceneConfig.state} onChange={e => setSceneConfig(p => ({ ...p, state: e.target.value }))} className="w-full p-2 mt-1 bg-slate-700 border border-slate-600 rounded-md">
                                        <option value="normal">Operación Normal</option>
                                        <option value="jam">Atasco en Trituradoras</option>
                                        <option value="low_efficiency">Baja Eficiencia de Detección</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <h5 className="text-sm font-semibold mb-2">{t('hmi.cinematicView.additionalElements')}</h5>
                                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                                        <label className="flex items-center gap-2 cursor-pointer text-xs"><input type="checkbox" checked={sceneConfig.elements.materialFlow} onChange={e => setSceneConfig(p => ({ ...p, elements: { ...p.elements, materialFlow: e.target.checked } }))} /><span>{t('phoenix.cinematic.materialFlow')}</span></label>
                                        <label className="flex items-center gap-2 cursor-pointer text-xs"><input type="checkbox" checked={sceneConfig.elements.maintenance} onChange={e => setSceneConfig(p => ({ ...p, elements: { ...p.elements, maintenance: e.target.checked } }))} /><span>{t('hmi.cinematicView.personnel')}</span></label>
                                        <label className="flex items-center gap-2 cursor-pointer text-xs"><input type="checkbox" checked={sceneConfig.elements.argusInterface} onChange={e => setSceneConfig(p => ({ ...p, elements: { ...p.elements, argusInterface: e.target.checked } }))} /><span>{t('phoenix.cinematic.argusInterface')}</span></label>
                                        <label className="flex items-center gap-2 cursor-pointer text-xs"><input type="checkbox" checked={sceneConfig.elements.ambience} onChange={e => setSceneConfig(p => ({ ...p, elements: { ...p.elements, ambience: e.target.checked } }))} /><span>{t('hmi.cinematicView.ambience')}</span></label>
                                    </div>
                                </div>
                            </div>
                        </Panel>
                        <Panel title={t('hmi.cinematicView.cinematicCreation')}>
                            <textarea value={cinematicPrompt} readOnly rows={10} className="w-full p-3 bg-slate-900 border border-slate-600 rounded-md text-slate-200 font-mono text-xs" />
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
                                    {cinematicResult.type === 'image' ? <img src={cinematicResult.url} alt="Visualización Phoenix" className="max-h-full max-w-full rounded-md object-contain flex-grow" /> : <video src={cinematicResult.url} controls autoPlay loop className="max-h-full max-w-full rounded-md flex-grow" />}
                                    <button onClick={handleSaveToTasks} className="w-full bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700">{t('vulcano.visualization.saveTask')}</button>
                                </div>
                            ) : <p className="text-slate-500">{t('hmi.cinematicView.visualizationPlaceholder')}</p>}
                        </div>
                    </Panel>
                </div>
            )}

            {/* Nexo Sinérgico - InsightCard Modal */}
            {insightCardData && (
                <InsightCard
                    data={insightCardData}
                    onClose={() => setInsightCardData(null)}
                    onAction={handleInsightAction}
                />
            )}
        </div>
    );
};
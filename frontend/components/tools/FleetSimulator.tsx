import React, { useState, useEffect } from 'react';
import type { Task, View, CoPreset, FleetModule, FleetSimulationResult, ParallelSimulationResult, UtilityDutyType } from '../../types';
import { ContentType } from '../../types';
import { CO_PRESETS } from '../../data/coPresets';
import { runFleetSimulation } from '../../services/fleetSimulationService';
import { PLANT_DATABASE } from '../../data/plantDatabase';
import { useTranslations } from '../../contexts/LanguageContext';
// FIX: To ensure consistent module resolution, removed the .tsx extension from the import path.
import { useUtilityCosts } from '../../contexts/UtilityCostContext';


const Panel: React.FC<React.PropsWithChildren<{ title: string; className?: string }>> = ({ title, children, className }) => (
    <div className={`bg-slate-800 p-6 rounded-lg border border-slate-700 ${className}`}>
        <h3 className="text-xl font-bold text-cyan-400 mb-4 border-b border-slate-700 pb-3">{title}</h3>
        {children}
    </div>
);

const EuroIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.75 6.75a.75.75 0 00-1.5 0v1.518a2.5 2.5 0 000 2.464v1.518a.75.75 0 001.5 0v-1.518a1 1 0 112 0v1.518a.75.75 0 001.5 0V9.232a2.5 2.5 0 000-2.464V6.75a.75.75 0 00-1.5 0v.586a1 1 0 11-2 0V6.75z" clipRule="evenodd" />
    </svg>
);

const KpiCard: React.FC<{ title: string; value: string; unit: string; icon: React.ReactNode; onWidgetClick?: () => void }> = ({ title, value, unit, icon, onWidgetClick }) => (
    <div className="bg-slate-700 p-4 rounded-lg flex items-center gap-4 relative">
        {onWidgetClick && (
            <button onClick={onWidgetClick} className="absolute top-2 right-2 p-1 text-yellow-400 hover:text-yellow-200" title="Calcular Costo Instantáneo">
                <EuroIcon />
            </button>
        )}
        <div className="bg-slate-800 p-3 rounded-lg text-cyan-400">{icon}</div>
        <div>
            <p className="text-sm text-slate-400">{title}</p>
            <p className="text-2xl font-bold font-mono">{value}</p>
            <p className="text-xs text-slate-500">{unit}</p>
        </div>
    </div>
);

interface FleetSimulatorProps {
    onSaveTask: (task: Task) => void;
    setView: (view: View) => void;
    onCreateReport: (result: ParallelSimulationResult) => void;
    onOpenUtilityWidget: (duty: number, dutyType: UtilityDutyType, unit: string) => void;
    onSimulationComplete: (results: FleetSimulationResult) => void;
    onNavigateToArchitecturalSynth: (preset: any) => void;
}

const FleetSimulator: React.FC<FleetSimulatorProps> = ({ onSaveTask, setView, onCreateReport, onOpenUtilityWidget, onSimulationComplete, onNavigateToArchitecturalSynth }) => {
    const { t } = useTranslations();
    const { costs } = useUtilityCosts();

    const [modules, setModules] = useState<Omit<FleetModule, 'status' | 'results'>[]>([
        { id: `P-01`, presetId: CO_PRESETS[0].name },
        { id: `P-02`, presetId: CO_PRESETS[3].name },
        { id: `P-03`, presetId: CO_PRESETS[4].name },
    ]);
    const [results, setResults] = useState<FleetSimulationResult | null>(null);
    const [moduleDetails, setModuleDetails] = useState<FleetModule[]>([]);
    
    // State for phased simulation
    const [simulationState, setSimulationState] = useState<'idle' | 'warming' | 'stabilizing' | 'complete'>('idle');
    const [simulationProgress, setSimulationProgress] = useState(0);

    const handleAddModule = () => {
        const existingIds = new Set(modules.map(m => m.id));
        let i = 1;
        let nextId;
        do {
            nextId = `P-${(i).toString().padStart(2, '0')}`;
            i++;
        } while (existingIds.has(nextId));
        setModules(prev => [...prev, { id: nextId, presetId: CO_PRESETS[0].name }]);
    };

    const handleRemoveModule = (id: string) => {
        setModules(prev => prev.filter(m => m.id !== id));
    };

    const handlePresetChange = (id: string, presetId: string) => {
        setModules(prev => prev.map(m => m.id === id ? { ...m, presetId } : m));
    };

    const handleRunSimulation = async () => {
        setResults(null);
        setModuleDetails([]);
        setSimulationState('warming');
        setSimulationProgress(0);

        // Simulate Warming Phase
        await new Promise(resolve => setTimeout(resolve, 1500));
        setSimulationProgress(50);
        
        // Simulate Stabilizing Phase
        setSimulationState('stabilizing');
        await new Promise(resolve => setTimeout(resolve, 1500));
        setSimulationProgress(100);

        try {
            const { updatedModules, aggregatedResult } = await runFleetSimulation(modules);
            setResults(aggregatedResult);
            setModuleDetails(updatedModules);
            setSimulationState('complete');
            onSimulationComplete(aggregatedResult); // Notify parent component
        } catch (error) {
            console.error("Simulation failed:", error);
            alert(error instanceof Error ? error.message : "An unknown error occurred.");
            setSimulationState('idle');
        }
    };
    
    const handleCreateReport = () => {
        console.log("handleCreateReport clicked", { results, moduleDetails });
        if (!results || !moduleDetails) {
            console.warn("Missing results or moduleDetails");
            return;
        }
        const plantModel = PLANT_DATABASE.plants.find(p => p.id === 'EHP-500');
        const totalCapacity = (plantModel?.capacity_kg_h || 500) * modules.length;

        const simulationDataForReport: ParallelSimulationResult = {
            total_capacity_kg_h: totalCapacity,
            total_biochar_kg_h: results.totalBiochar_kg_h,
            total_pyro_oil_kg_h: results.totalBioOil_kg_h,
            total_pyro_gas_kg_h: results.totalGas_kg_h,
            modules: modules.length,
        };
        onCreateReport(simulationDataForReport);
    };
    
    const handleVisualize = () => {
        console.log("handleVisualize clicked", { results, moduleDetails });
        if (!results || !moduleDetails) {
            console.warn("Missing results or moduleDetails");
            return;
        }

        onNavigateToArchitecturalSynth({
            preset: 'Planta Industrial Modular',
            numModules: modules.length,
            status: results.generalStatus,
        });
    };

    const financialAnalysis = React.useMemo(() => {
        if (!results) return null;

        const OPERATING_HOURS = 8000;
        const CAPEX_PER_MODULE = 2250000; // 500 kg/h * 4500 €/kW (estimado)
        
        const totalCapex = modules.length * CAPEX_PER_MODULE;
        const annualOpex = results.totalEnergy_kW * OPERATING_HOURS * costs.gridElectricityPrice;

        // Simplified revenue - assuming bio-oil is the main product
        const BIO_OIL_PRICE_PER_KG = 0.5; // €/kg
        const annualRevenue = results.totalBioOil_kg_h * OPERATING_HOURS * BIO_OIL_PRICE_PER_KG;
        
        const annualProfit = annualRevenue - annualOpex;
        const roi = totalCapex > 0 ? (annualProfit / totalCapex) * 100 : 0;
        
        return {
            totalCapex,
            annualOpex,
            annualRevenue,
            roi,
        };

    }, [results, modules.length, costs.gridElectricityPrice]);

    return (
        <div className="bg-slate-900 text-white p-8 rounded-lg min-h-full font-sans">
            <header className="text-center mb-8">
                <h1 className="text-4xl font-bold">{t('fleetSimulator.title')}</h1>
                <p className="text-slate-400 mt-2">{t('fleetSimulator.subtitle')}</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Panel title={t('fleetSimulator.fleetConfig')} className="lg:col-span-1">
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {modules.map(module => (
                            <div key={module.id} className="bg-slate-700 p-3 rounded-md flex items-center gap-4">
                                <span className="font-mono font-bold text-lg">{module.id}</span>
                                <select
                                    value={module.presetId}
                                    onChange={e => handlePresetChange(module.id, e.target.value)}
                                    className="flex-grow bg-slate-600 border border-slate-500 text-white rounded-md p-2 text-sm"
                                >
                                    {CO_PRESETS.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                                </select>
                                <button onClick={() => handleRemoveModule(module.id)} className="text-red-400 hover:text-red-300 font-bold">&times;</button>
                            </div>
                        ))}
                    </div>
                    <button onClick={handleAddModule} className="w-full mt-4 bg-blue-600/50 hover:bg-blue-600 text-white font-bold py-2 rounded-lg">{t('fleetSimulator.addModule')}</button>
                    <button onClick={handleRunSimulation} disabled={simulationState !== 'idle' && simulationState !== 'complete'} className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-slate-500">
                        {t('fleetSimulator.runSimulation')}
                    </button>
                </Panel>

                <Panel title={t('fleetSimulator.resultsTitle')} className="lg:col-span-1">
                    {simulationState === 'idle' ? (
                        <div className="flex justify-center items-center h-full text-slate-500">{t('fleetSimulator.placeholder')}</div>
                    ) : simulationState !== 'complete' ? (
                        <div className="flex flex-col justify-center items-center h-full animate-pulse">
                            <h3 className="text-xl font-bold text-slate-300">{t('fleetSimulator.simulationInProgress')}</h3>
                            <div className="w-full bg-slate-700 rounded-full h-2.5 my-4">
                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${simulationProgress}%`, transition: 'width 1.5s ease-in-out' }}></div>
                            </div>
                            {simulationState === 'warming' && <div className="text-center font-semibold text-lg text-yellow-400">{t('fleetSimulator.warmingUp')}</div>}
                            {simulationState === 'stabilizing' && <div className="text-center font-semibold text-lg text-blue-400">{t('fleetSimulator.stabilizing')}</div>}
                        </div>
                    ) : results ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <KpiCard title={t('fleetSimulator.totalBioOil')} value={results.totalBioOil_kg_h.toFixed(1)} unit="kg/h" icon={<>💧</>} />
                                <KpiCard title={t('fleetSimulator.totalBiochar')} value={results.totalBiochar_kg_h.toFixed(1)} unit="kg/h" icon={<>⚫</>} />
                                <KpiCard title={t('fleetSimulator.totalGas')} value={results.totalGas_kg_h.toFixed(1)} unit="kg/h" icon={<>💨</>} />
                                <KpiCard 
                                    title={t('fleetSimulator.totalConsumption')} 
                                    value={results.totalEnergy_kW.toFixed(1)} 
                                    unit="kW" 
                                    icon={<>⚡</>}
                                    onWidgetClick={() => onOpenUtilityWidget(results.totalEnergy_kW / 1000, 'fired-heat', 'MW')}
                                />
                            </div>
                            {financialAnalysis && (
                                <div className="pt-4 border-t border-slate-700">
                                     <h4 className="font-bold text-lg mb-3 text-cyan-400">Análisis de Rentabilidad</h4>
                                     <div className="grid grid-cols-2 gap-4">
                                         <KpiCard title="OPEX Anual Estimado" value={(financialAnalysis.annualOpex / 1000).toFixed(0)} unit="k€" icon={<>💶</>} />
                                         <KpiCard title="ROI Estimado" value={financialAnalysis.roi.toFixed(1)} unit="%" icon={<>📈</>} />
                                     </div>
                                </div>
                            )}
                            <div>
                                <h4 className="font-bold text-lg mt-6">{t('fleetSimulator.individualModules')}</h4>
                                <div className="space-y-2 mt-2 max-h-48 overflow-y-auto pr-2">
                                    {moduleDetails.map(m => (
                                        <div key={m.id} className="bg-slate-700 p-3 rounded-md text-sm">
                                            <div className="flex justify-between font-bold"><span>{m.id} ({m.presetId})</span> <span className={m.status === 'Operando' ? 'text-green-400' : 'text-red-400'}>{m.status}</span></div>
                                            {m.results && <div className="text-xs text-slate-300 font-mono flex flex-wrap justify-between gap-x-4"><span>Temp: {m.results.temperature.toFixed(0)}°C</span> <span>Presión: {m.results.pressure.toFixed(2)}bar</span> <span>Aceite: {m.results.bioOil.toFixed(1)}kg/h</span><span>Energía: {m.results.energyConsumption.toFixed(1)}kW</span></div>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="pt-4 border-t border-slate-700 flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={handleCreateReport}
                                    className="flex-1 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    {t('fleetSimulator.createReport')}
                                </button>
                                <button
                                    onClick={handleVisualize}
                                    className="flex-1 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    Visualizar Configuración de Flota
                                </button>
                            </div>
                        </div>
                    ) : (
                         <div className="flex justify-center items-center h-full text-slate-500">Error en la simulación.</div>
                    )}
                </Panel>
            </div>
        </div>
    );
};

export default FleetSimulator;
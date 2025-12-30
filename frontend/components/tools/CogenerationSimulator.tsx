import React, { useState } from 'react';
import type { Task } from '../../types';
import { ContentType } from '../../types';

// UI Components
const KpiCard: React.FC<{ title: string; value: string; unit: string; colorClass: string }> = ({ title, value, unit, colorClass }) => (
    <div className="bg-slate-700 p-4 rounded-lg text-center">
        <p className="text-sm text-slate-400">{title}</p>
        <p className={`text-4xl font-bold font-mono mt-1 ${colorClass}`}>
            {value}
            <span className="text-lg text-slate-300 ml-1.5">{unit}</span>
        </p>
    </div>
);

interface CogenerationSimulatorProps {
    onSaveTask: (task: Task) => void;
}

const CogenerationSimulator: React.FC<CogenerationSimulatorProps> = ({ onSaveTask }) => {
    // Escenarios
    const [scenario, setScenario] = useState<'base' | 'optimista' | 'pesimista'>('base');
    
    // Inputs
    const [electricalDemand, setElectricalDemand] = useState(1500); // kW (Capacidad Instalada)
    const [thermalDemand, setThermalDemand] = useState(10000); // MJ/hr
    const [fuelConsumption, setFuelConsumption] = useState(10); // ton/day
    const [fuelHHV, setFuelHHV] = useState(19.8); // MJ/kg
    const [gridCost, setGridCost] = useState(0.15); // €/kWh
    const [fuelCost, setFuelCost] = useState(50); // €/ton
    const [capexPerKw, setCapexPerKw] = useState(4500); // €/kW
    const [oAndM_percentage, setOAndM_percentage] = useState(2.25); // % of CAPEX

    // Simulation Results
    const [results, setResults] = useState<{
        electricalEfficiency: number;
        thermalEfficiency: number;
        overallEfficiency: number;
        costSavings: number;
        emissionsReduction: number;
        powerBalance: number; // Déficit/Superávit en kW
    } | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSimulate = () => {
        setIsLoading(true);
        setResults(null);
        setError('');

        setTimeout(() => {
            try {
                // 1. Definir parámetros del escenario
                let electricalEfficiencyPercent: number, thermalEfficiencyPercent: number;
                switch(scenario) {
                    case 'optimista':
                        electricalEfficiencyPercent = 35;
                        thermalEfficiencyPercent = 60;
                        break;
                    case 'pesimista':
                        electricalEfficiencyPercent = 25;
                        thermalEfficiencyPercent = 50;
                        break;
                    case 'base':
                    default:
                        electricalEfficiencyPercent = 30;
                        thermalEfficiencyPercent = 55;
                        break;
                }

                // --- Simulation Logic ---
                const PLANT_UPTIME_FACTOR = 0.9; // 90%
                const HOURS_PER_YEAR = 8760;

                // Energy Input from fuel
                const fuelKgPerHr = (fuelConsumption * 1000) / 24;
                const energyInputMJ_hr = fuelKgPerHr * fuelHHV;
                const energyInputkW = energyInputMJ_hr * (1000 / 3600);
                if(energyInputkW <= 0) throw new Error("El input energético debe ser positivo.");

                // Energy Output based on scenario efficiency
                const electricalOutputkW = energyInputkW * (electricalEfficiencyPercent / 100);
                const thermalOutputkW = energyInputkW * (thermalEfficiencyPercent / 100);
                const overallEfficiency = electricalEfficiencyPercent + thermalEfficiencyPercent;

                // Power Balance
                const powerBalance = electricalOutputkW - electricalDemand;
                
                // Cost Analysis
                const annualElectricityProduced_kWh = electricalOutputkW * HOURS_PER_YEAR * PLANT_UPTIME_FACTOR;
                const annualGridCostAvoided = annualElectricityProduced_kWh * gridCost;
                
                const totalCapex = electricalDemand * capexPerKw;
                const annualOandMCost = totalCapex * (oAndM_percentage / 100);
                const annualFuelCost = fuelConsumption * 365 * fuelCost;
                const totalAnnualOpex = annualOandMCost + annualFuelCost;
                
                const annualCostSavings = annualGridCostAvoided - totalAnnualOpex;

                // Emissions Reduction (simplified)
                const gridEmissionsFactor = 0.4; // kg CO2 / kWh
                const fuelEmissionsFactor = 0.1; // kg CO2 / MJ 
                const emissionsWithoutCHP_hr = electricalDemand * gridEmissionsFactor; // Emisiones si se comprara la demanda
                const emissionsWithCHP_hr = energyInputMJ_hr * fuelEmissionsFactor;
                const emissionsReduction = emissionsWithoutCHP_hr > 0 ? ((emissionsWithoutCHP_hr - emissionsWithCHP_hr) / emissionsWithoutCHP_hr) * 100 : 0;

                setResults({
                    electricalEfficiency: electricalEfficiencyPercent,
                    thermalEfficiency: thermalEfficiencyPercent,
                    overallEfficiency,
                    costSavings: annualCostSavings,
                    emissionsReduction,
                    powerBalance,
                });
            } catch (e) {
                setError(e instanceof Error ? e.message : "Error desconocido en la simulación.");
            } finally {
                setIsLoading(false);
            }
        }, 1500);
    };

    const handleCreateTask = () => {
        if (!results) return;
        const task: Task = {
            id: `task-cogen-real-${Date.now()}`,
            title: `Análisis Realista de Cogeneración - Escenario ${scenario.charAt(0).toUpperCase() + scenario.slice(1)}`,
            createdAt: Date.now(),
            status: 'Por Hacer',
            contentType: ContentType.Texto,
            formData: {
                objective: `Generar un reporte ejecutivo sobre la viabilidad de un sistema CHP bajo un escenario ${scenario}, con una eficiencia total del ${results.overallEfficiency.toFixed(1)}% y un ahorro anual estimado de ${results.costSavings.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}.`,
                tone: 'Formal / Analítico',
                specifics: {
                    [ContentType.Texto]: {
                        type: 'ExecutiveReport',
                        audience: 'Gerentes Financieros (CFO)',
                        rawData: `Escenario: ${scenario}\nCAPEX: ${capexPerKw} €/kW\nO&M: ${oAndM_percentage}%\nEficiencia Eléctrica: ${results.electricalEfficiency.toFixed(1)}%\nEficiencia Térmica: ${results.thermalEfficiency.toFixed(1)}%\nAhorro Anual: ${results.costSavings.toLocaleString()} EUR\nBalance Potencia: ${results.powerBalance.toFixed(0)} kW`,
                    },
                    [ContentType.Imagen]: {},
                    [ContentType.Video]: {},
                    [ContentType.Audio]: {},
                    [ContentType.Codigo]: {},
                },
                activeAgents: ['Redactor de Ensayos', 'Curator'],
            },
            isIntelligent: true,
            agentId: 'Orquestador',
            eventType: 'ExecutiveReport',
        };
        onSaveTask(task);
        alert('Tarea de reporte creada y enviada al Gestor de Tareas.');
    };

    const ScenarioButton: React.FC<{ name: 'base' | 'optimista' | 'pesimista', label: string }> = ({ name, label }) => (
        <button onClick={() => setScenario(name)} className={`flex-1 py-2 px-3 rounded-md text-sm font-semibold transition-colors ${scenario === name ? 'bg-blue-600 text-white' : 'text-gray-300 bg-slate-700 hover:bg-slate-600'}`}>{label}</button>
    );

    return (
        <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-lg w-full mx-auto">
            <header className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-100">Simulador de Cogeneración (CHP) - Escenarios Realistas</h2>
                <p className="mt-2 text-md text-gray-400">Evalúa la eficiencia y viabilidad de un sistema de Calor y Energía Combinados bajo parámetros de ingeniería reales.</p>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Panel */}
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 space-y-4">
                    <h3 className="text-xl font-bold text-cyan-400 mb-4">Parámetros de Entrada</h3>
                    
                    <div>
                        <label className="text-lg font-bold text-white mb-3 block text-center">Selección de Escenario</label>
                        <div className="bg-slate-900 rounded-lg p-1 flex border border-slate-700">
                            <ScenarioButton name="pesimista" label="Pesimista" />
                            <ScenarioButton name="base" label="Base" />
                            <ScenarioButton name="optimista" label="Optimista" />
                        </div>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-700 space-y-4">
                        <div>
                            <label className="text-sm text-gray-300 flex justify-between"><span>Demanda Eléctrica de la Planta (Capacidad Instalada)</span> <span>{electricalDemand.toLocaleString()} kW</span></label>
                            <input type="range" min="100" max="5000" step="100" value={electricalDemand} onChange={e => setElectricalDemand(Number(e.target.value))} className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                        </div>
                         <div>
                            <label className="text-sm text-gray-300 flex justify-between"><span>Demanda Térmica de la Planta</span> <span>{thermalDemand.toLocaleString()} MJ/hr</span></label>
                            <input type="range" min="1000" max="50000" step="1000" value={thermalDemand} onChange={e => setThermalDemand(Number(e.target.value))} className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-orange-500" />
                        </div>
                        <div>
                            <label className="text-sm text-gray-300 flex justify-between"><span>Consumo de Biomasa</span> <span>{fuelConsumption} ton/día</span></label>
                            <input type="range" min="1" max="50" step="1" value={fuelConsumption} onChange={e => setFuelConsumption(Number(e.target.value))} className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-yellow-500" />
                        </div>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-700 space-y-4">
                        <h4 className="font-semibold text-slate-300">Costos</h4>
                         <div>
                            <label className="text-sm text-gray-300 flex justify-between"><span>Coste de Capital (CAPEX)</span> <span>{capexPerKw.toLocaleString('es-ES', {style:'currency', currency:'EUR'})}/kW</span></label>
                            <input type="range" min="3000" max="6000" step="100" value={capexPerKw} onChange={e => setCapexPerKw(Number(e.target.value))} className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                        </div>
                         <div>
                            <label className="text-sm text-gray-300 flex justify-between"><span>Coste de O&M (% del CAPEX)</span> <span>{oAndM_percentage.toFixed(2)}%</span></label>
                            <input type="range" min="1.5" max="3" step="0.05" value={oAndM_percentage} onChange={e => setOAndM_percentage(Number(e.target.value))} className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-pink-500" />
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-300 block">PCI Combustible (MJ/kg)</label>
                                <input type="number" step="0.1" value={fuelHHV} onChange={e => setFuelHHV(Number(e.target.value))} className="w-full mt-1 p-2 rounded bg-slate-700 border border-slate-600"/>
                            </div>
                            <div>
                                <label className="text-sm text-gray-300 block">Coste Biomasa (€/ton)</label>
                                <input type="number" step="1" value={fuelCost} onChange={e => setFuelCost(Number(e.target.value))} className="w-full mt-1 p-2 rounded bg-slate-700 border border-slate-600"/>
                            </div>
                            <div>
                                <label className="text-sm text-gray-300 block">Coste Electricidad Red (€/kWh)</label>
                                <input type="number" step="0.01" value={gridCost} onChange={e => setGridCost(Number(e.target.value))} className="w-full mt-1 p-2 rounded bg-slate-700 border border-slate-600"/>
                            </div>
                         </div>
                    </div>

                    <button onClick={handleSimulate} disabled={isLoading} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-500 mt-4">
                        {isLoading ? 'Simulando...' : 'Ejecutar Simulación'}
                    </button>
                </div>

                {/* Output Panel */}
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                    <h3 className="text-xl font-bold text-cyan-400 mb-4">Resultados de la Simulación</h3>
                    {error && <div className="p-3 bg-red-900/50 text-red-300 border border-red-700 rounded-md text-sm">{error}</div>}
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full"><p className="text-slate-400 animate-pulse">Calculando métricas...</p></div>
                    ) : results ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-3 gap-4">
                                <KpiCard title="Ef. Eléctrica" value={results.electricalEfficiency.toFixed(1)} unit="%" colorClass="text-blue-400" />
                                <KpiCard title="Ef. Térmica" value={results.thermalEfficiency.toFixed(1)} unit="%" colorClass="text-orange-400" />
                                <KpiCard title="Ef. Total" value={results.overallEfficiency.toFixed(1)} unit="%" colorClass="text-teal-400" />
                            </div>
                             <div className="pt-4 border-t border-slate-700">
                                <KpiCard title="Déficit/Superávit Eléctrico" value={results.powerBalance.toFixed(0)} unit="kW" colorClass={results.powerBalance >= 0 ? 'text-green-400' : 'text-red-400'} />
                             </div>
                            <div className="space-y-3 pt-4 border-t border-slate-700">
                                <KpiCard title="Ahorro Anual Estimado" value={results.costSavings.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} unit="€" colorClass="text-green-400" />
                                <KpiCard title="Reducción de Emisiones CO₂" value={results.emissionsReduction.toFixed(1)} unit="%" colorClass="text-cyan-400" />
                            </div>
                            <button onClick={handleCreateTask} className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700">
                                Crear Tarea de Reporte Ejecutivo
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-500">
                            <p>Los resultados aparecerán aquí.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CogenerationSimulator;

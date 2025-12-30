import React, { useState, useEffect, useMemo } from 'react';
import type { View, Vehicle, VehicleStatus, VehicleTechnology, FleetVehicleOption, Task, UtilityDutyType, FleetSimulationResult } from '../../types';
import { ContentType } from '../../types';
import { FLEET_VEHICLES } from '../../data/fleetVehicles';
import { FormSelect, FormInput } from '../form/FormControls';

const Panel: React.FC<React.PropsWithChildren<{ title: string; }>> = ({ title, children }) => (
    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h3 className="text-xl font-bold text-cyan-400 mb-4 border-b border-slate-700 pb-3">{title}</h3>
        {children}
    </div>
);

const KpiCard: React.FC<{ label: string; value: string; unit: string; tooltipText?: string; }> = ({ label, value, unit, tooltipText }) => (
    <div className="relative group bg-slate-700 p-3 rounded-lg">
        {tooltipText && (
            <span className="absolute bottom-full mb-2 w-48 bg-slate-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none left-1/2 -translate-x-1/2 z-10 border border-slate-600">
                {tooltipText}
            </span>
        )}
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-2xl font-bold font-mono text-white">{value} <span className="text-base font-sans text-slate-300">{unit}</span></p>
    </div>
);


interface VehicleModalProps {
    onClose: () => void;
    onAdd: (vehicle: Omit<Vehicle, 'id' | 'status' | 'fuelLevel' | 'kpis'>) => void;
}

const VehicleModal: React.FC<VehicleModalProps> = ({ onClose, onAdd }) => {
    const [tech, setTech] = useState<VehicleTechnology>('Eléctrico');
    const [model, setModel] = useState('');

    const modelsForTech = useMemo(() => FLEET_VEHICLES.filter(v => v.tech === tech), [tech]);

    useEffect(() => {
        if (modelsForTech.length > 0) {
            setModel(modelsForTech[0].model);
        } else {
            setModel('');
        }
    }, [tech, modelsForTech]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (model) {
            onAdd({ tech, model });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-slate-800 text-white p-8 rounded-lg w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6">Añadir Vehículo a la Flota</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormSelect label="Tecnología" value={tech} onChange={e => setTech(e.target.value as VehicleTechnology)}>
                        <option>Eléctrico</option>
                        <option>Gas Natural/Biogás</option>
                        <option>Híbrido</option>
                    </FormSelect>
                    <FormSelect label="Fabricante/Modelo" value={model} onChange={e => setModel(e.target.value)} disabled={modelsForTech.length === 0}>
                        {modelsForTech.map(v => <option key={`${v.manufacturer}-${v.model}`} value={v.model}>{v.manufacturer} {v.model} {v.country ? `(${v.country})` : ''}</option>)}
                    </FormSelect>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-slate-600 hover:bg-slate-500">Cancelar</button>
                        <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 font-semibold">Añadir Vehículo</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface CircularFleetProps {
    fleetSimulationResult: FleetSimulationResult | null;
    onSaveTask: (task: Task) => void;
    onNavigateToUtilities: (context: { tab: string; demands?: { [key in UtilityDutyType]?: number } }) => void;
}

const formatOperatingHours = (totalHours: number): string => {
    const totalSeconds = totalHours * 3600;
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
};


export const CircularFleet: React.FC<CircularFleetProps> = ({ fleetSimulationResult, onSaveTask, onNavigateToUtilities }) => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [totalOperatingHours, setTotalOperatingHours] = useState(0);

    const addVehicle = (newVehicleData: Omit<Vehicle, 'id' | 'status' | 'fuelLevel' | 'kpis'>) => {
        const newVehicle: Vehicle = {
            id: `TRUCK-${(vehicles.length + 1).toString().padStart(3, '0')}`,
            ...newVehicleData,
            status: 'En Pausa',
            fuelLevel: 100,
            kpis: { distance: 0, wasteCollected: 0, operatingHours: 0 },
        };
        setVehicles(prev => [...prev, newVehicle]);
        setIsModalOpen(false);
    };

    // Simulation Loop
    useEffect(() => {
        const interval = setInterval(() => {
            let totalHoursInTick = 0;
            setVehicles(prevVehicles => prevVehicles.map(v => {
                const newKpis = { ...v.kpis };
                let { status, fuelLevel } = v;

                const vehicleConfig = FLEET_VEHICLES.find(fv => fv.model === v.model);

                switch (status) {
                    case 'En Ruta':
                        const consumption_percent_h = vehicleConfig?.consumptionRate_percent_h || 20; // Default 20%/h (5h autonomy)
                        const consumption_per_tick = consumption_percent_h / 3600; // per second
                        
                        fuelLevel -= consumption_per_tick;
                        
                        newKpis.distance += (80 / 3600); // 80 km/h
                        newKpis.wasteCollected += (2 / 3600); // 2 ton/h
                        newKpis.operatingHours += 1 / 3600;
                        totalHoursInTick += 1/3600;
                        if (fuelLevel <= 5) status = 'Recargando';
                        break;
                    case 'Recargando':
                        let rate_percent_h = 20; // Default electric charge rate
                        if (v.tech === 'Eléctrico') {
                            rate_percent_h = vehicleConfig?.chargeRate_percent_h || 20;
                        } else { // Gas or Hybrid refuel rate
                            rate_percent_h = vehicleConfig?.refuelRate_percent_h || 6000; // 6000%/h = 100%/min
                        }
                        fuelLevel += (rate_percent_h / 3600);
                        if (fuelLevel >= 100) {
                            fuelLevel = 100;
                            status = 'En Pausa';
                        }
                        break;
                    case 'En Pausa':
                        if (Math.random() < 0.005 && v.fuelLevel > 95) status = 'En Ruta';
                        break;
                }
                
                return {
                    id: v.id,
                    model: v.model,
                    tech: v.tech,
                    status: status,
                    fuelLevel: Math.max(0, Math.min(100, fuelLevel)),
                    kpis: newKpis,
                };
            }));

            setTotalOperatingHours(h => h + totalHoursInTick);

        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const { biogasProduction_m3_h, fleetKPIs } = useMemo(() => {
        const biogasProduction_kg_h = fleetSimulationResult?.totalGas_kg_h || 0;
        const SYNGAS_DENSITY_KG_M3 = 1.2;
        const biogasProduction_m3_h = biogasProduction_kg_h / SYNGAS_DENSITY_KG_M3;
    
        const biogasConsumption = vehicles.reduce((sum, v) => {
            const config = FLEET_VEHICLES.find(fv => fv.model === v.model);
            return sum + (v.tech === 'Gas Natural/Biogás' && v.status === 'En Ruta' && config?.consumptionRate_m3_h ? config.consumptionRate_m3_h : 0);
        }, 0);
    
        const netBalance = biogasProduction_m3_h - biogasConsumption;
        const selfSufficiency = biogasConsumption > 0 ? Math.max(0, Math.min(100, (biogasProduction_m3_h / biogasConsumption) * 100)) : 100;
    
        const totalWasteCollected = vehicles.reduce((sum, v) => sum + v.kpis.wasteCollected, 0);
        const totalDistance = vehicles.reduce((sum, v) => sum + v.kpis.distance, 0);
        const totalFuelConsumed = vehicles.reduce((sum, v) => {
            const config = FLEET_VEHICLES.find(fv => fv.model === v.model);
            return sum + (v.status === 'En Ruta' && config?.consumptionRate_m3_h ? config.consumptionRate_m3_h / 3600 : 0);
        }, 0);
        
        return {
            biogasProduction_m3_h,
            fleetKPIs: {
                totalWasteCollected,
                totalDistance,
                totalFuelConsumed,
                biogasConsumption,
                netBalance,
                selfSufficiency,
            }
        };
    }, [vehicles, fleetSimulationResult]);

    const handleGenerateReport = () => {
        const dieselConsumption_L_km = 0.35; // L/km
        const dieselEmissions_kgCO2_L = 2.68; // kg CO2 / L
        const biogasEmissions_kgCO2_m3 = 1.8; // kg CO2 / m3 (lower)
        
        const totalBiogasConsumed_m3 = fleetKPIs.totalFuelConsumed;
        const emissionsBiogas = totalBiogasConsumed_m3 * biogasEmissions_kgCO2_m3;
        
        const equivalentDiesel_L = fleetKPIs.totalDistance * dieselConsumption_L_km;
        const emissionsDiesel = equivalentDiesel_L * dieselEmissions_kgCO2_L;
        
        const emissionReductionPercent = emissionsDiesel > 0 ? ((emissionsDiesel - emissionsBiogas) / emissionsDiesel) * 100 : 0;

        const kpis = {
            efficiency_ton_km: fleetKPIs.totalDistance > 0 ? fleetKPIs.totalWasteCollected / fleetKPIs.totalDistance : 0,
            self_sufficiency_percent: fleetKPIs.selfSufficiency,
            emission_reduction_percent: emissionReductionPercent,
            total_cost: 0 // Placeholder
        };
        
        const newTask: Task = {
            id: `task-logistics-${Date.now()}`,
            title: `Informe de Logística Circular - ${new Date().toLocaleDateString()}`,
            createdAt: Date.now(),
            status: 'Por Hacer',
            contentType: ContentType.Texto,
            eventType: 'LogisticsReport',
            formData: {
                objective: `Generar un informe de operaciones para la flota circular.`,
                tone: 'Analítico',
                activeAgents: [],
                specifics: {
                    [ContentType.Texto]: {
                        calculatedKpis: kpis
                    },
                    [ContentType.Imagen]: {},
                    [ContentType.Video]: {},
                    [ContentType.Audio]: {},
                    [ContentType.Codigo]: {},
                }
            }
        };

        onSaveTask(newTask);
        alert('Tarea "Informe de Logística Circular" creada. Cárgala en el Creador de Prompts.');
    };

    return (
        <div className="bg-slate-900 text-white p-8 rounded-lg min-h-full font-sans space-y-8">
            {isModalOpen && <VehicleModal onClose={() => setIsModalOpen(false)} onAdd={addVehicle} />}
            <header className="text-center">
                <h1 className="text-4xl font-bold">Módulo de Flota Circular</h1>
                <p className="text-slate-400 mt-2">Gestión Logística y Sinergia de Combustibles</p>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <Panel title="Panel de Configuración de Flota">
                        <p className="text-sm text-slate-300">Construye tu flota de vehículos ecológicos.</p>
                        <button onClick={() => setIsModalOpen(true)} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700">
                            + Añadir Vehículo
                        </button>
                    </Panel>
                </div>
                <div className="lg:col-span-2">
                     <Panel title="Panel de Balance de Biogás">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <KpiCard label="Producción (Pirólisis)" value={`+${biogasProduction_m3_h.toFixed(1)}`} unit="m³/h" />
                                {biogasProduction_m3_h === 0 && !fleetSimulationResult && (
                                    <p className="text-xs text-slate-400 mt-2 text-center">Ejecuta simulación en "Orquestador de Flota" para ver producción.</p>
                                )}
                            </div>
                            <div>
                                <KpiCard label="Consumo Biogás (Flota)" value={`-${fleetKPIs.biogasConsumption.toFixed(1)}`} unit="m³/h" />
                                {fleetKPIs.biogasConsumption === 0 && vehicles.some(v => v.status === 'En Ruta' && v.tech !== 'Gas Natural/Biogás') && (
                                    <p className="text-xs text-slate-400 mt-2 text-center">No hay consumo de biogás de vehículos activos.</p>
                                )}
                            </div>
                            <div className={`p-4 rounded-lg text-center ${fleetKPIs.netBalance >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                <p className="text-sm text-slate-400">Balance Neto</p>
                                <p className={`text-3xl font-bold font-mono ${fleetKPIs.netBalance >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                                    {fleetKPIs.netBalance >= 0 ? '+' : ''}{fleetKPIs.netBalance.toFixed(1)}
                                    <span className="text-lg text-slate-300 ml-1">m³/h</span>
                                </p>
                                {fleetKPIs.netBalance < 0 && (
                                    <button onClick={() => onNavigateToUtilities({ tab: 'fleet-fuel', demands: { 'fleet-fuel': Math.abs(fleetKPIs.netBalance) }})} className="mt-2 text-xs font-semibold text-yellow-400 hover:text-yellow-300">Calcular Costo del Déficit →</button>
                                )}
                            </div>
                        </div>
                     </Panel>
                </div>
            </div>

            <Panel title="Dashboard de Flota en Tiempo Real">
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <KpiCard label="Residuos Recolectados" value={fleetKPIs.totalWasteCollected.toFixed(2)} unit="ton" tooltipText="Suma total de toneladas de residuos recolectados por todos los vehículos en ruta."/>
                    <KpiCard label="Distancia Total" value={fleetKPIs.totalDistance.toFixed(1)} unit="km" tooltipText="Suma total de kilómetros recorridos por todos los vehículos en ruta."/>
                    <KpiCard label="Horas de Operación" value={formatOperatingHours(totalOperatingHours)} unit="(HH:MM:SS)" tooltipText="Tiempo total acumulado de todos los vehículos en estado 'En Ruta'."/>
                    <KpiCard label="% Combustible Autogenerado" value={fleetKPIs.selfSufficiency.toFixed(1)} unit="%" tooltipText="Porcentaje del consumo total de biogás de la flota que es cubierto por la producción de la planta de pirólisis."/>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-700 text-xs uppercase text-slate-300">
                            <tr>
                                <th className="p-3">ID</th>
                                <th className="p-3">Modelo</th>
                                <th className="p-3">Tecnología</th>
                                <th className="p-3">Estado</th>
                                <th className="p-3 text-right">Combustible / Carga</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehicles.map(v => (
                                <tr key={v.id} className="border-b border-slate-700">
                                    <td className="p-3 font-mono text-slate-200">{v.id}</td>
                                    <td className="p-3 text-slate-200">{v.model}</td>
                                    <td className="p-3 text-slate-200">{v.tech}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            v.status === 'En Ruta' ? 'bg-green-500/20 text-green-300' :
                                            v.status === 'Recargando' ? 'bg-yellow-500/20 text-yellow-300' :
                                            'bg-slate-500/20 text-slate-300'
                                        }`}>{v.status}</span>
                                    </td>
                                    <td className="p-3 text-right">
                                        <div className="w-full bg-slate-600 rounded-full h-4">
                                            <div className="bg-cyan-400 h-4 rounded-full text-black text-xs font-bold flex items-center justify-center" style={{width: `${v.fuelLevel}%`}}>
                                                {v.fuelLevel.toFixed(0)}%
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {vehicles.length === 0 && <p className="text-center text-slate-500 py-8">No hay vehículos en la flota. Añade uno para empezar.</p>}
                </div>
            </Panel>

            <div className="text-center pt-4">
                 <button onClick={handleGenerateReport} disabled={vehicles.length === 0} className="bg-purple-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-purple-700 disabled:bg-slate-500">
                    Generar Reporte de Operaciones Logísticas
                </button>
            </div>
        </div>
    );
};
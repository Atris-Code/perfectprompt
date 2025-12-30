

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { generateCinematicImage, generateCinematicVideo } from '../../services/geminiService';
import type { HMIState, View, AgentMode, Alarm, AlarmConfig, CoPreset, SolidMaterial } from '../../types';
import { PYROLYSIS_MATERIALS, SIMULATION_ENGINE } from '../../data/pyrolysisMaterials';
import { CO_PRESETS } from '../../data/coPresets';
import { useTranslations } from '../../contexts/LanguageContext';

interface HMIControlRoomProps {
    hmiState: HMIState;
    setHmiState: React.Dispatch<React.SetStateAction<HMIState>>;
    handleStartSystem: () => void;
    handleStopSystem: () => void;
    heatingSeconds: number;
    coolingSeconds: number;
    stableSeconds: number;
    activeAlarms: Alarm[];
    setActiveAlarms: React.Dispatch<React.SetStateAction<Alarm[]>>;
    events: string[];
    addEvent: (message: string) => void;
    historyData: (HMIState & { time: number })[];
    minuteLog: (HMIState & { time: string })[];
    currentTime: Date;
    setView: (view: View) => void;
    alarmConfigs: Record<string, AlarmConfig>;
    onAlarmConfigChange: React.Dispatch<React.SetStateAction<Record<string, AlarmConfig>>>;
    pidGains: { kp: number; ki: number; kd: number; };
    onPidChange: React.Dispatch<React.SetStateAction<{ kp: number; ki: number; kd: number; }>>;
    selectedFeedstockId: number;
    onFeedstockChange: React.Dispatch<React.SetStateAction<number>>;
    selectedCatalystId: string;
    onCatalystChange: React.Dispatch<React.SetStateAction<string>>;
    initialTab: string | null;
    onTabVisited: (tabId: string) => void;
    isDiagnosing: boolean;
    runElectricalDiagnostics: () => void;
    isCondenserObstructed: boolean;
    setIsCondenserObstructed: React.Dispatch<React.SetStateAction<boolean>>;
    isGasLineObstructed: boolean;
    setIsGasLineObstructed: React.Dispatch<React.SetStateAction<boolean>>;
    isTempSensorFailed: boolean;
    setIsTempSensorFailed: React.Dispatch<React.SetStateAction<boolean>>;
    isBiomassContaminated: boolean;
    setIsBiomassContaminated: React.Dispatch<React.SetStateAction<boolean>>;
    onOpenUtilityWidget: any;
    onNavigateToArchitecturalSynth: any;
}


type HMIPanel = 'controlPanel' | 'presets' | 'coldSystems' | 'reports' | 'cinematicView' | 'trends' | 'preventiveSecurity' | 'materialsCatalysts' | 'scenarioConfigurator' | 'pidConfiguration';

// --- Reusable UI Components ---

const Panel: React.FC<React.PropsWithChildren<{ titleKey: string; className?: string }>> = ({ titleKey, children, className }) => {
    const { t } = useTranslations();
    return (
        <div className={`p-4 rounded-lg bg-slate-800 border border-slate-700 flex flex-col ${className}`}>
            <h4 className="text-base font-bold text-cyan-400 mb-3">{t(titleKey)}</h4>
            <div className="space-y-2 flex-grow flex flex-col justify-between">
                {children}
            </div>
        </div>
    );
};

const Indicator: React.FC<{ labelKey: string; value: React.ReactNode; unit?: string; }> = ({ labelKey, value, unit }) => {
    const { t } = useTranslations();
    return (
        <div className="flex justify-between items-baseline py-1">
            <span className="text-sm text-slate-400 truncate pr-2">{t(labelKey)}</span>
            <p className="text-lg font-mono font-bold text-white">
                {value}
                {unit && <span className="text-xs text-slate-400 ml-1.5">{unit}</span>}
            </p>
        </div>
    );
};

// --- NEW VISUAL/INTERACTIVE COMPONENTS ---

const SliderIndicator: React.FC<{ labelKey: string; value: number; unit: string; min: number; max: number; step: number; onChange: (value: number) => void; }> = ({ labelKey, value, unit, min, max, step, onChange }) => {
    const { t } = useTranslations();
    return (
        <div className="space-y-1 py-1">
            <div className="flex justify-between items-baseline">
                <span className="text-sm text-slate-400">{t(labelKey)}</span>
                <p className="text-lg font-mono font-bold text-white">{value.toFixed(1)}<span className="text-xs text-slate-400 ml-1.5">{unit}</span></p>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
        </div>
    );
};

const ProgressBarIndicator: React.FC<{ labelKey: string; value: number; unit: string; color: string; }> = ({ labelKey, value, unit, color }) => {
    const { t } = useTranslations();
    return (
        <div className="py-1">
            <div className="flex justify-between items-baseline text-sm mb-1">
                <span className="text-slate-400">{t(labelKey)}</span>
                <span className="font-mono font-bold text-white">{value.toFixed(1)}{unit}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3">
                <div className="h-3 rounded-full" style={{ width: `${value}%`, backgroundColor: color }}></div>
            </div>
        </div>
    );
};

const GasProgressBar: React.FC<{ label: string; value: number; color: string; }> = ({ label, value, color }) => {
    return (
        <div className="flex items-center gap-2 py-0.5">
            <span className="text-sm text-slate-400 font-mono w-8">{label}</span>
            <div className="w-full bg-slate-900 rounded-full h-5 relative border border-slate-700">
                <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }}></div>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white mix-blend-difference">{value.toFixed(1)}%</span>
            </div>
        </div>
    );
};

const EnergyBlocksIndicator: React.FC<{ labelKey: string; value: number; unit: string; }> = ({ labelKey, value, unit }) => {
    const { t } = useTranslations();
    const litBlocks = Math.round(value);
    return (
        <div className="py-1">
            <div className="flex justify-between items-baseline mb-2">
                <span className="text-sm text-slate-400">{t(labelKey)}</span>
                <p className="text-lg font-mono font-bold text-white">{value.toFixed(2)}<span className="text-xs text-slate-400 ml-1.5">{unit}</span></p>
            </div>
            <div className="flex gap-1.5 justify-between">
                {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className={`flex-1 h-4 rounded-sm ${i < litBlocks ? 'bg-yellow-400' : 'bg-slate-700'}`}></div>
                ))}
            </div>
        </div>
    );
};


const StatusTag: React.FC<{ status: string, large?: boolean }> = ({ status, large }) => {
    const statusMap: Record<string, { bg: string, text: string }> = {
        'EN ESPERA': { bg: 'bg-yellow-500', text: 'text-black' },
        'CERRADA': { bg: 'bg-red-600', text: 'text-white' },
        'INACTIVO': { bg: 'bg-slate-600', text: 'text-white' },
        'ABIERTA': { bg: 'bg-green-500', text: 'text-white' },
        'ACTIVO': { bg: 'bg-green-500', text: 'text-white' },
        'OK': { bg: 'bg-green-500', text: 'text-white'},
        'FALLO': { bg: 'bg-red-500', text: 'text-white'},
        'DESCARGANDO': { bg: 'bg-blue-500', text: 'text-white'},
        'ENFRIANDO': { bg: 'bg-cyan-500', text: 'text-black'},
    };
    const { bg, text } = statusMap[status.toUpperCase()] || { bg: 'bg-slate-500', text: 'text-white' };
    
    if (large) {
      return <div className={`w-full text-center py-2 px-3 rounded font-bold ${bg} ${text}`}>{status}</div>;
    }

    return <span className={`px-2 py-0.5 text-xs font-bold rounded ${bg} ${text}`}>{status}</span>;
};

// A small chart component to avoid repetition
const ChartPanel: React.FC<React.PropsWithChildren<{ titleKey: string }>> = ({ titleKey, children }) => {
    const { t } = useTranslations();
    return (
        <div className="p-4 rounded-lg bg-slate-800 border border-slate-700 h-72 flex flex-col">
            <h4 className="text-lg font-bold text-cyan-400 mb-3">{t(titleKey)}</h4>
            <div className="flex-grow">
                {children}
            </div>
        </div>
    );
};

const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
};

// --- TAB CONTENT COMPONENTS ---
const ControlPanelTab: React.FC<HMIControlRoomProps> = (props) => {
    const { t } = useTranslations();
    const { hmiState, handleStartSystem, handleStopSystem, heatingSeconds, coolingSeconds, stableSeconds } = props;
    
    const getSystemStatus = (status: HMIState['systemMode']) => {
        switch (status) {
            case 'CALENTANDO': return { textKey: 'hmi_p01.mainController.status.heating', class: 'bg-yellow-500 text-black' };
            case 'ESTABLE': return { textKey: 'hmi_p01.mainController.status.active', class: 'bg-green-500 text-white' };
            case 'ENFRIANDO': return { textKey: 'hmi_p01.mainController.status.cooling', class: 'bg-cyan-500 text-black' };
            case 'APAGADO':
            default: return { textKey: 'hmi_p01.mainController.status.inactive', class: 'bg-slate-600 text-white' };
        }
    };
    const systemStatus = getSystemStatus(hmiState.systemMode);

    return (
        <div className="grid grid-cols-12 gap-4">
            <Panel titleKey="hmi_p01.mainControl.title" className="col-span-3">
                 <SliderIndicator 
                    labelKey="hmi_p01.mainControl.targetTemp" 
                    value={hmiState.targetTemp} 
                    unit="°C" 
                    min={100} max={900} step={5} 
                    onChange={(v) => props.setHmiState(p => ({...p, targetTemp: v}))}
                />
                <SliderIndicator 
                    labelKey="hmi_p01.mainControl.residenceTime" 
                    value={hmiState.residenceTime} 
                    unit="s" 
                    min={0.5} max={30} step={0.1} 
                    onChange={(v) => props.setHmiState(p => ({...p, residenceTime: v}))}
                />
                <Indicator labelKey="hmi_p01.mainControl.oxygenConc" value={hmiState.oxygenConcentration.toFixed(2)} unit="%" />
            </Panel>
            <Panel titleKey="hmi_p01.reactorConditions.title" className="col-span-3"><Indicator labelKey="hmi_p01.reactorConditions.reactorTemp" value={hmiState.reactorTemp.toFixed(2)} unit="°C" /><Indicator labelKey="hmi_p01.reactorConditions.wallTemp" value={hmiState.reactorWallTemp.toFixed(2)} unit="°C" /><Indicator labelKey="hmi_p01.reactorConditions.pressure" value={hmiState.reactorPressure.toFixed(2)} unit="bar" /><Indicator labelKey="hmi_p01.reactorConditions.pyrometer" value={hmiState.pyrometerCoreTemp.toFixed(2)} unit="°C" /><Indicator labelKey="hmi_p01.reactorConditions.thermocouple" value={hmiState.thermocoupleCoreTemp.toFixed(2)} unit="°C" /></Panel>
            <Panel titleKey="hmi_p01.processTimer.title" className="col-span-3"><Indicator labelKey="hmi_p01.processTimer.localTime" value={props.currentTime.toLocaleTimeString()} /><Indicator labelKey="hmi_p01.stopwatch.heatingTime" value={formatTime(heatingSeconds)} /><Indicator labelKey="hmi_p01.stopwatch.stableTime" value={formatTime(stableSeconds)} /><Indicator labelKey="hmi_p01.stopwatch.coolingTime" value={formatTime(coolingSeconds)} /><div className="flex gap-2 mt-auto"><button className="flex-1 bg-slate-600 py-1 rounded">{t('hmi_p01.processTimer.start')}</button><button className="flex-1 bg-slate-600 py-1 rounded">{t('hmi_p01.processTimer.stop')}</button><button className="flex-1 bg-slate-600 py-1 rounded">{t('hmi_p01.processTimer.reset')}</button></div></Panel>
            <Panel titleKey="hmi_p01.oilProduction.title" className="col-span-3"><Indicator labelKey="hmi_p01.oilProduction.condenserState" value={<StatusTag status={hmiState.condenserState} />} /><Indicator labelKey="hmi_p01.oilProduction.condensateFlow" value={hmiState.condensateFlow.toFixed(2)} unit="L/h" /><Indicator labelKey="hmi_p01.oilProduction.condenserTemp" value={hmiState.condenserTemp.toFixed(2)} unit="°C" /><Indicator labelKey="hmi_p01.oilProduction.coolingPower" value={hmiState.coolingPower.toFixed(2)} unit="kW" /></Panel>
            
            <Panel titleKey="hmi_p01.flowFeed.title" className="col-span-3">
                <EnergyBlocksIndicator labelKey="hmi_p01.flowFeed.energyConsumption" value={hmiState.energyConsumption} unit="kW" />
                <Indicator labelKey="hmi_p01.flowFeed.feedRate" value={hmiState.feedRate.toFixed(2)} unit="kg/h" />
                <Indicator labelKey="hmi_p01.flowFeed.n2Flowmeter" value={hmiState.n2Flow.toFixed(2)} unit="L/min" />
                <Indicator labelKey="hmi_p01.flowFeed.n2LinePressure" value={hmiState.n2Pressure.toFixed(2)} unit="bar" />
            </Panel>
            <Panel titleKey="hmi_p01.mainController.title" className="col-span-3">
                 <div className="py-1">
                    <label className="text-sm text-slate-400">{t('hmi_p01.mainController.mode')}</label>
                    <select 
                        value={hmiState.agentMode} 
                        onChange={(e) => props.setHmiState(p => ({...p, agentMode: e.target.value as AgentMode}))}
                        className="w-full p-2 mt-1 bg-slate-700 border border-slate-600 rounded-md"
                    >
                        <option value="Automático (PID)">{t('hmi_p01.mainController.agentModes.autoPid')}</option>
                        <option value="Manual">{t('hmi_p01.mainController.agentModes.manual')}</option>
                        <option value="Solo Monitoreo">{t('hmi_p01.mainController.agentModes.monitoring')}</option>
                    </select>
                </div>
                <div className={`my-1 py-2 text-center rounded font-bold text-lg ${systemStatus.class}`}>{t(systemStatus.textKey)}</div>
                <div className="flex gap-2 mt-auto">
                    <button onClick={handleStartSystem} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg disabled:bg-slate-600" disabled={hmiState.systemMode !== 'APAGADO'}>{t('hmi_p01.mainController.startBtn')}</button>
                    <button onClick={handleStopSystem} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg disabled:bg-slate-600" disabled={hmiState.systemMode === 'APAGADO' || hmiState.systemMode === 'ENFRIANDO'}>{t('hmi_p01.mainController.stopBtn')}</button>
                </div>
            </Panel>
            <Panel titleKey="hmi_p01.storage.title" className="col-span-3">
                <ProgressBarIndicator labelKey="hmi_p01.storage.biomassHopperLevel" value={hmiState.biomassHopperLevel} unit="%" color="#d97706" />
                <ProgressBarIndicator labelKey="hmi_p01.storage.bioOilTankLevel" value={hmiState.bioOilTankLevel} unit="%" color="#0ea5e9" />
                <ProgressBarIndicator labelKey="hmi_p01.storage.aqueousPhaseTankLevel" value={hmiState.aqueousPhaseTankLevel} unit="%" color="#3b82f6" />
                <div className="pt-2 mt-auto border-t border-slate-700 space-y-2">
                    <Indicator labelKey="hmi_p01.mainController.biomassFeeder" value={<StatusTag status={hmiState.biomassFeederState ? "ACTIVO" : "INACTIVO"} />} />
                    <Indicator labelKey="hmi_p01.mainController.rpm" value={hmiState.biomassFeederRpm.toFixed(2)} unit="RPM" />
                </div>
            </Panel>
            <Panel titleKey="hmi_p01.gasAnalysis.title" className="col-span-3">
                <GasProgressBar label="CO" value={hmiState.co} color="#ef4444" />
                <GasProgressBar label="CO₂" value={hmiState.co2} color="#6b7280" />
                <GasProgressBar label="H₂" value={hmiState.h2} color="#3b82f6" />
                <GasProgressBar label="CH₄" value={hmiState.ch4} color="#facc15" />
            </Panel>

            <Panel titleKey="hmi_p01.biocharManagement.title" className="col-span-3"><Indicator labelKey="hmi_p01.biocharManagement.dischargeSystemState" value={<StatusTag status={hmiState.dischargeSystemState} />} /><Indicator labelKey="hmi_p01.biocharManagement.dischargeValve" value={<StatusTag status={hmiState.dischargeValve} />} /><Indicator labelKey="hmi_p01.biocharManagement.dischargeRate" value={hmiState.dischargeRate.toFixed(2)} unit="kg/h" /><Indicator labelKey="hmi_p01.biocharManagement.biocharTemp" value={hmiState.biocharTemp.toFixed(2)} unit="°C" /><Indicator labelKey="hmi_p01.biocharManagement.coolerState" value={<StatusTag status={hmiState.coolerState} />} /></Panel>
            <Panel titleKey="hmi_p01.catalystDosing.title" className="col-span-3"><Indicator labelKey="hmi_p01.catalystDosing.systemState" value={<StatusTag status={hmiState.catalystSystemState} />} /><Indicator labelKey="hmi_p01.catalystDosing.dosingValve" value={<StatusTag status={hmiState.catalystDoseValve} />} /><Indicator labelKey="hmi_p01.catalystDosing.dosingRateTarget" value={hmiState.catalystDoseTarget.toFixed(2)} unit="g/min" /><Indicator labelKey="hmi_p01.catalystDosing.feederRpm" value={hmiState.catalystFeederRpm.toFixed(2)} unit="RPM" /></Panel>
            <Panel titleKey="hmi_p01.safetySystem.title" className="col-span-6"><Indicator labelKey="hmi_p01.safetySystem.ambientO2" value={hmiState.ambientO2.toFixed(2)} unit="%" /><Indicator labelKey="hmi_p01.safetySystem.inertGasPurge" value={<StatusTag status={hmiState.inertGasPurge} />} /><div className="flex-grow flex items-center justify-center bg-red-800/50 border-4 border-red-600 rounded-lg mt-4 animate-pulse"><button className="text-2xl font-bold text-white tracking-widest">{t('hmi_p01.safetySystem.emergencyStop')}</button></div></Panel>
        </div>
    );
};

const PresetsTab: React.FC<HMIControlRoomProps> = (props) => {
    const { t } = useTranslations();
    const { setHmiState } = props;

    const allPresets = [
        { name: "Cocción Lenta de Biochar", temp: 400, time: 30, n2: 20, descKey: 'hmi.presets.slowCookingDesc' },
        { name: "Operación Estándar PID", temp: 400, time: 600, n2: 25, descKey: 'hmi.presets.stdPidDesc' },
        { name: "Modo Reposo Eficiente", temp: 150, time: 0, n2: 5, descKey: 'hmi.presets.efficientRestDesc' },
        { name: "Pirólisis Rápida (Bio-aceite)", temp: 500, time: 1.5, n2: 45, descKey: 'Pirólisis Rápida (Bio-aceite)' },
        { name: "Pirólisis de GCR para Syngas", temp: 850, time: 120, n2: 40, descKey: 'Pirólisis de GCR para Syngas' },
        { name: "Caos y Desorden en Sala de Control", temp: 850, time: 0.5, n2: 80, descKey: 'Caos y Desorden en Sala de Control' },
    ];
    
    const coPresetsMap = new Map(CO_PRESETS.map(p => [p.name, p]));
    
    const handleLoadPreset = (presetData: {temp: number, time: number, n2: number, name: string}) => {
        const fullPreset = coPresetsMap.get(presetData.name);
        setHmiState(prev => ({
            ...prev,
            targetTemp: presetData.temp,
            residenceTime: presetData.time,
            agentMode: fullPreset?.agentMode as AgentMode || 'Automático (PID)',
            n2Flow: presetData.n2,
        }));
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
                <div key={`placeholder-top-${i}`} className="p-4 rounded-lg bg-slate-800 border border-slate-700 flex flex-col justify-end">
                    <div className="flex-grow" />
                    <button className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700">{t('hmi.presets.apply')}</button>
                </div>
            ))}
            {allPresets.map((preset, index) => {
                const fullPreset = coPresetsMap.get(preset.name);
                const desc = fullPreset ? fullPreset.cinematicDescription : t(preset.descKey as any);
                return (
                    <div key={index} className="p-4 rounded-lg bg-slate-800 border border-slate-700 flex flex-col justify-between space-y-3">
                        <div>
                            <h4 className="font-bold text-lg text-cyan-400">{preset.name}</h4>
                            <p className="text-sm text-slate-400 italic mt-1">{desc}</p>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span>{t('hmi.presets.targetTemp')}:</span><span className="font-mono">{preset.temp}°C</span></div>
                            <div className="flex justify-between"><span>{t('hmi.presets.residenceTime')}:</span><span className="font-mono">{preset.time} s</span></div>
                            <div className="flex justify-between"><span>{t('hmi.presets.n2Flow')}:</span><span className="font-mono">{preset.n2} L/min</span></div>
                        </div>
                        <button onClick={() => handleLoadPreset(preset)} className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700">{t('hmi.presets.apply')}</button>
                    </div>
                )
            })}
        </div>
    );
};

const ColdSystemsTab: React.FC<HMIControlRoomProps> = (props) => {
    const { hmiState, historyData } = props;
    const { t } = useTranslations();

    const chartData = useMemo(() => {
        const data = historyData.length > 0 ? historyData.slice(-100) : [{...hmiState, time: 0}];
        return data.map((d, index) => ({
            time: index,
            tempIn: d.coolantTempIn,
            tempOut: d.coolantTempOut,
        }));
    }, [historyData, hmiState]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Panel titleKey="hmi.coldSystems.status">
                <Indicator labelKey="hmi.coldSystems.systemState" value={<StatusTag status={hmiState.refrigerationSystemState} />} />
                <Indicator labelKey="hmi.coldSystems.pumpState" value={<StatusTag status={hmiState.refrigerationPumpState} />} />
                <Indicator labelKey="hmi.coldSystems.coolantPressure" value={hmiState.coolantPressure.toFixed(2)} unit="bar" />
                <Indicator labelKey="hmi.coldSystems.chillerPower" value={hmiState.chillerPower.toFixed(2)} unit="kW" />
            </Panel>
            <ChartPanel titleKey="hmi.coldSystems.tempTrend">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="time" tick={false} label={{ value: t('hmi_p01.controlPanel.time'), position: 'insideBottom', offset: 0, fill: '#9ca3af' }} />
                        <YAxis domain={[0, 30]} stroke="#9ca3af" unit="°C" />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #374151' }} />
                        <Legend wrapperStyle={{fontSize: "12px"}}/>
                        <Line type="monotone" dataKey="tempIn" name={t('hmi.coldSystems.coolantTempIn')} stroke="#3b82f6" dot={false} strokeWidth={2} />
                        <Line type="monotone" dataKey="tempOut" name={t('hmi.coldSystems.coolantTempOut')} stroke="#ef4444" dot={false} strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </ChartPanel>
        </div>
    );
};

const ReportsAndDocsTab: React.FC<HMIControlRoomProps> = ({ minuteLog, events }) => {
    const { t } = useTranslations();
    const [subTab, setSubTab] = useState<'live' | 'export'>('live');

    return (
        <div>
            <div className="flex border-b border-slate-700 mb-4">
                <button 
                    onClick={() => setSubTab('live')} 
                    className={`py-2 px-4 -mb-px text-sm font-semibold border-b-2 ${subTab === 'live' ? 'border-cyan-400 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                >
                    {t('hmi.reports.liveLogs')}
                </button>
                <button 
                    onClick={() => setSubTab('export')} 
                    className={`py-2 px-4 -mb-px text-sm font-semibold border-b-2 ${subTab === 'export' ? 'border-cyan-400 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                >
                    {t('hmi.reports.exportData')}
                </button>
            </div>

            {subTab === 'live' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[calc(100vh-20rem)]">
                    <Panel titleKey="hmi.reports.minuteLog">
                        <div className="h-full overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                            {minuteLog.length > 0 ? (
                                minuteLog.slice().reverse().map((log, index) => (
                                    <div key={index} className="text-xs p-2 bg-slate-900/50 rounded font-mono text-slate-300">
                                        <span className="text-slate-500">{log.time}</span> | T:<span className="text-white">{log.reactorTemp.toFixed(1)}</span>°C | P:<span className="text-white">{log.reactorPressure.toFixed(2)}</span>bar | F:<span className="text-white">{log.feedRate.toFixed(1)}</span>kg/h
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-500 italic">No hay registros de minuto.</p>
                            )}
                        </div>
                    </Panel>
                    <Panel titleKey="hmi.reports.eventLog">
                        <div className="h-full overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                            {events.length > 0 ? (
                                events.map((event, index) => (
                                    <p key={index} className="text-xs font-mono text-slate-400">{event}</p>
                                ))
                            ) : (
                                <p className="text-slate-500 italic">{t('hmi.reports.noEvents')}</p>
                            )}
                        </div>
                    </Panel>
                </div>
            )}
            {subTab === 'export' && (
                <div className="p-8 text-center text-slate-500">
                    <p>La funcionalidad de exportación de datos no está implementada en esta demostración.</p>
                </div>
            )}
        </div>
    );
};

const CinematicViewTab: React.FC<HMIControlRoomProps> = (props) => {
    const { t } = useTranslations();
    const { hmiState } = props;
    const [prompt, setPrompt] = useState('');
    const [result, setResult] = useState<{type: 'image' | 'video', url: string} | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [videoProgress, setVideoProgress] = useState(0);
    const [videoStatusMessageKey, setVideoStatusMessageKey] = useState('');
    const [isVeoEnabled, setIsVeoEnabled] = useState(false);

    useEffect(() => {
        const checkApiKey = async () => {
            if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
                setIsVeoEnabled(true);
            }
        };
        checkApiKey();
    }, []);
    
    useEffect(() => {
        const stateMap = { 'APAGADO': 'APAGADO', 'CALENTANDO': 'CALENTANDO', 'ESTABLE': 'ESTABLE', 'ENFRIANDO': 'ENFRIANDO' };
        const moodMap = {
            'APAGADO': 'frío, durmiente y silencioso, sin partes brillantes',
            'CALENTANDO': 'energético y anticipatorio, con elementos que comienzan a brillar de un rojo tenue',
            'ESTABLE': 'poderoso y en pleno funcionamiento, con un núcleo incandescente y flujos de energía visibles',
            'ENFRIANDO': 'calmado y disipando calor, con partes que pierden su brillo lentamente'
        };
        const temp = hmiState.reactorTemp.toFixed(0);
        const state = stateMap[hmiState.systemMode] || 'desconocido';
        const mood = moodMap[hmiState.systemMode] || 'neutro';

        setPrompt(`Cinematic, photorealistic, wide shot of a P-01 biomass pyrolysis reactor inside a modern, clean industrial facility. The system is currently in a ${state} state. The core temperature is approximately ${temp}°C. The mood is ${mood}. High detail, 8k.`);
    }, [hmiState.systemMode, hmiState.reactorTemp]);

    const handleGenerateImage = async () => {
        setIsLoading(true); setError(''); setResult(null);
        try {
            const imageData = await generateCinematicImage(prompt);
            setResult({ type: 'image', url: `data:image/jpeg;base64,${imageData}` });
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error desconocido');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGenerateVideo = async () => {
        if (!window.aistudio) return;
        if (!isVeoEnabled) {
            await window.aistudio.openSelectKey();
            setIsVeoEnabled(true); 
            return;
        }

        setIsLoading(true); setError(''); setResult(null); setVideoProgress(0); setVideoStatusMessageKey('');
        const onProgress = (key: string, prog: number) => { setVideoStatusMessageKey(key); setVideoProgress(prog); };
        
        try {
            const videoUrl = await generateCinematicVideo(prompt, onProgress);
            setResult({ type: 'video', url: videoUrl });
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            if (msg.includes("Requested entity was not found")) {
                setIsVeoEnabled(false);
                setError(t('hmi.cinematicView.apiKeyError'));
            } else {
                setError(msg);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Panel titleKey="hmi.cinematicView.cinematicCreation">
                 <div>
                    <label className="text-sm text-slate-400" htmlFor="cinematic-prompt">{t('hmi.cinematicView.promptLabel')}</label>
                    <textarea id="cinematic-prompt" rows={8} value={prompt} onChange={e => setPrompt(e.target.value)} className="w-full p-2 mt-1 bg-slate-700 border border-slate-600 rounded-md" placeholder={t('hmi.cinematicView.promptPlaceholder')} />
                </div>
                {!isVeoEnabled && (
                    <div className="p-3 bg-yellow-900/50 border border-yellow-700 rounded-md text-sm text-yellow-300">
                        <p>{t('hmi.cinematicView.apiKeyDisclaimer')}
                           <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline">{t('hmi.cinematicView.apiKeyDisclaimerLink')}</a>
                        </p>
                        <button onClick={handleGenerateVideo} className="mt-2 w-full bg-yellow-600 text-white font-semibold py-2 rounded">{t('hmi.cinematicView.selectApiKey')}</button>
                    </div>
                )}
                <div className="flex gap-4 mt-auto">
                    <button onClick={handleGenerateVideo} disabled={isLoading || !isVeoEnabled} className="w-full bg-purple-600 text-white font-bold py-2 rounded-lg hover:bg-purple-700 disabled:bg-slate-600">{t('hmi.cinematicView.generateVideo')}</button>
                    <button onClick={handleGenerateImage} disabled={isLoading} className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg hover:bg-indigo-700 disabled:bg-slate-600">{t('hmi.cinematicView.generateImageFixed')}</button>
                </div>
            </Panel>
            <Panel titleKey="hmi.cinematicView.cinematicVisualization">
                <div className="flex-grow flex items-center justify-center bg-black/50 rounded-md min-h-[300px]">
                    {isLoading ? <div><p className="animate-pulse">{t('hmi.cinematicView.generating')}</p>{videoStatusMessageKey && <p className="text-xs text-slate-400 mt-2">{t(videoStatusMessageKey)} ({videoProgress}%)</p>}</div> : 
                     error ? <p className="text-red-400 p-4">{error}</p> :
                     result ? (
                        result.type === 'image' ? <img src={result.url} className="max-h-full max-w-full rounded-md" alt="Generated cinematic view"/> : <video src={result.url} controls autoPlay loop className="max-h-full max-w-full rounded-md" />
                     ) : <p className="text-slate-500">{t('hmi.cinematicView.visualizationPlaceholder')}</p>}
                </div>
            </Panel>
        </div>
    );
};

const TrendsAndKpisTab: React.FC<HMIControlRoomProps> = (props) => {
    const { t } = useTranslations();
    const { historyData } = props;

    // Ensure there's always some data for charts to render
    const chartData = useMemo(() => {
        const data = historyData.length > 0 ? historyData.slice(-100) : [{...props.hmiState, time: 0}];
        return data.map((d, index) => ({
            time: index,
            reactorTemp: d.reactorTemp,
            pyrometerCoreTemp: d.pyrometerCoreTemp,
            thermocoupleCoreTemp: d.thermocoupleCoreTemp,
            co: d.co || 0,
            co2: d.co2 || 0,
            h2: d.h2 || 0,
            ch4: d.ch4 || 0,
            feedRate: d.feedRate || 0,
            condensateFlow: d.condensateFlow || 0,
            n2Flow: d.n2Flow || 0,
            pressure: d.reactorPressure || 0,
        }));
    }, [historyData, props.hmiState]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ChartPanel titleKey="hmi_p01.controlPanel.reactorTemps">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="time" tick={false} label={{ value: t('hmi_p01.controlPanel.time'), position: 'insideBottom', offset: 0, fill: '#9ca3af' }} />
                        <YAxis domain={[0, 900]} stroke="#9ca3af" />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #374151' }} />
                        <Legend wrapperStyle={{fontSize: "12px"}}/>
                        <Line type="monotone" dataKey="reactorTemp" name={t('hmi_p01.reactorConditions.reactorTemp')} stroke="#f87171" dot={false} strokeWidth={2} />
                        <Line type="monotone" dataKey="pyrometerCoreTemp" name={t('hmi_p01.reactorConditions.pyrometer')} stroke="#fb923c" dot={false} strokeWidth={2} />
                        <Line type="monotone" dataKey="thermocoupleCoreTemp" name={t('hmi_p01.reactorConditions.thermocouple')} stroke="#facc15" dot={false} strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </ChartPanel>

            <ChartPanel titleKey="hmi_p01.controlPanel.outletGas">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="time" tick={false} label={{ value: t('hmi_p01.controlPanel.time'), position: 'insideBottom', offset: 0, fill: '#9ca3af' }}/>
                        <YAxis unit="%" domain={[0, 4]} stroke="#9ca3af"/>
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #374151' }} />
                        <Legend wrapperStyle={{fontSize: "12px"}}/>
                        <Line type="monotone" dataKey="co" name="CO" stroke="#dc2626" dot={false} />
                        <Line type="monotone" dataKey="co2" name="CO₂" stroke="#6b7280" dot={false} />
                        <Line type="monotone" dataKey="h2" name="H₂" stroke="#3b82f6" dot={false} />
                        <Line type="monotone" dataKey="ch4" name="CH₄" stroke="#ca8a04" dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </ChartPanel>

            <ChartPanel titleKey="hmi_p01.controlPanel.processFlows">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="time" tick={false} label={{ value: t('hmi_p01.controlPanel.time'), position: 'insideBottom', offset: 0, fill: '#9ca3af' }} />
                        <YAxis domain={[0, 60]} stroke="#9ca3af" />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #374151' }} />
                        <Legend wrapperStyle={{fontSize: "12px"}}/>
                        <Line type="monotone" dataKey="feedRate" name={t('hmi_p01.flowFeed.feedRate')} stroke="#22c55e" dot={false} strokeWidth={2}/>
                         <Line type="monotone" dataKey="condensateFlow" name={t('hmi_p01.oilProduction.condensateFlow')} stroke="#67e8f9" dot={false} strokeWidth={2}/>
                        <Line type="monotone" dataKey="n2Flow" name={t('hmi_p01.flowFeed.n2Flowmeter')} stroke="#60a5fa" dot={false} strokeWidth={2}/>
                    </LineChart>
                </ResponsiveContainer>
            </ChartPanel>

            <ChartPanel titleKey="hmi_p01.controlPanel.reactorPressure">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="time" tick={false} label={{ value: t('hmi_p01.controlPanel.time'), position: 'insideBottom', offset: 0, fill: '#9ca3af' }} />
                        <YAxis domain={[1.0, 2.5]} stroke="#9ca3af" allowDataOverflow={true}/>
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #374151' }} />
                        <Legend wrapperStyle={{fontSize: "12px"}}/>
                        <Line type="monotone" dataKey="pressure" name={t('hmi_p01.reactorConditions.pressure')} stroke="#a78bfa" dot={false} strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </ChartPanel>
        </div>
    );
};

const PreventiveSecurityTab: React.FC<HMIControlRoomProps> = (props) => {
    const { t } = useTranslations();
    const { alarmConfigs, onAlarmConfigChange } = props;

    const alarmGroups = [
        { key: 'reactorTemp', nameKey: 'hmi.preventiveSecurity.reactorTempAlarm' },
        { key: 'reactorPressure', nameKey: 'hmi.preventiveSecurity.pressureAlarm' },
        { key: 'condenserTemp', nameKey: 'hmi.preventiveSecurity.condenserTempAlarm' },
        { key: 'biomassHopper', nameKey: 'hmi.preventiveSecurity.hopperLevelAlarm' },
        { key: 'bioOilTank', nameKey: 'hmi.preventiveSecurity.bioOilTankAlarm' },
    ];
    
    const soundOptions = [
        { id: 'beepShort', nameKey: 'hmi.alarmSounds.beepShort' },
        { id: 'beepContinuous', nameKey: 'hmi.alarmSounds.beepContinuous' },
        { id: 'sirenIntermittent', nameKey: 'hmi.alarmSounds.sirenIntermittent' },
        { id: 'voiceAlert', nameKey: 'hmi.alarmSounds.voiceAlert' },
    ];

    const handleConfigChange = (key: string, field: keyof AlarmConfig, value: any) => {
        onAlarmConfigChange(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                [field]: value
            }
        }));
    };
    
    return (
        <div>
            <h3 className="text-xl font-bold mb-4">{t('hmi.preventiveSecurity.advancedConfigTitle')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {alarmGroups.map(alarm => {
                    const config = alarmConfigs[alarm.key];
                    if (!config) return null;
                    return (
                        <Panel key={alarm.key} titleKey="" className="!p-0">
                            <div className="p-4 flex justify-between items-center bg-slate-800 rounded-t-lg">
                                <h4 className="font-bold text-lg text-cyan-400">{t(alarm.nameKey)}</h4>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={config.enabled} onChange={() => handleConfigChange(alarm.key, 'enabled', !config.enabled)} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                </label>
                            </div>
                             <div className="p-4 space-y-3">
                                {['med', 'high', 'crit'].map(level => {
                                    const levelKey = level as 'med' | 'high' | 'crit';
                                    const nameKey = `hmi.preventiveSecurity.${levelKey}PriorityThreshold`;
                                    const value = config[levelKey];
                                    const soundKey = `${levelKey}Sound` as 'medSound' | 'highSound' | 'critSound';
                                    const soundValue = config[soundKey];

                                    return (
                                        <div key={levelKey} className="grid grid-cols-2 gap-2 items-center">
                                            <div className="flex flex-col">
                                                <label className="text-xs text-slate-400">{t(nameKey)}</label>
                                                <input
                                                    type="number"
                                                    value={value}
                                                    onChange={(e) => handleConfigChange(alarm.key, levelKey, Number(e.target.value))}
                                                    className="w-full p-1 bg-slate-700 border border-slate-600 rounded-md text-sm mt-1"
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <label className="text-xs text-slate-400">{t('hmi.preventiveSecurity.sound')}</label>
                                                <select
                                                    value={soundValue}
                                                    onChange={(e) => handleConfigChange(alarm.key, soundKey, e.target.value)}
                                                    className="w-full p-1 bg-slate-700 border border-slate-600 rounded-md text-sm mt-1"
                                                >
                                                    {soundOptions.map(opt => <option key={opt.id} value={opt.id}>{t(opt.nameKey)}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </Panel>
                    )
                })}
            </div>
        </div>
    );
};

const MaterialsAndCatalystsTab: React.FC<HMIControlRoomProps> = ({ selectedFeedstockId, onFeedstockChange, selectedCatalystId, onCatalystChange }) => {
    const { t } = useTranslations();
    const selectedMaterial = useMemo(() => PYROLYSIS_MATERIALS.find(m => m.id === selectedFeedstockId) as SolidMaterial | undefined, [selectedFeedstockId]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Panel titleKey="hmi.materials.feedstockSelection">
                 <div>
                    <label className="text-sm text-slate-400">{t('hmi.materials.baseFeedstock')}</label>
                    <select value={selectedFeedstockId} onChange={e => onFeedstockChange(Number(e.target.value))} className="w-full p-2 mt-1 bg-slate-700 border border-slate-600 rounded-md">
                        {PYROLYSIS_MATERIALS.filter(m => m.fase === 'Sólido').map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                    </select>
                </div>
                {selectedMaterial && (
                    <div className="mt-4 pt-4 border-t border-slate-700">
                        <h5 className="font-semibold text-white mb-2">{t('hmi.materials.materialProperties')}</h5>
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between"><span>{t('hmi.materials.calorificValue')}:</span> <span className="font-mono">{selectedMaterial.propiedades.poderCalorificoSuperior} MJ/kg</span></div>
                            <div className="flex justify-between"><span>{t('hmi.materials.cellulose')}:</span> <span className="font-mono">{selectedMaterial.propiedades.composicion.celulosa}%</span></div>
                            <div className="flex justify-between"><span>{t('hmi.materials.hemicellulose')}:</span> <span className="font-mono">{selectedMaterial.propiedades.composicion.hemicellulosa}%</span></div>
                            <div className="flex justify-between"><span>{t('hmi.materials.lignin')}:</span> <span className="font-mono">{selectedMaterial.propiedades.composicion.lignina}%</span></div>
                        </div>
                    </div>
                )}
            </Panel>
             <Panel titleKey="hmi.materials.catalystSelection">
                <div>
                    <label className="text-sm text-slate-400">{t('hmi.materials.catalyst')}</label>
                    <select value={selectedCatalystId} onChange={e => onCatalystChange(e.target.value)} className="w-full p-2 mt-1 bg-slate-700 border border-slate-600 rounded-md">
                        {SIMULATION_ENGINE.catalysts.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                </div>
            </Panel>
        </div>
    );
};

const ScenarioConfiguratorTab: React.FC<HMIControlRoomProps> = (props) => {
    const { t } = useTranslations();
    const { setIsCondenserObstructed, setIsGasLineObstructed, setIsTempSensorFailed, setIsBiomassContaminated } = props;
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Panel titleKey="hmi.scenarioConfig.creationConfig">
                <div className="flex flex-col h-full justify-center">
                    <label htmlFor="preset-select" className="block text-sm text-slate-400 mb-1">{t('hmi.scenarioConfig.opPreset')}</label>
                    <select id="preset-select" className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md">
                        <option>{t('hmi.scenarioConfig.selectPreset')}</option>
                        {CO_PRESETS.map(p => <option key={p.name}>{p.name}</option>)}
                    </select>
                </div>
            </Panel>
            <Panel titleKey="hmi.scenarioConfig.failureSim">
                 <div className="grid grid-cols-2 gap-3 h-full content-center">
                    <button onClick={() => setIsCondenserObstructed(true)} className="bg-orange-600 hover:bg-orange-700 p-3 rounded font-semibold">{t('hmi.scenarioConfig.simCondenser')}</button>
                    <button onClick={() => setIsGasLineObstructed(true)} className="bg-orange-600 hover:bg-orange-700 p-3 rounded font-semibold">{t('hmi.scenarioConfig.simGasLine')}</button>
                    <button onClick={() => setIsTempSensorFailed(true)} className="bg-orange-600 hover:bg-orange-700 p-3 rounded font-semibold">{t('hmi.scenarioConfig.simThermocouple')}</button>
                    <button onClick={() => setIsBiomassContaminated(true)} className="bg-orange-600 hover:bg-orange-700 p-3 rounded font-semibold">{t('hmi.scenarioConfig.simBiomass')}</button>
                </div>
            </Panel>
        </div>
    );
};

const PIDConfigurationTab: React.FC<HMIControlRoomProps> = ({ pidGains, onPidChange }) => {
    const { t } = useTranslations();
    const errorData = useMemo(() => Array.from({length: 100}, (_, i) => ({
        time: i,
        error: 50 * Math.exp(-i/20) * Math.cos(i/5) + (Math.random() - 0.5) * 2,
        setpoint: 0
    })), []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        onPidChange(prev => ({
            ...prev,
            [name]: parseFloat(value) || 0
        }));
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Panel titleKey="hmi.pidConfig.title">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="kp" className="text-sm text-slate-400">{t('hmi.pidConfig.kp')}</label>
                        <input id="kp" name="kp" type="number" step="0.1" value={pidGains.kp} onChange={handleChange} className="w-full p-2 mt-1 bg-slate-700 border border-slate-600 rounded-md font-mono text-right" />
                    </div>
                     <div>
                        <label htmlFor="ki" className="text-sm text-slate-400">{t('hmi.pidConfig.ki')}</label>
                        <input id="ki" name="ki" type="number" step="0.01" value={pidGains.ki} onChange={handleChange} className="w-full p-2 mt-1 bg-slate-700 border border-slate-600 rounded-md font-mono text-right" />
                    </div>
                     <div>
                        <label htmlFor="kd" className="text-sm text-slate-400">{t('hmi.pidConfig.kd')}</label>
                        <input id="kd" name="kd" type="number" step="0.1" value={pidGains.kd} onChange={handleChange} className="w-full p-2 mt-1 bg-slate-700 border border-slate-600 rounded-md font-mono text-right" />
                    </div>
                </div>
            </Panel>
            <ChartPanel titleKey="hmi.pidConfig.systemResponse">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={errorData} margin={{ top: 5, right: 20, left: -20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="time" tick={false} label={{ value: t('hmi.pidConfig.timeLabel'), position: 'insideBottom', fill: '#9ca3af' }} />
                        <YAxis domain={[-50, 50]} stroke="#9ca3af" />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #374151' }} />
                        <Legend wrapperStyle={{fontSize: "12px"}}/>
                        <Line type="monotone" dataKey="error" name={t('hmi.pidConfig.error')} stroke="#ef4444" dot={false} strokeWidth={2}/>
                        <Line type="monotone" dataKey="setpoint" name={t('hmi.pidConfig.setpoint')} stroke="#22c55e" dot={false} strokeWidth={2}/>
                    </LineChart>
                </ResponsiveContainer>
            </ChartPanel>
        </div>
    );
};


export const HMIControlRoom: React.FC<HMIControlRoomProps> = (props) => {
    const { t } = useTranslations();
    const [activeTab, setActiveTab] = useState<HMIPanel>('controlPanel');
    
    const allTabs: { id: HMIPanel; nameKey: string }[] = [
        { id: 'controlPanel', nameKey: 'hmi_p01.tabs.controlPanel' },
        { id: 'presets', nameKey: 'hmi.tabs.presets' },
        { id: 'coldSystems', nameKey: 'hmi.tabs.coldSystems' },
        { id: 'reports', nameKey: 'hmi.tabs.reports' },
        { id: 'cinematicView', nameKey: 'hmi.tabs.cinematicView' },
        { id: 'trends', nameKey: 'hmi.tabs.trends' },
        { id: 'preventiveSecurity', nameKey: 'hmi.tabs.preventiveSecurity' },
        { id: 'materialsCatalysts', nameKey: 'hmi.tabs.materialsCatalysts' },
        { id: 'scenarioConfigurator', nameKey: 'hmi.tabs.scenarioConfigurator' },
        { id: 'pidConfiguration', nameKey: 'hmi.tabs.pidConfiguration' },
    ];
    
    const renderContent = () => {
        switch(activeTab) {
            case 'controlPanel': return <ControlPanelTab {...props} />;
            case 'presets': return <PresetsTab {...props} />;
            case 'coldSystems': return <ColdSystemsTab {...props} />;
            case 'reports': return <ReportsAndDocsTab {...props} />;
            case 'cinematicView': return <CinematicViewTab {...props} />;
            case 'trends': return <TrendsAndKpisTab {...props} />;
            case 'preventiveSecurity': return <PreventiveSecurityTab {...props} />;
            case 'materialsCatalysts': return <MaterialsAndCatalystsTab {...props} />;
            case 'scenarioConfigurator': return <ScenarioConfiguratorTab {...props} />;
            case 'pidConfiguration': return <PIDConfigurationTab {...props} />;
            default: return <ControlPanelTab {...props} />;
        }
    };

    return (
        <div className="bg-slate-900 text-white min-h-full p-6 font-sans flex flex-col">
            <header className="text-center mb-4 relative">
                <h2 className="text-3xl font-bold">{t('hmi_p01.title')}</h2>
                <p className="mt-1 text-md text-slate-400">{t('hmi_p01.subtitle')}</p>
                 <button onClick={() => props.setView('hyperion-9')} className="absolute top-1/2 -translate-y-1/2 right-0 flex items-center gap-2 bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors px-4 py-2 rounded-lg text-sm font-semibold">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    {t('hmi_p01.backToHyperion')}
                </button>
            </header>
            
            <div className="border-b border-slate-700 mb-6">
                <nav className="-mb-px flex flex-wrap text-sm">
                    {allTabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`whitespace-nowrap py-3 px-2 border-b-2 font-medium ${activeTab === tab.id ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'}`}>
                            {t(tab.nameKey)}
                        </button>
                    ))}
                </nav>
            </div>
            
            <main className="flex-grow animate-fade-in">
                {renderContent()}
            </main>
             <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};
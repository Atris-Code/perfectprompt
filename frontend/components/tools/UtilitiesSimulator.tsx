import React, { useState, useCallback, useEffect } from 'react';
import { useUtilityCosts, UtilityCostState } from '../../contexts/UtilityCostContext';
import type { Task, UtilityDutyType, View } from '../../types';
import { ContentType } from '../../types';
import { useTranslations } from '../../contexts/LanguageContext';

interface UtilitiesSimulatorProps {
    onSaveTask: (task: Task) => void;
    setView: (view: View) => void;
    isWidgetMode?: boolean;
    initialDuty?: number | null;
    initialDutyType?: UtilityDutyType | null;
    initialUnit?: string | null;
    onCloseWidget?: () => void;
    initialActiveTab?: string;
    initialProcessDemand?: number;
    initialDemands?: { [key: string]: number } | null;
    onDataConsumed?: () => void;
}

const InputField: React.FC<{ label: string; id: string; type?: string; value: number | string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; unit: string; disabled?: boolean }> = ({ label, id, type = 'number', value, onChange, unit, disabled }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-300">{label}</label>
        <div className="mt-1 flex rounded-md shadow-sm">
            <input
                type={type}
                id={id}
                value={value}
                onChange={onChange}
                className="flex-grow block w-full min-w-0 rounded-none rounded-l-md bg-slate-700 border-slate-600 text-white px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-800 disabled:text-slate-400"
                step="any"
                disabled={disabled}
            />
            <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-slate-600 bg-slate-800 text-slate-400 text-sm">
                {unit}
            </span>
        </div>
    </div>
);

const OutputField: React.FC<{ label: string; value: string; unit: string; isHighlighted?: boolean }> = ({ label, value, unit, isHighlighted }) => (
    <div>
        <p className="text-sm text-slate-400">{label}</p>
        <p className={`text-2xl font-bold ${isHighlighted ? 'text-yellow-400' : 'text-cyan-400'}`}>
            {value} <span className="text-lg text-slate-300">{unit}</span>
        </p>
    </div>
);

const Panel: React.FC<React.PropsWithChildren<{ title: string; }>> = ({ title, children }) => (
    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex-grow">
        <h3 className="text-lg font-bold text-cyan-400 mb-3 border-b border-slate-700 pb-2">{title}</h3>
        <div className="space-y-3">{children}</div>
    </div>
);


export const UtilitiesSimulator: React.FC<UtilitiesSimulatorProps> = ({
    onSaveTask,
    setView,
    isWidgetMode = false,
    initialDuty,
    initialDutyType,
    initialUnit,
    onCloseWidget,
    initialActiveTab,
    initialProcessDemand,
    initialDemands,
    onDataConsumed
}) => {
    const { t } = useTranslations();
    const { costs, setCosts } = useUtilityCosts();
    const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

    const [activeTab, setActiveTab] = useState(initialActiveTab || 'fired-heat');

    // States for inputs
    const [fhInputs, setFhInputs] = useState({ duty: 4, efficiency: 85, fuelCost: 3.20, hours: 8000 });
    const [sInputs, setSInputs] = useState({ fuelCost: 6, elecCost: 0.06, boilerEff: 80, turbineEff: 85 });
    const [rInputs, setRInputs] = useState({ duty: 1.2, tempEvap: -10, tempCond: 45, cycleEff: 80, elecCost: 0.06, hours: 8000 });
    const [cwInputs, setCwInputs] = useState({ duty: 1000, range: 5.5, spec: 0.4, elecCost: 0.06 });
    const [caInputs, setCaInputs] = useState({ flow: 150, pressure: 6, eff: 75, elecCost: 0.06 });
    const [ppInputs, setPpInputs] = useState({ demand: 385, elecCost: 0.06, hours: 8000 });
    const [ffInputs, setFfInputs] = useState({ demand: 0, price: 0.5, hours: 8000 });


    // States for outputs
    const [fhOutputs, setFhOutputs] = useState({ fuelReq: '...', annualCost: '...' });
    const [sOutputs, setSOutputs] = useState({ hpPrice: '...', mpPrice: '...', lpPrice: '...' });
    const [rOutputs, setROutputs] = useState({ copCarnot: '...', copActual: '...', workReq: '...', annualCost: '...' });
    const [cwOutputs, setCwOutputs] = useState({ flow: '...', power: '...', costHour: '...' });
    const [caOutputs, setCaOutputs] = useState({ power: '...', costHour: '...' });
    const [ppOutputs, setPpOutputs] = useState({ costHour: '...', annualCost: '...' });
    const [ffOutputs, setFfOutputs] = useState({ costHour: '...', annualCost: '...' });

    useEffect(() => {
        if (isWidgetMode && initialDutyType && initialDuty !== null) {
            setActiveTab(initialDutyType);
            switch (initialDutyType) {
                case 'fired-heat': setFhInputs(prev => ({ ...prev, duty: initialDuty })); break;
                case 'refrigeration': setRInputs(prev => ({ ...prev, duty: initialDuty / 1000 })); break;
                case 'cooling-water': setCwInputs(prev => ({ ...prev, duty: initialDuty })); break;
                case 'compressed-air': setCaInputs(prev => ({ ...prev, flow: initialDuty })); break;
            }
        }
    }, [isWidgetMode, initialDutyType, initialDuty]);

    useEffect(() => {
        if (isWidgetMode) return;

        let didConsume = false;

        if (initialDemands) {
            if (initialDemands['process-power']) setPpInputs(prev => ({ ...prev, demand: initialDemands['process-power']! }));
            if (initialDemands['fired-heat']) setFhInputs(prev => ({ ...prev, duty: initialDemands['fired-heat']! }));
            if (initialDemands['compressed-air']) setCaInputs(prev => ({ ...prev, flow: initialDemands['compressed-air']! }));
            if (initialDemands['fleet-fuel']) setFfInputs(prev => ({ ...prev, demand: initialDemands['fleet-fuel']! }));

            if (initialActiveTab) {
                setActiveTab(initialActiveTab);
            } else {
                const firstDemandTab = Object.keys(initialDemands)[0];
                if (firstDemandTab) setActiveTab(firstDemandTab);
            }
            didConsume = true;
        } else if (initialActiveTab && initialProcessDemand) {
            setActiveTab(initialActiveTab);
            if (initialActiveTab === 'process-power') setPpInputs(prev => ({ ...prev, demand: initialProcessDemand }));
            if (initialActiveTab === 'fired-heat') setFhInputs(prev => ({ ...prev, duty: initialProcessDemand }));
            didConsume = true;
        }

        if (didConsume && onDataConsumed) {
            onDataConsumed();
        }
    }, [initialDemands, initialActiveTab, initialProcessDemand, onDataConsumed, isWidgetMode]);

    const handleInputChange = (setter: React.Dispatch<React.SetStateAction<any>>, field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setter((prev: any) => ({ ...prev, [field]: parseFloat(e.target.value) || 0 }));
    };

    const calculateAll = useCallback(() => {
        // Fired Heat
        const fuelRequired = fhInputs.duty / (fhInputs.efficiency / 100);
        const MMBtu_per_MW = 3.412;
        const annualCostFh = fuelRequired * MMBtu_per_MW * fhInputs.hours * fhInputs.fuelCost;
        setFhOutputs({
            fuelReq: fuelRequired.toFixed(2),
            annualCost: annualCostFh.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
        });

        // Steam
        const { fuelCost, elecCost, boilerEff, turbineEff } = sInputs;
        const heating_rate_MMBtu_per_Mlb = 0.864;
        const price_hp_mlb = (fuelCost * heating_rate_MMBtu_per_Mlb / (boilerEff / 100));
        const price_hp_ton = price_hp_mlb * 2.20462;
        const shaft_work_credit_hp_mp = 20.2 * (turbineEff / 85) * elecCost * (1 / 1.01);
        const shaft_work_credit_mp_lp = 28.7 * (turbineEff / 85) * elecCost * (1 / 1.44);
        const price_mp_ton = (price_hp_mlb - shaft_work_credit_hp_mp) * 2.20462;
        const price_lp_ton = ((price_mp_ton / 2.20462) - shaft_work_credit_mp_lp) * 2.20462;
        setSOutputs({
            hpPrice: price_hp_ton.toFixed(2),
            mpPrice: price_mp_ton.toFixed(2),
            lpPrice: price_lp_ton.toFixed(2),
        });

        // Refrigeration
        const { duty, tempEvap, tempCond, cycleEff, elecCost: rElecCost, hours } = rInputs;
        const tempEvapK = tempEvap + 273.15; const tempCondK = tempCond + 273.15;
        const copCarnot = tempEvapK > 0 && (tempCondK - tempEvapK) > 0 ? tempEvapK / (tempCondK - tempEvapK) : 0;
        const copActual = copCarnot * (cycleEff / 100);
        const workRequired = copActual > 0 ? duty / copActual : 0;
        const annualCostR = workRequired * 1000 * hours * rElecCost;
        setROutputs({
            copCarnot: copCarnot.toFixed(2),
            copActual: copActual.toFixed(2),
            workReq: workRequired.toFixed(3),
            annualCost: annualCostR.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
        });

        // Cooling Water
        const { duty: cwDuty, range, spec, elecCost: cwElecCost } = cwInputs;
        const cp_water = 4.186; const density_water = 1000;
        const massFlow = (range > 0) ? cwDuty / (cp_water * range) : 0;
        const volumeFlow_m3_h = (massFlow / density_water) * 3600;
        const powerConsumption_kW = volumeFlow_m3_h * spec;
        const costPerHourCw = powerConsumption_kW * cwElecCost;
        setCwOutputs({
            flow: volumeFlow_m3_h.toFixed(2),
            power: powerConsumption_kW.toFixed(2),
            costHour: costPerHourCw.toFixed(2)
        });

        // Compressed Air
        const { flow, pressure, eff, elecCost: caElecCost } = caInputs;
        const p1 = 1.01325; const n = 1.4; const R = 8.314; const T1 = 298.15;
        const p2 = pressure + p1;
        const work_j_mol = (n * R * T1 / (n - 1)) * (Math.pow(p2 / p1, (n - 1) / n) - 1);
        const flow_mol_s = (flow / 3600) * (p1 * 1e5) / (R * T1);
        const ideal_power_w = work_j_mol * flow_mol_s;
        const real_power_kw = (ideal_power_w / 1000) / (eff / 100);
        const costPerHourCa = real_power_kw * caElecCost;
        setCaOutputs({
            power: real_power_kw.toFixed(2),
            costHour: costPerHourCa.toFixed(2)
        });

        // Process Power
        const costPerHourPp = ppInputs.demand * ppInputs.elecCost;
        const annualCostPp = costPerHourPp * ppInputs.hours;
        setPpOutputs({
            costHour: costPerHourPp.toFixed(2),
            annualCost: annualCostPp.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
        });

        // Fleet Fuel
        const costPerHourFf = ffInputs.demand * costs.biogasPrice_m3;
        const annualCostFf = costPerHourFf * ffInputs.hours;
        setFfOutputs({
            costHour: costPerHourFf.toFixed(2),
            annualCost: annualCostFf.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
        });

    }, [fhInputs, sInputs, rInputs, cwInputs, caInputs, ppInputs, ffInputs, costs.biogasPrice_m3]);

    useEffect(() => {
        calculateAll();
    }, [calculateAll]);

    useEffect(() => {
        setSInputs(prev => ({ ...prev, elecCost: ppInputs.elecCost }));
        setRInputs(prev => ({ ...prev, elecCost: ppInputs.elecCost }));
        setCwInputs(prev => ({ ...prev, elecCost: ppInputs.elecCost }));
        setCaInputs(prev => ({ ...prev, elecCost: ppInputs.elecCost }));
    }, [ppInputs.elecCost]);

    const handleSaveCosts = () => {
        const effectiveRefrigerationPrice = rInputs.elecCost / (parseFloat(rOutputs.copActual) || 1);
        const coolingWaterPriceM3 = cwInputs.spec * cwInputs.elecCost;

        const newCosts: Partial<UtilityCostState> = {
            steamHpPrice: parseFloat(sOutputs.hpPrice),
            steamMpPrice: parseFloat(sOutputs.mpPrice),
            steamLpPrice: parseFloat(sOutputs.lpPrice),
            refrigerationPriceKwhCooling: effectiveRefrigerationPrice,
            coolingWaterPriceM3: coolingWaterPriceM3,
            compressedAirPriceKwh: caInputs.elecCost,
            firedHeatPriceMMBtu: fhInputs.fuelCost,
            gridElectricityPrice: ppInputs.elecCost,
            biogasPrice_m3: ffInputs.price,
        };
        setCosts(newCosts);
        setShowSaveConfirmation(true);
        setTimeout(() => setShowSaveConfirmation(false), 3000);
    };

    const handleGenerateReport = () => {
        if (!onSaveTask || !setView) return;

        const tabs = [
            { id: 'fired-heat', label: t('utilities.tabs.firedHeat') },
            { id: 'steam', label: t('utilities.tabs.steam') },
            { id: 'refrigeration', label: t('utilities.tabs.refrigeration') },
            { id: 'cooling-water', label: t('utilities.tabs.coolingWater') },
            { id: 'compressed-air', label: t('utilities.tabs.compressedAir') },
            { id: 'process-power', label: t('utilities.tabs.processPower') },
            { id: 'fleet-fuel', label: t('utilities.tabs.fleetFuel') },
        ];

        const currentTabLabel = tabs.find(tab => tab.id === activeTab)?.label || 'Utilities';

        let reportData = `## Resumen de Costos: ${currentTabLabel}\n\n`;

        switch (activeTab) {
            case 'fired-heat':
                reportData += `| Métrica                       | Valor                                     |\n|-------------------------------|-------------------------------------------|\n| **Parámetros de Entrada**     |                                           |\n| Carga Térmica (MW)            | ${fhInputs.duty}                          |\n| Eficiencia Calentador (%)     | ${fhInputs.efficiency}                    |\n| Costo Combustible (€/MMBtu)   | ${fhInputs.fuelCost}                      |\n| Horas Anuales                 | ${fhInputs.hours}                         |\n| **Resultados**                |                                           |\n| Combustible Requerido (MW)    | ${fhOutputs.fuelReq}                      |\n| Costo Anual (Combustible)     | ${fhOutputs.annualCost}                   |`;
                break;
            // Add cases for other tabs similarly
            default:
                reportData += "No se ha generado un reporte para esta sección.";
                break;
        }

        const taskTitle = `${t('utilities.taskTitle')} - ${currentTabLabel}`;

        const task: Task = {
            id: `task-utilities-${Date.now()}`,
            title: taskTitle,
            createdAt: Date.now(),
            status: 'Completado',
            contentType: ContentType.Texto,
            formData: {
                objective: `Generar un informe ejecutivo que resuma los costos operativos para ${currentTabLabel}.`,
                tone: "Formal / Analítico",
            },
            result: { text: reportData.trim() },
            eventType: 'ExecutiveReport'
        };

        onSaveTask(task);
        alert(t('utilities.taskCreatedAlert', { taskTitle }));
        setView('tasks');
    };


    const tabs = [
        { id: 'fired-heat', label: t('utilities.tabs.firedHeat') },
        { id: 'steam', label: t('utilities.tabs.steam') },
        { id: 'refrigeration', label: t('utilities.tabs.refrigeration') },
        { id: 'cooling-water', label: t('utilities.tabs.coolingWater') },
        { id: 'compressed-air', label: t('utilities.tabs.compressedAir') },
        { id: 'process-power', label: t('utilities.tabs.processPower') },
        { id: 'fleet-fuel', label: t('utilities.tabs.fleetFuel') },
    ];

    if (isWidgetMode) {
        let title = '', costLabel = '', costValue = '...', costUnit = '';
        switch (initialDutyType) {
            case 'cooling-water':
                title = t('utilities.widget.titleCooling');
                costLabel = t('utilities.widget.costPerHour');
                costValue = cwOutputs.costHour;
                costUnit = '€/h';
                break;
            case 'fired-heat':
                title = t('utilities.widget.titleFiredHeat');
                const hourlyCost = (parseFloat(fhOutputs.fuelReq) * 3.412 * fhInputs.fuelCost);
                costLabel = t('utilities.widget.costPerHourFuel');
                costValue = isNaN(hourlyCost) ? '...' : hourlyCost.toFixed(2);
                costUnit = '€/h';
                break;
        }

        return (
            <div className="bg-slate-900 text-white p-6 rounded-lg shadow-2xl w-96 flex flex-col font-sans border-2 border-blue-500" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4 text-cyan-400">{title}</h3>
                <div className="space-y-4">
                    <InputField label={t('utilities.widget.currentDemand')} id="widget-duty" value={initialDuty || 0} onChange={() => { }} unit={initialUnit || ''} disabled={true} />
                </div>
                <div className="mt-6 pt-4 border-t border-slate-700">
                    <OutputField label={costLabel} value={costValue} unit={costUnit} isHighlighted={true} />
                </div>
                {onCloseWidget && <button onClick={onCloseWidget} className="mt-6 w-full bg-slate-700 text-white font-bold py-2 rounded-lg hover:bg-slate-600">{t('utilities.widget.close')}</button>}
            </div>
        )
    }

    return (
        <div className="bg-slate-900 text-white p-4 rounded-lg shadow-2xl h-full flex flex-col font-sans">
            <header className="text-center mb-4">
                <h2 className="text-2xl font-bold">{t('utilities.title')}</h2>
                <p className="mt-1 text-sm text-slate-400">{t('utilities.subtitle')}</p>
            </header>

            <div className="border-b border-slate-700 mb-4">
                <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`whitespace-nowrap py-2 px-2 border-b-2 font-medium text-xs ${activeTab === tab.id ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'}`}>
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="flex-grow mt-3 overflow-y-auto">
                <div style={{ display: activeTab === 'fired-heat' ? 'block' : 'none' }} className="animate-fade-in">
                    <div className="grid md:grid-cols-2 gap-4">
                        <Panel title={t('utilities.inputsTitle')}>
                            <InputField label={t('utilities.firedHeat.duty')} id="fh-duty" value={fhInputs.duty} onChange={handleInputChange(setFhInputs, 'duty')} unit="MW" />
                            <InputField label={t('utilities.firedHeat.efficiency')} id="fh-eff" value={fhInputs.efficiency} onChange={handleInputChange(setFhInputs, 'efficiency')} unit="%" />
                            <InputField label={t('utilities.firedHeat.fuelCost')} id="fh-cost" value={fhInputs.fuelCost} onChange={handleInputChange(setFhInputs, 'fuelCost')} unit="€/MMBtu" />
                            <InputField label={t('utilities.firedHeat.hours')} id="fh-hours" value={fhInputs.hours} onChange={handleInputChange(setFhInputs, 'hours')} unit="h/año" />
                        </Panel>
                        <Panel title={t('utilities.resultsTitle')}>
                            <OutputField label={t('utilities.firedHeat.fuelReq')} value={fhOutputs.fuelReq} unit="MW" />
                            <OutputField label={t('utilities.firedHeat.annualCost')} value={fhOutputs.annualCost} unit="" isHighlighted />
                        </Panel>
                    </div>
                </div>
                <div style={{ display: activeTab === 'steam' ? 'block' : 'none' }} className="animate-fade-in">
                    <div className="grid md:grid-cols-2 gap-4">
                        <Panel title={t('utilities.inputsTitle')}>
                            <InputField label={t('utilities.steam.fuelCost')} id="s-fuel-cost" value={sInputs.fuelCost} onChange={handleInputChange(setSInputs, 'fuelCost')} unit="€/MMBtu" />
                            <InputField label={t('utilities.steam.elecCost')} id="s-elec-cost" value={sInputs.elecCost} onChange={handleInputChange(setSInputs, 'elecCost')} unit="€/kWh" disabled />
                            <InputField label={t('utilities.steam.boilerEff')} id="s-boiler-eff" value={sInputs.boilerEff} onChange={handleInputChange(setSInputs, 'boilerEff')} unit="%" />
                            <InputField label={t('utilities.steam.turbineEff')} id="s-turbine-eff" value={sInputs.turbineEff} onChange={handleInputChange(setSInputs, 'turbineEff')} unit="%" />
                        </Panel>
                        <Panel title={t('utilities.resultsTitle')}>
                            <OutputField label={t('utilities.steam.hpPrice')} value={sOutputs.hpPrice} unit="€/ton" isHighlighted />
                            <OutputField label={t('utilities.steam.mpPrice')} value={sOutputs.mpPrice} unit="€/ton" isHighlighted />
                            <OutputField label={t('utilities.steam.lpPrice')} value={sOutputs.lpPrice} unit="€/ton" isHighlighted />
                        </Panel>
                    </div>
                </div>
                <div style={{ display: activeTab === 'refrigeration' ? 'block' : 'none' }} className="animate-fade-in">
                    <div className="grid md:grid-cols-2 gap-4">
                        <Panel title={t('utilities.inputsTitle')}>
                            <InputField label={t('utilities.refrigeration.duty')} id="r-duty" value={rInputs.duty} onChange={handleInputChange(setRInputs, 'duty')} unit="MW" />
                            <InputField label={t('utilities.refrigeration.tempEvap')} id="r-temp-evap" value={rInputs.tempEvap} onChange={handleInputChange(setRInputs, 'tempEvap')} unit="°C" />
                            <InputField label={t('utilities.refrigeration.tempCond')} id="r-temp-cond" value={rInputs.tempCond} onChange={handleInputChange(setRInputs, 'tempCond')} unit="°C" />
                            <InputField label={t('utilities.refrigeration.cycleEff')} id="r-cycle-eff" value={rInputs.cycleEff} onChange={handleInputChange(setRInputs, 'cycleEff')} unit="%" />
                            <InputField label={t('utilities.refrigeration.elecCost')} id="r-elec-cost" value={rInputs.elecCost} onChange={handleInputChange(setRInputs, 'elecCost')} unit="€/kWh" disabled />
                            <InputField label={t('utilities.refrigeration.hours')} id="r-hours" value={rInputs.hours} onChange={handleInputChange(setRInputs, 'hours')} unit="h/año" />
                        </Panel>
                        <Panel title={t('utilities.resultsTitle')}>
                            <OutputField label={t('utilities.refrigeration.copCarnot')} value={rOutputs.copCarnot} unit="" />
                            <OutputField label={t('utilities.refrigeration.copActual')} value={rOutputs.copActual} unit="" />
                            <OutputField label={t('utilities.refrigeration.workReq')} value={rOutputs.workReq} unit="MW" />
                            <OutputField label={t('utilities.refrigeration.annualCost')} value={rOutputs.annualCost} unit="" isHighlighted />
                        </Panel>
                    </div>
                </div>
                <div style={{ display: activeTab === 'cooling-water' ? 'block' : 'none' }} className="animate-fade-in">
                    <div className="grid md:grid-cols-2 gap-4">
                        <Panel title={t('utilities.inputsTitle')}>
                            <InputField label={t('utilities.coolingWater.duty')} id="cw-duty" value={cwInputs.duty} onChange={handleInputChange(setCwInputs, 'duty')} unit="kW" />
                            <InputField label={t('utilities.coolingWater.range')} id="cw-range" value={cwInputs.range} onChange={handleInputChange(setCwInputs, 'range')} unit="°C" />
                            <InputField label={t('utilities.coolingWater.spec')} id="cw-spec" value={cwInputs.spec} onChange={handleInputChange(setCwInputs, 'spec')} unit="kWh/m³" />
                            <InputField label={t('utilities.coolingWater.elecCost')} id="cw-elec-cost" value={cwInputs.elecCost} onChange={handleInputChange(setCwInputs, 'elecCost')} unit="€/kWh" disabled />
                        </Panel>
                        <Panel title={t('utilities.resultsTitle')}>
                            <OutputField label={t('utilities.coolingWater.flow')} value={cwOutputs.flow} unit="m³/h" />
                            <OutputField label={t('utilities.coolingWater.power')} value={cwOutputs.power} unit="kW" />
                            <OutputField label={t('utilities.coolingWater.costHour')} value={cwOutputs.costHour} unit="€/h" isHighlighted />
                        </Panel>
                    </div>
                </div>
                <div style={{ display: activeTab === 'compressed-air' ? 'block' : 'none' }} className="animate-fade-in">
                    <div className="grid md:grid-cols-2 gap-4">
                        <Panel title={t('utilities.inputsTitle')}>
                            <InputField label={t('utilities.compressedAir.flow')} id="ca-flow" value={caInputs.flow} onChange={handleInputChange(setCaInputs, 'flow')} unit="m³/h" />
                            <InputField label={t('utilities.compressedAir.pressure')} id="ca-pressure" value={caInputs.pressure} onChange={handleInputChange(setCaInputs, 'pressure')} unit="bar" />
                            <InputField label={t('utilities.compressedAir.efficiency')} id="ca-eff" value={caInputs.eff} onChange={handleInputChange(setCaInputs, 'eff')} unit="%" />
                            <InputField label={t('utilities.compressedAir.elecCost')} id="ca-elec-cost" value={caInputs.elecCost} onChange={handleInputChange(setCaInputs, 'elecCost')} unit="€/kWh" disabled />
                        </Panel>
                        <Panel title={t('utilities.resultsTitle')}>
                            <OutputField label={t('utilities.compressedAir.power')} value={caOutputs.power} unit="kW" />
                            <OutputField label={t('utilities.compressedAir.costHour')} value={caOutputs.costHour} unit="€/h" isHighlighted />
                        </Panel>
                    </div>
                </div>
                <div style={{ display: activeTab === 'process-power' ? 'block' : 'none' }} className="animate-fade-in">
                    <div className="grid md:grid-cols-2 gap-4">
                        <Panel title={t('utilities.inputsTitle')}>
                            <InputField label={t('utilities.processPower.demand')} id="pp-demand" value={ppInputs.demand} onChange={handleInputChange(setPpInputs, 'demand')} unit="kW" />
                            <InputField label={t('utilities.processPower.elecCost')} id="pp-elec-cost" value={ppInputs.elecCost} onChange={handleInputChange(setPpInputs, 'elecCost')} unit="€/kWh" />
                            <InputField label={t('utilities.processPower.hours')} id="pp-hours" value={ppInputs.hours} onChange={handleInputChange(setPpInputs, 'hours')} unit="h/año" />
                        </Panel>
                        <Panel title={t('utilities.resultsTitle')}>
                            <OutputField label={t('utilities.processPower.costHour')} value={ppOutputs.costHour} unit="€/h" />
                            <OutputField label={t('utilities.processPower.annualCost')} value={ppOutputs.annualCost} unit="" isHighlighted />
                        </Panel>
                    </div>
                </div>
                <div style={{ display: activeTab === 'fleet-fuel' ? 'block' : 'none' }} className="animate-fade-in">
                    <div className="grid md:grid-cols-2 gap-4">
                        <Panel title={t('utilities.inputsTitle')}>
                            <InputField label={t('utilities.fleetFuel.demand')} id="ff-demand" value={ffInputs.demand} onChange={handleInputChange(setFfInputs, 'demand')} unit="m³/h" />
                            <InputField label={t('utilities.fleetFuel.price')} id="ff-price" value={ffInputs.price} onChange={handleInputChange(setFfInputs, 'price')} unit="€/m³" />
                            <InputField label={t('utilities.fleetFuel.hours')} id="ff-hours" value={ffInputs.hours} onChange={handleInputChange(setFfInputs, 'hours')} unit="h/año" />
                        </Panel>
                        <Panel title={t('utilities.resultsTitle')}>
                            <OutputField label={t('utilities.fleetFuel.costHour')} value={ffOutputs.costHour} unit="€/h" />
                            <OutputField label={t('utilities.fleetFuel.annualCost')} value={ffOutputs.annualCost} unit="" isHighlighted />
                        </Panel>
                    </div>
                </div>
            </div>

            <footer className="mt-4 pt-4 border-t border-slate-700 flex flex-col sm:flex-row gap-3 justify-end relative">
                {showSaveConfirmation && <div className="absolute bottom-full right-0 mb-2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-md animate-fade-in">{t('utilities.saveConfirm')}</div>}
                <button onClick={handleGenerateReport} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-2 px-6 rounded-lg text-sm">{t('utilities.createReport')}</button>
                <button onClick={handleSaveCosts} className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-2 px-6 rounded-lg text-sm">{t('utilities.saveAndApply')}</button>
            </footer>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};
import React from 'react';
import { FormInput } from '../form/FormControls';

// Re-using the internal components for layout
const Panel: React.FC<React.PropsWithChildren<{ title: string; }>> = ({ title, children }) => (
    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 h-full overflow-y-auto">
        <h3 className="text-lg font-bold text-cyan-400 mb-4 border-b border-slate-700 pb-2">{title}</h3>
        <div className="space-y-4">{children}</div>
    </div>
);

const Indicator: React.FC<{ label: string; value: string | number; unit?: string; valueClassName?: string; isLoading?: boolean }> = ({ label, value, unit, valueClassName, isLoading }) => (
    <div className="flex justify-between items-baseline py-2 border-b border-slate-700/50">
        <span className="text-slate-400">{label}</span>
        {isLoading ? (
            <div className="h-6 bg-slate-700 rounded w-24 animate-pulse"></div>
        ) : (
            <span className={`font-mono font-semibold text-white text-xl ${valueClassName}`}>
                {value}
                {unit && <span className="text-slate-400 text-sm ml-1.5">{unit}</span>}
            </span>
        )}
    </div>
);

const InputWithUncertaintySlider: React.FC<{
    label: string;
    id: string;
    value: number;
    onValueChange: (value: number) => void;
    uncertainty: number;
    onUncertaintyChange: (value: number) => void;
}> = ({ label, id, value, onValueChange, uncertainty, onUncertaintyChange }) => (
    <div>
        <label htmlFor={id} className="text-sm font-medium text-slate-300 mb-1 block">{label}</label>
        <input id={id} type="number" value={value} onChange={e => onValueChange(Number(e.target.value))} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white" />
        <div className="mt-2">
            <label htmlFor={`${id}-uncertainty`} className="text-xs text-slate-400 flex justify-between">
                <span>Incertidumbre</span>
                <span>± {uncertainty}%</span>
            </label>
            <input id={`${id}-uncertainty`} type="range" min="0" max="50" step="1" value={uncertainty} onChange={e => onUncertaintyChange(Number(e.target.value))} className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
        </div>
    </div>
);

export interface FinancialParams {
    projectName: string;
    projectYears: number;
    assetValue: number;
    assetValueUncertainty: number;
    capitalToRaise: number;
    productionCosts: number;
    productionCostsUncertainty: number;
}

export interface FinancialResults {
    avgVpn: number;
    avgTir: number;
    avgPayback: number;
    profitability: number;
}

interface FinancialSimulatorProps {
    params: FinancialParams;
    onParamChange: (key: keyof FinancialParams, value: any) => void;
    onRunSimulation: () => void;
    result: FinancialResults | null;
    isSimulating: boolean;
}

export const FinancialSimulator: React.FC<FinancialSimulatorProps> = ({
    params,
    onParamChange,
    onRunSimulation,
    result,
    isSimulating
}) => {
    return (
        <div className="flex flex-col h-full gap-4">
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex justify-between items-center flex-shrink-0">
                <div>
                    <h2 className="text-xl font-bold text-white">Simulador Financiero (Monte Carlo)</h2>
                    <p className="text-sm text-slate-400">Módulo 5: Auditoría de Riesgos</p>
                </div>
                <button
                    onClick={onRunSimulation}
                    disabled={isSimulating}
                    className={`px-6 py-2 rounded font-bold transition-colors ${isSimulating ? 'bg-slate-600 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-500 text-white'}`}
                >
                    {isSimulating ? 'Simulando...' : 'Ejecutar Auditoría'}
                </button>
            </div>

            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0 overflow-hidden">
                {/* Inputs Panel */}
                <Panel title="Variables del Proyecto">
                    <FormInput
                        id="project-name"
                        label="Nombre del Proyecto"
                        type="text"
                        value={params.projectName}
                        onChange={(e) => onParamChange('projectName', e.target.value)}
                    />
                    <FormInput
                        id="project-years"
                        label="Duración (años)"
                        type="number"
                        value={params.projectYears}
                        onChange={(e) => onParamChange('projectYears', Number(e.target.value))}
                    />
                    
                    <div className="border-t border-slate-700 pt-4 mt-4">
                        <h4 className="text-cyan-300 font-semibold mb-3">Estructura de Capital</h4>
                        <FormInput
                            id="capital-raise"
                            label="Capital a Recaudar (€)"
                            type="number"
                            value={params.capitalToRaise}
                            onChange={(e) => onParamChange('capitalToRaise', Number(e.target.value))}
                        />
                    </div>

                    <div className="border-t border-slate-700 pt-4 mt-4">
                        <h4 className="text-cyan-300 font-semibold mb-3">Proyecciones con Incertidumbre</h4>
                        <InputWithUncertaintySlider
                            id="asset-value"
                            label="Valor del Activo (Base Anual €)"
                            value={params.assetValue}
                            onValueChange={(v) => onParamChange('assetValue', v)}
                            uncertainty={params.assetValueUncertainty}
                            onUncertaintyChange={(v) => onParamChange('assetValueUncertainty', v)}
                        />
                        <div className="mt-4">
                            <InputWithUncertaintySlider
                                id="prod-costs"
                                label="Costes de Producción (Base Anual €)"
                                value={params.productionCosts}
                                onValueChange={(v) => onParamChange('productionCosts', v)}
                                uncertainty={params.productionCostsUncertainty}
                                onUncertaintyChange={(v) => onParamChange('productionCostsUncertainty', v)}
                            />
                        </div>
                    </div>
                </Panel>

                {/* Results Panel */}
                <Panel title="Resultados de Auditoría">
                    {!result ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500">
                            <p>Ejecuta la simulación para ver los resultados.</p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-6">
                                <h4 className="text-sm font-bold text-slate-300 mb-2">Métricas Clave (Promedios)</h4>
                                <Indicator 
                                    label="TIR (Tasa Interna de Retorno)" 
                                    value={(result.avgTir * 100).toFixed(2)} 
                                    unit="%" 
                                    valueClassName={(result.avgTir * 100) > 12 ? "text-green-400" : "text-red-400"}
                                />
                                <Indicator 
                                    label="VPN (Valor Presente Neto)" 
                                    value={result.avgVpn.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })} 
                                    valueClassName={result.avgVpn > 0 ? "text-green-400" : "text-red-400"}
                                />
                                <Indicator 
                                    label="Payback Period" 
                                    value={result.avgPayback === Infinity ? "∞" : result.avgPayback.toFixed(1)} 
                                    unit="años" 
                                />
                            </div>

                            <div>
                                <h4 className="text-sm font-bold text-slate-300 mb-2">Análisis de Riesgo</h4>
                                <div className="bg-slate-900 p-4 rounded border border-slate-700 text-center">
                                    <span className="block text-slate-400 text-sm mb-1">Probabilidad de Rentabilidad</span>
                                    <span className={`text-3xl font-bold ${result.profitability > 80 ? 'text-green-500' : result.profitability > 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                                        {result.profitability.toFixed(1)}%
                                    </span>
                                    <p className="text-xs text-slate-500 mt-2">
                                        % de escenarios donde TIR {'>'} 12%
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </Panel>
            </div>
        </div>
    );
};

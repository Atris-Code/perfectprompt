
import React from 'react';
import type { SimpleSimulationResult } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Accordion } from '../form/Accordion';

interface M3SimulatorProps {
    params: {
        temperature: number;
        residenceTime: number;
        uncertainty: number;
    };
    onParamChange: (param: keyof M3SimulatorProps['params'], value: number) => void;
    onRunSimulation: () => void;
    result: SimpleSimulationResult | null;
    isSimulating: boolean;
}

const Slider: React.FC<{ label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, value, min, max, step, unit, onChange }) => (
    <div>
        <label className="text-sm font-medium text-gray-300 flex justify-between">
            <span>{label}</span>
            <span className="font-mono">{value.toFixed(1)} {unit}</span>
        </label>
        <input type="range" min={min} max={max} step={step} value={value} onChange={onChange} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
    </div>
);

const KpiCard: React.FC<{ label: string; value: number | undefined; color: string }> = ({ label, value, color }) => (
    <div className="bg-gray-700 p-4 rounded-lg text-center">
        <p className="text-sm text-gray-400">{label}</p>
        <p className={`text-3xl font-bold font-mono ${color}`}>{value !== undefined ? value.toFixed(1) : '0.0'}%</p>
    </div>
);

export const M3Simulator: React.FC<M3SimulatorProps> = ({ params, onParamChange, onRunSimulation, result, isSimulating }) => {

    const histogramData = React.useMemo(() => {
        if (!result?.distribution) return [];
        const data = result.distribution;
        if (data.length === 0) return [];
        
        const min = Math.floor(Math.min(...data));
        const max = Math.ceil(Math.max(...data));
        const bucketCount = 20;
        const bucketSize = (max - min) / bucketCount || 1;
        const buckets = Array(bucketCount).fill(0);

        for (const val of data) {
            const index = Math.floor((val - min) / bucketSize);
            if (index >= 0 && index < bucketCount) {
                buckets[index]++;
            }
        }

        return buckets.map((count, i) => ({
            name: `${(min + i * bucketSize).toFixed(1)}`,
            Frecuencia: count
        }));
    }, [result]);

    return (
        <div className="bg-gray-800 text-white rounded-lg shadow-lg flex flex-col h-full border border-gray-700 p-4 space-y-4 overflow-y-auto">
            <h3 className="text-lg font-bold text-cyan-400 text-center">Panel A: Sandbox de Simulación (Módulo 3)</h3>
            
            <Accordion title="Controles de Simulación" defaultOpen>
                <div className="space-y-4">
                    <Slider
                        label="Temperatura (T)"
                        value={params.temperature}
                        onChange={(e) => onParamChange('temperature', Number(e.target.value))}
                        min={300} max={900} step={5} unit="°C"
                    />
                    <Slider
                        label="Tiempo de Residencia (t)"
                        value={params.residenceTime}
                        onChange={(e) => onParamChange('residenceTime', Number(e.target.value))}
                        min={0.5} max={10} step={0.1} unit="s"
                    />
                    <Slider
                        label="Incertidumbre de Temperatura (T)"
                        value={params.uncertainty}
                        onChange={(e) => onParamChange('uncertainty', Number(e.target.value))}
                        min={0} max={30} step={0.5} unit="± %"
                    />
                    <button onClick={onRunSimulation} disabled={isSimulating} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500">
                        {isSimulating ? 'Simulando...' : 'Ejecutar Simulación Monte-Carlo'}
                    </button>
                </div>
            </Accordion>

            <Accordion title="Resultados" defaultOpen>
                {!result && !isSimulating && <p className="text-sm text-gray-500 text-center p-8">Los resultados de la simulación aparecerán aquí.</p>}
                {isSimulating && <p className="text-sm text-gray-400 text-center p-8 animate-pulse">Calculando resultados...</p>}
                {result && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <KpiCard label="Bio-aceite" value={result.yields?.['Bio-aceite']} color="text-cyan-400" />
                            <KpiCard label="Biochar" value={result.yields?.['Biochar']} color="text-orange-400" />
                            <KpiCard label="Gas" value={result.yields?.['Gas']} color="text-purple-400" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-center mb-2 text-sm">Distribución de Rendimiento de Bio-aceite</h4>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={histogramData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                                        <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
                                        <Tooltip contentStyle={{ backgroundColor: '#1f293b', border: '1px solid #374151' }} />
                                        <Legend wrapperStyle={{fontSize: "12px"}}/>
                                        <Bar dataKey="Frecuencia" fill="#22d3ee" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}
            </Accordion>
        </div>
    );
};

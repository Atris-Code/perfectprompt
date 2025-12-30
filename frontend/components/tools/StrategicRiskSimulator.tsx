import React, { useState, useMemo, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { SimulationFormData, Task, View, DecisionPackage, TechnicalRiskPackage } from '../../types';
import { ContentType, EventType } from '../../types';
import { Accordion } from '../form/Accordion';

// --- Reusable UI Components ---
const KpiCard: React.FC<{ title: string; value: string; unit?: string; colorClass?: string; description: string; }> = ({ title, value, unit, colorClass = 'text-blue-600', description }) => (
    <div className="bg-gray-100 p-4 rounded-lg border border-gray-200" title={description}>
        <h5 className="text-sm font-semibold text-gray-500">{title}</h5>
        <p className={`text-3xl font-bold font-mono mt-1 ${colorClass}`}>
            {value}
            {unit && <span className="text-lg text-gray-600 ml-1.5">{unit}</span>}
        </p>
    </div>
);

const ParameterSlider: React.FC<{ label: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; min: number; max: number; step: number; unit: string; name: string; disabled?: boolean }> = ({ label, value, onChange, min, max, step, unit, name, disabled }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 flex justify-between">
            <span>{label}</span>
            <span className="font-mono">{value.toLocaleString('de-DE')} {unit}</span>
        </label>
        <input type="range" id={name} name={name} min={min} max={max} step={step} value={value} onChange={onChange} disabled={disabled} className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:accent-gray-400 disabled:cursor-not-allowed" />
    </div>
);


// --- Simulation Logic ---
const randomNormal = (mean: number, stdDev: number): number => {
    let u = 0, v = 0;
    while(u === 0) u = Math.random();
    while(v === 0) v = Math.random();
    let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    return num * stdDev + mean;
};

const calculateIRR = (cashFlows: number[]): number => {
    let irr = 0.1; // Initial guess
    const maxIterations = 100;
    const tolerance = 1e-7;

    for (let i = 0; i < maxIterations; i++) {
        let npv = 0;
        let derivative = 0;
        for (let t = 0; t < cashFlows.length; t++) {
            const denominator = Math.pow(1 + irr, t);
            if (denominator === 0) return NaN;
            npv += cashFlows[t] / denominator;
            if (t > 0) {
                const derivativeDenominator = Math.pow(1 + irr, t + 1);
                if (derivativeDenominator === 0) return NaN;
                derivative -= t * cashFlows[t] / derivativeDenominator;
            }
        }
        
        if (Math.abs(npv) < tolerance) {
            return irr; // Converged
        }
        
        if (derivative === 0) {
            return NaN; // Cannot continue
        }
        
        irr -= npv / derivative;
    }
    
    return NaN; // Failed to converge
};


// Component
interface StrategicRiskSimulatorProps {
  initialData: Partial<SimulationFormData> | null;
  onDataConsumed: () => void;
  onSaveTask: (task: Task) => void;
  setView: (view: View) => void;
  technicalRiskPackage: TechnicalRiskPackage | null;
}

export const StrategicRiskSimulator: React.FC<StrategicRiskSimulatorProps> = ({ initialData, onDataConsumed, onSaveTask, setView, technicalRiskPackage }) => {
    const [params, setParams] = useState({
        investment: 20000000,
        years: 15,
        costOfCapital: 12,
        simulations: 5000,
        opex: 1500000,
        opexUncertainty: 15,
        bioOilPrice: 450, // €/ton
        bioOilPriceUncertainty: 25, // %
        biocharPrice: 300, // €/ton
        biocharPriceUncertainty: 30, // %
    });
    
    const [results, setResults] = useState<{
        avgIRR: number;
        stdDevIRR: number;
        profitability: number;
        irrDistribution: number[];
    } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    const isTechnicalRiskActive = technicalRiskPackage !== null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setParams(prev => ({ ...prev, [name]: parseFloat(value) }));
    };

    const runSimulation = useCallback(async () => {
        setIsLoading(true);
        setProgress(0);
        setResults(null);
        await new Promise(res => setTimeout(res, 100));

        const irrResults: number[] = [];
        const { simulations, investment, years, ...restParams } = params;

        const bioOilProfile = isTechnicalRiskActive ? technicalRiskPackage.outputDistributions.find(d => d.product === 'Bio-aceite') : null;
        const biocharProfile = isTechnicalRiskActive ? technicalRiskPackage.outputDistributions.find(d => d.product === 'Coque (Biochar)') : null;
        
        const PLANT_CAPACITY_TONS_PER_YEAR = 25000;

        for (let i = 0; i < simulations; i++) {
            let annualRevenue: number;

            if (isTechnicalRiskActive && bioOilProfile && biocharProfile) {
                const bioOilYield = randomNormal(bioOilProfile.mean, bioOilProfile.stdDev) / 100;
                const biocharYield = randomNormal(biocharProfile.mean, biocharProfile.stdDev) / 100;
                
                const bioOilProduction = PLANT_CAPACITY_TONS_PER_YEAR * Math.max(0, bioOilYield);
                const biocharProduction = PLANT_CAPACITY_TONS_PER_YEAR * Math.max(0, biocharYield);
                
                const currentBioOilPrice = randomNormal(restParams.bioOilPrice, restParams.bioOilPrice * (restParams.bioOilPriceUncertainty / 100));
                const currentBiocharPrice = randomNormal(restParams.biocharPrice, restParams.biocharPrice * (restParams.biocharPriceUncertainty / 100));
                
                annualRevenue = (bioOilProduction * currentBioOilPrice) + (biocharProduction * currentBiocharPrice);
            } else {
                // This path should not be taken in the synergy flow, but is kept for standalone use.
                annualRevenue = randomNormal(5000000, 5000000 * 0.2); 
            }
            
            const currentOpex = randomNormal(restParams.opex, restParams.opex * (restParams.opexUncertainty / 100));
            const annualCashFlow = annualRevenue - currentOpex;
            const cashFlows = [-investment, ...Array(years).fill(annualCashFlow)];
            const irr = calculateIRR(cashFlows);

            if (isFinite(irr)) irrResults.push(irr * 100);
            
            if (i % (simulations/100) === 0) {
                await new Promise(res => setTimeout(res, 0));
                setProgress((i / simulations) * 100);
            }
        }
        
        const sum = irrResults.reduce((a, b) => a + b, 0);
        const avg = irrResults.length > 0 ? sum / irrResults.length : 0;
        const stdDev = irrResults.length > 0 ? Math.sqrt(irrResults.map(x => Math.pow(x - avg, 2)).reduce((a, b) => a + b, 0) / irrResults.length) : 0;
        const profitableRuns = irrResults.filter(irr => irr > params.costOfCapital).length;
        const profitability = irrResults.length > 0 ? (profitableRuns / irrResults.length) * 100 : 0;

        setResults({ avgIRR: avg, stdDevIRR: stdDev, profitability, irrDistribution: irrResults });
        setIsLoading(false);
    }, [params, technicalRiskPackage, isTechnicalRiskActive]);

    const histogramData = useMemo(() => {
        if (!results) return [];
        const { irrDistribution } = results;
        const filteredIRR = irrDistribution.filter((irr:number) => irr > -50 && irr < 150);
        if (filteredIRR.length === 0) return [];

        const min = Math.floor(Math.min(...filteredIRR));
        const max = Math.ceil(Math.max(...filteredIRR));
        const bucketCount = 30;
        const bucketSize = (max - min) / bucketCount || 1;
        const buckets = Array(bucketCount).fill(0);

        for (const irr of filteredIRR) {
            const index = Math.floor((irr - min) / bucketSize);
            if (index >= 0 && index < bucketCount) buckets[index]++;
        }

        return buckets.map((count, i) => ({ name: `${(min + i * bucketSize).toFixed(1)}%`, Frecuencia: count }));
    }, [results]);

    return (
        <div className="bg-white p-8 rounded-lg">
            <header className="text-center mb-8">
                <h1 className="text-3xl font-bold">Módulo 5: Simulador de Riesgos Estratégicos</h1>
                <p className="text-gray-600 mt-2">Análisis de Viabilidad Financiera mediante Simulación de Monte Carlo.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-4">
                    <Accordion title="1. Parámetros del Proyecto" defaultOpen>
                        <ParameterSlider label="Inversión Inicial (CAPEX)" name="investment" unit="€" value={params.investment} onChange={handleChange} min={1000000} max={50000000} step={100000} />
                        <ParameterSlider label="Duración del Proyecto" name="years" unit="Años" value={params.years} onChange={handleChange} min={5} max={30} step={1} />
                        <ParameterSlider label="Coste de Capital" name="costOfCapital" unit="%" value={params.costOfCapital} onChange={handleChange} min={5} max={25} step={0.5} />
                    </Accordion>
                    <Accordion title="2. Variables con Incertidumbre" defaultOpen>
                        {isTechnicalRiskActive && (
                            <div className="p-4 bg-blue-100 border-l-4 border-blue-500 text-blue-800">
                                <p className="font-bold">Modo de Riesgo Compuesto Activo</p>
                                <p className="text-sm">Se están utilizando las distribuciones de rendimiento del Módulo 3. El valor de activos se calculará a partir de los precios de mercado del bio-aceite y biochar.</p>
                            </div>
                        )}
                        
                        <ParameterSlider label="Precio Bio-aceite (Mercado)" name="bioOilPrice" unit="€/ton" value={params.bioOilPrice} onChange={handleChange} min={200} max={800} step={10} />
                        <ParameterSlider label="Incertidumbre Precio Bio-aceite" name="bioOilPriceUncertainty" unit="%" value={params.bioOilPriceUncertainty} onChange={handleChange} min={0} max={50} step={1} />
                        <hr/>
                        <ParameterSlider label="Precio Biochar (Mercado)" name="biocharPrice" unit="€/ton" value={params.biocharPrice} onChange={handleChange} min={100} max={600} step={10} />
                        <ParameterSlider label="Incertidumbre Precio Biochar" name="biocharPriceUncertainty" unit="%" value={params.biocharPriceUncertainty} onChange={handleChange} min={0} max={50} step={1} />
                        
                        <hr className="border-gray-200" />
                        <ParameterSlider label="Coste Operacional Anual (OPEX)" name="opex" unit="€" value={params.opex} onChange={handleChange} min={50000} max={3000000} step={10000} />
                        <ParameterSlider label="Incertidumbre del OPEX (+/-)" name="opexUncertainty" unit="%" value={params.opexUncertainty} onChange={handleChange} min={0} max={50} step={1} />
                    </Accordion>
                    <div className="space-y-2">
                        <ParameterSlider label="Número de Simulaciones" name="simulations" unit="" value={params.simulations} onChange={handleChange} min={1000} max={10000} step={1000} />
                        <button onClick={runSimulation} disabled={isLoading} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                            {isLoading ? `Simulando... ${progress.toFixed(0)}%` : 'Ejecutar Simulación'}
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <h3 className="text-xl font-bold text-center text-gray-800 mb-4">Distribución de Resultados (TIR)</h3>
                        <div className="h-80">
                             {results ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={histogramData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                        <YAxis />
                                        <Tooltip cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }}/>
                                        <Bar dataKey="Frecuencia" fill="#2563eb" />
                                        <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="3 3" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-500">El histograma de la TIR aparecerá aquí.</div>
                            )}
                        </div>
                    </div>
                     {results && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <KpiCard title="Prob. de Rentabilidad" value={results.profitability.toFixed(1)} unit="%" colorClass={results.profitability > 70 ? 'text-green-600' : results.profitability > 50 ? 'text-yellow-600' : 'text-red-600'} description={`Porcentaje de simulaciones donde la TIR > ${params.costOfCapital}%`} />
                                <KpiCard title="TIR Promedio" value={results.avgIRR.toFixed(2)} unit="%" colorClass="text-blue-600" description="La Tasa Interna de Retorno media de todas las simulaciones." />
                                <KpiCard title="Desv. Estándar (Riesgo)" value={results.stdDevIRR.toFixed(2)} unit="%" colorClass="text-orange-500" description="Mide la volatilidad o riesgo. Un valor más alto implica mayor incertidumbre." />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
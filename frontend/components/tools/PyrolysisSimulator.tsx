
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { PYROLYSIS_MATERIALS, SIMULATION_ENGINE } from '../../data/pyrolysisMaterials';
// FIX: To ensure consistent module resolution, removed the .ts extension from the import path.
import type { PyrolysisMaterial, BiomassPyrolysisMode, Catalyst, HeatSource, SimulationKPIs, HeatSourceEffect, GasPhaseComposition, PlasticPyrolysisMode, SimulationInsights, SolidMaterial, PlantModel, SimulationResult, SimulationFormData } from '../../types';
import ModeYieldChart from './ModeYieldChart';
import { CatalyticOracle } from './CatalyticOracle';
import { SimulationForm } from './SimulationForm';
import { runSimulation } from '../../services/simulationService';

declare const html2canvas: any;

const DonutChart: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
    const size = 180;
    const strokeWidth = 25;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    let accumulated = 0;
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);

    if (totalValue === 0) {
        return (
             <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke="#4b5563"
                    strokeWidth={strokeWidth}
                />
            </svg>
        );
    }


    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
            {data.map((item, index) => {
                 if (item.value === 0) return null;
                const dashoffset = circumference * (1 - (accumulated / totalValue));
                const dasharray = (circumference * item.value) / totalValue;
                accumulated += item.value;
                return (
                    <circle
                        key={index}
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="transparent"
                        stroke={item.color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${dasharray} ${circumference}`}
                        strokeDashoffset={dashoffset}
                        className="transition-all duration-500 ease-in-out"
                    />
                );
            })}
        </svg>
    );
};

interface PyrolysisSimulatorProps {
  initialMaterialIds?: number[] | null;
  onCreateContent: (data: {
    material: string;
    process: string;
    catalyst: string;
    yield: { liquido: number; solido: number; gas: number };
    notes: string[];
  }) => void;
}

export const PyrolysisSimulator: React.FC<PyrolysisSimulatorProps> = ({ initialMaterialIds, onCreateContent }) => {
    const [formData, setFormData] = useState<SimulationFormData>({
        simulationMode: 'simple',
        composition: { celulosa: 42.5, hemicellulosa: 26.0, lignina: 31.5 },
        simpleCatalystId: null,
        mixture: [{ materialId: 1, percentage: 100 }],
        advancedCatalystId: null,
        selectedBiomassModeId: 'mode_bio_oil',
        selectedHeatSourceId: 'hibrido',
        sensitivityChange: 0,
        temperatura: 425,
        tiempoResidencia: 1.5,
        oxigeno: 0,
    });
    
    const [result, setResult] = useState<SimulationResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (initialMaterialIds && initialMaterialIds.length > 0) {
            const materials = initialMaterialIds
                .map(id => PYROLYSIS_MATERIALS.find(m => m.id === id))
                .filter((m): m is PyrolysisMaterial => !!m);
    
            if (materials.length > 0) {
                const percentage = 100 / materials.length;
                const newMixture = materials.map(m => ({ 
                    materialId: m.id, 
                    percentage: parseFloat(percentage.toFixed(2)) 
                }));
                const total = newMixture.reduce((sum, item) => sum + item.percentage, 0);
                if (total !== 100 && newMixture.length > 0) {
                    newMixture[newMixture.length - 1].percentage += (100 - total);
                }
                
                setFormData(prev => ({
                    ...prev,
                    simulationMode: 'avanzado',
                    mixture: newMixture,
                    selectedBiomassModeId: materials.some(m => SIMULATION_ENGINE.plastic_materials.includes(m.id)) ? 'mode_bio_oil' : prev.selectedBiomassModeId
                }));
            }
        }
    }, [initialMaterialIds]);

    const handleFormChange = (fieldName: keyof SimulationFormData, value: any) => {
        setFormData(prev => ({ ...prev, [fieldName]: value }));
    };

    const handleRunSimulation = () => {
        setIsLoading(true);
        // Simulate async calculation
        setTimeout(() => {
            const simulationResult = runSimulation(formData);
            setResult(simulationResult);
            setIsLoading(false);
        }, 500);
    };

    return (
         <div className="bg-slate-900 text-white p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold mb-6 text-center">Simulador de Pirólisis Avanzado</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <SimulationForm 
                        formData={formData} 
                        onFormChange={handleFormChange} 
                        title="Configuración del Reactor" 
                    />
                    <button 
                        onClick={handleRunSimulation} 
                        disabled={isLoading}
                        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-slate-600 transition-colors"
                    >
                        {isLoading ? 'Simulando...' : 'Ejecutar Simulación'}
                    </button>
                </div>
                
                <div className="space-y-6">
                    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 min-h-[400px]">
                        <h3 className="text-xl font-bold mb-4 text-cyan-400">Resultados</h3>
                        
                        {result && result.simulatedYield ? (
                            <div className="space-y-6 animate-fade-in">
                                 <div className="flex flex-col items-center">
                                    <div className="relative">
                                        <DonutChart data={[
                                            { label: 'Líquido', value: result.simulatedYield.liquido, color: '#22d3ee' },
                                            { label: 'Sólido', value: result.simulatedYield.solido, color: '#f97316' },
                                            { label: 'Gas', value: result.simulatedYield.gas, color: '#a855f7' },
                                        ]} />
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4 text-sm">
                                        <div className="flex items-center"><span className="h-3 w-3 rounded-full bg-cyan-400 mr-2"></span>Líquido: {result.simulatedYield.liquido.toFixed(1)}%</div>
                                        <div className="flex items-center"><span className="h-3 w-3 rounded-full bg-orange-500 mr-2"></span>Sólido: {result.simulatedYield.solido.toFixed(1)}%</div>
                                        <div className="flex items-center"><span className="h-3 w-3 rounded-full bg-purple-500 mr-2"></span>Gas: {result.simulatedYield.gas.toFixed(1)}%</div>
                                    </div>
                                </div>
                                
                                {result.aiAnalysis && (
                                    <div className="p-4 bg-slate-700/50 rounded border border-slate-600">
                                        <h4 className="font-bold text-cyan-300 text-sm mb-1">Análisis de IA:</h4>
                                        <p className="text-sm text-slate-300 italic">{result.aiAnalysis}</p>
                                    </div>
                                )}
                                
                                {result.qualityInsights.length > 0 && (
                                     <div className="p-4 bg-slate-700/50 rounded border border-slate-600">
                                        <h4 className="font-bold text-yellow-300 text-sm mb-1">Insights de Calidad:</h4>
                                        <ul className="list-disc list-inside text-sm text-slate-300">
                                            {result.qualityInsights.map((insight, i) => <li key={i}>{insight}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-500">
                                Ejecuta la simulación para ver resultados.
                            </div>
                        )}
                    </div>
                    
                    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                         <ModeYieldChart />
                    </div>
                </div>
            </div>
             <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
};

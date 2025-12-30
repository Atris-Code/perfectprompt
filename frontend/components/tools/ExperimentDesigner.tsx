import React, { useState, useMemo, useCallback } from 'react';
import { PYROLYSIS_MATERIALS } from '../../data/pyrolysisMaterials';
import { FormSelect, FormInput, FormTextarea } from '../form/FormControls';
import { Accordion } from '../form/Accordion';
import type { ExperimentVariable, ExperimentConfig, PyrolysisMaterial, ExperimentResult, ExperimentResultPoint, SimulationFormData } from '../../types';
import { runSimulation } from '../../services/simulationService';
import { getConcilioAnalysis } from '../../services/geminiService';

const OPTIMIZATION_GOALS = [
    { id: 'liquido', label: 'Maximizar Rendimiento de Bio-aceite (%)' },
    { id: 'solido', label: 'Maximizar Formación de Biochar (%)' },
    { id: 'gas', label: 'Maximizar Producción de Gas (%)' },
    { id: 'min_solido', label: 'Minimizar Formación de Char (%)' },
    { id: 'eficiencia_energetica', label: 'Maximizar Eficiencia Energética (%)' },
    { id: 'min_coste', label: 'Minimizar Coste del Bio-aceite (€/GJ)' },
];

const VARIABLE_OPTIONS: { id: ExperimentVariable['name']; label: string, min: number, max: number, step: number, unit: string }[] = [
    { id: 'temperatura', label: 'Temperatura', min: 300, max: 900, step: 5, unit: '°C' },
    { id: 'tiempoResidencia', label: 'Tiempo de Residencia', min: 1, max: 7200, step: 1, unit: 's' },
    { id: 'oxigeno', label: 'Oxígeno', min: 0, max: 21, step: 0.5, unit: '%' },
];

interface HeatmapProps {
    data: ExperimentResultPoint[];
    xVar: ExperimentVariable;
    yVar: ExperimentVariable;
    objectiveLabel: string;
    optimalValue: number;
}

const Heatmap: React.FC<HeatmapProps> = ({ data, xVar, yVar, objectiveLabel, optimalValue }) => {
    const [tooltip, setTooltip] = useState<{ x: number; y: number; point: ExperimentResultPoint } | null>(null);

    const originalXLabels = useMemo(() => 
        (Array.from(new Set(data.map(p => p.params[xVar.name]))) as number[]).sort((a: number, b: number) => a - b)
    , [data, xVar.name]);

    const originalYLabels = useMemo(() => 
        (Array.from(new Set(data.map(p => p.params[yVar.name]))) as number[]).sort((a: number, b: number) => a - b)
    , [data, yVar.name]);
    
    const objectiveValues = data.map(d => d.objectiveValue).filter(v => !isNaN(v) && isFinite(v));
    const minValue = Math.min(...objectiveValues);
    const maxValue = Math.max(...objectiveValues);

    const getColor = (value: number) => {
        if (isNaN(value) || !isFinite(value)) return '#E5E7EB'; // gray-200
        if (minValue === maxValue) return '#6EE7B7'; // emerald-300 for a single value
        const ratio = (value - minValue) / (maxValue - minValue);
        if (isNaN(ratio)) return '#6EE7B7';
        const h = 120; // Green
        const s = 80;
        const l = 40 + ratio * 50; // Lightness from 40% to 90%
        return `hsl(${h}, ${s}%, ${l}%)`;
    };

    const handleMouseOver = (e: React.MouseEvent<SVGRectElement>, point: ExperimentResultPoint) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltip({
            x: rect.left + window.scrollX,
            y: rect.top + window.scrollY,
            point
        });
    };

    const gridWidth = 500;
    const gridHeight = 500;
    const cellWidth = gridWidth / originalXLabels.length;
    const cellHeight = gridHeight / originalYLabels.length;
    
    const xVarInfo = VARIABLE_OPTIONS.find(v => v.id === xVar.name);
    const yVarInfo = VARIABLE_OPTIONS.find(v => v.id === yVar.name);


    return (
        <div className="relative">
            <svg width="100%" viewBox={`0 0 ${gridWidth + 80} ${gridHeight + 80}`}>
                <text x={-gridHeight/2 - 40} y="20" transform="rotate(-90)" textAnchor="middle" className="text-sm font-semibold">{yVarInfo?.label} ({yVarInfo?.unit})</text>
                <text x={gridWidth/2 + 40} y={gridHeight + 70} textAnchor="middle" className="text-sm font-semibold">{xVarInfo?.label} ({xVarInfo?.unit})</text>

                {originalYLabels.map((originalValue, i) => {
                    return <text key={i} x="35" y={(originalYLabels.length - 1 - i) * cellHeight + cellHeight / 2 + 40} textAnchor="end" dy="0.3em" className="text-xs">{originalValue.toFixed(1)}</text>
                })}

                {originalXLabels.map((originalValue, i) => {
                    return <text key={i} x={i * cellWidth + cellWidth / 2 + 40} y={gridHeight + 55} textAnchor="middle" className="text-xs">{originalValue.toFixed(1)}</text>
                })}

                <g transform="translate(40, 40)">
                    {data.map((point, i) => {
                        const xIndex = originalXLabels.indexOf(point.params[xVar.name]);
                        const yIndex = originalYLabels.indexOf(point.params[yVar.name]);
                        
                        return (
                            <rect
                                key={i}
                                x={xIndex * cellWidth}
                                y={(originalYLabels.length - 1 - yIndex) * cellHeight}
                                width={cellWidth}
                                height={cellHeight}
                                fill={getColor(point.objectiveValue)}
                                stroke="#1F2937"
                                strokeWidth="1"
                                onMouseOver={(e) => handleMouseOver(e, point)}
                                onMouseOut={() => setTooltip(null)}
                            />
                        );
                    })}
                </g>
            </svg>
            
            {tooltip && (
                <div 
                    className="absolute bg-gray-800 text-white p-3 rounded-md shadow-lg text-xs pointer-events-none"
                    style={{ left: tooltip.x, top: tooltip.y, transform: 'translate(10px, -110%)' }}
                >
                    <p><strong>{xVarInfo?.label}:</strong> {tooltip.point.params[xVar.name]}</p>
                    <p><strong>{yVarInfo?.label}:</strong> {tooltip.point.params[yVar.name]}</p>
                    <p><strong>{objectiveLabel}:</strong> {tooltip.point.objectiveValue.toFixed(2)}</p>
                </div>
            )}
        </div>
    );
};

interface ExperimentDesignerProps {
    onUseAnalysisForPrompt: (objective: string, analysisText: string) => void;
}

export const ExperimentDesigner: React.FC<ExperimentDesignerProps> = ({ onUseAnalysisForPrompt }) => {
    const [variables, setVariables] = useState<ExperimentVariable[]>([]);
    const [objective, setObjective] = useState<string>(OPTIMIZATION_GOALS[0].id);
    const [materialId, setMaterialId] = useState<number | null>(PYROLYSIS_MATERIALS[0].id);

    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const [experimentResult, setExperimentResult] = useState<ExperimentResult | null>(null);

    const totalSimulations = useMemo(() => {
        if (variables.length === 0) return 0;
        return variables.reduce((acc, v) => acc * v.steps, 1);
    }, [variables]);

    const handleAddVariable = (name: ExperimentVariable['name']) => {
        if (variables.some(v => v.name === name)) return;
        const varOption = VARIABLE_OPTIONS.find(v => v.id === name);
        if (varOption) {
            setVariables([...variables, {
                id: `${name}-${Date.now()}`,
                name: name,
                min: varOption.min,
                max: varOption.max,
                steps: 3
            }]);
        }
    };

    const handleVariableChange = (id: string, field: 'min' | 'max' | 'steps', value: number) => {
        setVariables(variables.map(v => v.id === id ? { ...v, [field]: Math.max(field === 'steps' ? 2 : 0, value) } : v));
    };

    const handleRemoveVariable = (id: string) => {
        setVariables(variables.filter(v => v.id !== id));
    };

    const startExperiment = useCallback(async () => {
        if (variables.length < 1 || !materialId) {
            setError('Debe seleccionar al menos una variable y un material.');
            return;
        }

        setIsLoading(true);
        setProgress(0);
        setError('');
        setExperimentResult(null);

        const config: ExperimentConfig = { variables, objective, materialId };

        const simulationMatrix: any[] = [];
        const generateCombinations = (index: number, current: any) => {
            if (index === variables.length) {
                simulationMatrix.push({ ...current });
                return;
            }
            const variable = variables[index];
            const stepValue = (variable.max - variable.min) / (variable.steps - 1);
            for (let i = 0; i < variable.steps; i++) {
                const value = variable.min + (i * stepValue);
                generateCombinations(index + 1, { ...current, [variable.name]: value });
            }
        };

        generateCombinations(0, {
            temperatura: 500,
            tiempoResidencia: 1.5,
            oxigeno: 0,
        });

        const total = simulationMatrix.length;
        const resultsMatrix: ExperimentResultPoint[] = [];

        for (let i = 0; i < total; i++) {
            const params = simulationMatrix[i];
            const formData: SimulationFormData = {
                simulationMode: 'avanzado',
                mixture: [{ materialId, percentage: 100 }],
                composition: { celulosa: 0, hemicelulosa: 0, lignina: 0 }, // not used in advanced
                simpleCatalystId: null,
                advancedCatalystId: null,
                selectedBiomassModeId: 'mode_bio_oil', // Let conditions override
                selectedHeatSourceId: 'hibrido',
                sensitivityChange: 0,
                ...params,
            };
            
            const result = runSimulation(formData);

            let objectiveValue = 0;
            switch(objective) {
                case 'liquido': objectiveValue = result.simulatedYield?.liquido || 0; break;
                case 'solido': objectiveValue = result.simulatedYield?.solido || 0; break;
                case 'gas': objectiveValue = result.simulatedYield?.gas || 0; break;
                case 'min_solido': objectiveValue = result.simulatedYield ? 100 - result.simulatedYield.solido : 0; break;
                case 'eficiencia_energetica': objectiveValue = result.kpis?.eficiencia_energetica || 0; break;
                case 'min_coste': objectiveValue = result.kpis ? 1000 - result.kpis.coste_bio_aceite : 0; break; // Invert for maximization
            }
            
            resultsMatrix.push({ params, result, objectiveValue });
            setProgress(((i + 1) / total) * 100);
            await new Promise(res => setTimeout(res, 50)); // simulate async
        }
        
        const optimalPoint = resultsMatrix.reduce((best, current) => {
            return current.objectiveValue > best.objectiveValue ? current : best;
        }, resultsMatrix[0]);
        
        try {
            const analysis = await getConcilioAnalysis(optimalPoint, config);
            setExperimentResult({ config, resultsMatrix, optimalPoint, concilioAnalysis: analysis });
        } catch (e) {
            setError(e instanceof Error ? e.message : "Error al obtener el análisis del Concilio.");
        } finally {
            setIsLoading(false);
        }

    }, [variables, objective, materialId]);

    const handleDownloadAnalysis = useCallback(() => {
        if (!experimentResult) return;

        const blob = new Blob([experimentResult.concilioAnalysis], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const material = PYROLYSIS_MATERIALS.find(m => m.id === experimentResult.config.materialId);
        const materialName = material ? material.nombre.replace(/[\s(),]/g, '_') : 'experimento';
        link.download = `analisis_concilio_${materialName}.md`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [experimentResult]);

    const handleUseForPrompt = useCallback(() => {
        if (!experimentResult) return;
        const material = PYROLYSIS_MATERIALS.find(m => m.id === experimentResult.config.materialId);
        const materialName = material ? material.nombre : 'la materia prima seleccionada';
        
        const objective = `Redactar un informe técnico exhaustivo basado en los resultados de la campaña de optimización "Hyperion" para ${materialName}. El informe debe detallar las condiciones operativas óptimas identificadas para maximizar ${OPTIMIZATION_GOALS.find(g => g.id === experimentResult.config.objective)?.label || 'el objetivo seleccionado'} y analizar las implicaciones de estos hallazgos, integrando el análisis profundo proporcionado por el Concilio.`;
        
        onUseAnalysisForPrompt(objective, experimentResult.concilioAnalysis);
    }, [experimentResult, onUseAnalysisForPrompt]);

    const availableVariables = VARIABLE_OPTIONS.filter(opt => !variables.some(v => v.name === opt.id));

    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg">
            <header className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-900">Módulo de Optimización "Hyperion"</h2>
                <p className="mt-2 text-md text-gray-600">
                    Define tu espacio experimental para encontrar la "estrella" más brillante en tu universo de simulación.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* --- CONFIGURATION PANEL --- */}
                <div className="space-y-6">
                    <Accordion title="1. Panel de Variables Independientes" defaultOpen>
                        <div className="space-y-4">
                            {variables.map(v => {
                                const varOption = VARIABLE_OPTIONS.find(opt => opt.id === v.name);
                                return (
                                    <div key={v.id} className="p-4 bg-gray-50 rounded-md border grid grid-cols-3 gap-4 items-end">
                                        <div className="col-span-3 flex justify-between items-center">
                                            <label className="font-bold text-gray-700">{varOption?.label}</label>
                                            <button onClick={() => handleRemoveVariable(v.id)} className="text-red-500 hover:text-red-700 font-bold">&times;</button>
                                        </div>
                                        <FormInput label="Mínimo" type="number" value={v.min} onChange={(e) => handleVariableChange(v.id, 'min', Number(e.target.value))} min={varOption?.min} max={v.max} step={varOption?.step} />
                                        <FormInput label="Máximo" type="number" value={v.max} onChange={(e) => handleVariableChange(v.id, 'max', Number(e.target.value))} min={v.min} max={varOption?.max} step={varOption?.step} />
                                        <FormInput label="Pasos" type="number" value={v.steps} onChange={(e) => handleVariableChange(v.id, 'steps', Number(e.target.value))} min={2} max={10} />
                                    </div>
                                );
                            })}
                        </div>
                        {availableVariables.length > 0 && (
                            <div className="pt-4">
                                <FormSelect label="+ Añadir Variable" value="" onChange={e => handleAddVariable(e.target.value as any)}>
                                    <option value="" disabled>Selecciona una variable...</option>
                                    {availableVariables.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                                </FormSelect>
                            </div>
                        )}
                    </Accordion>

                    <Accordion title="2. Panel de Variable de Objetivo" defaultOpen>
                        <FormSelect label="Meta del Experimento" value={objective} onChange={e => setObjective(e.target.value)}>
                            {OPTIMIZATION_GOALS.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
                        </FormSelect>
                        <FormSelect label="Material Base" value={materialId || ''} onChange={e => setMaterialId(Number(e.target.value))}>
                            <option value="" disabled>Selecciona un material...</option>
                            {PYROLYSIS_MATERIALS.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                        </FormSelect>
                    </Accordion>
                    
                    <div className="p-4 bg-gray-800 text-white rounded-lg text-center">
                        <p className="text-sm font-semibold">Total de Simulaciones a Ejecutar:</p>
                        <p className="text-3xl font-bold">{totalSimulations}</p>
                    </div>

                    <button onClick={startExperiment} disabled={isLoading || totalSimulations === 0 || totalSimulations > 100} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                        {isLoading ? 'Ejecutando Campaña...' : 'Iniciar Experimento Hyperion'}
                    </button>
                    {totalSimulations > 100 && <p className="text-red-500 text-sm text-center">El número máximo de simulaciones es 100.</p>}
                </div>

                {/* --- RESULTS PANEL --- */}
                <div className="space-y-6">
                    {isLoading && (
                        <div className="p-4 bg-gray-50 rounded-lg border">
                            <h3 className="font-bold text-lg mb-2">Procesando...</h3>
                            <div className="w-full bg-gray-200 rounded-full h-4">
                                <div className="bg-blue-600 h-4 rounded-full" style={{ width: `${progress}%` }}></div>
                            </div>
                            <p className="text-center text-sm mt-2">{progress.toFixed(0)}% completado</p>
                        </div>
                    )}
                    {error && <div className="p-4 bg-red-100 text-red-700 rounded-lg border border-red-300">{error}</div>}
                    
                    {experimentResult && (
                        <>
                            <Accordion title="Mapa de Calor de Optimización" defaultOpen>
                                {experimentResult.config.variables.length === 2 ? (
                                    <Heatmap 
                                      data={experimentResult.resultsMatrix}
                                      xVar={experimentResult.config.variables[0]}
                                      yVar={experimentResult.config.variables[1]}
                                      objectiveLabel={OPTIMIZATION_GOALS.find(g => g.id === experimentResult.config.objective)?.label || ''}
                                      optimalValue={experimentResult.optimalPoint.objectiveValue}
                                    />
                                ) : (
                                    <p className="text-gray-600">La visualización de mapa de calor solo está disponible para 2 variables.</p>
                                )}
                            </Accordion>

                            <Accordion title="Análisis Profundo del Concilio" defaultOpen>
                                <div className="space-y-4">
                                    <div className="bg-gray-100 p-4 rounded-md max-h-96 overflow-y-auto border border-gray-200">
                                        <pre className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-sans break-words">
                                            {experimentResult.concilioAnalysis}
                                        </pre>
                                    </div>
                                    <div className="pt-4 border-t flex flex-col sm:flex-row gap-4">
                                        <button
                                            onClick={handleDownloadAnalysis}
                                            className="flex-1 bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors text-sm flex items-center justify-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                            Descargar Análisis (.md)
                                        </button>
                                        <button
                                            onClick={handleUseForPrompt}
                                            className="flex-1 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" /><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" /></svg>
                                            Usar en Creador
                                        </button>
                                    </div>
                                </div>
                            </Accordion>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
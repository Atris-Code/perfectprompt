import React, { useMemo, useState } from 'react';
import type { PyrolysisMaterial, Catalyst, SimulationFormData } from '../../types';
import { PYROLYSIS_MATERIALS, SIMULATION_ENGINE } from '../../data/pyrolysisMaterials';
import { CatalyticOracle } from './CatalyticOracle';

// FIX: Corrected typo in name prop type from hemicelulosa to hemicellulosa.
const Slider: React.FC<{ name: 'celulosa' | 'hemicellulosa' | 'lignina', label: string, value: number, color: string, onChange: (name: 'celulosa' | 'hemicellulosa' | 'lignina', value: number) => void }> = ({ name, label, value, color, onChange }) => (
    <div>
        <div className="flex justify-between items-center mb-1">
            <label htmlFor={`slider-${name}`} className="text-sm font-medium text-gray-300">{label}</label>
            <span className="text-sm font-mono bg-slate-600 text-white px-2 py-0.5 rounded-md">{value.toFixed(1)}%</span>
        </div>
        <input
            id={`slider-${name}`}
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={value}
            onChange={(e) => onChange(name, parseFloat(e.target.value))}
            className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${color}`}
        />
    </div>
);

const SliderControl: React.FC<{ label: string; unit: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number; color: string; }> = ({ label, unit, value, onChange, min, max, step, color }) => (
    <div>
        <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-medium text-gray-300">{label}</label>
            <span className="text-sm font-mono bg-slate-600 text-white px-2 py-0.5 rounded-md">{value.toFixed(label === 'Tiempo de Residencia' && value < 10 ? 1 : 0)} {unit}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${color}`}
        />
    </div>
);

interface SimulationFormProps {
    formData: SimulationFormData;
    onFormChange: (fieldName: keyof SimulationFormData, value: any) => void;
    title: string;
}

export const SimulationForm: React.FC<SimulationFormProps> = ({ formData, onFormChange, title }) => {
    const [loadedMaterialId, setLoadedMaterialId] = useState('');
    const {
        simulationMode,
        composition,
        simpleCatalystId,
        mixture,
        advancedCatalystId,
        selectedBiomassModeId,
        selectedHeatSourceId,
        temperatura,
        tiempoResidencia,
        oxigeno,
    } = formData;

    const handleAdvancedPercentageChange = (index: number, newPercentage: number) => {
        const newMixture = [...mixture];
        const otherItemsTotal = mixture.reduce((sum, item, i) => i !== index ? sum + (item.percentage || 0) : sum, 0);
        const maxAllowed = 100 - otherItemsTotal;
        newMixture[index].percentage = Math.max(0, Math.min(newPercentage, maxAllowed));
        onFormChange('mixture', newMixture);
    };

    const totalPercentage = useMemo(() => {
        if (simulationMode === 'avanzado') {
            return mixture.reduce((sum, item) => sum + (item.percentage || 0), 0);
        }
        return 0;
    }, [mixture, simulationMode]);


    const solidMaterials = useMemo(() => PYROLYSIS_MATERIALS.filter((m): m is PyrolysisMaterial & { fase: 'Sólido' } => m.fase === 'Sólido'), []);
    const allMaterialsForAdvanced = useMemo(() => PYROLYSIS_MATERIALS.filter(m => m.id !== -1), []);
    const biomassModes = SIMULATION_ENGINE.biomass_pyrolysis_modes;
    const heatSources = SIMULATION_ENGINE.heat_sources;
    const availableCatalysts = SIMULATION_ENGINE.catalysts; 

     const effectiveMaterialName = useMemo(() => {
        if (simulationMode === 'simple' || simulationMode === 'extremo') {
            const materialId = mixture[0]?.materialId;
            if (materialId) {
                return allMaterialsForAdvanced.find(m => m.id === materialId)?.nombre || "Material Base";
            }
            return 'Biomasa Teórica';
        }
        if (mixture.length === 1 && mixture[0]) {
            return allMaterialsForAdvanced.find(m => m.id === mixture[0].materialId)?.nombre || "Mezcla";
        }
        if (mixture.length > 1) {
            return "Mezcla Personalizada";
        }
        return "No definido";
    }, [simulationMode, mixture, allMaterialsForAdvanced]);


    // FIX: Corrected typo in name parameter type from hemicelulosa to hemicellulosa.
    const handleCompositionSliderChange = (name: 'celulosa' | 'hemicellulosa' | 'lignina', value: number) => {
        let newComposition = { ...composition };
        const oldValue = newComposition[name];
        if (value === oldValue) return;
        
        // FIX: Corrected typo in otherSliders array from hemicelulosa to hemicellulosa.
        const otherSliders = (['celulosa', 'hemicellulosa', 'lignina'] as const).filter(k => k !== name);
        const oldOtherSum = otherSliders.reduce((sum, k) => sum + newComposition[k], 0);

        if (oldOtherSum > 0) {
            const newOtherSum = 100 - value;
            const ratio = newOtherSum / oldOtherSum;
            otherSliders.forEach(k => { newComposition[k] *= ratio; });
        } else {
            otherSliders.forEach(k => { newComposition[k] = (100 - value) / 2; });
        }
        
        newComposition[name] = value;
        const finalSum = newComposition.celulosa + newComposition.hemicellulosa + newComposition.lignina;
        const diff = 100 - finalSum;
        if (diff !== 0) { newComposition[name] += diff; }

        onFormChange('composition', {
            celulosa: Math.max(0, Math.min(100, newComposition.celulosa)),
            hemicellulosa: Math.max(0, Math.min(100, newComposition.hemicellulosa)),
            lignina: Math.max(0, Math.min(100, newComposition.lignina)),
        });
    };
    
    const handleLoadComposition = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const materialIdStr = e.target.value;
        setLoadedMaterialId(materialIdStr);
        const materialId = Number(materialIdStr);
        if (!materialId) {
            onFormChange('composition', { celulosa: 40, hemicelulosa: 30, lignina: 30 });
            return;
        };

        const material = solidMaterials.find(m => m.id === materialId);
        // FIX: Add a more robust check for the existence of `propiedades` and `composicion` before accessing them.
        if (material && 'propiedades' in material && material.propiedades && 'composicion' in material.propiedades && material.propiedades.composicion) {
            // FIX: Corrected typo from hemicelulosa to hemicellulosa.
            const { celulosa = 0, hemicellulosa = 0, lignina = 0 } = material.propiedades.composicion;
            
            const total = celulosa + hemicellulosa + lignina;
            let finalComposition;
            if (total > 0 && total !== 100) {
                const scale = 100 / total;
                finalComposition = {
                    celulosa: celulosa * scale,
                    hemicellulosa: hemicellulosa * scale,
                    lignina: lignina * scale,
                };
            } else if (total === 100) {
                finalComposition = { celulosa, hemicellulosa, lignina };
            } else {
                finalComposition = { celulosa: 34, hemicellulosa: 33, lignina: 33 };
            }
            
             const finalSum = finalComposition.celulosa + finalComposition.hemicellulosa + finalComposition.lignina;
             const diff = 100 - finalSum;
             if (diff !== 0) {
                 finalComposition.celulosa += diff;
             }

            onFormChange('composition', finalComposition);
        }
    };

    const handleAddMaterial = () => {
        const newMaterialId = allMaterialsForAdvanced.find(m => !mixture.some(item => item.materialId === m.id))?.id;
        if (newMaterialId !== undefined) {
            onFormChange('mixture', [...mixture, { materialId: newMaterialId, percentage: 0 }]);
        }
    };

    return (
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 space-y-4">
            <h3 className="text-xl font-bold text-white mb-4 text-center">{title}</h3>
            
            <div>
                <label className="text-lg font-bold text-white mb-3 block text-center">Modo de Simulación</label>
                <div className="bg-slate-900 rounded-lg p-1 flex border border-slate-700">
                    <button onClick={() => onFormChange('simulationMode', 'simple')} className={`flex-1 py-2 px-3 rounded-md text-sm font-semibold transition-colors ${simulationMode === 'simple' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'}`}>Simple</button>
                    <button onClick={() => onFormChange('simulationMode', 'avanzado')} className={`flex-1 py-2 px-3 rounded-md text-sm font-semibold transition-colors ${simulationMode === 'avanzado' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'}`}>Avanzado</button>
                    <button onClick={() => onFormChange('simulationMode', 'extremo')} className={`flex-1 py-2 px-3 rounded-md text-sm font-semibold transition-colors ${simulationMode === 'extremo' ? 'bg-orange-600 text-white' : 'text-gray-300 hover:bg-slate-700'}`}>Condiciones Extremas</button>
                </div>
            </div>

            {simulationMode === 'simple' ? (
                <>
                    <h4 className="text-lg font-bold text-white pt-4">Composición de Biomasa Teórica</h4>
                     <div className="mt-2">
                        <label htmlFor={`base-material-loader-${title}`} className="block text-sm font-medium text-gray-300 mb-1">Cargar composición desde un material base</label>
                        <select
                            id={`base-material-loader-${title}`}
                            onChange={handleLoadComposition}
                            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md text-white"
                            value={loadedMaterialId}
                        >
                            <option value="">Seleccionar material...</option>
                            {solidMaterials.map(m => (m.propiedades.composicion.celulosa !== undefined) && <option key={m.id} value={m.id}>{m.nombre} ({m.fase})</option>)}
                        </select>
                    </div>
                    <div className="space-y-4 pt-4 border-t border-slate-700">
                        <Slider name="celulosa" label="Celulosa" value={composition.celulosa} color="accent-green-500" onChange={handleCompositionSliderChange} />
                        {/* FIX: Corrected typo in name prop from hemicelulosa to hemicellulosa. */}
                        <Slider name="hemicellulosa" label="Hemicelulosa" value={composition.hemicellulosa} color="accent-yellow-500" onChange={handleCompositionSliderChange} />
                        <Slider name="lignina" label="Lignina" value={composition.lignina} color="accent-orange-700" onChange={handleCompositionSliderChange} />
                    </div>
                </>
            ) : simulationMode === 'avanzado' ? (
                 <>
                    <h4 className="text-lg font-bold text-white pt-4">Mezclador de Materias Primas</h4>
                    <div className="space-y-4">
                        {mixture.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                <select value={item.materialId} onChange={(e) => {
                                    const newMixture = [...mixture];
                                    newMixture[index].materialId = Number(e.target.value);
                                    onFormChange('mixture', newMixture);
                                }} className="col-span-7 p-2 bg-slate-700 border border-slate-600 rounded-md text-white text-sm">
                                    {allMaterialsForAdvanced.map(m => (<option key={m.id} value={m.id} disabled={mixture.some((mixItem, mixIndex) => mixIndex !== index && mixItem.materialId === m.id)}>{m.nombre} ({m.fase})</option>))}
                                </select>
                                <input type="number" value={item.percentage} onChange={(e) => handleAdvancedPercentageChange(index, Number(e.target.value))} className="col-span-3 p-2 bg-slate-700 border border-slate-600 rounded-md text-white text-sm text-right" min="0" max="100" />
                                <span className="text-sm">%</span>
                                <button onClick={() => onFormChange('mixture', mixture.filter((_, i) => i !== index))} className="col-span-1 text-red-400 hover:text-red-300 disabled:opacity-50" disabled={mixture.length <= 1}>&times;</button>
                            </div>
                        ))}
                    </div>
                    <button onClick={handleAddMaterial} className="mt-4 text-sm font-semibold text-blue-400 hover:text-blue-300" disabled={mixture.length >= allMaterialsForAdvanced.length}>+ Añadir</button>
                    {totalPercentage > 99.9 && (
                        <p className="text-xs text-yellow-400 mt-2">Atención: La suma de porcentajes ha alcanzado el 100% y no puede superarlo.</p>
                    )}
                </>
            ) : ( // modo 'extremo'
                <>
                    <h4 className="text-lg font-bold text-white pt-4">Control Manual de Condiciones</h4>
                    <p className="text-xs text-slate-400 -mt-2">Ajusta los parámetros fuera de los rangos normales para explorar escenarios de fallo o no convencionales.</p>
                    <div className="space-y-4 pt-4 border-t border-slate-700">
                        <SliderControl label="Temperatura" unit="°C" value={temperatura} onChange={(v) => onFormChange('temperatura', v)} min={100} max={1200} step={10} color="accent-red-500" />
                        <SliderControl label="Tiempo de Residencia" unit="s" value={tiempoResidencia} onChange={(v) => onFormChange('tiempoResidencia', v)} min={0.1} max={10000} step={0.1} color="accent-blue-500" />
                        <SliderControl label="Oxígeno en el Reactor" unit="%" value={oxigeno} onChange={(v) => onFormChange('oxigeno', v)} min={0} max={50} step={0.5} color="accent-teal-500" />
                    </div>
                     <div className="pt-4 border-t border-slate-600">
                        <p className="text-xs text-slate-400">Este modo utilizará la mezcla de materiales definida en el modo 'Avanzado' como base para la simulación.</p>
                    </div>
                </>
            )}

            {simulationMode !== 'extremo' && (
                <>
                    <div>
                        <label htmlFor="biomass-mode" className="block text-sm font-medium text-gray-300 mb-1">Modo de Pirólisis</label>
                        <select id="biomass-mode" value={selectedBiomassModeId} onChange={e => onFormChange('selectedBiomassModeId', e.target.value)} className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md text-white">
                            {biomassModes.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="heat-source" className="block text-sm font-medium text-gray-300 mb-1">Fuente de Calor</label>
                        <select
                            id="heat-source"
                            value={selectedHeatSourceId}
                            onChange={e => onFormChange('selectedHeatSourceId', e.target.value)}
                            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md text-white"
                        >
                            {heatSources.map(h => <option key={h.id} value={h.id}>{h.nombre}</option>)}
                        </select>
                    </div>
                </>
            )}
            
            <div className="pt-4 border-t border-slate-600">
                <CatalyticOracle selectedMaterialName={effectiveMaterialName} />
            </div>

            <div className="mt-6">
                <label htmlFor={`${simulationMode}-catalyst`} className="block text-sm font-medium text-gray-300 mb-1">Catalizador</label>
                <select id={`${simulationMode}-catalyst`} value={simulationMode === 'simple' ? simpleCatalystId || '' : advancedCatalystId || ''} onChange={e => onFormChange(simulationMode === 'simple' ? 'simpleCatalystId' : 'advancedCatalystId', e.target.value || null)} className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md text-white">
                    <option value="">Ninguno</option>
                    {availableCatalysts.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
            </div>
        </div>
    );
};
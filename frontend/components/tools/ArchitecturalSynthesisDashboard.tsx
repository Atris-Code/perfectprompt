import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ARCHITECTURAL_STYLES } from '../../data/architecturalStyles';
import type { ArchitecturalStyle } from '../../types';
import { generateArchitecturalVisualization } from '../../services/geminiService';
import { Accordion } from '../form/Accordion';

const Slider: React.FC<{ label: string, value: number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, min?: number, max?: number, step?: number, unit?: string }> = ({ label, value, onChange, min = 0, max = 100, step = 1, unit = '%' }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 flex justify-between">
            <span>{label}</span>
            <span className="font-mono">{value}{unit}</span>
        </label>
        <input type="range" min={min} max={max} step={step} value={value} onChange={onChange} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
    </div>
);

const CheckboxGroup: React.FC<{ title: string, options: string[], selected: string[], onChange: (value: string) => void }> = ({ title, options, selected, onChange }) => (
    <div>
        <h4 className="text-sm font-semibold text-gray-300 mb-2">{title}</h4>
        <div className="space-y-2">
            {options.map(option => (
                <label key={option} className="flex items-center text-sm text-gray-400 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={selected.includes(option)}
                        onChange={() => onChange(option)}
                        className="h-4 w-4 rounded bg-gray-700 border-gray-500 text-cyan-500 focus:ring-cyan-600"
                    />
                    <span className="ml-2">{option}</span>
                </label>
            ))}
        </div>
    </div>
);

interface ArchitecturalSynthesisDashboardProps {
    architecturalPreset: any | null;
    onPresetConsumed: () => void;
}

export const ArchitecturalSynthesisDashboard: React.FC<ArchitecturalSynthesisDashboardProps> = ({ architecturalPreset, onPresetConsumed }) => {
    const [selectedStyle, setSelectedStyle] = useState<ArchitecturalStyle>(ARCHITECTURAL_STYLES[6]);
    
    // State for controls
    const [materials, setMaterials] = useState<string[]>(['Acero Estructural', 'Hormigón']);
    const [natureParams, setNatureParams] = useState<string[]>([]);
    const [buildingType, setBuildingType] = useState('Planta Industrial / Módulos');
    const [environment, setEnvironment] = useState('Industrial');
    const [additionalElements, setAdditionalElements] = useState<string[]>(['Personas']);
    const [implicitPrompt, setImplicitPrompt] = useState('');

    useEffect(() => {
        if (architecturalPreset) {
            if (architecturalPreset.preset === 'Planta Industrial Modular') {
                setBuildingType('Planta Industrial / Módulos');
                setEnvironment('Industrial');
                setImplicitPrompt(`Planta modular con ${architecturalPreset.numModules} unidades de pirólisis. Estado: ${architecturalPreset.status}.`);
            }
            onPresetConsumed();
        }
    }, [architecturalPreset, onPresetConsumed]);

    // State for generation
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);

    const handleMaterialChange = (option: string) => {
        setMaterials(prev => prev.includes(option) ? prev.filter(item => item !== option) : [...prev, option]);
    };
    
    const handleNatureChange = (option: string) => {
        setNatureParams(prev => prev.includes(option) ? prev.filter(item => item !== option) : [...prev, option]);
    };

    const handleAdditionalChange = (option: string) => {
        setAdditionalElements(prev => prev.includes(option) ? prev.filter(item => item !== option) : [...prev, option]);
    };

    const handleGenerate = useCallback(async () => {
        setIsLoading(true);
        setError('');
        setGeneratedImage(null);

        try {
            let prompt = `fotorrealista, visualización arquitectónica cinematográfica, 8k, obra maestra. Un(a) ${buildingType} de estilo ${selectedStyle.nombre}. `;
            prompt += `La estructura está situada en un entorno ${environment}. `;
            
            if (materials.length > 0) {
                prompt += `Los materiales clave visibles son ${materials.join(', ')}. `;
            } else {
                prompt += `Los materiales clave visibles son ${selectedStyle.materiales_clave.join(', ')}. `;
            }
            
            if (natureParams.length > 0) {
                prompt += `El diseño integra elementos de naturaleza y sostenibilidad como: ${natureParams.join(', ')}. `;
            }

            if (additionalElements.length > 0) {
                prompt += `La escena incluye ${additionalElements.join(', ')}. `;
            }

            if (implicitPrompt) {
                prompt += `INSTRUCCIÓN IMPLÍCITA: ${implicitPrompt}. `;
            }

            prompt += 'La iluminación es naturalista, posiblemente durante la hora dorada, resaltando la textura de los materiales y la conexión entre la arquitectura y la naturaleza.';
            
            const imageData = await generateArchitecturalVisualization(prompt);
            setGeneratedImage(`data:image/jpeg;base64,${imageData}`);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Ocurrió un error al generar la imagen.');
        } finally {
            setIsLoading(false);
        }
    }, [buildingType, selectedStyle, environment, materials, natureParams, additionalElements, implicitPrompt]);

     useEffect(() => {
        if (!architecturalPreset) return;

        let newImplicitPrompt = '';
        const { preset } = architecturalPreset;

        if (preset === 'Planta Industrial Modular') {
            setSelectedStyle(ARCHITECTURAL_STYLES.find(s => s.id === 'arquitectura_moderna') || ARCHITECTURAL_STYLES[0]);
            setBuildingType('Planta Industrial / Módulos');
            setEnvironment('Industrial');
            setMaterials(['Acero Estructural', 'Hormigón', 'Paneles Compuestos']);
            setNatureParams([]);
            newImplicitPrompt = `Representar ${architecturalPreset.numModules} módulos interconectados tipo P-01. El estado general es '${architecturalPreset.status}'.`;
        } else if (preset === 'Vivienda Sostenible (EcoCasa)') {
            setSelectedStyle(ARCHITECTURAL_STYLES.find(s => s.id === 'arquitectura_contemporanea') || ARCHITECTURAL_STYLES[0]);
            setBuildingType('Vivienda Unifamiliar');
            const locationMap: Record<string, string> = { 'warm': 'Urbano', 'temperate': 'Suburbano', 'continental': 'Rural', 'cold': 'Natural' };
            setEnvironment(locationMap[architecturalPreset.location] || 'Suburbano');
            
            const improvements = architecturalPreset.improvements;
            const newMaterials = ['Vidrio de altas prestaciones'];
            if(improvements.insulation || improvements.windows) newMaterials.push('Madera Sostenible/Certificada');
            if(improvements.insulation) newMaterials.push('Materiales Reciclados');
            setMaterials(newMaterials);

            const newNature = [];
            if(improvements.solarWater) newNature.push('Paneles Solares Integrados');
            setNatureParams(newNature);
            
            const ratingScore = architecturalPreset.improvedRating.charCodeAt(0);
            const efficiencyText = ratingScore <= 'B'.charCodeAt(0) ? "diseño moderno y altamente eficiente" : ratingScore <= 'D'.charCodeAt(0) ? "diseño estándar con mejoras visibles" : "estructura básica necesitada de mejora";
            newImplicitPrompt = `Reflejar un ${efficiencyText} con calificación '${architecturalPreset.improvedRating}'. ${improvements.solarWater ? 'Mostrar claramente los paneles solares térmicos.' : ''}`;
        } else if (preset === 'Detalle de Unidad Industrial (P-01)') {
            setSelectedStyle(ARCHITECTURAL_STYLES.find(s => s.id === 'arquitectura_moderna') || ARCHITECTURAL_STYLES[0]);
            setBuildingType('Detalle Unidad Industrial');
            setEnvironment('Interior Planta');
            setMaterials(['Acero Inoxidable', 'Tuberías']);

            let statusText = '';
            if (architecturalPreset.status === 'ESTABLE' || architecturalPreset.status === 'CALENTANDO') {
                statusText = `El reactor P-01 está operativo a ${Math.round(architecturalPreset.temperature)}°C, mostrando un brillo intenso y vapor visible.`;
            } else {
                statusText = 'El reactor P-01 está inactivo y frío.';
            }
            newImplicitPrompt = `Enfocar la visualización en el reactor P-01. ${statusText}`;
        }
        
        setImplicitPrompt(newImplicitPrompt);
        
        setTimeout(() => {
            const generateButton = document.getElementById('architectural-synth-generate-button');
            if (generateButton) {
                generateButton.click();
            }
        }, 100);

        onPresetConsumed();

    }, [architecturalPreset, onPresetConsumed]);


    return (
        <div className="bg-gray-900 text-white p-8 rounded-2xl shadow-lg min-h-full">
            <header className="text-center mb-8">
                <h2 className="text-4xl font-bold">Dashboard de Síntesis Arquitectónica</h2>
                <p className="mt-2 text-md text-gray-400">Diseña, fusiona y visualiza la arquitectura del futuro.</p>
            </header>
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-3">
                    <Accordion title="1. Galería de Estilos" defaultOpen>
                        <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
                            {ARCHITECTURAL_STYLES.map(style => (
                                <button 
                                    key={style.id} 
                                    onClick={() => setSelectedStyle(style)}
                                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${selectedStyle.id === style.id ? 'bg-blue-900/50 border-2 border-blue-500' : 'bg-gray-800 border border-gray-700 hover:bg-gray-700'}`}
                                >
                                    <h4 className="font-bold text-sm">{style.nombre}</h4>
                                </button>
                            ))}
                        </div>
                    </Accordion>
                </div>

                <div className="col-span-12 lg:col-span-5 flex flex-col items-center justify-center bg-black rounded-lg p-4 aspect-video lg:aspect-auto">
                    {isLoading ? (
                        <div className="text-center">
                             <svg className="animate-spin h-10 w-10 text-cyan-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                             <p className="mt-4 text-gray-400">Vitruvio está diseñando... La generación puede tardar un minuto.</p>
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-400 p-4">
                            <p><strong>Error:</strong></p>
                            <p>{error}</p>
                        </div>
                    ) : generatedImage ? (
                        <img src={generatedImage} alt="Visualización arquitectónica generada" className="w-full h-full object-contain rounded-md" />
                    ) : (
                        <div className="text-center text-gray-500">
                            <h3 className="text-xl font-semibold">Lienzo de Proyección</h3>
                            <p className="mt-2 text-sm">La imagen generada aparecerá aquí.</p>
                        </div>
                    )}
                </div>
                
                <div className="col-span-12 lg:col-span-4 space-y-4">
                    <Accordion title="2. Parámetros Constructivos" defaultOpen>
                         <CheckboxGroup title="Materiales y Conexión Pyrolysis" options={['Acero Estructural', 'Hormigón', 'Madera Sostenible/Certificada', 'Materiales Reciclados', 'Bioplásticos/Compuestos']} selected={materials} onChange={handleMaterialChange} />
                    </Accordion>
                    <Accordion title="3. Naturaleza y Sostenibilidad" defaultOpen>
                        <CheckboxGroup title="Integración Natural" options={['Cubierta Verde', 'Jardines Verticales', 'Patios Interiores']} selected={natureParams} onChange={handleNatureChange} />
                        <CheckboxGroup title="Gestión del Agua" options={['Recolección Pluvial', 'Reutilización Aguas Grises']} selected={natureParams} onChange={handleNatureChange} />
                        <CheckboxGroup title="Energía Renovable Visible" options={['Paneles Solares Integrados', 'Mini-Eólica']} selected={natureParams} onChange={handleNatureChange} />
                    </Accordion>
                    <Accordion title="4. Simulación Visual" defaultOpen>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Tipo de Edificio</label>
                            <select value={buildingType} onChange={e => setBuildingType(e.target.value)} className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md">
                                <option>Vivienda Unifamiliar</option>
                                <option>Planta Industrial / Módulos</option>
                                <option>Detalle Unidad Industrial</option>
                                <option>Almacén</option>
                                <option>Oficina</option>
                                <option>Espacio Público</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Entorno/Contexto</label>
                            <select value={environment} onChange={e => setEnvironment(e.target.value)} className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md">
                                <option>Urbano</option>
                                <option>Suburbano</option>
                                <option>Rural</option>
                                <option>Natural</option>
                                <option>Industrial</option>
                                <option>Interior Planta</option>
                            </select>
                        </div>
                        <CheckboxGroup title="Elementos Adicionales" options={['Personas', 'Vehículos']} selected={additionalElements} onChange={handleAdditionalChange} />
                         <button id="architectural-synth-generate-button" onClick={handleGenerate} disabled={isLoading} className="w-full mt-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500">
                           {isLoading ? 'Generando...' : 'Generar Visualización Arquitectónica'}
                        </button>
                    </Accordion>
                </div>
            </div>
        </div>
    );
};
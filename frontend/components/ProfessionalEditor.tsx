import React, { useState, useMemo, useEffect } from 'react';
import { PEP_PRESETS } from '../data/pepPresets';
import { FormTextarea, FormSelect, FormInput } from './form/FormControls';
import { editImageWithPep } from '../services/geminiService';
import { Accordion } from './form/Accordion';
import type { StyleDefinition } from '../types';
import SavePepStyleModal from './SavePepStyleModal';

const expressionSuggestions = [
  { intention: 'Serenidad/Calma', prompt: 'Suavizar las líneas de la frente y relajar las comisuras de los labios a una posición neutra.' },
  { intention: 'Intensidad/Foco', prompt: 'Intensificar la mirada (foco directo) con una tensión sutil en la mandíbula inferior, pero manteniendo la frente lisa.' },
  { intention: 'Duda/Melancolía', prompt: 'Bajar sutilmente las cejas y proyectar una sombra debajo del ojo para una expresión de serena melancolía.' },
  { intention: 'Fuerza/Defensa', prompt: 'Mantener una mirada inquebrantable, elevando levemente la barbilla y tensando los músculos del cuello.' },
  { intention: 'Sonrisa Tenue', prompt: 'Elevar sutilmente las comisuras de los labios para una sonrisa tenue, manteniendo la seriedad en los ojos.' },
  { intention: 'Alegría Genuina', prompt: 'Elevar las comisuras de los labios y entrecerrar ligeramente los ojos para crear \'patas de gallo\' naturales.' },
  { intention: 'Sorpresa/Asombro', prompt: 'Abrir ligeramente la boca y elevar las cejas, manteniendo los ojos bien abiertos.' },
  { intention: 'Desdén/Desprecio', prompt: 'Elevar ligeramente una comisura del labio en una media sonrisa asimétrica y entrecerrar sutilmente un ojo.' },
  { intention: 'Tristeza Profunda', prompt: 'Bajar las comisuras de los labios y relajar el párpado superior para una mirada caída, con una ligera tensión en la barbilla.' },
  { intention: 'Ira/Furia Contenida', prompt: 'Fruncir el ceño intensamente y apretar firmemente los labios en una línea delgada, con tensión visible en la mandíbula.' }
];

const poseSuggestions = [
  { component: 'Línea de Visión', prompt: 'Ajustar la línea de visión para un contacto visual directo e inquebrantable con el lente de la cámara.' },
  { component: 'Inclinación de la Cabeza', prompt: 'Inclinar la cabeza 3 grados a la izquierda (o derecha) para inyectar dinamismo y romper la simetría perfecta.' },
  { component: 'Hombros/Postura', prompt: 'Relajar la rigidez de los hombros, permitiendo que uno de ellos caiga ligeramente para una pose más natural.' },
  { component: 'Manos/Brazos', prompt: 'Suavizar la tensión en los dedos o el agarre, aplicando una curva más orgánica en la muñeca y el antebrazo.' },
  { component: 'Efecto de Proyección', prompt: 'Proyectar la barbilla ligeramente hacia adelante (mandíbula fuerte) para un efecto dramático y de determinación.' }
];

const ImageUpload: React.FC<{ label: string; image: { data: string; name: string } | null; onImageUpload: (file: File) => void; onImageRemove: () => void; }> = ({ label, image, onImageUpload, onImageRemove }) => (
    <div className="space-y-2">
        <label className="font-medium text-gray-700">{label}</label>
        {!image ? (
            <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span></p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && onImageUpload(e.target.files[0])} />
                </label>
            </div>
        ) : (
            <div className="relative group">
                <img src={image.data} alt={image.name} className="w-full h-40 object-contain rounded-lg border bg-gray-100" />
                <button
                  type="button"
                  onClick={onImageRemove}
                  className="absolute top-2 right-2 p-2 bg-black bg-opacity-50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Eliminar imagen"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                </button>
            </div>
        )}
    </div>
);

const SuggestionBox: React.FC<{
    suggestions: Array<{ primary: string; prompt: string }>;
    onSelect: (prompt: string) => void;
}> = ({ suggestions, onSelect }) => (
    <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-1">
        <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Sugerencias</h5>
        {suggestions.map((s, i) => (
            <button
                key={i}
                type="button"
                onClick={() => onSelect(s.prompt)}
                className="w-full text-left p-2 rounded-md hover:bg-gray-200 transition-colors text-sm group"
            >
                <span className="font-semibold text-gray-800 group-hover:text-blue-700">{s.primary}:</span>{' '}
                <span className="text-gray-600">{s.prompt}</span>
            </button>
        ))}
    </div>
);

interface ProfessionalEditorProps {
    onAddStyle: (newStyle: StyleDefinition) => void;
    initialData: Partial<{
        action: string;
        technicalOutput: string;
        styleReference: string;
        advancedControls: any;
        originImage: { data: string; name: string; type: string; };
    }> | null;
    setInitialData: (data: any | null) => void;
}

export const ProfessionalEditor: React.FC<ProfessionalEditorProps> = ({ onAddStyle, initialData, setInitialData }) => {
    const [originImage, setOriginImage] = useState<{ data: string; name: string; type: string; } | null>(null);
    const [action, setAction] = useState('');
    const [technicalOutput, setTechnicalOutput] = useState('');
    const [styleReference, setStyleReference] = useState('');
    const [advancedControls, setAdvancedControls] = useState({
        composition: '',
        perspective: '',
        expressionDirection: '',
        poseAdjustment: '',
        aperture: '',
        colorGrading: '',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [aiTextResponse, setAiTextResponse] = useState<string | null>(null);
    
    const [showExpressionSuggestions, setShowExpressionSuggestions] = useState(false);
    const [showPoseSuggestions, setShowPoseSuggestions] = useState(false);
    const [isSaveStyleModalOpen, setIsSaveStyleModalOpen] = useState(false);

    useEffect(() => {
        if (initialData) {
            setAction(initialData.action || '');
            setTechnicalOutput(initialData.technicalOutput || '');
            setStyleReference(initialData.styleReference || '');
            setAdvancedControls(initialData.advancedControls || {
                composition: '', perspective: '', expressionDirection: '', poseAdjustment: '', aperture: '', colorGrading: '',
            });
            if (initialData.originImage) {
                setOriginImage(initialData.originImage);
            }
            setInitialData(null);
        }
    }, [initialData, setInitialData]);

    const presetCategories = useMemo(() => {
        const categories = new Set(PEP_PRESETS.map(p => p.category));
        return Array.from(categories);
    }, []);
    const [selectedCategory, setSelectedCategory] = useState(presetCategories[0]);
    const presetsForCategory = useMemo(() => PEP_PRESETS.filter(p => p.category === selectedCategory), [selectedCategory]);

    const fileToDataUrl = (file: File): Promise<{ data: string; name: string; type: string }> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve({ data: reader.result as string, name: file.name, type: file.type });
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    };
    
    const handleAdvancedChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | { target: { name: string, value: string } }) => {
        const { name, value } = e.target;
        setAdvancedControls(prev => ({ ...prev, [name]: value }));
    };

    const handleSuggestionClick = (name: 'expressionDirection' | 'poseAdjustment', prompt: string) => {
        handleAdvancedChange({ target: { name, value: prompt } });
        if (name === 'expressionDirection') setShowExpressionSuggestions(false);
        if (name === 'poseAdjustment') setShowPoseSuggestions(false);
    };

    const handleOriginImageUpload = async (file: File) => {
        const imageData = await fileToDataUrl(file);
        setOriginImage(imageData);
    };

    const handleApplyPreset = (presetType: string) => {
        const preset = PEP_PRESETS.find(p => p.type === presetType);
        if (preset) {
            setAction(preset.action);
            setTechnicalOutput(preset.technical_output);
            setStyleReference(preset.style_reference_suggestion || '');
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!originImage) {
            setError('La imagen de origen es obligatoria.');
            return;
        }
        if (!action) {
            setError('La Acción Principal es obligatoria si no usas un preset.');
            return;
        }
        setError('');
        setIsLoading(true);
        setEditedImage(null);
        setAiTextResponse(null);

        try {
            const result = await editImageWithPep(
                { data: originImage.data, mimeType: originImage.type },
                styleReference,
                action,
                technicalOutput,
                advancedControls
            );
            if (result.imageData) {
              setEditedImage(`data:image/png;base64,${result.imageData}`);
            }
            if (result.text) {
              setAiTextResponse(result.text);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveStyle = (name: string) => {
        const newStyle: StyleDefinition = {
            id_style: `pep_custom_${Date.now()}`,
            style: name,
            description: `Estilo PEP personalizado. Acción: ${action.substring(0, 50)}${action.length > 50 ? '...' : ''}`,
            category: 'pep_personalizado',
            categoryName: 'Estilos PEP Personalizados',
            sensacion_atmosfera: ['S1', 'Rigor y Precisión'],
            pep_config: {
                action,
                technicalOutput,
                styleReference,
                advancedControls
            }
        };
        onAddStyle(newStyle);
        setIsSaveStyleModalOpen(false);
    };

    const handleDownloadImage = () => {
        if (!editedImage) return;
        const link = document.createElement('a');
        link.href = editedImage;
        link.download = `pep_edited_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="grid grid-cols-2 gap-8 bg-white p-8 rounded-2xl shadow-lg">
            {isSaveStyleModalOpen && <SavePepStyleModal onClose={() => setIsSaveStyleModalOpen(false)} onSave={handleSaveStyle} />}
            {/* Columna 1: Formulario */}
            <main className="flex flex-col">
                <header className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Editor Profesional (PEP)</h2>
                    <p className="mt-2 text-md text-gray-600">Edita tus imágenes usando prompts estructurados y la IA.</p>
                </header>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Accordion title="1. Imágenes de Entrada" defaultOpen={true}>
                        <div className="md:col-span-1">
                          <ImageUpload label="Imagen de Origen (Obligatorio)" image={originImage} onImageUpload={handleOriginImageUpload} onImageRemove={() => setOriginImage(null)} />
                        </div>
                        <div className="md:col-span-1">
                          <FormTextarea 
                              label="Referencia de Estilo (Opcional)" 
                              id="style_reference_json"
                              name="style_reference"
                              rows={6}
                              value={styleReference}
                              onChange={(e) => setStyleReference(e.target.value)}
                              placeholder="Pega aquí el JSON de un estilo desde la Biblioteca de Estilos o escribe instrucciones de estilo."
                              className="h-full"
                          />
                        </div>
                    </Accordion>
                    
                    <Accordion title="2. Plantillas de Edición (Opcional)" defaultOpen={false}>
                        <FormSelect label="Categoría" id="preset_category" name="preset_category" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                            {presetCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </FormSelect>
                        <FormSelect label="Tipo de Edición" id="preset_type" name="preset_type" onChange={(e) => handleApplyPreset(e.target.value)} defaultValue="">
                            <option value="" disabled>Selecciona un preset para autocompletar...</option>
                            {presetsForCategory.map(p => <option key={p.type} value={p.type}>{p.type}</option>)}
                        </FormSelect>
                    </Accordion>
                    
                    <Accordion title="3. Instrucciones Manuales de Edición" defaultOpen={true}>
                        <div className="md:col-span-2">
                            <FormTextarea
                                label="Acción Principal (Obligatorio si no usas preset)"
                                id="action"
                                name="action"
                                rows={3}
                                value={action}
                                onChange={(e) => setAction(e.target.value)}
                                placeholder="Describe la transformación principal que quieres lograr. Ej: 'Cambiar el fondo por una escena de playa al atardecer.'"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <FormTextarea
                                label="Salida Técnica (Opcional)"
                                id="technicalOutput"
                                name="technicalOutput"
                                rows={3}
                                value={technicalOutput}
                                onChange={(e) => setTechnicalOutput(e.target.value)}
                                placeholder="Describe las especificaciones técnicas del resultado. Ej: 'Iluminación de hora dorada, alta resolución 4K, look de película cinematográfica.'"
                            />
                        </div>
                    </Accordion>

                    <Accordion title="4. Controles de Dirección Avanzados (PEP)" defaultOpen={true}>
                        <FormSelect
                            label="Composición (Regla de Tercios)"
                            id="composition"
                            name="composition"
                            value={advancedControls.composition}
                            onChange={handleAdvancedChange}
                        >
                            <option value="">Seleccionar composición...</option>
                            <option value="Sujeto Central (Estático)">Sujeto Central (Estático)</option>
                            <option value="Intersección Superior Izquierda (Dinamismo)">Intersección Superior Izquierda (Dinamismo)</option>
                            <option value="Intersección Superior Derecha">Intersección Superior Derecha</option>
                            <option value="Intersección Inferior Izquierda">Intersección Inferior Izquierda</option>
                            <option value="Intersección Inferior Derecha (Anclaje)">Intersección Inferior Derecha (Anclaje)</option>
                        </FormSelect>

                        <FormSelect
                            label="Perspectiva (Ángulo de Cámara)"
                            id="perspective"
                            name="perspective"
                            value={advancedControls.perspective}
                            onChange={handleAdvancedChange}
                        >
                           <option value="">Seleccionar perspectiva...</option>
                           <option value="Ángulo Bajo (Poder)">Ángulo Bajo (Poder)</option>
                           <option value="Ángulo Alto (Vulnerabilidad)">Ángulo Alto (Vulnerabilidad)</option>
                           <option value="Ángulo a Nivel (Realismo)">Ángulo a Nivel (Realismo)</option>
                           <option value="Ángulo Holandés (Tensión)">Ángulo Holandés (Tensión)</option>
                        </FormSelect>

                        <div className="md:col-span-2">
                            <div className="flex justify-between items-center mb-2">
                                <label htmlFor="expressionDirection" className="font-medium text-gray-700">Dirección de Expresión</label>
                                <button type="button" onClick={() => setShowExpressionSuggestions(prev => !prev)} className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center p-1 rounded-md hover:bg-blue-50">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    {showExpressionSuggestions ? 'Ocultar' : 'Ver'} Sugerencias
                                </button>
                            </div>
                            <textarea
                                id="expressionDirection"
                                name="expressionDirection"
                                rows={3}
                                value={advancedControls.expressionDirection}
                                onChange={handleAdvancedChange}
                                placeholder="Ej: Suavizar la boca de 'desafío' a 'serenidad tenue'."
                                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                            />
                            {showExpressionSuggestions && <SuggestionBox suggestions={expressionSuggestions.map(s => ({ primary: s.intention, prompt: s.prompt }))} onSelect={(p) => handleSuggestionClick('expressionDirection', p)} />}
                        </div>
                        <div className="md:col-span-2">
                            <div className="flex justify-between items-center mb-2">
                                <label htmlFor="poseAdjustment" className="font-medium text-gray-700">Ajuste de Pose</label>
                                <button type="button" onClick={() => setShowPoseSuggestions(prev => !prev)} className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center p-1 rounded-md hover:bg-blue-50">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    {showPoseSuggestions ? 'Ocultar' : 'Ver'} Sugerencias
                                </button>
                            </div>
                            <textarea
                                id="poseAdjustment"
                                name="poseAdjustment"
                                rows={3}
                                value={advancedControls.poseAdjustment}
                                onChange={handleAdvancedChange}
                                placeholder="Ej: Rotar el hombro derecho 10 grados hacia adelante."
                                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                            />
                             {showPoseSuggestions && <SuggestionBox suggestions={poseSuggestions.map(s => ({ primary: s.component, prompt: s.prompt }))} onSelect={(p) => handleSuggestionClick('poseAdjustment', p)} />}
                        </div>
                         <FormSelect
                            label="Apertura (f-stop)"
                            id="aperture"
                            name="aperture"
                            value={advancedControls.aperture}
                            onChange={handleAdvancedChange}
                        >
                           <option value="">Seleccionar apertura...</option>
                           <option value="f/1.4 (Bokeh Máximo)">f/1.4 (Bokeh Máximo)</option>
                           <option value="f/2.8 (Desenfoque Suave)">f/2.8 (Desenfoque Suave)</option>
                           <option value="f/5.6 (Equilibrado)">f/5.6 (Equilibrado)</option>
                           <option value="f/11 (Nitidez Amplia)">f/11 (Nitidez Amplia)</option>
                           <option value="f/22 (Máxima Nitidez)">f/22 (Máxima Nitidez)</option>
                        </FormSelect>

                        <FormInput
                            label="Gradación de Color (Color Grading)"
                            id="colorGrading"
                            name="colorGrading"
                            value={advancedControls.colorGrading}
                            onChange={handleAdvancedChange}
                            placeholder="Ej: Look cinematográfico (teal & orange)"
                            list="color-grading-styles"
                        />
                        <datalist id="color-grading-styles">
                            <option value="Look cinematográfico (teal and orange)" />
                            <option value="Look de película Kodachrome" />
                            <option value="Estética desaturada y melancólica" />
                            <option value="Blanco y negro de alto contraste (film noir)" />
                            <option value="Tonalidad sepia vintage" />
                        </datalist>
                    </Accordion>
                    
                    <button type="submit" disabled={isLoading || !originImage || !action}
                        className="w-full mt-6 flex justify-center items-center bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isLoading ? 'Editando con IA...' : 'Ejecutar Edición Profesional'}
                    </button>
                </form>
            </main>
            {/* Columna 2: Output */}
            <aside className="flex flex-col bg-gray-50 p-8 rounded-lg border">
                <div className="flex-grow">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Resultado de la Edición</h2>
                    {error && (
                        <div className="p-4 bg-red-100 text-red-800 border-l-4 border-red-500 rounded-r-lg" role="alert">
                            <p className="font-bold">Error</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    )}
                    
                    {isLoading && (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                <p className="mt-4 text-gray-600 font-semibold">Editando con IA...</p>
                            </div>
                        </div>
                    )}

                    {!isLoading && !editedImage && !error && (
                        <div className="flex items-center justify-center h-full text-center text-gray-500">
                            <div>
                                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <p className="mt-2 font-semibold">La imagen editada aparecerá aquí.</p>
                            </div>
                        </div>
                    )}

                    {editedImage && (
                        <div className="space-y-6 animate-fade-in">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Imagen Editada</h3>
                                <img src={editedImage} alt="Imagen editada por IA" className="w-full rounded-lg shadow-md" />
                            </div>
                            {aiTextResponse && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Respuesta de la IA</h3>
                                    <p className="text-sm text-gray-700 p-4 bg-gray-100 rounded-md">{aiTextResponse}</p>
                                </div>
                            )}
                            <div className="mt-4 flex flex-col sm:flex-row gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsSaveStyleModalOpen(true)}
                                    className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none"
                                >
                                    Guardar como Estilo PEP...
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDownloadImage}
                                    className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    Descargar Imagen
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </aside>
             <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
};
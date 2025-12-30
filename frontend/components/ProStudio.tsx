import React, { useState, useRef } from 'react';
import type { ProFormData } from '../types';
import { ContentType } from '../types';
import { Accordion } from './form/Accordion';
import { FormInput, FormTextarea, FormSelect } from './form/FormControls';
import MetadataDisplay from './MetadataDisplay';
import { ProStudioReportPDF } from './pdf/ProStudioReportPDF';

// FIX: Removed redundant global declarations for 'exifr' and 'html2canvas' which are already centralized in types.ts.

interface ProStudioProps {
    formData: ProFormData;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | { target: { name: string, value: any } }) => void;
    handleSubmit: (e: React.FormEvent) => void;
    isLoading: boolean;
    error: string;
    generatedPrompt: string;
    onReset: () => void;
    onMetadataExtract: (metadata: any | null) => void;
    onUseInCreator: (prompt: string, contentType: ContentType) => void;
}

export const ProStudio: React.FC<ProStudioProps> = ({
    formData,
    handleChange,
    handleSubmit,
    isLoading,
    error,
    generatedPrompt,
    onReset,
    onMetadataExtract,
    onUseInCreator,
}) => {
    const [showCopyConfirmation, setShowCopyConfirmation] = useState<boolean>(false);
    const [metadata, setMetadata] = useState<any | null>(null);
    const [metadataError, setMetadataError] = useState<string>('');
    const [isParsing, setIsParsing] = useState<boolean>(false);
    const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
    const [showPDFPreview, setShowPDFPreview] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setMetadata(null);
        onMetadataExtract(null);
        setMetadataError('');
        setIsParsing(true);

        try {
            // Wait for exifr library to load (with timeout)
            let retries = 0;
            const maxRetries = 10;
            while (typeof window.exifr === 'undefined' && retries < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 100));
                retries++;
            }

            if (typeof window.exifr === 'undefined') {
                throw new Error("La librería de metadatos (exifr) no se pudo cargar desde el CDN. Verifica tu conexión a internet y recarga la página (F5).");
            }

            // Read file into an ArrayBuffer for more robust parsing
            const buffer = await file.arrayBuffer();
            const data = await window.exifr.parse(buffer, true); // Force full parsing
            if (!data || Object.keys(data).length === 0) {
                throw new Error('No se encontraron metadatos EXIF en este archivo. Los archivos de imagen deben contener información EXIF (la mayoría de fotos de cámaras y smartphones lo tienen).');
            }
            setMetadata(data);
            onMetadataExtract(data);

            // Auto-relleno de campos del formulario
            if (data.ExposureTime) {
                const exposureTime = data.ExposureTime;
                const shutterSpeedString = exposureTime < 1 ? '1/' + Math.round(1 / exposureTime) + 's' : exposureTime + 's';
                handleChange({ target: { name: 'pro_shutter_speed', value: shutterSpeedString } } as any);
            }
            if (data.ISO) {
                handleChange({ target: { name: 'pro_iso', value: `ISO ${data.ISO}` } } as any);
            }
            if (data.FocalLength) {
                handleChange({ target: { name: 'pro_focal_length', value: `${data.FocalLength}mm` } } as any);
            }
            if (data.LensModel) {
                handleChange({ target: { name: 'pro_lens_effects', value: data.LensModel } } as any);
            }

        } catch (err) {
            console.error("Error parsing EXIF data:", err);
            const errorMessage = err instanceof Error ? err.message : 'Ocurrió un error desconocido.';
            if (errorMessage.toLowerCase().includes('unknown file format') || errorMessage.toLowerCase().includes('not a valid file')) {
                setMetadataError('Formato de archivo no reconocido. Sube una imagen RAW (CR2, NEF, ARW, etc.) o JPG/TIFF con metadatos EXIF.');
            } else {
                setMetadataError(`Error: ${errorMessage}`);
            }
            onMetadataExtract(null);
        } finally {
            setIsParsing(false);
            e.target.value = ''; // Clear file input
        }
    };

    const handleReset = () => {
        onReset();
        setMetadata(null);
        setMetadataError('');
        onMetadataExtract(null);
    };

    const handleDownloadJson = () => {
        if (!metadata) return;
        const jsonString = JSON.stringify(metadata, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'metadata.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleCopy = () => {
        if (!generatedPrompt) return;
        navigator.clipboard.writeText(generatedPrompt).then(() => {
            setShowCopyConfirmation(true);
            setTimeout(() => setShowCopyConfirmation(false), 2000);
        });
    };

    const handleDownloadPDF = async () => {
        if (!generatedPrompt) return;
        if (typeof window.html2canvas === 'undefined' || typeof window.jspdf === 'undefined') {
            setMetadataError("Las librerías para generar PDF no se cargaron correctamente. Comprueba tu conexión a internet y refresca la página.");
            return;
        }

        setIsDownloadingPDF(true);
        setShowPDFPreview(true);
        await new Promise(resolve => setTimeout(resolve, 100)); // wait for hidden component to render

        const pdfContentElement = document.getElementById('pro-studio-pdf-content');
        if (!pdfContentElement) {
            setMetadataError('No se pudo encontrar el contenido para generar el PDF.');
            setIsDownloadingPDF(false);
            setShowPDFPreview(false);
            return;
        }

        try {
            const canvas = await window.html2canvas(pdfContentElement, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
            });
            const imgData = canvas.toDataURL('image/png', 1.0);
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = pdfWidth / canvasWidth;
            const scaledCanvasHeight = canvasHeight * ratio;

            let heightLeft = scaledCanvasHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledCanvasHeight);
            heightLeft -= pdfHeight;

            let page = 1;
            while (heightLeft > 0) {
                position = -pdfHeight * page;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledCanvasHeight);
                heightLeft -= pdfHeight;
                page++;
            }

            pdf.save('Pro_Studio_Report.pdf');
        } catch (e) {
            console.error("Error al generar PDF:", e);
            setMetadataError("No se pudo generar el PDF. Por favor, inténtalo de nuevo.");
        } finally {
            setIsDownloadingPDF(false);
            setShowPDFPreview(false);
        }
    };

    return (
        <div className="grid grid-cols-2 gap-8">
            {showPDFPreview && (
                <div style={{ position: 'fixed', left: '-9999px', top: 0, zIndex: -1 }}>
                    <ProStudioReportPDF formData={formData} prompt={generatedPrompt} />
                </div>
            )}

            {/* Columna 1: Formulario */}
            <main className="bg-white p-8 flex flex-col">
                <header className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-gray-900">IA Pro Studio</h2>
                    <p className="mt-2 text-md text-gray-600">La consola de dirección de arte para imágenes de calidad profesional.</p>
                </header>

                <form onSubmit={handleSubmit} className="flex-grow flex flex-col">
                    <div className="flex-grow space-y-6 pr-4 -mr-4">
                        <Accordion title="Escáner de Metadatos de Imagen (RAW, JPG, etc.)" defaultOpen={true}>
                            <div className="md:col-span-2">
                                <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">Sube una imagen (RAW, JPG, etc.) para extraer su "receta" y auto-rellenar los campos técnicos.</label>
                                <input
                                    id="file-upload"
                                    type="file"
                                    accept=".cr3,.cr2,.nef,.arw,.dng,.raf,.orf,.rw2,.tiff,.tif,.jpeg,.jpg"
                                    onChange={handleFileChange}
                                    disabled={isParsing}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                                />
                                {isParsing && <p className="mt-2 text-sm text-gray-600">Analizando metadatos...</p>}
                                {metadataError && <p className="mt-2 text-sm text-red-600">{metadataError}</p>}
                            </div>
                        </Accordion>

                        {metadata && <MetadataDisplay metadata={metadata} onDownloadJson={handleDownloadJson} />}

                        <Accordion title="Concepto y Narrativa" defaultOpen={true}>
                            <div className="md:col-span-2">
                                <FormTextarea
                                    label="Concepto Artístico Detallado"
                                    id="pro_concept"
                                    name="pro_concept"
                                    placeholder="Describe la idea central, el 'big picture' de tu imagen. ¿Qué historia quieres contar?"
                                    rows={4}
                                    value={formData.pro_concept}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <FormInput
                                label="Narrativa y Emoción"
                                id="pro_emotion"
                                name="pro_emotion"
                                placeholder="Ej: Melancolía, Euforia, Tensión, Paz"
                                value={formData.pro_emotion}
                                onChange={handleChange}
                            />
                            <FormInput
                                label="Simbolismo Clave"
                                id="pro_symbolism"
                                name="pro_symbolism"
                                placeholder="Ej: Un reloj roto (tiempo perdido), una llave (secreto)"
                                value={formData.pro_symbolism}
                                onChange={handleChange}
                            />
                        </Accordion>

                        <Accordion title="Composición y Color" defaultOpen={true}>
                            <FormSelect
                                label="Regla de Composición Principal"
                                id="pro_composition_rule"
                                name="pro_composition_rule"
                                value={formData.pro_composition_rule}
                                onChange={handleChange}
                            >
                                <option value="">Selecciona una regla...</option>
                                <option value="Regla de los Tercios">Regla de los Tercios</option>
                                <option value="Proporción Áurea">Proporción Áurea</option>
                                <option value="Simetría Dinámica">Simetría Dinámica</option>
                                <option value="Líneas Guía (Leading Lines)">Líneas Guía (Leading Lines)</option>
                                <option value="Encuadre dentro de un Encuadre">Encuadre dentro de un Encuadre</option>
                                <option value="Llenar el Encuadre (Fill the Frame)">Llenar el Encuadre (Fill the Frame)</option>
                            </FormSelect>
                            <FormSelect
                                label="Teoría del Color / Esquema"
                                id="pro_color_theory"
                                name="pro_color_theory"
                                value={formData.pro_color_theory}
                                onChange={handleChange}
                            >
                                <option value="">Selecciona un esquema...</option>
                                <option value="Monocromático">Monocromático</option>
                                <option value="Análogo">Análogo</option>
                                <option value="Complementario">Complementario</option>
                                <option value="Triádico">Triádico</option>
                                <option value="Complementarios Divididos">Complementarios Divididos</option>
                            </FormSelect>
                            <div className="md:col-span-2">
                                <FormInput
                                    label="Paleta Específica Deseada"
                                    id="pro_specific_palette"
                                    name="pro_specific_palette"
                                    placeholder="Ej: Tonos tierra desaturados con un acento de azul cobalto"
                                    value={formData.pro_specific_palette}
                                    onChange={handleChange}
                                />
                            </div>
                        </Accordion>

                        <Accordion title="Técnica Fotográfica Avanzada" defaultOpen={true}>
                            <FormInput
                                label="Distancia Focal (Lente)"
                                id="pro_focal_length"
                                name="pro_focal_length"
                                placeholder="Ej: 24mm (gran angular), 85mm (retrato)"
                                value={formData.pro_focal_length}
                                onChange={handleChange}
                            />
                            <FormInput
                                label="Velocidad de Obturación (Efecto)"
                                id="pro_shutter_speed"
                                name="pro_shutter_speed"
                                placeholder="Ej: 1/1000s (congelar movimiento), 1s (desenfocar)"
                                value={formData.pro_shutter_speed}
                                onChange={handleChange}
                            />
                            <FormInput
                                label="ISO (Grano/Sensibilidad)"
                                id="pro_iso"
                                name="pro_iso"
                                placeholder="Ej: ISO 100 (limpio), ISO 3200 (grano visible)"
                                value={formData.pro_iso}
                                onChange={handleChange}
                            />
                            <FormInput
                                label="Efectos de Lente y Aberraciones"
                                id="pro_lens_effects"
                                name="pro_lens_effects"
                                placeholder="Ej: Lens flare anamórfico, viñeteado suave"
                                value={formData.pro_lens_effects}
                                onChange={handleChange}
                            />
                        </Accordion>

                        <Accordion title="Estilo de Post-Producción" defaultOpen={true}>
                            <div className="md:col-span-2">
                                <FormInput
                                    label="Acabado Final y Grado de Color"
                                    id="pro_post_production"
                                    name="pro_post_production"
                                    placeholder="Ej: Look cinematográfico (teal & orange), estética de película Kodachrome"
                                    value={formData.pro_post_production}
                                    onChange={handleChange}
                                />
                            </div>
                        </Accordion>
                    </div>

                    <div className="mt-8 pt-6 border-t flex justify-end items-center gap-4">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            Restablecer
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex justify-center items-center bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105 disabled:bg-gray-400"
                        >
                            {isLoading ? 'Generando...' : 'Generar Prompt Pro'}
                        </button>
                    </div>
                </form>
            </main>

            {/* Columna 2: Output */}
            <aside className="bg-gray-50 p-8 rounded-lg border flex flex-col">
                <div className="flex-grow">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Prompt Profesional</h2>
                    {error && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm mb-4">{error}</div>}

                    <div className={`relative p-6 bg-gray-800 text-gray-100 rounded-lg shadow-inner min-h-[200px] flex flex-col transition-all duration-300 ${isLoading || generatedPrompt ? 'opacity-100' : 'opacity-50'}`}>
                        {isLoading ? (
                            <div className="flex-grow flex items-center justify-center">
                                <div className="text-center">
                                    <svg className="animate-spin h-6 w-6 text-white mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    <span>Sintetizando...</span>
                                </div>
                            </div>
                        ) : generatedPrompt ? (
                            <>
                                <pre className="whitespace-pre-wrap text-base leading-relaxed font-mono flex-grow">{generatedPrompt}</pre>
                                <button onClick={handleCopy} className="absolute top-4 right-4 flex items-center bg-green-500 text-white font-bold py-2 px-3 rounded-lg hover:bg-green-600 transition-colors text-xs">
                                    {showCopyConfirmation ? '¡Copiado!' : 'Copiar'}
                                </button>
                            </>
                        ) : (
                            <div className="flex-grow flex items-center justify-center text-center text-gray-400">
                                <div>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                                    <p>El prompt sintetizado por la IA aparecerá aquí.</p>
                                </div>
                            </div>
                        )}
                        {generatedPrompt && (
                            <div className="mt-4 pt-4 border-t border-gray-600 space-y-3">
                                {/* Primary: Imagen */}
                                <button
                                    onClick={() => onUseInCreator(generatedPrompt, ContentType.Imagen)}
                                    className="w-full flex items-center justify-center bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors text-sm shadow-lg"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    ✨ Usar en Creador de Prompts (Imagen)
                                </button>

                                {/* Secondary options */}
                                <div className="flex gap-2">
                                    <button onClick={() => onUseInCreator(generatedPrompt, ContentType.Texto)} className="flex-1 flex items-center justify-center bg-gray-600 text-white font-semibold py-2 px-3 rounded-lg hover:bg-gray-700 transition-colors text-xs">Texto</button>
                                    <button onClick={() => onUseInCreator(generatedPrompt, ContentType.Video)} className="flex-1 flex items-center justify-center bg-gray-600 text-white font-semibold py-2 px-3 rounded-lg hover:bg-gray-700 transition-colors text-xs">Video</button>
                                </div>
                                <div>
                                    <button
                                        onClick={handleDownloadPDF}
                                        disabled={isDownloadingPDF}
                                        className="w-full flex items-center justify-center bg-gray-200 text-gray-800 font-bold py-2 px-3 rounded-lg hover:bg-gray-300 transition-colors text-xs disabled:opacity-50"
                                    >
                                        {isDownloadingPDF ? 'Descargando PDF...' : 'Descargar Reporte PDF'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </div>
    );
};
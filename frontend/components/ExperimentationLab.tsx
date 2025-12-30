import React, { useState, useMemo, useRef } from 'react';
import { FormTextarea, FormSelect } from './form/FormControls';
import { CLASSIFIED_VIDEO_PRESETS, ALL_VIDEO_PRESETS } from '../data/videoPresets';
// FIX: Changed import of 'VideoPreset' from '../data/videoPresets' to '../types' to resolve export errors.
import type { VideoPreset, DirectorAnalysis } from '../types';
import { generateAcademyDemonstration } from '../services/geminiService';

// FIX: Removed redundant global declarations for 'html2canvas' and 'window.jspdf' which are already centralized in types.ts.

const IndexBadge: React.FC<{ index: number }> = ({ index }) => {
  const colorClasses = index > 0 ? 'bg-green-100 text-green-800 border-green-200'
                     : index < 0 ? 'bg-red-100 text-red-800 border-red-200'
                     : 'bg-gray-100 text-gray-800 border-gray-200';
  const sign = index > 0 ? '+' : '';
  
  return (
    <span className={`font-bold text-lg px-3 py-1 rounded-md border ${colorClasses}`}>
      {sign}{index}
    </span>
  );
};

const componentIcons: Record<string, React.ReactNode> = {
  'Cohesión Estilística (FCN)': (
    <div className="bg-blue-100 p-3 rounded-full">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <title>Cohesión Estilística</title>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    </div>
  ),
  'Impacto Emocional (FCN)': (
    <div className="bg-blue-100 p-3 rounded-full">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <title>Impacto Emocional</title>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    </div>
  ),
  'Complejidad y Originalidad': (
    <div className="bg-blue-100 p-3 rounded-full">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <title>Complejidad y Originalidad</title>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    </div>
  ),
};

const getIconForComponent = (componentName: string) => {
    if (componentName.includes('Cohesión')) return componentIcons['Cohesión Estilística (FCN)'];
    if (componentName.includes('Impacto')) return componentIcons['Impacto Emocional (FCN)'];
    if (componentName.includes('Complejidad')) return componentIcons['Complejidad y Originalidad'];
    return null;
}

interface ExperimentationLabProps {
  action: string;
  onActionChange: (value: string) => void;
}


export const ExperimentationLab: React.FC<ExperimentationLabProps> = ({ action, onActionChange }) => {
  const [technique, setTechnique] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [demonstration, setDemonstration] = useState<DirectorAnalysis | null>(null);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const analysisRef = useRef<HTMLDivElement>(null);

  const cameraTechniques = useMemo(() => {
    const category = CLASSIFIED_VIDEO_PRESETS.find(c => c.category === "Lenguaje de la Cámara (Movimientos y Ángulos)");
    return category ? category.presets : [];
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!action || !technique) {
      setError('Por favor, describe una acción y selecciona una técnica.');
      return;
    }
    setError('');
    setIsLoading(true);
    setDemonstration(null);

    try {
      const selectedPreset = ALL_VIDEO_PRESETS.find(p => p.preset_name === technique);
      if (!selectedPreset) throw new Error('Preset no encontrado.');
      
      const result = await generateAcademyDemonstration(action, selectedPreset);
      setDemonstration(result);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownloadPDF = async () => {
    if (!analysisRef.current) return;
    if (typeof (window as any).html2canvas === 'undefined' || typeof (window as any).jspdf === 'undefined') {
        setError("Las librerías para generar PDF no se cargaron correctamente. Comprueba tu conexión a internet y refresca la página.");
        return;
    }
    const { jsPDF } = window.jspdf;
    
    setIsDownloadingPDF(true);
    setError('');

    try {
        // FIX: Use window.html2canvas as it's defined on the global window object.
        const canvas = await window.html2canvas(analysisRef.current, {
            scale: 2, // Aumentar la escala para mejor resolución
            useCORS: true,
            backgroundColor: '#ffffff',
        });
        
        const imgData = canvas.toDataURL('image/png', 1.0);
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / pdfWidth;
        const scaledCanvasHeight = canvasHeight / ratio;
        
        let heightLeft = scaledCanvasHeight;
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledCanvasHeight);
        heightLeft -= pdfHeight;
        
        while (heightLeft > 0) {
            position = -pdfHeight * (pdf.internal.getNumberOfPages());
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledCanvasHeight);
            heightLeft -= pdfHeight;
        }
        
        pdf.save('Analisis_de_Director.pdf');
    } catch (e) {
        console.error("Error al generar PDF:", e);
        setError("No se pudo generar el PDF. Por favor, inténtalo de nuevo.");
    } finally {
        setIsDownloadingPDF(false);
    }
  };

  const [isCopied, setIsCopied] = useState(false);
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <section>
      <div className="p-8 bg-gray-50 rounded-xl border-2 border-gray-200 shadow-sm">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Laboratorio de Experimentación</h3>
        <p className="text-md text-gray-600 mb-8">Combina una acción con una técnica cinematográfica y recibe un análisis de dirección instantáneo de la IA.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormTextarea
            label="1. Describe una Acción o Escena Base"
            id="action"
            name="action"
            rows={2}
            value={action}
            onChange={(e) => onActionChange(e.target.value)}
            placeholder="Ej: Un momento íntimo donde una mujer ofrece ayuda y ternura al tomar la mano de un hombre."
            required
          />
          <FormSelect
            label="2. Elige una Técnica Cinematográfica a Aplicar"
            id="technique"
            name="technique"
            value={technique}
            onChange={(e) => setTechnique(e.target.value)}
            required
          >
            <option value="">Selecciona un movimiento o ángulo...</option>
            {cameraTechniques.map(preset => (
              <option key={preset.preset_name} value={preset.preset_name}>{preset.preset_name}</option>
            ))}
          </FormSelect>
          <button
            type="submit"
            disabled={isLoading || !action || !technique}
            className="w-full flex justify-center items-center bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? 'Analizando...' : 'Generar Análisis de Director'}
          </button>
        </form>
      </div>

      <div className="mt-8">
        {error && <div className="p-4 bg-red-100 text-red-800 border-l-4 border-red-500 rounded-r-lg" role="alert"><p>{error}</p></div>}

        {isLoading && (
            <div className="text-center p-8">
                <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <p className="mt-4 text-gray-600 font-semibold">Consultando a la Academia de IA...</p>
            </div>
        )}

        {demonstration && (
           <div className="p-4 animate-fade-in">
              <div ref={analysisRef}>
                <div className="space-y-8 p-4 bg-white">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-gray-800">Análisis de Director Revisado</h3>
                     <button
                        onClick={handleDownloadPDF}
                        disabled={isDownloadingPDF}
                        className="flex items-center bg-gray-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-900 transition-colors text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {isDownloadingPDF ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Preparando PDF...
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            Descargar PDF
                          </>
                        )}
                      </button>
                  </div>
              
                  {/* Escena Analizada */}
                  <div className="bg-white p-6 rounded-lg border shadow-sm">
                      <h4 className="text-lg font-bold text-gray-800 mb-4">Escena Analizada</h4>
                      <ul className="space-y-3 text-gray-700">
                        <li className="flex items-start">
                            <strong className="w-48 flex-shrink-0">Descripción Inicial:</strong> 
                            <span>{(demonstration.analyzedScene && demonstration.analyzedScene.baseDescription) ? demonstration.analyzedScene.baseDescription : 'N/A'}</span>
                        </li>
                        <li className="flex items-start">
                            <strong className="w-48 flex-shrink-0">Técnica Aplicada:</strong> 
                            <span>{(demonstration.analyzedScene && demonstration.analyzedScene.appliedTechnique) ? demonstration.analyzedScene.appliedTechnique : 'N/A'}</span>
                        </li>
                        <li className="flex items-start">
                            <strong className="w-48 flex-shrink-0">Propósito Técnico:</strong> 
                            <span className="italic">"{(demonstration.analyzedScene && demonstration.analyzedScene.techniqueDescription) ? demonstration.analyzedScene.techniqueDescription : 'N/A'}"</span>
                        </li>
                      </ul>
                  </div>
                  
                  {/* Análisis Detallado */}
                   <div className="bg-white p-6 rounded-lg border shadow-sm">
                        <h4 className="text-lg font-bold text-gray-800 mb-6">Análisis Detallado del Impacto Cinematográfico</h4>
                        <div className="space-y-6">
                            {(demonstration.impactAnalysis && demonstration.impactAnalysis.components && Array.isArray(demonstration.impactAnalysis.components)) ? demonstration.impactAnalysis.components.map((item, index) => (
                              <div key={index} className="flex items-start gap-5 p-4 rounded-md bg-gray-50/50">
                                  <div className="flex-shrink-0 pt-1">
                                      {getIconForComponent(item.component)}
                                  </div>
                                  <div className="flex-1">
                                      <h5 className="font-bold text-gray-900">{item.component}</h5>
                                      <p className="text-sm text-gray-600 mt-1">{item.criterion}</p>
                                      <blockquote className="mt-3 pl-4 border-l-4 border-gray-200">
                                          <p className="text-sm text-gray-800 italic">{item.result}</p>
                                      </blockquote>
                                  </div>
                                  <div className="flex-shrink-0">
                                      <IndexBadge index={item.professionalismIndex} />
                                  </div>
                              </div>
                            )) : <p className="text-gray-500 italic">No hay detalles de impacto disponibles.</p>}
                        </div>
                        <div className="mt-8 pt-6 border-t flex justify-between items-center">
                            <div>
                                <h5 className="font-bold text-lg text-gray-900">Índice Compuesto Final</h5>
                                <p className="text-sm text-gray-600 mt-1">{(demonstration.impactAnalysis && demonstration.impactAnalysis.finalCompositeIndex) ? demonstration.impactAnalysis.finalCompositeIndex.result : 'N/A'}</p>
                            </div>
                            <IndexBadge index={(demonstration.impactAnalysis && demonstration.impactAnalysis.finalCompositeIndex) ? demonstration.impactAnalysis.finalCompositeIndex.professionalismIndex : 0} />
                        </div>
                    </div>

                  {/* Juicio del Director */}
                  <div className="bg-white p-6 rounded-lg border shadow-sm">
                      <h4 className="text-lg font-bold text-gray-800 mb-4">Juicio del Director (Índice Final: <IndexBadge index={(demonstration.directorsJudgment) ? demonstration.directorsJudgment.finalIndex : 0} />)</h4>
                      <div className="space-y-4 text-gray-700">
                          <p><strong>El Valor Agregado:</strong> {(demonstration.directorsJudgment) ? demonstration.directorsJudgment.addedValue : 'N/A'}</p>
                          <p><strong>El Riesgo (Punto Negativo):</strong> {(demonstration.directorsJudgment) ? demonstration.directorsJudgment.risk : 'N/A'}</p>
                      </div>
                  </div>
                  
                   {/* Conclusión de la Academia */}
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                      <h4 className="text-lg font-bold text-blue-900 mb-4">Conclusión de la Academia</h4>
                      <div className="space-y-2 text-blue-800">
                        <p><strong>Técnica:</strong> {(demonstration.academyConclusion) ? demonstration.academyConclusion.techniqueLevel : 'N/A'}</p>
                        <p><strong>Análisis:</strong> {(demonstration.academyConclusion) ? demonstration.academyConclusion.analysisSummary : 'N/A'}</p>
                        <p><strong>Recomendación:</strong> {(demonstration.academyConclusion) ? demonstration.academyConclusion.recommendation : 'N/A'}</p>
                      </div>
                  </div>

                 {/* Prompt Cinematográfico */}
                 <div>
                    <h4 className="text-xl font-bold text-gray-800 mb-4">Prompt Cinematográfico Generado</h4>
                    <div className="relative p-6 bg-gray-800 text-gray-100 rounded-lg shadow-inner">
                        <pre className="whitespace-pre-wrap text-base leading-relaxed font-mono">{demonstration.cinematicPrompt}</pre>
                         <button onClick={() => handleCopy(demonstration.cinematicPrompt)} className="absolute top-4 right-4 flex items-center bg-green-500 text-white font-bold py-2 px-3 rounded-lg hover:bg-green-600 transition-colors text-xs">
                            {isCopied ? '¡Copiado!' : 'Copiar Prompt'}
                        </button>
                    </div>
                 </div>
                </div>
              </div>
           </div>
        )}
      </div>
       <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
      `}</style>
    </section>
  );
};
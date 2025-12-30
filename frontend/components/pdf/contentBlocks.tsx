import React from 'react';
import type { FormData, GenerationHistory, NarrativeConsistencyFeedback } from '../../types';

const parsePromptData = (jsonString: string) => {
    try {
        const data = JSON.parse(jsonString);
        if (Array.isArray(data)) {
            const firstPrompt = data[0];
            return {
                refined_prompt: firstPrompt?.refined_prompt || '',
                technical_details: {},
            };
        }
        return {
            refined_prompt: data.refined_prompt || '',
            technical_details: data.technical_details || {},
        };
    } catch (e) {
        return {
            refined_prompt: jsonString,
            technical_details: {},
        };
    }
};

// Helper function to merge default classes with optional className prop
const mergeClasses = (defaultClasses: string, className?: string): string => {
    return [defaultClasses, className].filter(Boolean).join(' ');
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;
    return (
        <div className="mb-5 break-inside-avoid">
            <h4 className="font-semibold text-sm text-gray-500 uppercase tracking-wider">{label}</h4>
            <div className="text-gray-800 mt-1 text-base">{value}</div>
        </div>
    );
};

export const ImageBlock: React.FC<{ imageUrl: string; className?: string }> = ({ imageUrl, className }) => (
    <div className={mergeClasses('h-[500px] bg-cover bg-center bg-gray-200', className)} style={{ backgroundImage: `url(${imageUrl})` }}></div>
);

export const DataBlock: React.FC<{ formData: FormData; className?: string }> = ({ formData, className }) => {
    const imageSpecifics = formData.specifics.Imagen;
    const { technical_details } = parsePromptData('');

    return (
      <div className={mergeClasses('space-y-6', className)}>
          <div className="p-4 border-b">
              <DetailItem label="OBJETIVO" value={formData.objective} />
          </div>
          <div className="grid grid-cols-2 gap-x-12 pt-2">
              <div>
                  <DetailItem label="TONO" value={formData.tone} />
                  <DetailItem label="ESTILO(S)" value={Array.isArray(imageSpecifics?.style) ? imageSpecifics.style.join(', ') : imageSpecifics?.style} />
                  <DetailItem label="ELEMENTOS CLAVE" value={imageSpecifics?.elements} />
              </div>
              <div>
                  <DetailItem label="TIPO DE PLANO" value={imageSpecifics?.shotType} />
                  <DetailItem label="ILUMINACIÓN" value={imageSpecifics?.lighting} />
                  <DetailItem label="LENTE Y APERTURA (IA)" value={technical_details.lens_and_aperture} />
              </div>
          </div>
           {formData.restrictions && (
              <div className="pt-4 border-t">
                   <DetailItem label="RESTRICCIONES" value={formData.restrictions} />
              </div>
          )}
      </div>
    );
};

export const FcnBlock: React.FC<{ feedback: NarrativeConsistencyFeedback | null; className?: string }> = ({ feedback, className }) => {
    if (!feedback) return null;
    const renderScore = (score: number) => {
        const color = score > 3 ? 'text-green-600' : score < -3 ? 'text-red-600' : 'text-yellow-600';
        return <span className={`font-bold ${color}`}>{score > 0 ? '+' : ''}{score}</span>;
    };
    return (
        <div className={mergeClasses('mt-4 p-6 bg-gray-50 rounded-lg border', className)}>
             <h3 className="text-lg font-bold text-blue-700 mb-4">Análisis de Consistencia (FCN)</h3>
             <DetailItem label="COHESIÓN ESTILÍSTICA" value={<><span className="font-mono text-lg mr-2">[{renderScore(feedback.stylisticCohesion.score)}]</span> {feedback.stylisticCohesion.analysis}</>} />
             <div className="mb-0">
                <DetailItem label="INTENSIDAD EMOCIONAL" value={<><span className="font-mono text-lg mr-2">[{renderScore(feedback.emotionalIntensity.score)}]</span> {feedback.emotionalIntensity.analysis}</>} />
             </div>
        </div>
    );
};

export const VideoBlock: React.FC<{ videoUrl?: string; className?: string }> = ({ videoUrl, className }) => (
    <div className={mergeClasses('h-[500px] bg-black flex items-center justify-center', className)}>
        {videoUrl ? (
            <video src={videoUrl} controls className="w-full h-full object-contain"></video>
        ) : (
            <div className="text-gray-400">No video available</div>
        )}
    </div>
);

export const CodeBlock: React.FC<{ prompt: string; className?: string }> = ({ prompt, className }) => (
    <pre className={mergeClasses('text-base bg-code-block p-6 rounded-lg whitespace-pre-wrap font-consolas leading-relaxed border', className)}>{prompt}</pre>
);

export const TitleBlock: React.FC<{ title: string; className?: string }> = ({ title, className }) => (
    <h3 className={mergeClasses('text-2xl font-bold text-gray-800', className)}>{title}</h3>
);

export const HistoryBlock: React.FC<{ history: GenerationHistory | null; className?: string }> = ({ history, className }) => {
    if (!history) {
        return (
            <div className={mergeClasses('p-4 bg-purple-50 rounded-lg border border-purple-200', className)}>
                <p className="text-sm text-purple-700">No generation history available.</p>
            </div>
        );
    }

    return (
        <div className={mergeClasses('p-6 bg-purple-50 rounded-lg border border-purple-200', className)}>
            <h3 className="text-lg font-bold text-purple-800 mb-4">Generation History</h3>
            <div className="space-y-3 text-sm">
                <div>
                    <h4 className="font-semibold text-purple-700">Applied Solution:</h4>
                    <p className="text-gray-800">{history.appliedSolution.correctionType} by {history.appliedSolution.agent}</p>
                    <p className="text-gray-600 italic mt-1">"{history.appliedSolution.description}"</p>
                </div>
            </div>
        </div>
    );
};

export const TextBlock: React.FC<{ content: string; className?: string }> = ({ content, className }) => (
    <div className={mergeClasses('text-base leading-relaxed space-y-4', className)} style={{ color: 'var(--body-text-color)' }}>
      {content.split('\n').filter(p => p.trim() !== '').map((paragraph, index) => (
        <p key={index} className="mb-4">{paragraph}</p>
      ))}
    </div>
  );
  
const TextDetailItem: React.FC<{ label: string; value?: string }> = ({ label, value }) => {
    if (!value || value.trim() === '') return null;
    return (
        <div className="mb-3 break-inside-avoid">
            <h5 className="font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--secondary-color)' }}>{label}</h5>
            <p className="mt-1 text-sm" style={{ color: 'var(--primary-color)' }}>{value}</p>
        </div>
    );
};
  
export const TextDataBlock: React.FC<{ formData: FormData; className?: string }> = ({ formData, className }) => {
    const specifics = formData.specifics.Texto;
    return (
        <div className={mergeClasses('p-6 rounded-lg border', className)} style={{ backgroundColor: 'var(--subtle-bg-color)', borderColor: 'var(--accent-color)' }}>
            <div className="grid grid-cols-1 gap-y-4">
                <TextDetailItem label="Tono" value={formData.tone} />
                <TextDetailItem label="Público Objetivo" value={specifics?.audience} />
                <TextDetailItem label="Tipo de Texto" value={specifics?.type} />
                <TextDetailItem label="Punto de Conflicto (Hook)" value={specifics?.conflictPoint} />
                <TextDetailItem label="Propuesta de Valor (Solución)" value={specifics?.uvp} />
                <TextDetailItem label="Llamada a la Acción (CTA)" value={specifics?.cta} />
                <TextDetailItem label="Audiencia de Traducción" value={specifics?.translationAudience} />
                <TextDetailItem label="Datos Crudos a Simplificar" value={specifics?.rawData} />
                <TextDetailItem label="Restricciones" value={formData.restrictions} />
            </div>
        </div>
    );
};
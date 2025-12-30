import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ContentTypeSelector } from '../ContentTypeSelector';
import { GlobalControls } from '../form/GlobalControls';
import { SpecificFields } from '../form/SpecificFields';
import { NarrativeFeedbackDisplay } from '../NarrativeFeedbackDisplay';
import AgentSolutionDisplay from '../AgentSolutionDisplay';
import TextualFeedbackDisplay from '../TextualFeedbackDisplay';
import SuperAgentControl from '../SuperAgentControl';
import TaskModal from '../TaskModal';
import { TONES } from '../../constants';
import {
  generateEnhancedPrompt,
  generateImages,
  generateNarrativeConsistencyFeedback,
  generateTextualCoherenceFeedback,
  generateAgentSolutions,
  validateGeoContext,
  analyzeInspirationWall,
  analyzeSceneForSuggestions
} from '../../services/geminiService';
import PDFPreviewModal from '../PDFPreviewModal';
import { Accordion } from '../form/Accordion';
import InspirationWall from '../InspirationWall';
import { FormSelect } from '../form/FormControls';
import { PRESETS } from '../../data/presets';
import type { View } from '../../types';
import { Tutorial } from '../Tutorial';
import type { TutorialStep } from '../Tutorial';
// FIX: Added import for useTranslations hook.
import { useTranslations } from '../../contexts/LanguageContext';


import { ContentType } from '../../types';
import type { FormData, NarrativeConsistencyFeedback, TextualNarrativeCoherence, AgentSolution, GeoContextualData, MapClickPayload, Task, StyleDefinition, AudiovisualScene, SubTask } from '../../types';

// FIX: Removed redundant global window declaration as it is now centralized in types.ts.
/*
declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
  }
}
*/

const initialFormData: FormData = {
  objective: '',
  tone: TONES[0],
  restrictions: '',
  outputLanguage: 'Español',
  location: '',
  contextualLanguage: '',
  keyVisualReference: '',
  activeAgents: ['Crítico de Arte', 'Curator'],
  specifics: {
    [ContentType.Texto]: {},
    [ContentType.Imagen]: { style: [], aspectRatio: '1:1', numberOfImages: 2, variety: 50, stylization: 50, rarity: 50 },
    // FIX: The `videoCreationMode` property was incorrectly set to 'manual'. It has been corrected to 'text-to-video' to align with the allowed types.
    [ContentType.Video]: { videoCreationMode: 'text-to-video', artisticStyle: [] },
    // FIX: Added readingSpeed to the initial form data for the Audio content type to align with the type definition.
    [ContentType.Audio]: { readingSpeed: 50 },
    [ContentType.Codigo]: { scriptType: 'vrc' },
  },
};

interface CreatorProps {
    initialData?: Partial<FormData> | null;
    onSaveTask: (task: Task) => void;
    allStyles: StyleDefinition[];
    onAddStyle: (newStyle: StyleDefinition) => void;
    creativeContext: any | null;
    onPromptGenerated: (context: any, promptText: string) => void;
    knowledgeSources: { name: string; content: string }[];
    setView: (view: View) => void;
}

// Helper function to convert file to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                // Return only the base64 part
                resolve(reader.result.split(',')[1]);
            } else {
                reject(new Error("Failed to convert blob to base64 string."));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

export const Creator: React.FC<CreatorProps> = ({ initialData, onSaveTask, allStyles, onAddStyle, creativeContext, onPromptGenerated, knowledgeSources, setView }) => {
  const { t } = useTranslations();
  const [contentType, setContentType] = useState<ContentType>(ContentType.Texto);
  const [formData, setFormData] = useState<FormData>({ ...initialFormData });
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string,string>>({});
  const [fcnFeedback, setFcnFeedback] = useState<NarrativeConsistencyFeedback | null>(null);
  const [cntFeedback, setCntFeedback] = useState<TextualNarrativeCoherence | null>(null);
  const [agentSolutions, setAgentSolutions] = useState<AgentSolution[] | null>(null);
  const [vgcData, setVgcData] = useState<GeoContextualData | null>(null);
  const [isVgcLoading, setIsVgcLoading] = useState(false);
  const [vgcError, setVgcError] = useState('');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [imageError, setImageError] = useState('');
  const [isPromptCopied, setIsPromptCopied] = useState(false);
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [hasSubmittedOnce, setHasSubmittedOnce] = useState(false);
  const [receivedContext, setReceivedContext] = useState<any | null>(null);
  const [inspirationAnalysisLoading, setInspirationAnalysisLoading] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const [showSahButton, setShowSahButton] = useState(false);

  const tutorialSteps: TutorialStep[] = [
    { targetId: 'tutorial-step-1', title: 'Paso 1: Selecciona el Contenido', content: 'Empieza eligiendo qué tipo de contenido quieres crear. Cada opción te mostrará campos específicos para refinar tu idea.', position: 'bottom' },
    { targetId: 'tutorial-step-2', title: 'Paso 2: Define tu Objetivo Principal', content: 'Este es el corazón de tu prompt. Describe aquí la idea, escena o concepto principal de la forma más clara posible.', position: 'bottom' },
    { targetId: 'tutorial-step-3', title: 'Paso 3: Añade Detalles Específicos', content: 'Aquí es donde ocurre la magia. Rellena estos campos para dar a la IA todos los detalles que necesita, desde el estilo visual y la composición hasta la narrativa y el público objetivo.', position: 'top' },
    { targetId: 'tutorial-step-4', title: 'Paso 4: Activa los Agentes de IA (SAH)', content: 'Si tu idea es compleja, activa los agentes. El "Super-Agente Híbrido" analizará la coherencia de tu prompt y te dará soluciones proactivas si encuentra conflictos.', position: 'top' },
    { targetId: 'tutorial-step-5', title: 'Paso 5: Genera el Prompt', content: 'Una vez que estés listo, haz clic aquí. La IA tomará toda tu información y la sintetizará en un prompt de alta calidad.', position: 'top' },
    { targetId: 'tutorial-step-6', title: 'Paso 6: Revisa el Feedback', content: 'Después de generar, la IA te dará un análisis de coherencia (FCN/CNT). Una puntuación baja indica que tu idea podría tener conflictos. ¡Es aquí donde los agentes SAH te ayudarán!', position: 'top' },
    { targetId: 'tutorial-step-7', title: 'Paso 7: Usa tu Prompt', content: '¡Aquí está tu resultado! Este es el prompt refinado y optimizado, listo para ser copiado y usado en tu plataforma de IA generativa favorita.', position: 'top' },
    { targetId: '', title: '¡Todo Listo!', content: 'Has completado la guía. Ahora estás listo para crear prompts de nivel profesional. ¡Experimenta y diviértete!', position: 'bottom' }
  ];
  
  const handleFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | { target: { name: string, value: any, type?: string, checked?: boolean } }) => {
    const { name, value, type } = e.target;
    
    if (name === 'activeAgents' && type === 'checkbox' && 'checked' in e.target) {
        const checked = e.target.checked;
        setFormData(prev => ({
            ...prev,
            activeAgents: checked
                ? [...prev.activeAgents, value]
                : prev.activeAgents.filter(agent => agent !== value),
        }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  }, []);
  
  const handleSpecificsChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | { target: { name: string, value: any, type?: string, checked?: boolean } }) => {
      const { name, value, type } = e.target;
      const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

      if (target.nodeName === 'SELECT' && 'multiple' in target && target.multiple) {
          const selectedOptions = Array.from((target as HTMLSelectElement).selectedOptions).map(option => option.value);
          setFormData(prev => ({
              ...prev,
              specifics: {
                  ...prev.specifics,
                  [contentType]: {
                      ...prev.specifics[contentType],
                      [name]: selectedOptions,
                  },
              },
          }));
          return;
      }

      const finalValue = type === 'checkbox' && 'checked' in target ? target.checked : value;

      setFormData(prev => ({
          ...prev,
          specifics: {
              ...prev.specifics,
              [contentType]: {
                  ...prev.specifics[contentType],
                  [name]: finalValue,
              },
          },
      }));
  }, [contentType]);
  
  return (
    <>
      {isTutorialActive && <Tutorial steps={tutorialSteps} onClose={() => setIsTutorialActive(false)} />}
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <header className="text-center mb-10 flex justify-between items-center">
            <div className="w-48"></div> {/* Spacer */}
            <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-900">Creador de Prompt</h2>
                <p className="mt-2 text-md text-gray-600">
                    Selecciona un tipo de contenido, define tus objetivos y deja que la IA te ayude a construir el prompt perfecto.
                </p>
            </div>
            <div className="w-48 flex justify-end">
                <button
                    onClick={() => setIsTutorialActive(true)}
                    className="bg-blue-100 text-blue-700 font-semibold py-2 px-4 rounded-lg hover:bg-blue-200 transition-colors flex items-center"
                    title="Iniciar tutorial"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Guía Interactiva
                </button>
            </div>
        </header>

        {isTaskModalOpen && <TaskModal onClose={() => setIsTaskModalOpen(false)} onSave={() => {}} />}

        <main>
          {/* Form content placeholder */}
        </main>
    </div>
    </>
  );
};
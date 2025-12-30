
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ContentTypeSelector } from '../ContentTypeSelector';
import { SpecificFields } from '../form/SpecificFields';
import { NarrativeFeedbackDisplay } from '../NarrativeFeedbackDisplay';
import AgentSolutionDisplay from '../AgentSolutionDisplay';
import TextualFeedbackDisplay from '../TextualFeedbackDisplay';
import SuperAgentControl from '../SuperAgentControl';
import TaskModal from '../TaskModal';
import { FormTextarea } from '../form/FormControls';
import {
    generateEnhancedPrompt,
    generateImages,
    generateNarrativeConsistencyFeedback,
    generateTextualCoherenceFeedback,
    generateAgentSolutions,
} from '../../services/geminiService';
import { useTranslations } from '../../contexts/LanguageContext';
import { ContentType } from '../../types';
import type { FormData, NarrativeConsistencyFeedback, TextualNarrativeCoherence, AgentSolution, Task, StyleDefinition, View, ChronosState, STOState } from '../../types';
import ScientificAppendixModal from '../ScientificAppendixModal';
import PDFPreviewModal from '../PDFPreviewModal';
import { PRESETS } from '../../data/presets';

const initialFormData: FormData = {
    objective: '',
    tone: 'Profesional',
    restrictions: '',
    activeAgents: ['Crítico de Arte', 'Curator'],
    specifics: {
        [ContentType.Texto]: {},
        [ContentType.Imagen]: { style: [], aspectRatio: '1:1', numberOfImages: 1, variety: 50, stylization: 50, rarity: 50 },
        [ContentType.Video]: { videoCreationMode: 'text-to-video', artisticStyle: [], videoWorkflow: 'manual', audiovisualSequence: [] },
        [ContentType.Audio]: { scriptFormat: 'monologue', readingSpeed: 50 },
        [ContentType.Codigo]: { scriptType: 'vrc' },
    },
};

export interface CreatorProps {
    initialData?: Partial<FormData> | null;
    initialContentType?: ContentType;
    onDataConsumed?: () => void;
    onSaveTask: (task: Task) => void;
    allStyles: StyleDefinition[];
    onAddStyle: (newStyle: StyleDefinition) => void;
    creativeContext: any | null;
    onPromptGenerated: (context: any, promptText: string) => void;
    knowledgeSources: { name: string; content: string }[];
    setView: (view: View) => void;
    chronosState: ChronosState;
    stoState: STOState;
}

export const Creator: React.FC<CreatorProps> = ({
    onSaveTask,
    allStyles,
    onAddStyle,
    knowledgeSources,
    setView,
    initialData,
    initialContentType,
    onDataConsumed
}) => {
    const { t } = useTranslations();
    const [contentType, setContentType] = useState<ContentType>(initialContentType || ContentType.Texto);
    const [formData, setFormData] = useState<FormData>({ ...initialFormData });

    // Workflow states
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisDone, setAnalysisDone] = useState(false);
    const [showSahButton, setShowSahButton] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [inspirationAnalysisLoading, setInspirationAnalysisLoading] = useState(false);

    // Data states
    const [fcnFeedback, setFcnFeedback] = useState<NarrativeConsistencyFeedback | null>(null);
    const [cntFeedback, setCntFeedback] = useState<TextualNarrativeCoherence | null>(null);
    const [agentSolutions, setAgentSolutions] = useState<AgentSolution[] | null>(null);
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);

    // UI states
    const [error, setError] = useState('');
    const [isAppendixOpen, setIsAppendixOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);


    useEffect(() => {
        if (initialData) {
            // Start with a deep copy of the default form data
            const newFormData = JSON.parse(JSON.stringify(initialFormData));

            // Merge top-level properties from initialData
            for (const key in initialData) {
                if (key !== 'specifics' && Object.prototype.hasOwnProperty.call(initialData, key)) {
                    const val = (initialData as any)[key];
                    if (val !== undefined && val !== null) {
                        (newFormData as any)[key] = val;
                    }
                }
            }

            // Deep merge the 'specifics' object property by property
            if (initialData.specifics) {
                for (const contentTypeKey in initialData.specifics) {
                    const key = contentTypeKey as ContentType;
                    if (!newFormData.specifics[key]) {
                        newFormData.specifics[key] = {};
                    }
                    Object.assign(newFormData.specifics[key], (initialData.specifics as any)[key]);
                }
            }

            setFormData(newFormData);

            if (initialContentType) {
                setContentType(initialContentType);
            }
            if (onDataConsumed) {
                onDataConsumed();
            }
        }
        // Removed the else block that reset form data.
    }, [initialData, initialContentType, onDataConsumed]);

    const handleContentTypeChange = (type: ContentType) => {
        setContentType(type);
        setFormData(prev => ({
            ...initialFormData, // Reset to defaults
            objective: prev.objective, // Keep the main objective
        }));
        // Reset workflow
        setAnalysisDone(false);
        setShowSahButton(false);
        setAgentSolutions(null);
        setFcnFeedback(null);
        setCntFeedback(null);
        setError('');
        setGeneratedPrompt('');
        setGeneratedImages([]);
    };

    const handleFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | { target: { name: string; value: any; type?: string; checked?: boolean; } }) => {
        const { name, value, type } = e.target as HTMLInputElement;

        if (name === 'activeAgents' && type === 'checkbox' && 'checked' in e.target) {
            const checked = (e.target as HTMLInputElement).checked;
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

    const handleSpecificsChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | { target: { name: string; value: any; type?: string; checked?: boolean; } }) => {
        const { name, value, type } = e.target as HTMLInputElement;
        const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

        let finalValue: any;
        if (target.nodeName === 'SELECT' && 'multiple' in target && (target as HTMLSelectElement).multiple) {
            finalValue = Array.from((target as HTMLSelectElement).selectedOptions).map(option => option.value);
        } else {
            finalValue = type === 'checkbox' && 'checked' in target ? (target as HTMLInputElement).checked : value;
        }

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

    const handleApplyPreset = useCallback((presetName: string) => {
        if (!presetName) return;
        const preset = PRESETS.find(p => p.name === presetName);
        if (preset) {
            setFormData(prev => {
                const nextState = { ...prev };
                const { specifics: presetSpecifics, ...topLevelPresetData } = preset.data;
                Object.assign(nextState, topLevelPresetData);
                nextState.specifics = { ...prev.specifics };

                if (presetSpecifics) {
                    for (const key of Object.keys(presetSpecifics)) {
                        const contentTypeKey = key as ContentType;
                        nextState.specifics[contentTypeKey] = {
                            ...(prev.specifics[contentTypeKey] || {}),
                            ...presetSpecifics[contentTypeKey]
                        };
                    }
                }

                nextState.specifics[ContentType.Texto] = {
                    ...(nextState.specifics[ContentType.Texto] || {}),
                    narrativeCatalyst: presetName
                };

                return nextState;
            });
        }
    }, []);

    const handleAnalysis = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setGeneratedPrompt(''); setGeneratedImages([]); setFcnFeedback(null); setCntFeedback(null);
        setAgentSolutions(null); setError(''); setAnalysisDone(false); setShowSahButton(false);
        setIsAnalyzing(true);

        try {
            console.log('🔍 DEBUG [TOOLS] - formData.objective:', formData.objective);
            console.log('🔍 DEBUG [TOOLS] - objective type:', typeof formData.objective);
            console.log('🔍 DEBUG [TOOLS] - objective length:', formData.objective?.length);
            // FIX: Added optional chaining and empty string fallback to prevent crash on null
            if (!formData.objective || !formData.objective.trim()) {
                console.error('❌ [TOOLS] Validation failed: objective is empty');
                throw new Error("El objetivo principal no puede estar vacío.");
            }

            const feedback = contentType === ContentType.Texto
                ? await generateTextualCoherenceFeedback(formData)
                : await generateNarrativeConsistencyFeedback(formData, contentType);

            let scores: number[] = [];
            if (contentType === ContentType.Texto && feedback) {
                const textualFeedback = feedback as TextualNarrativeCoherence;
                setCntFeedback(textualFeedback);
                scores = Object.values(textualFeedback).map(v => v.score);
            } else if (feedback) {
                const narrativeFeedback = feedback as NarrativeConsistencyFeedback;
                setFcnFeedback(narrativeFeedback);
                scores = Object.values(narrativeFeedback).map(v => v.score);
            }

            if (scores.some(s => s < 0) && formData.activeAgents.length > 0) {
                setShowSahButton(true);
            }
            setAnalysisDone(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocurrió un error durante el análisis.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleGetSolutions = async () => {
        setShowSahButton(false);
        setIsAnalyzing(true);
        setAgentSolutions(null);
        try {
            const feedback = cntFeedback || fcnFeedback;
            if (feedback) {
                const solutions = await generateAgentSolutions(formData, contentType, feedback, null);
                setAgentSolutions(solutions);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocurrió un error al obtener soluciones.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleApplySolution = useCallback((solution: AgentSolution) => {
        setFormData(prev => {
            const updatedSpecifics = { ...prev.specifics };
            if (solution.changes.specifics) {
                for (const typeKey in solution.changes.specifics) {
                    const key = typeKey as ContentType;
                    if (updatedSpecifics[key]) {
                        updatedSpecifics[key] = {
                            ...updatedSpecifics[key],
                            ...solution.changes.specifics[key],
                        };
                    }
                }
            }

            const nextState = {
                ...prev,
                ...solution.changes,
                specifics: updatedSpecifics,
            };
            return nextState;
        });

        setTimeout(() => {
            handleAnalysis();
        }, 100);
    }, []);

    const handleGeneration = async () => {
        setIsGenerating(true);
        setError('');
        setGeneratedImages([]);
        setGeneratedPrompt('');
        try {
            const prompt = await generateEnhancedPrompt(formData, contentType, null, {});
            setGeneratedPrompt(prompt);

            if (contentType === ContentType.Imagen) {
                const images = await generateImages(formData, prompt);
                setGeneratedImages(images);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocurrió un error durante la generación.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg">
            {isTaskModalOpen && <TaskModal onClose={() => setIsTaskModalOpen(false)} onSave={() => { }} />}
            {isAppendixOpen && <ScientificAppendixModal onClose={() => setIsAppendixOpen(false)} />}
            {isPdfPreviewOpen && <PDFPreviewModal onClose={() => setIsPdfPreviewOpen(false)} onDownload={() => { }} isDownloading={isDownloadingPdf} formData={formData} generatedPrompt={generatedPrompt} allStyles={allStyles} />}
            <header className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-900">{t('creator.title')}</h2>
                <p className="mt-2 text-md text-gray-600">{t('creator.subtitle')}</p>
            </header>

            <ContentTypeSelector selectedType={contentType} onSelectType={handleContentTypeChange} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <form onSubmit={handleAnalysis} className="space-y-6">
                    <FormTextarea label={t('creator.mainObjectiveLabel')} id="objective" name="objective" value={formData.objective || ''} onChange={handleFormChange} required rows={3} placeholder="Fábula de animales salvajes en la época victoriana" />
                    <SpecificFields
                        contentType={contentType}
                        formData={formData}
                        handleChange={handleSpecificsChange}
                        allStyles={allStyles}
                        onAddStyle={onAddStyle}
                        onReset={() => { }}
                        errors={{}}
                        onAnalyzeInspiration={() => { }}
                        inspirationAnalysisLoading={inspirationAnalysisLoading}
                        onAnalyzeInspirationForVideo={() => { }}
                        videoInspirationLoading={false}
                        onAnalyzeScript={() => { }}
                        onImageUpload={() => { }}
                        onAudioUpload={() => { }}
                        onMusicUpload={() => { }}
                        onDocumentUpload={() => { }}
                        onApplyAudioPreset={() => { }}
                        knowledgeSources={knowledgeSources}
                        setView={setView}
                        onApplyPreset={handleApplyPreset}
                        onOpenAppendix={() => setIsAppendixOpen(true)}
                    />
                    <SuperAgentControl activeAgents={formData.activeAgents} handleChange={handleFormChange} />
                    <div className="pt-4 border-t border-gray-200">
                        <button type="submit" disabled={isAnalyzing} className="w-full flex justify-center items-center bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400">
                            {isAnalyzing ? 'Analizando...' : 'Analizar Coherencia'}
                        </button>
                    </div>
                </form>

                <aside className="h-full">
                    <div className="sticky top-8 space-y-6">
                        <h3 className="text-xl font-bold text-gray-800">Análisis y Generación</h3>
                        {error && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}
                        {(isAnalyzing && !analysisDone) && (
                            <div className="h-full flex flex-col items-center justify-center text-center bg-gray-50 rounded-lg p-8 border-2 border-dashed">
                                <p className="mt-4 text-gray-500 font-semibold animate-pulse">Analizando...</p>
                            </div>
                        )}
                        {analysisDone && (
                            <div className="animate-fade-in space-y-4">
                                {fcnFeedback && <NarrativeFeedbackDisplay feedback={fcnFeedback} />}
                                {cntFeedback && <TextualFeedbackDisplay feedback={cntFeedback} />}
                                {showSahButton && (
                                    <button onClick={handleGetSolutions} className="w-full bg-yellow-500 text-black font-bold py-3 px-4 rounded-lg hover:bg-yellow-600">
                                        Resolver con Agentes SAH
                                    </button>
                                )}
                                <AgentSolutionDisplay solutions={agentSolutions || []} onApply={handleApplySolution} />
                            </div>
                        )}
                        {!analysisDone && !isAnalyzing && !error && (
                            <div className="h-full flex flex-col items-center justify-center text-center bg-gray-50 rounded-lg p-8 border-2 border-dashed">
                                <p className="mt-2 text-gray-500">Los resultados del análisis aparecerán aquí.</p>
                            </div>
                        )}
                        {generatedPrompt && (
                            <div className="mt-6 animate-fade-in">
                                <h4 className="font-bold mb-2">Prompt Generado</h4>
                                <pre className="text-sm bg-gray-800 text-white p-4 rounded-md whitespace-pre-wrap font-mono max-h-60 overflow-y-auto">{generatedPrompt}</pre>
                            </div>
                        )}
                        {generatedImages.length > 0 && (
                            <div className="mt-6 animate-fade-in">
                                <h4 className="font-bold mb-2">Imágenes Generadas</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    {generatedImages.map((imgData, i) => <img key={i} src={`data:image/jpeg;base64,${imgData}`} alt={`Generated image ${i + 1}`} className="rounded-lg" />)}
                                </div>
                            </div>
                        )}
                    </div>
                </aside>
            </div>

            {analysisDone && !showSahButton && (
                <div className="mt-12 pt-8 border-t-2 border-gray-200 text-center">
                    <button onClick={handleGeneration} disabled={isGenerating} className="w-full max-w-lg mx-auto flex justify-center items-center bg-green-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 text-lg">
                        {isGenerating ? 'Generando...' : 'Generar Contenido Final'}
                    </button>
                </div>
            )}
        </div>
    );
};

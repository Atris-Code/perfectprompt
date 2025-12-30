
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ContentTypeSelector } from './ContentTypeSelector';
import { SpecificFields } from './form/SpecificFields';
import { NarrativeFeedbackDisplay } from './NarrativeFeedbackDisplay';
import AgentSolutionDisplay from './AgentSolutionDisplay';
import TextualFeedbackDisplay from './TextualFeedbackDisplay';
import TaskModal from './TaskModal';
import { FormTextarea } from './form/FormControls';
import SuperAgentControl from './SuperAgentControl';
import {
    generateEnhancedPrompt,
    generateImages,
    generateNarrativeConsistencyFeedback,
    generateTextualCoherenceFeedback,
    generateAgentSolutions,
} from '../services/geminiService';
import { useTranslations } from '../contexts/LanguageContext';
import { ContentType } from '../types';
import type { FormData, NarrativeConsistencyFeedback, TextualNarrativeCoherence, AgentSolution, Task, StyleDefinition, View, ChronosState, STOState } from '../types';
import ScientificAppendixModal from './ScientificAppendixModal';
import PDFPreviewModal from './PDFPreviewModal';
import { TONES } from '../constants';
import { PRESETS } from '../data/presets';

const initialFormData: FormData = {
    objective: '',
    tone: 'Neutro',
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
    onDataConsumed,
    chronosState,
    stoState
}) => {
    const { t } = useTranslations();
    const [contentType, setContentType] = useState<ContentType>(initialContentType || ContentType.Texto);
    const [formData, setFormData] = useState<FormData>({ ...initialFormData });

    // Workflow states
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisDone, setAnalysisDone] = useState(false);
    const [showSahButton, setShowSahButton] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [hasGeneratedContent, setHasGeneratedContent] = useState(false);
    const [inspirationAnalysisLoading, setInspirationAnalysisLoading] = useState(false);

    // Data states
    const [fcnFeedback, setFcnFeedback] = useState<NarrativeConsistencyFeedback | null>(null);
    const [cntFeedback, setCntFeedback] = useState<TextualNarrativeCoherence | null>(null);
    const [agentSolutions, setAgentSolutions] = useState<AgentSolution[] | null>(null);
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [copiedToClipboard, setCopiedToClipboard] = useState(false);

    // UI states
    const [error, setError] = useState('');
    const [isAppendixOpen, setIsAppendixOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    const [appliedPreset, setAppliedPreset] = useState<string | null>(null);
    const [enableCoherenceEvaluation, setEnableCoherenceEvaluation] = useState(true);
    const [presetInfo, setPresetInfo] = useState<{ name: string; skipCoherence?: boolean } | null>(null);


    useEffect(() => {
        if (initialData) {
            // Start with a deep copy of the default form data to ensure all keys are present
            const newFormData = JSON.parse(JSON.stringify(initialFormData));

            // Merge top-level properties from initialData, excluding 'specifics'
            for (const key in initialData) {
                if (key !== 'specifics' && Object.prototype.hasOwnProperty.call(initialData, key)) {
                    (newFormData as any)[key] = (initialData as any)[key];
                }
            }

            // Deep merge the 'specifics' object property by property
            if (initialData.specifics) {
                for (const contentTypeKey in initialData.specifics) {
                    const key = contentTypeKey as ContentType;
                    // Ensure the specifics object for this content type exists on the base
                    if (!newFormData.specifics[key]) {
                        newFormData.specifics[key] = {};
                    }
                    // Merge the properties for the specific content type
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
        // This allows loaded data to persist even if initialData becomes null (on consumption).
        // The user can manually reset via "Nuevo" or by switching content types if needed.
    }, [initialData, initialContentType, onDataConsumed]);

    // Automatically trigger analysis when a preset is applied
    useEffect(() => {
        if (appliedPreset) {
            // Use a timeout to ensure the preset data has been applied to formData
            setTimeout(() => {
                handleAnalysis();
                setAppliedPreset(null); // Reset to avoid re-triggering
            }, 0);
        }
    }, [appliedPreset]); // Removed handleAnalysis from dependencies to prevent loops

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
        setHasGeneratedContent(false);
        setCopiedToClipboard(false);
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

    const handleAnalysis = useCallback(async (e?: React.FormEvent) => {
        e?.preventDefault();

        // Guard: Prevent multiple simultaneous executions
        if (isAnalyzing) {
            console.warn('⚠️ handleAnalysis already running, skipping duplicate call');
            return;
        }

        setGeneratedPrompt(''); setGeneratedImages([]); setFcnFeedback(null); setCntFeedback(null);
        setAgentSolutions(null); setError(''); setAnalysisDone(false); setShowSahButton(false);
        setIsAnalyzing(true);

        // Skip coherence evaluation if disabled
        if (!enableCoherenceEvaluation) {
            console.log('⏭️ Coherence evaluation disabled, skipping to prompt generation');
            setAnalysisDone(true);
            setIsAnalyzing(false);
            return;
        }

        try {
            console.log('🔍 DEBUG - formData.objective:', formData.objective);
            console.log('🔍 DEBUG - objective type:', typeof formData.objective);
            console.log('🔍 DEBUG - objective length:', formData.objective?.length);
            if (!formData.objective || !formData.objective.trim()) {
                console.error('❌ Validation failed: objective is empty');
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
    }, [isAnalyzing, formData, contentType, enableCoherenceEvaluation]);

    const handleApplyPreset = useCallback((presetName: string) => {
        if (!presetName) return;
        const preset = PRESETS.find(p => p.name === presetName);
        if (preset) {
            console.log('🎯 Applying preset:', presetName);
            console.log('📦 Preset data:', preset.data);
            
            setFormData(prev => {
                // 1. Shallow copy of previous state
                const nextState = { ...prev };

                // 2. Merge top-level data from preset (objective, tone, etc)
                const { specifics: presetSpecifics, ...topLevelPresetData } = preset.data;
                Object.assign(nextState, topLevelPresetData);

                // 3. Deep copy specifics container to ensure React detects change
                nextState.specifics = { ...prev.specifics };

                // 4. Merge specifics if they exist
                if (presetSpecifics) {
                    for (const key of Object.keys(presetSpecifics)) {
                        const contentTypeKey = key as ContentType;
                        // Create new object for the specific content type
                        nextState.specifics[contentTypeKey] = {
                            ...(prev.specifics[contentTypeKey] || {}),
                            ...presetSpecifics[contentTypeKey]
                        };
                    }
                }

                // 5. Explicitly set the narrativeCatalyst field for Text so the UI dropdown updates
                // Always create a new object for ContentType.Texto to guarantee re-render of that section
                nextState.specifics[ContentType.Texto] = {
                    ...(nextState.specifics[ContentType.Texto] || {}),
                    narrativeCatalyst: presetName
                };

                console.log('✅ Updated formData specifics:', nextState.specifics[ContentType.Texto]);
                return nextState;
            });

            // Store preset info and determine if coherence evaluation should be skipped
            setPresetInfo({ name: presetName, skipCoherence: preset.skipCoherenceEvaluation });
            setEnableCoherenceEvaluation(!preset.skipCoherenceEvaluation);

            // Mark that a preset was applied to trigger automatic analysis
            setAppliedPreset(presetName);
        }
    }, []);

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

        // Re-run analysis after applying the solution to create an iterative loop.
        setTimeout(() => {
            handleAnalysis();
        }, 100);
    }, []);

    const handleGeneration = async () => {
        setIsGenerating(true);
        setError('');
        setGeneratedImages([]);
        setGeneratedPrompt('');
        setCopiedToClipboard(false);
        try {
            const prompt = await generateEnhancedPrompt(formData, contentType, null, {});
            setGeneratedPrompt(prompt);
            setHasGeneratedContent(true);

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

    const handleCopyPrompt = () => {
        navigator.clipboard.writeText(generatedPrompt);
        setCopiedToClipboard(true);
        setTimeout(() => setCopiedToClipboard(false), 2000);
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg">
            <header className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-900">{t('creator.title')}</h2>
                <p className="mt-2 text-md text-gray-600">{t('creator.subtitle')}</p>
            </header>

            <ContentTypeSelector selectedType={contentType} onSelectType={handleContentTypeChange} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <form onSubmit={handleAnalysis} className="space-y-6">
                    <FormTextarea label={t('creator.mainObjectiveLabel')} id="objective" name="objective" value={formData.objective} onChange={handleFormChange} required rows={3} placeholder="Fábula de animales salvajes en la época victoriana" />
                    
                    <div>
                        <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-2">
                            Tono del Contenido
                        </label>
                        <input
                            type="text"
                            id="tone"
                            name="tone"
                            value={formData.tone}
                            onChange={handleFormChange}
                            list="tones-list"
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Selecciona o escribe un tono..."
                        />
                        <datalist id="tones-list">
                            {TONES.map(tone => (
                                <option key={tone} value={tone} />
                            ))}
                        </datalist>
                    </div>

                    <SpecificFields
                        contentType={contentType}
                        formData={formData}
                        handleChange={handleSpecificsChange}
                        allStyles={allStyles}
                        onAddStyle={onAddStyle}
                        onReset={() => { }}
                        knowledgeSources={knowledgeSources}
                        setView={setView}
                        errors={{}}
                        onAnalyzeInspiration={() => Promise.resolve()}
                        inspirationAnalysisLoading={false}
                        onAnalyzeInspirationForVideo={() => Promise.resolve()}
                        videoInspirationLoading={false}
                        onAnalyzeScript={() => { }}
                        onImageUpload={() => { }}
                        onAudioUpload={() => { }}
                        onMusicUpload={() => { }}
                        onDocumentUpload={() => { }}
                        onApplyAudioPreset={() => { }}
                        onApplyPreset={handleApplyPreset}
                        onOpenAppendix={() => { }}
                    />

                    <SuperAgentControl activeAgents={formData.activeAgents} handleChange={handleFormChange} />

                    {/* Coherence Evaluation Toggle */}
                    <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <input
                            type="checkbox"
                            id="enableCoherence"
                            checked={enableCoherenceEvaluation}
                            onChange={(e) => setEnableCoherenceEvaluation(e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <label htmlFor="enableCoherence" className="text-sm font-medium text-gray-700 cursor-pointer">
                            {presetInfo?.skipCoherence 
                                ? `✓ Preset "${presetInfo.name}" incluye coherencia predefinida` 
                                : 'Evaluar coherencia del prompt'}
                        </label>
                    </div>

                    <button type="submit" disabled={isAnalyzing} className="w-full max-w-lg mx-auto flex justify-center items-center bg-blue-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 text-lg">
                        {isAnalyzing ? 'Analizando...' : 'Analizar Prompt'}
                    </button>
                </form>

                <div className="space-y-6">
                    {analysisDone && (
                        <>
                            {/* FCN - Feedback de Coherencia Narrativa */}
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
                                <h3 className="text-lg font-bold text-blue-900 mb-4">Evaluación de Coherencia</h3>
                                {fcnFeedback && <NarrativeFeedbackDisplay feedback={fcnFeedback} />}
                                {cntFeedback && <TextualFeedbackDisplay feedback={cntFeedback} />}
                                {!fcnFeedback && !cntFeedback && !enableCoherenceEvaluation && (
                                    <p className="text-blue-700">✓ Evaluación de coherencia omitida (preset con coherencia predefinida)</p>
                                )}
                                {!fcnFeedback && !cntFeedback && enableCoherenceEvaluation && (
                                    <p className="text-blue-700">Analizando coherencia del prompt...</p>
                                )}
                            </div>
                            {showSahButton && (
                                <button onClick={handleGetSolutions} className="w-full bg-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-purple-700">
                                    Obtener Soluciones de Agentes
                                </button>
                            )}
                            
                            {agentSolutions && <AgentSolutionDisplay solutions={agentSolutions} />}

                            {!generatedPrompt && !agentSolutions && (
                                <button 
                                    onClick={handleGeneration} 
                                    disabled={isGenerating} 
                                    className="w-full bg-green-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 text-lg"
                                >
                                    {isGenerating ? 'Generando...' : 'Generar Prompt Optimizado'}
                                </button>
                            )}
                            
                            {generatedPrompt && (
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Prompt Generado</h3>
                                    <div className="bg-white p-4 rounded border max-h-96 overflow-y-auto">
                                        <pre className="whitespace-pre-wrap text-sm">{generatedPrompt}</pre>
                                    </div>
                                    <div className="mt-4 flex gap-3">
                                        <button 
                                            onClick={handleCopyPrompt} 
                                            className={`flex-1 font-bold py-2 px-4 rounded transition-all ${
                                                copiedToClipboard 
                                                    ? 'bg-green-500 text-white' 
                                                    : 'bg-green-600 text-white hover:bg-green-700'
                                            }`}
                                        >
                                            {copiedToClipboard ? '✓ Copiado!' : 'Copiar al Portapapeles'}
                                        </button>
                                        <button 
                                            onClick={handleGeneration} 
                                            disabled={isGenerating} 
                                            className="flex-1 bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
                                        >
                                            {isGenerating ? 'Regenerando...' : 'Regenerar Prompt'}
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            {generatedPrompt && (
                                <button 
                                    onClick={handleGeneration} 
                                    disabled={isGenerating} 
                                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-4 px-6 rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 text-lg flex items-center justify-center gap-2"
                                >
                                    {isGenerating ? (
                                        <>{hasGeneratedContent ? 'Regenerando' : 'Generando'} Contenido...</>
                                    ) : (
                                        <>{hasGeneratedContent ? '🔄 Regenerar' : '✨ Generar'} Contenido Final</>
                                    )}
                                </button>
                            )}
                        </>
                    )}
                    
                    {error && <p className="text-red-600 text-center">{error}</p>}
                </div>
            </div>
        </div>
    );
};

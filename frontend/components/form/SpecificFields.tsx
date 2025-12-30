import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { ContentType, type FormData, type StyleDefinition, type AudiovisualScene, type View, type VideoPreset, type GenrePack } from '../../types';
import { Accordion } from './Accordion';
import { FormInput, FormTextarea, FormSelect, RatingSlider } from './FormControls';
// FIX: Imported TONES to resolve 'Cannot find name' error.
import { TEXT_TYPES, TARGET_AUDIENCES, MUSIC_GENRES, TONAL_SYNC_MAP, TONES } from '../../constants';
import { CLASSIFIED_STYLES } from '../../data/styles';
import InspirationWall from '../InspirationWall';
import { useTranslations } from '../../contexts/LanguageContext';
import { PRESETS } from '../../data/presets';
import { StyleSearchInput } from './StyleSearchInput';
import { ALL_DOCUMENTARY_PRESETS, CLASSIFIED_DOCUMENTARY_PRESETS } from '../../data/documentaryPresets';
import { CLASSIFIED_GENRE_PRESETS } from '../../data/genrePresets';
import { SceneEditor } from './SceneEditor';
import { AGENTS_CODEX } from '../../data/agentsCodex';
import { generateProcessedAudio, cleanAndAdaptScript, extractStrategicMilestones, generateCinematicScriptFromMilestones } from '../../services/geminiService';

// --- Audio Helper Functions ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function audioBufferToWav(buffer: AudioBuffer): Blob {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const arrayBuffer = new ArrayBuffer(length);
    const view = new DataView(arrayBuffer);
    let pos = 0;

    const setUint16 = (data: number) => { view.setUint16(pos, data, true); pos += 2; };
    const setUint32 = (data: number) => { view.setUint32(pos, data, true); pos += 4; };

    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8);
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt "
    setUint32(16);
    setUint16(1);
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16);
    setUint32(0x61746164); // "data"
    setUint32(length - pos - 4);

    const channels = [];
    for (let i = 0; i < buffer.numberOfChannels; i++) {
        channels.push(buffer.getChannelData(i));
    }

    let offset = 0;
    while (pos < length) {
        for (let i = 0; i < numOfChan; i++) {
            let sample = Math.max(-1, Math.min(1, channels[i][offset]));
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
            view.setInt16(pos, sample, true);
            pos += 2;
        }
        offset++;
    }
    return new Blob([view], { type: 'audio/wav' });
}


const fileToDataUrl = (file: File): Promise<{ data: string; name: string; type: string; }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ data: reader.result as string, name: file.name, type: file.type });
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
};

interface FileUploaderProps {
    label: string;
    accept: string;
    acceptedFormats: string;
    file: { name: string; data?: string, content?: string } | null | undefined;
    onFileChange: (file: File) => void;
    onFileRemove: () => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ label, accept, acceptedFormats, file, onFileChange, onFileRemove }) => {
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFiles = (files: FileList | null) => {
        if (files && files[0]) {
            onFileChange(files[0]);
        }
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    };

    if (file) {
        return (
            <div className="md:col-span-2">
                <label className="font-medium text-gray-700">{label}</label>
                <div className="mt-2 relative group p-2 border rounded-lg bg-gray-100 flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                    <button type="button" onClick={onFileRemove} className="p-1 bg-red-500 text-white rounded-full">&times;</button>
                </div>
            </div>
        );
    }

    return (
        <div className="md:col-span-2">
            <label className="font-medium text-gray-700">{label}</label>
            <div
                onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors cursor-pointer ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
                onClick={() => inputRef.current?.click()}
            >
                <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                        <p className="pl-1">Sube un archivo o arrástralo aquí</p>
                    </div>
                    <p className="text-xs text-gray-500">{acceptedFormats}</p>
                    <input ref={inputRef} type="file" className="hidden" accept={accept} onChange={(e) => handleFiles(e.target.files)} />
                </div>
            </div>
        </div>
    );
};


interface SpecificFieldsProps {
  contentType: ContentType;
  formData: FormData;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | { target: { name: string; value: any; type?: string; checked?: boolean; } }
  ) => void;
  allStyles: StyleDefinition[];
  onAddStyle: (newStyle: StyleDefinition) => void;
  onReset: (type: ContentType) => void;
  errors: Record<string, string>;
  onAnalyzeInspiration: (files: File[]) => void;
  inspirationAnalysisLoading: boolean;
  onAnalyzeInspirationForVideo: (files: File[]) => void;
  videoInspirationLoading: boolean;
  onAnalyzeScript: () => void;
  onImageUpload: (file: File) => void;
  onAudioUpload: (file: File) => void;
  onMusicUpload: (file: File) => void;
  onDocumentUpload: (file: File) => void;
  onApplyAudioPreset: (presetName: string) => void;
  knowledgeSources: { name: string; content: string }[];
  setView: (view: View) => void;
  onApplyPreset: (presetName: string) => void;
  onOpenAppendix: () => void;
}

export const SpecificFields: React.FC<SpecificFieldsProps> = ({
  contentType,
  formData,
  handleChange,
  allStyles,
  onAddStyle,
  onReset,
  errors,
  onAnalyzeInspiration,
  inspirationAnalysisLoading,
  onAnalyzeInspirationForVideo,
  videoInspirationLoading,
  onAnalyzeScript,
  onImageUpload,
  onAudioUpload,
  onMusicUpload,
  onDocumentUpload,
  onApplyAudioPreset,
  knowledgeSources,
  setView,
  onApplyPreset,
  onOpenAppendix,
}) => {
  const { t } = useTranslations();
  
  // FIX: All hooks moved to the top-level to fix React Error #310.
  // This ensures hooks are not called conditionally.
  const [selectedSceneType, setSelectedSceneType] = useState('');
  const [selectedGenrePack, setSelectedGenrePack] = useState('');
  const [audioMode, setAudioMode] = useState<'tts' | 'processing'>('tts');
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioError, setAudioError] = useState('');
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isCleaningScript, setIsCleaningScript] = useState(false);

  // State for Synergy Workflow
  const [isExtractingMilestones, setIsExtractingMilestones] = useState(false);
  const [milestoneError, setMilestoneError] = useState('');
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [scriptError, setScriptError] = useState('');

  const financialPresetNames = useMemo(() => [
    '[REPORTE] Viabilidad de Nuevo Activo (Chronos)',
  ], []);

  const narrativePresets = useMemo(() => PRESETS.filter(p => !financialPresetNames.includes(p.name)), [financialPresetNames]);
  const financialPresets = useMemo(() => PRESETS.filter(p => financialPresetNames.includes(p.name)), [financialPresetNames]);
  const VOICE_AGENTS = useMemo(() => AGENTS_CODEX.map(a => a.claveName.split(',')[0]), []);
  const HOST_VOICES = useMemo(() => ['Narrador Neutral (Masculino)', 'Narradora Neutral (Femenino)'], []);
  
  const specificsForText = formData.specifics[ContentType.Texto] || {};
  const specificsForImage = formData.specifics[ContentType.Imagen] || {};
  const specificsForVideo = formData.specifics[ContentType.Video] || {};
  const specificsForAudio = formData.specifics[ContentType.Audio] || {};
  const specificsForCodigo = formData.specifics[ContentType.Codigo] || {};

  // This useEffect will now be the single source of truth for the "Task-to-Script" workflow.
  // It triggers when the source document changes or the workflow is switched to 'synergy'.
  useEffect(() => {
    const doc = specificsForVideo.synergySourceDocument;
    const milestones = specificsForVideo.strategicMilestones || [];

    // Condition to run: synergy mode is active, a document with content exists,
    // and milestones haven't been extracted for it yet.
    if (specificsForVideo.videoWorkflow === 'synergy' && doc?.content && milestones.length === 0) {
      
      const extract = async () => {
        setIsExtractingMilestones(true);
        setMilestoneError('');
        try {
          const result = await extractStrategicMilestones(doc.content);
          handleChange({ target: { name: 'strategicMilestones', value: result.milestones } });
        } catch (err) {
          setMilestoneError(err instanceof Error ? err.message : 'Error al extraer los hitos del documento.');
        } finally {
          setIsExtractingMilestones(false);
        }
      };

      extract();
    }
  }, [specificsForVideo.synergySourceDocument, specificsForVideo.videoWorkflow, handleChange]);
  
  const handleCleanScript = async () => {
      const { scriptContent, scriptFormat } = specificsForAudio;
      if (!scriptContent) {
          setAudioError('No hay guion para limpiar.');
          return;
      }
      setIsCleaningScript(true);
      setAudioError('');
      try {
          const cleanedScript = await cleanAndAdaptScript(scriptContent, scriptFormat || 'monologue');
          handleChange({ target: { name: 'scriptContent', value: cleanedScript }});
      } catch (err) {
          setAudioError(err instanceof Error ? err.message : 'Error al limpiar el guion.');
      } finally {
          setIsCleaningScript(false);
      }
  };

  const handleGenerateProcessedAudio = async () => {
      const { scriptContent, voiceIntonation, scriptFormat, voiceAgent, hostVoice, titanVoice } = specificsForAudio;
      if (!scriptContent) {
          setAudioError('El guion no puede estar vacío.');
          return;
      }
      setIsGeneratingAudio(true);
      setAudioError('');
      handleChange({ target: { name: 'generatedAudioUrl', value: '' } });

      try {
          const audioConfig = {
              format: scriptFormat || 'monologue',
              voiceAgent: voiceAgent,
              hostVoice: hostVoice,
              titanVoice: titanVoice
          };
          const base64Audio = await generateProcessedAudio(scriptContent, voiceIntonation || 'Narrativo', audioConfig);
          
          if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
              audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
          }
          const ctx = audioContextRef.current;
          const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
          
          const wavBlob = audioBufferToWav(audioBuffer);
          const url = URL.createObjectURL(wavBlob);

          handleChange({ target: { name: 'generatedAudioUrl', value: url } });

      } catch (err) {
          setAudioError(err instanceof Error ? err.message : 'Error al generar audio');
      } finally {
          setIsGeneratingAudio(false);
      }
  };
  
  const handleSequenceChange = (newSequence: AudiovisualScene[]) => {
      handleChange({ target: { name: 'audiovisualSequence', value: newSequence }});
  };
  
  const handleAddScene = () => {
      if (!selectedSceneType) return;
      const preset = ALL_DOCUMENTARY_PRESETS.find(p => p.preset_name === selectedSceneType);
      if (!preset) return;

      const newScene: AudiovisualScene = {
          id: `scene-${Date.now()}`,
          sceneTitle: preset.preset_name,
          narration: preset.description,
          duration: 10,
          visualPromptPreset: '',
          visualPromptFreeText: preset.prompt_block,
          soundDesign: ''
      };
      const currentSequence = specificsForVideo.audiovisualSequence || [];
      handleSequenceChange([...currentSequence, newScene]);
  };
  
  const handleApplyGenrePack = () => {
      if (!selectedGenrePack) return;
      const pack = CLASSIFIED_GENRE_PRESETS.find(p => p.genre === selectedGenrePack);
      if (!pack) return;

      const newSequence: AudiovisualScene[] = pack.presets.map(preset => ({
          id: `scene-${preset.preset_name}-${Date.now()}`,
          sceneTitle: preset.preset_name,
          narration: preset.description,
          duration: 15,
          visualPromptPreset: '',
          visualPromptFreeText: preset.prompt_block,
          soundDesign: ''
      }));
      handleSequenceChange(newSequence);
  };

  // This handler is now simplified. It's only responsible for reading the file
  // and setting the state in a way that triggers the useEffect above correctly.
  const handleSynergyDocumentUpload = async (file: File) => {
    // Reset the entire flow when a new document is uploaded.
    // Clearing milestones here is CRUCIAL for the useEffect to re-trigger.
    handleChange({ target: { name: 'strategicMilestones', value: [] } });
    handleChange({ target: { name: 'generatedCinematicScript', value: '' } });
    setMilestoneError('');
    setScriptError('');
    
    try {
        let content = '';
        if (file.type === 'application/pdf') {
            if (typeof window.pdfjsLib === 'undefined' || !window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
                throw new Error("PDF.js no se ha cargado correctamente.");
            }
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                content += textContent.items.map((item: any) => item.str).join(' ');
            }
        } else if (file.type.startsWith('text/')) {
            content = await file.text();
        } else {
            throw new Error('Formato no soportado. Sube PDF o TXT.');
        }

        // Set the new document, which will trigger the useEffect to extract milestones.
        handleChange({ target: { name: 'synergySourceDocument', value: { name: file.name, content } } });
        
    } catch (err) {
        setMilestoneError(err instanceof Error ? err.message : 'Error al procesar documento.');
        // Ensure document is cleared if processing fails
        handleChange({ target: { name: 'synergySourceDocument', value: undefined } });
    }
  };

  const handleGenerateCinematicScript = async () => {
    const { strategicMilestones, emotionalTone, targetAudience } = specificsForVideo;
    if (!strategicMilestones || strategicMilestones.length === 0) {
        setScriptError('Primero debes extraer los hitos estratégicos.');
        return;
    }
    setIsGeneratingScript(true);
    setScriptError('');
    try {
        const script = await generateCinematicScriptFromMilestones(strategicMilestones, emotionalTone || 'Inspirador y Épico', targetAudience || 'Inversores');
        handleChange({ target: { name: 'generatedCinematicScript', value: script } });
    } catch (err) {
        setScriptError(err instanceof Error ? err.message : 'Error al generar el guion.');
    } finally {
        setIsGeneratingScript(false);
    }
  };

  const handleMilestoneChange = (id: string, field: 'title' | 'description', value: string) => {
      const updatedMilestones = specificsForVideo.strategicMilestones?.map(m =>
          m.id === id ? { ...m, [field]: value } : m
      );
      handleChange({ target: { name: 'strategicMilestones', value: updatedMilestones } });
  };
  
  switch (contentType) {
    case ContentType.Texto:
      return (
        <div className="space-y-4">
          <Accordion title={t('creator.textFields.basicDetails.title')} defaultOpen>
            <FormSelect label={t('creator.textFields.basicDetails.textType')} id="type" name="type" value={specificsForText.type || ''} onChange={handleChange}>
              <option value="">Selecciona un tipo...</option>
              {TEXT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
            </FormSelect>
            <FormSelect label={t('creator.textFields.basicDetails.targetAudience')} id="audience" name="audience" value={specificsForText.audience || ''} onChange={handleChange}>
              <option value="">Selecciona una audiencia...</option>
              {TARGET_AUDIENCES.map(aud => <option key={aud} value={aud}>{aud}</option>)}
            </FormSelect>
          </Accordion>

          <Accordion title="Oficina del Director Financiero (CFO) Automatizada" defaultOpen>
            <div className="md:col-span-2">
                <FormSelect
                    label="Cargar CO-PRESET Financiero"
                    id="financialCoPreset"
                    name="narrativeCatalyst" // This will be the trigger
                    value={specificsForText.narrativeCatalyst || ''}
                    onChange={(e) => onApplyPreset(e.target.value)}
                >
                    <option value="">Selecciona un reporte...</option>
                    {financialPresets.map(preset => <option key={preset.name} value={preset.name}>{preset.name}</option>)}
                </FormSelect>
                <p className="mt-2 text-xs text-gray-500">Genera un análisis de viabilidad o un reporte de rentabilidad con un solo clic, orquestado por Kairos.</p>
            </div>
          </Accordion>
          
          <Accordion title={t('creator.textFields.automation.title')} defaultOpen>
              <div className="md:col-span-2">
                  <FormSelect
                      label={t('creator.textFields.automation.label')}
                      id="narrativeCatalyst"
                      name="narrativeCatalyst"
                      value={specificsForText.narrativeCatalyst || ''}
                      onChange={(e) => onApplyPreset(e.target.value)}
                  >
                      <option value="">{t('creator.textFields.automation.placeholder')}</option>
                      {narrativePresets.map(preset => <option key={preset.name} value={preset.name}>{preset.name}</option>)}
                  </FormSelect>
                  <p className="mt-2 text-xs text-gray-500">{t('creator.textFields.automation.info')}</p>
              </div>
          </Accordion>

          <Accordion title={t('creator.textFields.narrativeArchitecture.title')} defaultOpen>
            <FormTextarea label={t('creator.textFields.narrativeArchitecture.conflictPoint')} id="conflictPoint" name="conflictPoint" value={specificsForText.conflictPoint || ''} onChange={handleChange} rows={2} placeholder={t('creator.textFields.narrativeArchitecture.conflictPlaceholder')} />
            <FormTextarea label={t('creator.textFields.narrativeArchitecture.uvp')} id="uvp" name="uvp" value={specificsForText.uvp || ''} onChange={handleChange} rows={2} placeholder={t('creator.textFields.narrativeArchitecture.uvpPlaceholder')} />
            <FormInput label={t('creator.textFields.narrativeArchitecture.cta')} id="cta" name="cta" value={specificsForText.cta || ''} onChange={handleChange} placeholder={t('creator.textFields.narrativeArchitecture.ctaPlaceholder')} />
          </Accordion>

          <Accordion title={t('creator.textFields.dataStorytelling.title')} defaultOpen>
            <FormTextarea label={t('creator.textFields.dataStorytelling.rawData')} id="rawData" name="rawData" value={specificsForText.rawData || ''} onChange={handleChange} rows={4} placeholder={t('creator.textFields.dataStorytelling.rawDataPlaceholder')} />
            <FormSelect label={t('creator.textFields.dataStorytelling.translationAudience')} id="translationAudience" name="translationAudience" value={specificsForText.translationAudience || ''} onChange={handleChange}>
              <option value="">{t('creator.textFields.dataStorytelling.translationAudiencePlaceholder')}</option>
              {TARGET_AUDIENCES.map(aud => <option key={aud} value={aud}>{aud}</option>)}
            </FormSelect>
          </Accordion>
          
          <Accordion title={t('creator.textFields.knowledgeBase.title')} defaultOpen>
              <p className="text-sm text-gray-600 col-span-2">{t('creator.textFields.knowledgeBase.info')}</p>
              {knowledgeSources.length > 0 ? (
                  <ul className="list-disc list-inside text-sm text-gray-700 col-span-2">
                      {knowledgeSources.map(s => <li key={s.name}>{s.name}</li>)}
                  </ul>
              ) : (
                  <p className="text-sm italic text-gray-500 col-span-2">{t('creator.textFields.knowledgeBase.noDocuments')}</p>
              )}
               <div className="col-span-2">
                  <button type="button" onClick={() => setView('knowledge-base')} className="text-sm font-semibold text-blue-600 hover:text-blue-800">{t('creator.textFields.knowledgeBase.manageButton')}</button>
              </div>
          </Accordion>

          <Accordion title={t('creator.textFields.documentUpload.title')} defaultOpen={false}>
              <p className="text-sm text-gray-600 col-span-2">{t('creator.textFields.documentUpload.info')}</p>
              <div className="col-span-2">
                  <input type="file" id="documentUpload" name="documentUpload" onChange={(e) => e.target.files && onDocumentUpload(e.target.files[0])} accept=".txt,.pdf,.json" className="text-sm"/>
                   {specificsForText.uploadedDocument && (
                       <div className="mt-2 text-sm flex items-center">
                           <span>{specificsForText.uploadedDocument.name}</span>
                           <button type="button" onClick={() => handleChange({ target: { name: 'uploadedDocument', value: undefined } })} className="ml-2 text-red-500 font-bold">&times;</button>
                       </div>
                   )}
              </div>
          </Accordion>

          <Accordion title={t('creator.textFields.tonalSync.title')} defaultOpen>
              <div className="md:col-span-2">
                 <StyleSearchInput
                    label={t('creator.textFields.tonalSync.style')}
                    id="visualToneSyncStyle"
                    name="visualToneSyncStyle"
                    value={specificsForText.visualToneSyncStyle || ''}
                    onChange={handleChange}
                    placeholder={t('creator.textFields.tonalSync.stylePlaceholder')}
                    allStyles={allStyles}
                />
              </div>
          </Accordion>
        </div>
      );
    case ContentType.Imagen:
      return (
        <div className="space-y-4">
            <Accordion title="Muro de Inspiración (Opcional)" defaultOpen>
              <InspirationWall onAnalyze={onAnalyzeInspiration} isLoading={inspirationAnalysisLoading} />
            </Accordion>
            <Accordion title="Estilo y Concepto" defaultOpen>
              <div className="md:col-span-2">
                <label htmlFor="style" className="block text-sm font-medium text-gray-700 mb-2">Estilos Artísticos (múltiple)</label>
                <select id="style" name="style" multiple value={specificsForImage.style || []} onChange={handleChange} className="w-full h-48 border border-gray-300 rounded-md">
                    {CLASSIFIED_STYLES.map(group => (
                        <optgroup key={group.id} label={group.category}>
                            {group.styles.map(style => <option key={style} value={style}>{style}</option>)}
                        </optgroup>
                    ))}
                </select>
              </div>
              <FormTextarea label="Elementos Principales" id="elements" name="elements" value={specificsForImage.elements || ''} onChange={handleChange} rows={2} placeholder="Ej: Un astronauta solitario, un árbol antiguo, un robot con un paraguas"/>
            </Accordion>

            <Accordion title="Composición y Ambiente" defaultOpen>
                <FormInput label="Fondo" id="background" name="background" value={specificsForImage.background || ''} onChange={handleChange} placeholder="Ej: Un paisaje marciano desolado, una ciudad futurista de neón" />
                <FormInput label="Localización / Entorno" id="location" name="location" value={specificsForImage.location || ''} onChange={handleChange} placeholder="Ej: Interior de una nave espacial, un bosque encantado" />
                <FormSelect label="Tipo de Plano" id="shotType" name="shotType" value={specificsForImage.shotType || ''} onChange={handleChange}>
                    <option value="">Selecciona un plano...</option>
                    <option>Primerísimo Primer Plano (Extreme Close-Up)</option>
                    <option>Primer Plano (Close-Up)</option>
                    <option>Plano Medio (Medium Shot)</option>
                    <option>Plano Americano</option>
                    <option>Plano General (Wide Shot)</option>
                </FormSelect>
                <FormInput label="Iluminación" id="lighting" name="lighting" value={specificsForImage.lighting || ''} onChange={handleChange} placeholder="Ej: Luz suave y difusa, hora dorada, claroscuro dramático" />
            </Accordion>
             <Accordion title="Parámetros Avanzados de IA" defaultOpen={false}>
                <RatingSlider label="Variedad (0-100)" id="variety" name="variety" value={specificsForImage.variety || 0} onChange={handleChange} min={0} max={100} step={1} />
                <RatingSlider label="Estilización (0-100)" id="stylization" name="stylization" value={specificsForImage.stylization || 0} onChange={handleChange} min={0} max={100} step={1} />
                <RatingSlider label="Rareza (0-100)" id="rarity" name="rarity" value={specificsForImage.rarity || 0} onChange={handleChange} min={0} max={100} step={1} />
            </Accordion>
        </div>
      );
    case ContentType.Video:
        const emotionalTones = ['Inspirador y Épico', 'Técnico y Preciso', 'Urgente y Dramático', 'Esperanzador y Humano'];
        const synergyTargetAudiences = ['Inversores de Capital de Riesgo', 'Equipos Internos (Alineación)', 'Público General (Concienciación)'];

      return (
        <div className="space-y-4">
            <div className="p-4 bg-gray-100 rounded-lg">
                <FormSelect
                    label="Modo de Trabajo"
                    id="videoWorkflow"
                    name="videoWorkflow"
                    value={specificsForVideo.videoWorkflow || 'manual'}
                    onChange={handleChange}
                >
                    <option value="manual">Constructor de Escenas Manual</option>
                    <option value="synergy">Sinergia Estratégica: De Hoja de Ruta a Guion</option>
                </FormSelect>
            </div>

            {specificsForVideo.videoWorkflow === 'synergy' ? (
                <div className="space-y-6">
                    <Accordion title="Fase 1: Laboratorio de Narrativa (Definición de Hitos)" defaultOpen>
                        <FileUploader
                            label="Importar Análisis Estratégico"
                            accept=".pdf,.txt"
                            acceptedFormats="PDF, TXT"
                            file={specificsForVideo.synergySourceDocument}
                            onFileChange={handleSynergyDocumentUpload}
                            onFileRemove={() => {
                                handleChange({ target: { name: 'synergySourceDocument', value: undefined } });
                                handleChange({ target: { name: 'strategicMilestones', value: [] } });
                                handleChange({ target: { name: 'generatedCinematicScript', value: '' } });
                            }}
                        />
                        {isExtractingMilestones && <div className="text-center text-blue-600">Extrayendo hitos con IA (Helena)...</div>}
                        {milestoneError && <div className="text-center text-red-600">{milestoneError}</div>}
                        
                        {(specificsForVideo.strategicMilestones || []).length > 0 && (
                            <div className="space-y-4 pt-4 border-t">
                                <h4 className="font-semibold">Hitos Narrativos Extraídos (Editables)</h4>
                                {specificsForVideo.strategicMilestones!.map(milestone => (
                                    <div key={milestone.id} className="p-3 border rounded-md bg-gray-50">
                                        <FormInput label="" name={`milestone-title-${milestone.id}`} value={milestone.title} onChange={(e) => handleMilestoneChange(milestone.id, 'title', e.target.value)} className="font-bold mb-2"/>
                                        <FormTextarea label="" name={`milestone-desc-${milestone.id}`} value={milestone.description} onChange={(e) => handleMilestoneChange(milestone.id, 'description', e.target.value)} rows={3} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </Accordion>
                    <Accordion title="Fase 2: Traducción Creativa (Dirección Cinematográfica)" defaultOpen>
                        <FormSelect label="Tono Emocional" name="emotionalTone" value={specificsForVideo.emotionalTone || ''} onChange={handleChange}>
                             {emotionalTones.map(tone => <option key={tone} value={tone}>{tone}</option>)}
                        </FormSelect>
                        <FormSelect label="Audiencia Objetivo" name="targetAudience" value={specificsForVideo.targetAudience || ''} onChange={handleChange}>
                             {synergyTargetAudiences.map(aud => <option key={aud} value={aud}>{aud}</option>)}
                        </FormSelect>
                        <button type="button" onClick={handleGenerateCinematicScript} disabled={isGeneratingScript || !specificsForVideo.strategicMilestones?.length} className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400">
                           {isGeneratingScript ? 'Generando...' : 'Generar Borrador de Guion (Marco)'}
                        </button>
                        {scriptError && <div className="text-center text-red-600 mt-2">{scriptError}</div>}
                    </Accordion>
                    <Accordion title="Fase 3: Resultado (Guion Generado)" defaultOpen>
                        <FormTextarea label="" name="generatedCinematicScript" value={specificsForVideo.generatedCinematicScript || (isGeneratingScript ? 'Generando guion...' : 'El guion cinematográfico aparecerá aquí.')} readOnly rows={15} className="font-mono bg-gray-100"/>
                    </Accordion>
                </div>
            ) : (
                <>
                    <Accordion title="Agente Guionista Documental" defaultOpen>
                        <div className="md:col-span-2 space-y-4">
                            <div>
                                <h4 className="font-semibold text-gray-800">Herramientas de Guion Específico</h4>
                                <p className="text-xs text-gray-500 mb-2">Añade escenas prototipo individuales a tu secuencia.</p>
                                <div className="flex gap-2">
                                    <FormSelect
                                        label=""
                                        id="sceneType"
                                        name="sceneType"
                                        value={selectedSceneType}
                                        onChange={(e) => setSelectedSceneType(e.target.value)}
                                        className="flex-grow"
                                    >
                                        <option value="">Selecciona un tipo de escena...</option>
                                        {CLASSIFIED_DOCUMENTARY_PRESETS.map(group => (
                                            <optgroup key={group.category} label={group.category}>
                                                {group.presets.map(preset => <option key={preset.preset_name} value={preset.preset_name}>{preset.preset_name}</option>)}
                                            </optgroup>
                                        ))}
                                    </FormSelect>
                                    <button type="button" onClick={handleAddScene} className="px-4 py-2 bg-blue-600 text-white rounded-md font-semibold text-sm">Añadir Escena</button>
                                </div>
                            </div>
                             <div>
                                <h4 className="font-semibold text-gray-800">Paquetes de Género Documental</h4>
                                <p className="text-xs text-gray-500 mb-2">Carga una secuencia completa de escenas basada en un género documental.</p>
                                <div className="flex gap-2">
                                    <FormSelect
                                        label=""
                                        id="genrePack"
                                        name="genrePack"
                                        value={selectedGenrePack}
                                        onChange={(e) => setSelectedGenrePack(e.target.value)}
                                        className="flex-grow"
                                    >
                                        <option value="">Selecciona un paquete de género...</option>
                                        {CLASSIFIED_GENRE_PRESETS.map(pack => <option key={pack.genre} value={pack.genre}>{pack.genre}</option>)}
                                    </FormSelect>
                                    <button type="button" onClick={handleApplyGenrePack} className="px-4 py-2 bg-purple-600 text-white rounded-md font-semibold text-sm">Aplicar Paquete</button>
                                </div>
                            </div>
                        </div>
                    </Accordion>

                    <SceneEditor
                        scenes={specificsForVideo.audiovisualSequence || []}
                        onSceneChange={(updatedScene) => {
                            const updatedSequence = (specificsForVideo.audiovisualSequence || []).map(s => s.id === updatedScene.id ? updatedScene : s);
                            handleSequenceChange(updatedSequence);
                        }}
                        onSequenceChange={handleSequenceChange}
                    />
                    <Accordion title="Estilo Visual y Formato" defaultOpen>
                        <FormSelect label="Relación de Aspecto" id="aspectRatio" name="aspectRatio" value={specificsForVideo.aspectRatio || '16:9'} onChange={handleChange}>
                            <option value="16:9">16:9 (Horizontal)</option>
                            <option value="9:16">9:16 (Vertical)</option>
                            <option value="1:1">1:1 (Cuadrado)</option>
                        </FormSelect>
                        <div className="md:col-span-2">
                            <label htmlFor="artisticStyle" className="mb-2 font-medium text-gray-700 block">Estilo Artístico</label>
                            <select id="artisticStyle" name="artisticStyle" multiple value={specificsForVideo.artisticStyle || []} onChange={handleChange} className="w-full h-40 px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white text-gray-800 border-gray-300">
                                {CLASSIFIED_STYLES.map(group => (<optgroup key={group.id} label={group.category}>{group.styles.map(style => <option key={style} value={style}>{style}</option>)}</optgroup>))}
                            </select>
                            <p className="mt-2 text-xs text-gray-500">Selecciona uno o más estilos para influir en la estética. Usa Ctrl/Cmd para seleccionar varios.</p>
                        </div>
                    </Accordion>
                </>
            )}
        </div>
      );
    case ContentType.Audio:
      const ENTONATION_PRESETS = [
          'Didáctico (Estilo Euclides)', 'Narrativo (Estilo Marco)', 'Experto (Estilo Kandel)',
          'Susurro (Confidencial)', 'Proyección (Conferencia)',
      ];
      const AMBIENCE_PRESETS = [
          'Estudio Limpio (Inmutable)', 'Sótano (Entrevista)', 'Entorno Industrial (Vulcano)',
          'Concierto (Susurro)', 'Laboratorio (Pirolis)', 'Biblioteca (Euclides)',
      ];

      return (
        <div className="space-y-4">
          <Accordion title="Fase 1: Interfaz de Usuario 'Estudio de Audio Pro'" defaultOpen>
            <div className="md:col-span-2">
              <div className="flex rounded-md shadow-sm">
                <button type="button" onClick={() => setAudioMode('tts')} className={`px-4 py-2 text-sm font-medium rounded-l-md border transition-colors w-1/2 ${audioMode === 'tts' ? 'bg-blue-600 text-white border-blue-700' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                  Modo 1: Texto a Voz (TTS)
                </button>
                <button type="button" onClick={() => setAudioMode('processing')} className={`-ml-px px-4 py-2 text-sm font-medium rounded-r-md border transition-colors w-1/2 ${audioMode === 'processing' ? 'bg-blue-600 text-white border-blue-700' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                  Modo 2: Mejora de Audio
                </button>
              </div>
            </div>
          </Accordion>

          <Accordion title="Fase 2: Sourcing y Limpieza de Guion (IA)" defaultOpen>
              <div className="md:col-span-2 space-y-4 pt-2">
                <FormTextarea label="Entrada: Guion de Texto" id="scriptContent" name="scriptContent" value={specificsForAudio.scriptContent || ''} onChange={handleChange} rows={5} placeholder="Escribe o pega aquí el guion 'sucio' o la transcripción..." />
                <button type="button" className="w-full text-left p-3 bg-gray-100 rounded-md hover:bg-gray-200 text-sm font-semibold text-gray-700">Sinergia (Autorrellenado): Importar Guion desde...</button>
                <button type="button" onClick={handleCleanScript} disabled={isCleaningScript} className="w-full bg-yellow-500 text-black font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 disabled:bg-gray-400 flex items-center justify-center">
                  {isCleaningScript ? 'Limpiando...' : 'Limpiar y Adaptar Guion con IA (Marco)'}
                </button>
              </div>
          </Accordion>

          {audioMode === 'tts' && (
            <Accordion title="Fase 3 & 4: Dirección de Voz y Postproducción (IA)" defaultOpen>
              <FormSelect label="Formato de Guion" id="scriptFormat" name="scriptFormat" value={specificsForAudio.scriptFormat || 'monologue'} onChange={handleChange}>
                <option value="monologue">Monólogo (Una Sola Voz)</option>
                <option value="dialogue">Diálogo (Múltiples Voces)</option>
              </FormSelect>
              
              {specificsForAudio.scriptFormat === 'dialogue' ? (
                <>
                  <FormSelect label="Voz del Anfitrión" id="hostVoice" name="hostVoice" value={specificsForAudio.hostVoice || ''} onChange={handleChange}>
                    <option value="">Selecciona una voz...</option>
                    {HOST_VOICES.map(voice => <option key={voice} value={voice}>{voice}</option>)}
                  </FormSelect>
                  <FormSelect label="Voz del Titán" id="titanVoice" name="titanVoice" value={specificsForAudio.titanVoice || ''} onChange={handleChange}>
                     <option value="">Selecciona un Titán...</option>
                    {VOICE_AGENTS.map(agent => <option key={agent} value={agent}>{agent}</option>)}
                  </FormSelect>
                </>
              ) : (
                <FormSelect label="Selector de Agente (Voz)" id="voiceAgent" name="voiceAgent" value={specificsForAudio.voiceAgent || ''} onChange={handleChange}>
                  <option value="">Selecciona un Titán...</option>
                  {VOICE_AGENTS.map(agent => <option key={agent} value={agent}>{agent}</option>)}
                </FormSelect>
              )}

              <FormSelect label="Preset de Entonación (Dinámico)" id="voiceIntonation" name="voiceIntonation" value={specificsForAudio.voiceIntonation || ''} onChange={handleChange}>
                <option value="">Selecciona una entonación...</option>
                {ENTONATION_PRESETS.map(preset => <option key={preset} value={preset}>{preset}</option>)}
              </FormSelect>
              
              <FormSelect label="Paisaje Sonoro (Ambiente)" id="ambiencePreset" name="ambiencePreset" value={specificsForAudio.ambiencePreset || ''} onChange={handleChange}>
                <option value="">Selecciona un ambiente...</option>
                {AMBIENCE_PRESETS.map(preset => <option key={preset} value={preset}>{preset}</option>)}
              </FormSelect>

              <div className="md:col-span-2">
                <h4 className="font-semibold text-gray-800 mb-2">Agente de Postproducción (Habilidad IA)</h4>
                 <button type="button" onClick={handleGenerateProcessedAudio} disabled={isGeneratingAudio} className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center">
                  {isGeneratingAudio ? 'Generando...' : 'Generar Audio Procesado'}
                </button>
                {audioError && <p className="text-red-500 text-sm mt-2">{audioError}</p>}
                {specificsForAudio.generatedAudioUrl && (
                    <div className="mt-4">
                        <h5 className="font-semibold text-gray-800 mb-2">Audio Generado:</h5>
                        <audio controls src={specificsForAudio.generatedAudioUrl} className="w-full" />
                        <a href={specificsForAudio.generatedAudioUrl} download={`audio_procesado_${Date.now()}.wav`} className="inline-block mt-2 text-sm text-blue-600 hover:underline">
                            Descargar Audio
                        </a>
                    </div>
                )}
              </div>
            </Accordion>
          )}
        </div>
      );
    case ContentType.Codigo:
      return (
        <div className="space-y-4">
            <Accordion title="Generador de Código IA" defaultOpen>
                <FormSelect label="Tipo de Script" id="scriptType" name="scriptType" value={specificsForCodigo.scriptType || 'vrc'} onChange={handleChange}>
                    <option value="vrc">VRC (Visual Response Code)</option>
                    <option value="generador">Generador de Código</option>
                    <option value="validador_prompt">Validador de Prompt</option>
                    <option value="documentador">Documentador de Código</option>
                </FormSelect>
                {specificsForCodigo.scriptType === 'vrc' && (
                    <FormTextarea label="Dirección Emocional" id="emotionalDirection" name="emotionalDirection" value={specificsForCodigo.emotionalDirection || ''} onChange={handleChange} rows={3} placeholder="Describe la emoción o estado que el código debe representar visualmente." />
                )}
                {specificsForCodigo.scriptType === 'generador' && (
                    <>
                        <FormTextarea label="Prompt Base" id="basePrompt" name="basePrompt" value={specificsForCodigo.basePrompt || ''} onChange={handleChange} rows={3} placeholder="Describe la funcionalidad principal del código a generar." />
                        <FormTextarea label="Parámetros a Variar" id="parametersToVary" name="parametersToVary" value={specificsForCodigo.parametersToVary || ''} onChange={handleChange} rows={2} placeholder="Ej: número de iteraciones, tipo de datos de entrada" />
                    </>
                )}
                 {specificsForCodigo.scriptType === 'validador_prompt' && (
                    <>
                        <FormTextarea label="Prompt a Validar" id="promptToValidate" name="promptToValidate" value={specificsForCodigo.promptToValidate || ''} onChange={handleChange} rows={3} placeholder="Pega el prompt que quieres que la IA evalúe." />
                        <FormTextarea label="Criterios de Validación" id="validationCriteria" name="validationCriteria" value={specificsForCodigo.validationCriteria || ''} onChange={handleChange} rows={2} placeholder="Ej: Claridad, especificidad, ausencia de ambigüedad, potencial para generar resultados no deseados." />
                    </>
                )}
                 {specificsForCodigo.scriptType === 'documentador' && (
                    <FormTextarea label="Código a Documentar" id="codeToDocument" name="codeToDocument" value={specificsForCodigo.codeToDocument || ''} onChange={handleChange} rows={8} placeholder="Pega aquí el fragmento de código que necesita documentation." />
                )}
            </Accordion>
        </div>
      );
    default:
      return null;
  }
};
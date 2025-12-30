import React, { useState, useMemo } from 'react';
import { Accordion } from '../form/Accordion';
import { FormSelect, FormTextarea, FormInput } from '../form/FormControls';
import { generatePodcastScript, generatePodcastAudio, generateVideoStructureFromScript } from '../../services/geminiService';
import type { View, Task } from '../../types';
import { ContentType } from '../../types';
import { AGENTS_CODEX } from '../../data/agentsCodex';

interface PodcastStudioProps {
    onSaveTask: (task: Task, navigate?: boolean) => void;
    setView: (view: View) => void;
    onUseVideoPreset: (jsonString: string) => void;
}

// Base64 decoding function for audio
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Audio data decoding function
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

const CONTENT_MAP: Record<string, Partial<Record<'cinematic' | 'editorial' | 'module_docs', string>>> = {
    '¿Quién es Vulcano? (Análisis de Módulo)': {
        module_docs: 'Documentación de Vulcano: "Vulcano es un módulo de pre-tratamiento para Neumáticos Fuera de Uso (NFU), que separa el caucho, el acero y la fibra textil. Su eficiencia es clave para el proceso de pirólisis posterior."',
        cinematic: 'Vista Cinemática de Vulcano: "Un plano cenital muestra la imponente línea de trituración de Vulcano. Neumáticos gigantes entran por un lado y salen como GCR (Grano de Caucho Reciclado) por el otro. El ambiente es ruidoso, industrial y eficiente."',
        editorial: 'Editorial sobre Vulcano: "En el corazón de la economía circular, el módulo Vulcano representa una proeza de la ingeniería, transformando un residuo problemático en tres flujos de materiales valiosos: GCR, acero de alta pureza y fibra textil."'
    },
    'El Puente: Bellas Artes, Innovación Industrial y Ciencia': {
        editorial: 'Editorial sobre El Puente: "El módulo \'El Puente\' actúa como un nexo conceptual, demostrando que la innovación industrial no está reñida con la belleza de las bellas artes ni con el rigor de la ciencia. Es la materialización de una visión holística que busca la armonía entre la estética, la función y el conocimiento."'
    },
    'Mundo Interior: Visión General de la Suite': {
        editorial: 'Editorial sobre la Suite: "El Creador de Prompts Perfecto es más que una herramienta; es un ecosistema creativo. Desde la chispa inicial en el Creador de Prompts, pasando por la inspiración en la Galería, hasta la ejecución técnica en los módulos industriales como Phoenix y Vulcano, cada componente está diseñado para dialogar con los demás, creando un flujo de trabajo sinérgico."'
    }
};

const ICONS = {
    'Conceptos Fundamentales': (<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547a2 2 0 00-.547 1.806l.477 2.387a6 6 0 00.517 3.86l.158.318a6 6 0 00.517 3.86l2.387.477a2 2 0 001.806-.547a2 2 0 00.547-1.806l-.477-2.387a6 6 0 00-.517-3.86l-.158-.318a6 6 0 01-.517-3.86l.477-2.387a2 2 0 01.547-1.806z" /><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 10.25l2.387.477a2 2 0 011.022.547l-2.387-.477a6 6 0 01-3.86-.517l-.318-.158a6 6 0 00-3.86-.517l-2.387-.477a2 2 0 00-1.806.547a2 2 0 00-.547 1.806l.477 2.387a6 6 0 00.517 3.86l.158.318a6 6 0 00.517 3.86l2.387.477a2 2 0 001.806-.547a2 2 0 00.547-1.806l-.477-2.387a6 6 0 00-.517-3.86l-.158-.318a6 6 0 01-.517-3.86l.477-2.387a2 2 0 01.547-1.806z" /></svg>),
    'Análisis de Agentes': (<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>),
    'Análisis de Módulos': (<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>),
    'Personalizado': (<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>)
};

const PODCAST_THEMES_DATA = [
    { title: 'Mundo Interior: Visión General de la Suite', description: 'Una introducción al ecosistema de herramientas y su filosofía de inteligencia aumentada.', category: 'Conceptos Fundamentales' },
    { title: 'El Concepto de Co-Preset', description: 'Explora cómo las plantillas de prompts predefinidas aceleran el flujo de trabajo creativo.', category: 'Conceptos Fundamentales' },
    { title: 'El Rol de los Agentes IA (Helena, Janus, etc.)', description: 'Un análisis profundo de los arquetipos de IA, sus roles y cómo colaboran en el Concilio de Titanes.', category: 'Análisis de Agentes' },
    { title: 'Entendiendo los Índices CNT/FCN', description: 'Una guía para interpretar los scores de coherencia narrativa y cómo usarlos para mejorar tus prompts.', category: 'Conceptos Fundamentales' },
    { title: 'Entendiendo los Índices CNT/FCN a Profundidad', description: 'Una inmersión profunda en los criterios que usan los agentes para evaluar la coherencia y la consistencia.', category: 'Conceptos Fundamentales' },
    { title: 'Inteligencia Aumentada y Automatizaciones', description: 'Descubre cómo los agentes IA pueden automatizar tareas complejas y aumentar tu capacidad estratégica.', category: 'Conceptos Fundamentales' },
    { title: 'El Puente: Bellas Artes, Innovación Industrial y Ciencia', description: 'Explora la sinergia entre la estética, la ingeniería y el análisis de datos en el ecosistema.', category: 'Conceptos Fundamentales' },
    { title: 'Paradigma Open Science', description: 'Cómo la plataforma integra principios de ciencia abierta para la colaboración y el avance del conocimiento.', category: 'Conceptos Fundamentales' },
    { title: '¿Quién es Vulcano? (Análisis de Módulo)', description: 'Un análisis detallado del módulo Vulcano, su función en el reciclaje de NFU y su sinergia con Hefesto.', category: 'Análisis de Módulos' },
    { title: 'Tema Personalizado', description: 'Define tu propio tema para el podcast. Usa el campo de texto que aparecerá al seleccionarlo.', category: 'Personalizado' },
];

export const PodcastStudio: React.FC<PodcastStudioProps> = ({ onSaveTask, setView, onUseVideoPreset }) => {
    const [theme, setTheme] = useState('Mundo Interior: Visión General de la Suite');
    const [customTheme, setCustomTheme] = useState('');
    const [sourceNotes, setSourceNotes] = useState('');
    const [scriptContent, setScriptContent] = useState('');
    const [voicePreset, setVoicePreset] = useState('Narrador Documental (Sereno)');
    const [backgroundMusic, setBackgroundMusic] = useState('Tecnología Sutil');
    const [outputFormat, setOutputFormat] = useState<'MP3' | 'WAV'>('MP3');
    const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
    const [error, setError] = useState('');
    const [videoStructure, setVideoStructure] = useState('');
    const [isCreatingStructure, setIsCreatingStructure] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState('Marco, el Narrador');

    const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');

    const filteredThemes = useMemo(() => {
        return PODCAST_THEMES_DATA.filter(t => {
            if (t.category === 'Personalizado' && categoryFilter !== 'All' && categoryFilter !== 'Personalizado') return false;
            const categoryMatch = categoryFilter === 'All' || t.category === categoryFilter;
            const searchMatch = searchQuery === '' || t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase());
            return categoryMatch && searchMatch;
        });
    }, [searchQuery, categoryFilter]);

    const handleSelectTheme = (selectedTitle: string) => {
        setTheme(selectedTitle);
        setIsThemeModalOpen(false);
    };

    const VOICE_PRESETS = [
        'Narrador Documental (Sereno)',
        'Experto Técnico (Claro)',
        'Anfitrión Entusiasta (Dinámico)',
    ];

    const MUSIC_PRESETS = [
        'Tecnología Sutil',
        'Ambiente Inspirador',
        'Sin Música',
    ];

    const handleImportContent = (contentType: 'cinematic' | 'editorial' | 'module_docs') => {
        let importedText = '';
        const isCustom = theme === 'Tema Personalizado';
        const themeContent = CONTENT_MAP[theme];

        if (!isCustom && themeContent && themeContent[contentType]) {
            importedText = themeContent[contentType]!;
        } else {
            // Fallback content
            switch (contentType) {
                case 'cinematic': importedText = 'Ejemplo de Vistas Cinemáticas de Phoenix...'; break;
                case 'editorial': importedText = 'Ejemplo de texto desde Editorial...'; break;
                case 'module_docs': importedText = 'Documentación de Vulcano...'; break;
            }
        }
        setSourceNotes(prev => `${prev}\n\n--- CONTENIDO IMPORTADO ---\n${importedText}\n`);
    };

    const handleGenerateScript = async () => {
        setIsLoading(true);
        setError('');
        try {
            const finalTheme = theme === 'Tema Personalizado' ? customTheme : theme;
            const agentProfile = AGENTS_CODEX.find(a => a.claveName === selectedAgent);
            const systemInstruction = agentProfile?.system_prompt || `Eres un guionista de podcasts experto con el arquetipo de ${agentProfile?.archetype || 'narrador'}.`;
            const script = await generatePodcastScript(finalTheme, sourceNotes, systemInstruction);
            setScriptContent(script);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al generar el guion.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGenerateAudio = async () => {
        if (!scriptContent) {
            setError('El guion no puede estar vacío.');
            return;
        }
        setIsGeneratingAudio(true);
        setError('');
        setGeneratedAudioUrl(null);
        try {
            const base64Audio = await generatePodcastAudio(scriptContent, voicePreset);
            
            const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
            
            const getWavBlob = (buffer: AudioBuffer) => {
                const numOfChan = buffer.numberOfChannels,
                      length = buffer.length * numOfChan * 2 + 44,
                      bufferArr = new ArrayBuffer(length),
                      view = new DataView(bufferArr),
                      channels = [];
                let i, sample, offset = 0, pos = 0;
            
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
            
                for (i = 0; i < buffer.numberOfChannels; i++) channels.push(buffer.getChannelData(i));
            
                while (pos < length) {
                    for (i = 0; i < numOfChan; i++) {
                        sample = Math.max(-1, Math.min(1, channels[i][offset]));
                        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
                        view.setInt16(pos, sample, true);
                        pos += 2;
                    }
                    offset++;
                }
                return new Blob([view], { type: 'audio/wav' });
            };
            
            const wavBlob = getWavBlob(audioBuffer);
            const url = URL.createObjectURL(wavBlob);
            setGeneratedAudioUrl(url);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al generar el audio.');
        } finally {
            setIsGeneratingAudio(false);
        }
    };
    
    const handleCreateAnnouncementTask = () => {
        const finalTheme = theme === 'Tema Personalizado' ? customTheme : theme;
        const task: Task = {
            id: `podcast-announcement-${Date.now()}`,
            title: `Anuncio de Nuevo Podcast: ${finalTheme}`,
            createdAt: Date.now(),
            status: 'Por Hacer',
            contentType: ContentType.Texto,
            formData: {
                objective: `Crear un post para blog/redes sociales anunciando el nuevo episodio de podcast titulado "${finalTheme}".`,
                tone: 'Inspiracional',
                specifics: {
                    [ContentType.Texto]: {
                        type: 'Publicación para Redes Sociales',
                        audience: 'Público General',
                        rawData: `**Guion del Podcast:**\n\n${scriptContent}`,
                        uvp: 'Extrae los puntos clave del guion y genera una descripción atractiva para el anuncio.'
                    },
                    [ContentType.Imagen]: {},
                    [ContentType.Video]: {},
                    [ContentType.Audio]: {},
                    [ContentType.Codigo]: {},
                },
            },
            isIntelligent: true,
            agentId: 'Marco, el Narrador',
            eventType: 'PodcastAnnouncement',
        };
        onSaveTask(task, true);
    };

    const handleCreateVideoStructure = async () => {
        if (!scriptContent) {
            setError('El guion no puede estar vacío para crear la estructura de video.');
            return;
        }
        setIsCreatingStructure(true);
        setError('');
        setVideoStructure('');
        try {
            const finalTheme = theme === 'Tema Personalizado' ? customTheme : theme;
            const structureJson = await generateVideoStructureFromScript(scriptContent, finalTheme);
            setVideoStructure(structureJson);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al crear la estructura de video.');
        } finally {
            setIsCreatingStructure(false);
        }
    };
    
    const isCustomTheme = theme === 'Tema Personalizado';
    const currentThemeContent = CONTENT_MAP[theme] || {};

    const buttonClass = (contentType: 'cinematic' | 'editorial' | 'module_docs') => {
        const base = "px-4 py-2 rounded-md text-sm font-semibold transition-colors";
        const enabled = "bg-gray-200 text-gray-800 hover:bg-gray-300";
        const disabled = "bg-gray-100 text-gray-400 cursor-not-allowed";
        return `${base} ${!isCustomTheme && !currentThemeContent[contentType] ? disabled : enabled}`;
    };

    const selectedThemeData = PODCAST_THEMES_DATA.find(t => t.title === theme);
    const themeCategories = ['All', ...Array.from(new Set(PODCAST_THEMES_DATA.map(t => t.category).filter(c => c !== 'Personalizado')))];

    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg">
            <header className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-900">Estudio de Podcast IA</h2>
                <p className="mt-2 text-md text-gray-600">Crea podcasts que expliquen tu ecosistema de herramientas, de forma meta-reflexiva.</p>
            </header>
            
            {isThemeModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={() => setIsThemeModalOpen(false)}>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-2xl font-bold mb-4">Biblioteca de Contenidos</h3>
                        <div className="flex flex-col md:flex-row gap-4 mb-4">
                            <input
                                type="search"
                                placeholder="Buscar temas..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="flex-grow p-2 border border-gray-300 rounded-md"
                            />
                            <div className="flex-shrink-0 flex items-center gap-2 bg-gray-100 p-1 rounded-md">
                                {themeCategories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setCategoryFilter(cat)}
                                        className={`px-3 py-1 text-sm font-semibold rounded ${categoryFilter === cat ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
                                    >
                                        {cat === 'All' ? 'Todos' : cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex-grow overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredThemes.map(t => (
                                <div key={t.title} className="border border-gray-200 rounded-lg p-4 flex flex-col hover:border-blue-500 hover:shadow-md transition-all">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0">{ICONS[t.category as keyof typeof ICONS]}</div>
                                        <div>
                                            <h4 className="font-bold text-gray-800">{t.title}</h4>
                                            <p className="text-xs text-gray-500 mt-1">{t.category}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-3 flex-grow">{t.description}</p>
                                    <button
                                        onClick={() => handleSelectTheme(t.title)}
                                        className="mt-4 w-full bg-blue-500 text-white font-semibold py-2 rounded-md hover:bg-blue-600"
                                    >
                                        Seleccionar Tema
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                 {error && <div className="p-4 bg-red-100 text-red-700 rounded-md border border-red-300">{error}</div>}

                <Accordion title="Fase 1: Creación del Módulo y Selección de Temas" defaultOpen>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tema Seleccionado</label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                            <div className="relative flex-grow focus-within:z-10">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    {selectedThemeData && ICONS[selectedThemeData.category as keyof typeof ICONS] && React.cloneElement(ICONS[selectedThemeData.category as keyof typeof ICONS], { className: "h-5 w-5 text-gray-400" })}
                                </div>
                                <input
                                    type="text"
                                    value={theme}
                                    readOnly
                                    onClick={() => setIsThemeModalOpen(true)}
                                    className="block w-full rounded-none rounded-l-md bg-gray-100 border-gray-300 text-gray-600 pl-10 py-2 cursor-pointer"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsThemeModalOpen(true)}
                                className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100"
                            >
                                Cambiar Tema
                            </button>
                        </div>
                    </div>
                    {theme === 'Tema Personalizado' && (
                        <FormInput label="Tema Personalizado" placeholder="Define tu propio tema..." value={customTheme} onChange={(e) => setCustomTheme(e.target.value)} />
                    )}
                </Accordion>

                <Accordion title="Fase 2: Sourcing de Contenido (Retroalimentación)" defaultOpen>
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => handleImportContent('editorial')} disabled={!isCustomTheme && !currentThemeContent.editorial} className={buttonClass('editorial')}>Importar desde Editorial</button>
                        <button onClick={() => handleImportContent('cinematic')} disabled={!isCustomTheme && !currentThemeContent.cinematic} className={buttonClass('cinematic')}>Importar desde Vistas Cinemáticas</button>
                        <button onClick={() => handleImportContent('module_docs')} disabled={!isCustomTheme && !currentThemeContent.module_docs} className={buttonClass('module_docs')}>Importar Documentación de Módulo</button>
                    </div>
                    <FormTextarea label="Notas Adicionales" value={sourceNotes} onChange={(e) => setSourceNotes(e.target.value)} rows={5} placeholder="Añade introducciones, conclusiones o ideas propias. También puedes pegar contenido importado aquí." />
                </Accordion>
                
                 <Accordion title="Fase 3: Generación y Refinamiento del Guion" defaultOpen>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div className="md:col-span-2">
                             <FormSelect label="Seleccionar Guionista IA" value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)}>
                                {AGENTS_CODEX.map(agent => (
                                    <option key={agent.claveName} value={agent.claveName}>{agent.claveName}</option>
                                ))}
                            </FormSelect>
                        </div>
                        <button onClick={handleGenerateScript} disabled={isLoading} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                            {isLoading ? 'Generando...' : `Generar Borrador con ${selectedAgent.split(',')[0]}`}
                        </button>
                    </div>
                     <FormTextarea label="Guion Generado" value={scriptContent} onChange={(e) => setScriptContent(e.target.value)} rows={10} placeholder="El guion generado por el agente seleccionado aparecerá aquí. Puedes refinarlo antes de generar el audio." />
                </Accordion>

                <Accordion title="Fase 3.5: Sinergia Transmedia (Guion a Video)" defaultOpen>
                    <p className="text-sm text-gray-600 mb-4">Transforma el guion de audio finalizado en una estructura multi-escena (JSON) para tu generador de prompts de video, automatizando gran parte del proceso de visualización.</p>
                    <button onClick={handleCreateVideoStructure} disabled={isCreatingStructure || !scriptContent} className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400">
                        {isCreatingStructure ? 'Creando Estructura...' : 'Crear Estructura de Video desde Guion'}
                    </button>
                    <FormTextarea label="Preset de Video Multi-Escena (JSON)" value={videoStructure} onChange={(e) => setVideoStructure(e.target.value)} rows={10} placeholder="La estructura JSON para el generador de video aparecerá aquí." readOnly={!videoStructure}/>
                    {videoStructure && (
                        <div className="mt-4">
                            <button
                                type="button"
                                onClick={() => onUseVideoPreset(videoStructure)}
                                className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors"
                            >
                                Cargar Escenas en Creador de Video
                            </button>
                        </div>
                    )}
                </Accordion>
                
                 <Accordion title="Fase 4: Generación de Audio (Módulo TTS)" defaultOpen>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormSelect label="Selector de Voz (Preset)" value={voicePreset} onChange={(e) => setVoicePreset(e.target.value)}>
                            {VOICE_PRESETS.map(v => <option key={v} value={v}>{v}</option>)}
                        </FormSelect>
                        <FormSelect label="Música de Fondo (Preset)" value={backgroundMusic} onChange={(e) => setBackgroundMusic(e.target.value)}>
                            {MUSIC_PRESETS.map(m => <option key={m} value={m}>{m}</option>)}
                        </FormSelect>
                         <FormSelect label="Formato de Salida" value={outputFormat} onChange={(e) => setOutputFormat(e.target.value as any)}>
                            <option>MP3</option>
                            <option>WAV</option>
                        </FormSelect>
                    </div>
                    <button onClick={handleGenerateAudio} disabled={isGeneratingAudio || !scriptContent} className="w-full mt-4 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400">
                        {isGeneratingAudio ? 'Generando Audio...' : 'Generar Audio del Podcast (Voice Off)'}
                    </button>
                     {generatedAudioUrl && (
                        <div className="mt-4">
                            <h4 className="font-semibold mb-2">Audio Generado:</h4>
                            <audio controls src={generatedAudioUrl} className="w-full" />
                            <a href={generatedAudioUrl} download={`podcast_${Date.now()}.wav`} className="inline-block mt-2 text-sm text-blue-600 hover:underline">
                                Descargar Audio
                            </a>
                        </div>
                    )}
                </Accordion>

                 <Accordion title="Fase 5: Distribución (Sinergia Editorial)" defaultOpen>
                    <p className="text-sm text-gray-600">Una vez generado el audio, puedes crear una tarea inteligente para que Synthia Pro redacte un anuncio para tu blog o redes sociales.</p>
                    <button onClick={handleCreateAnnouncementTask} disabled={!generatedAudioUrl} className="w-full mt-4 bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-400">
                        Crear Anuncio de Podcast
                    </button>
                </Accordion>
            </div>
        </div>
    );
};

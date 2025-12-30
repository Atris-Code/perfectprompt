import React, { useState, useCallback, useEffect, useMemo } from 'react';
import type { Task, View, ForumConfig, CharacterProfile, AutoSolution } from '../../types';
import { ContentType } from '../../types';
import { AGENTS_CODEX } from '../../data/agentsCodex';
import { Accordion } from '../form/Accordion';
import { FormInput, FormTextarea, FormSelect } from '../form/FormControls';
import { runForumSimulation } from '../../services/geminiService';
import { useTranslations } from '../../contexts/LanguageContext';

const TITAN_OPTIONS = AGENTS_CODEX.map(agent => ({
    id: agent.claveName,
    name: agent.claveName.split(',')[0],
}));

const ROLE_OPTIONS = [
    'Exponente Principal',
    'Oponente Crítico',
    'Moderador/Sintetizador',
    'Experto Técnico',
    'Observador Silencioso',
];

interface ParticipantState {
    reactId: string;
    id: string; // claveName from AGENTS_CODEX
    role: string;
    intensity: number;
}

interface TitansDebateProps {
    knowledgeSources: { name: string; content: string }[];
    initialTask: Task | null;
    onTaskConsumed: () => void;
    onSaveTask: (task: Task, navigate?: boolean) => void;
    onUpdateTask: (task: Task) => void;
    setView: (view: View) => void;
}

const fileToDataUrl = (file: File): Promise<{ data: string; name: string; type: string; }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ data: (reader.result as string).split(',')[1], name: file.name, type: file.type });
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
};

export const TitansDebate: React.FC<TitansDebateProps> = ({ knowledgeSources, initialTask, onTaskConsumed, onSaveTask, onUpdateTask, setView }) => {
    const { t } = useTranslations();
    
    const [instructions, setInstructions] = useState('');
    const [interactionStyle, setInteractionStyle] = useState('Debate profesional y constructivo, enfocado en encontrar la mejor solución.');
    const [isContingencyMode, setIsContingencyMode] = useState(false);
    const [participants, setParticipants] = useState<ParticipantState[]>([
        { reactId: `p-${Date.now()}-1`, id: 'Dr. Pirolis', role: 'Exponente Principal', intensity: 7 },
        { reactId: `p-${Date.now()}-2`, id: 'Helena, la Estratega', role: 'Oponente Crítico', intensity: 7 },
        { reactId: `p-${Date.now()}-3`, id: 'Janus, el Conciliador', role: 'Moderador/Sintetizador', intensity: 5 },
    ]);
    const [internalFiles, setInternalFiles] = useState<string[]>([]);
    const [externalFiles, setExternalFiles] = useState<File[]>([]);
    const [transcript, setTranscript] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    const isRatificationMode = useMemo(() => 
        initialTask?.stateLabel === 'Pendiente de Ratificación DAO'
    , [initialTask]);

    useEffect(() => {
        if (initialTask && !isRatificationMode) {
            setInstructions(initialTask.formData?.objective || '');
            const doc = initialTask.formData?.specifics?.[ContentType.Texto]?.uploadedDocument;
            if (doc?.name && knowledgeSources.some(ks => ks.name === doc.name)) {
                setInternalFiles([doc.name]);
            }
            onTaskConsumed();
        }
    }, [initialTask, isRatificationMode, onTaskConsumed, knowledgeSources]);


    const handleApproveAndSeal = () => {
        if (!initialTask) return;

        setIsLoading(true);
        setError('');
        
        setTimeout(() => {
            try {
                const transactionHash = `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;

                const updatedRatificationTask: Task = {
                    ...initialTask,
                    status: 'Completado',
                    stateLabel: 'Ratificado y Sellado',
                };
                onUpdateTask(updatedRatificationTask);

                const rawData = initialTask.formData?.specifics?.[ContentType.Texto]?.rawData;

                if (!rawData) {
                    throw new Error("No se encontraron los datos de cumplimiento originales (rawData) para crear el guion.");
                }
                
                const videoScriptPrompt = `
### **Prompt Mejorado para Generador de IA**
**Actúa como un director de producción y generador de guiones para videos técnicos.**

Tu tarea es crear el guion para un video corto y profesional que sirva como **registro visual del cumplimiento** de un protocolo de mantenimiento de contingencia. El video debe documentar de forma clara y secuencial cada paso completado por el cliente para resolver la "Alarma 7".

**1. Título del Proyecto:**
Registro de Cumplimiento: Protocolo de Limpieza para Alarma 7

**2. Objetivo Principal:**
Generar un video conciso que certifique la ejecución completa y exitosa del "Protocolo de Limpieza Inmediato" para la Alarma 7, realizado por el cliente. Este video funcionará como prueba documental para el soporte técnico y el registro interno.

**3. Audiencia:**
Personal de soporte técnico, ingenieros de mantenimiento y el propio cliente para sus registros de calidad.

**4. Tono y Estilo Visual (visualToneSyncStyle):**
* **Tono del Narrador/Texto:** Profesional, factual, claro y directo. Sin lenguaje coloquial.
* **Estilo Visual:** Documental técnico. Tomas limpias, estables, bien iluminadas y con un enfoque nítido en los detalles de cada acción. La paleta de colores debe ser neutra y profesional (grises, blancos, azules metálicos). Utiliza superposiciones de texto (gráficos en pantalla) minimalistas y legibles para cada paso.

**5. Estructura del Guion (Escena por Escena):**
Basado en los siguientes datos de cumplimiento, genera una secuencia visual lógica:

* **Raw Data:**
${rawData.split('\n').map(line => `* \`${line}\``).join('\n')}

---

### **GUION DE VIDEO:**
**(ESCENA 1: INTRODUCCIÓN)**
* **VISUAL:** Pantalla de título sobre un fondo técnico desenfocado (esquema de la caldera).
* **TEXTO EN PANTALLA:**
  * TÍTULO: **Registro de Cumplimiento**
  * PROTOCOLO: **Limpieza Inmediata - Alarma 7**
  * ESTADO: **Completado por el Cliente**
* **AUDIO:** Sonido electrónico breve y sutil.

**(ESCENA 2: PROTOCOLO DE SEGURIDAD)**
* **VISUAL:** Plano medio de la mano del cliente desconectando el enchufe de la caldera de la pared. Corte a un primer plano de un dedo apagando el interruptor de un SAI (Sistema de Alimentación Ininterrumpida).
* **TEXTO EN PANTALLA:** **Paso 1: Desconexión de seguridad (Sec. 7.2) | ✓ COMPLETADO**
* **AUDIO:** Clic distintivo de la desconexión y del interruptor.

**(ESCENA 3: ACCESO A COMPONENTES)**
* **VISUAL:** Vista cenital de manos (con guantes) retirando con precisión las 4 tapas triangulares de la parte superior de la caldera.
* **TEXTO EN PANTALLA:** **Paso 2: Acceso a tubos de convección (Sec. 7.2) | ✓ COMPLETADO**
* **AUDIO:** Sonido metálico ligero al retirar las tapas.

**(ESCENA 4: LIMPIEZA DE DEFLECTORES)**
* **VISUAL:** Secuencia rápida: 1) Mano extrayendo un deflector de acero inoxidable. 2) Plano de los 18 deflectores alineados. 3) Primer plano extremo de un cepillo de alambre limpiando enérgicamente un deflector, mostrando el hollín desprendiéndose.
* **TEXTO EN PANTALLA:** **Paso 3: Limpieza de 18 deflectores (Sec. 7.2) | ✓ COMPLETADO**
* **AUDIO:** Sonido de metal contra metal y del cepillado.

**(ESCENA 5: LIMPIEZA INTERNA)**
* **VISUAL:** Un plano que mira hacia el interior de los tubos expuestos. El cepillo largo suministrado entra y sale de un tubo, arrastrando hollín. Se puede usar un leve avance rápido para mostrar la acción repetida.
* **TEXTO EN PANTALLA:** **Paso 4: Limpieza de 18 tubos de convección (Sec. 7.2) | ✓ COMPLETADO**
* **AUDIO:** Sonido de cerdas raspando el interior metálico.

**(ESCENA 6: MANTENIMIENTO DEL EXTRACTOR)**
* **VISUAL:** Manos abriendo la carcasa del extractor de humos. Un primer plano de las aspas de la turbina, que son limpiadas con un paño o cepillo, pasando de estar opacas a brillantes.
* **TEXTO EN PANTALLA:** **Paso 5: Limpieza de turbina de humos (Sec. 7.3.2) | ✓ COMPLETADO**
* **AUDIO:** Sonido de una bisagra y de una limpieza suave.

**(ESCENA 7: REENSAMBLAJE)**
* **VISUAL:** Montaje en lapso de tiempo (timelapse) mostrando el reensamblaje de todos los componentes en orden inverso. Enfocar en el ajuste final de las tapas, asegurando un sellado perfecto.
* **TEXTO EN PANTALLA:** **Paso 6: Reensamblaje y sellado final | ✓ COMPLETADO**
* **AUDIO:** Sonidos de herramientas y clics metálicos, ligeramente acelerados.

**(ESCENA 8: CIERRE Y VERIFICACIÓN)**
* **VISUAL:** Plano general de la caldera completamente ensamblada. Una luz indicadora en el panel de control cambia de rojo intermitente (alarma) a verde fijo (operativo).
* **TEXTO EN PANTALLA:**
  * **PROTOCOLO FINALIZADO CON ÉXITO**
  * **Alarma 7 Resuelta.**
  * **Sistema Operativo.**
  * **PRUEBA DE VALIDACIÓN DAO (NFT):** \`{transactionHash}\`
* **AUDIO:** Un pitido de confirmación positivo, seguido por el suave zumbido de la caldera en funcionamiento normal.

---
**Instrucción Final:** Asegúrate de que las transiciones entre escenas sean limpias y rápidas. La duración total del video debe ser corta y directa al punto (ej. 45-60 segundos), enfocada en mostrar eficiencia y cumplimiento.
                `.trim();

                // THIS IS THE FIX: A completely new object with no spread from initialTask.
                const editorialTask: Task = {
                    id: `editorial-task-${Date.now()}`,
                    title: `Video: Prueba de Cumplimiento (Alarma 7)`,
                    createdAt: Date.now(),
                    status: 'Por Hacer',
                    contentType: ContentType.Video,
                    // NO eventType property is included.
                    formData: {
                        objective: 'Crear un video documental técnico que sirva como prueba de cumplimiento del protocolo de limpieza de la Alarma 7.',
                        tone: 'Profesional, factual, claro y directo',
                        specifics: {
                            [ContentType.Video]: {
                                videoWorkflow: 'synergy',
                                generatedCinematicScript: videoScriptPrompt.replace('{transactionHash}', transactionHash),
                            },
                            [ContentType.Texto]: { rawData },
                            [ContentType.Imagen]: {},
                            [ContentType.Audio]: {},
                            [ContentType.Codigo]: {},
                        }
                    },
                };
                onSaveTask(editorialTask);
                onTaskConsumed();
                setView('tasks');
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Error desconocido.');
            } finally {
                setIsLoading(false);
            }
        }, 1000);
    };

    const handleAddParticipant = () => {
        setParticipants(prev => [...prev, { reactId: `p-${Date.now()}`, id: TITAN_OPTIONS[0].id, role: ROLE_OPTIONS[0], intensity: 5 }]);
    };

    const handleRemoveParticipant = (reactId: string) => {
        setParticipants(prev => prev.filter(p => p.reactId !== reactId));
    };

    const handleUpdateParticipant = (reactId: string, field: 'id' | 'role' | 'intensity', value: string | number) => {
        setParticipants(prev => prev.map(p => p.reactId === reactId ? { ...p, [field]: value } : p));
    };

    const handleExecuteSimulation = async () => {
        setIsLoading(true);
        setError('');
        setTranscript('');

        try {
            const externalFileContents = await Promise.all(
                externalFiles.map(file => fileToDataUrl(file))
            );

            const internalFileContents = internalFiles.map(fileName => {
                const source = knowledgeSources.find(ks => ks.name === fileName);
                return { name: fileName, content: source ? source.content : 'Contenido no encontrado.' };
            });

            const config: ForumConfig = {
                instructions,
                interactionStyle,
                isContingencyMode,
                participants: participants.map(p => ({ id: p.id, role: p.role, intensity: p.intensity, type: 'internal' })),
                files: externalFileContents,
                knowledgeBaseFiles: internalFileContents,
            };

            const result = await runForumSimulation(config);
            setTranscript(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido.');
        } finally {
            setIsLoading(false);
        }
    };
    
    if (isRatificationMode) {
        const rawData = initialTask?.formData?.specifics?.[ContentType.Texto]?.rawData;

        return (
            <div className="bg-white p-6 rounded-lg shadow-md animate-fade-in">
                <style>{`
                  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                  .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
                `}</style>
                <h2 className="text-2xl font-bold text-gray-800">Propuesta de Ratificación: Cumplimiento Protocolo Alarma 7</h2>
                <p className="text-sm text-gray-500 mb-6">Revisa el cumplimiento del protocolo y aprueba para sellar el "Registro Único" en la blockchain (simulado).</p>

                <Accordion title="Datos Brutos del Cumplimiento" defaultOpen>
                    <pre className="text-sm bg-gray-100 p-4 rounded-md whitespace-pre-wrap font-mono">{rawData || "No hay datos de cumplimiento."}</pre>
                </Accordion>
                
                <div className="mt-6">
                    <button
                        onClick={handleApproveAndSeal}
                        disabled={isLoading}
                        className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                    >
                        {isLoading ? 'Procesando en Blockchain...' : 'Aprobar Propuesta y Sellar Cumplimiento (Simulado)'}
                    </button>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>
            </div>
        );
    }


    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
             <header className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Debate de Titanes</h2>
                <p className="text-sm text-gray-500">Simula una mesa redonda estratégica con tus agentes IA para resolver conflictos y tomar decisiones.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* --- CONFIGURATION PANEL --- */}
                <div className="space-y-4">
                    <Accordion title={t('titansForum.debate.title')} defaultOpen>
                        <FormTextarea label={t('titansForum.debate.instructions')} value={instructions} onChange={e => setInstructions(e.target.value)} placeholder={t('titansForum.debate.instructionsPlaceholder')} rows={3} required />
                        <FormInput label={t('titansForum.debate.interactionStyle')} value={interactionStyle} onChange={e => setInteractionStyle(e.target.value)} placeholder={t('titansForum.debate.interactionStylePlaceholder')} />
                        <div className="flex items-center"><input id="contingency-mode" type="checkbox" checked={isContingencyMode} onChange={e => setIsContingencyMode(e.target.checked)} className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500" /><label htmlFor="contingency-mode" className="ml-2 block text-sm text-red-700 font-semibold">{t('titansForum.debate.contingencyMode')}</label></div>
                    </Accordion>

                    <Accordion title={t('titansForum.debate.participants')} defaultOpen>
                        <div className="space-y-4">
                            {participants.map((p, index) => (
                                <div key={p.reactId} className="grid grid-cols-12 gap-2 items-end p-2 bg-gray-50 rounded-md border">
                                    <div className="col-span-5"><FormSelect label={`Participante ${index + 1}`} value={p.id} onChange={e => handleUpdateParticipant(p.reactId, 'id', e.target.value)}>{TITAN_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}</FormSelect></div>
                                    <div className="col-span-6"><FormSelect label="Rol" value={p.role} onChange={e => handleUpdateParticipant(p.reactId, 'role', e.target.value)}>{ROLE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}</FormSelect></div>
                                    <div className="col-span-1"><button onClick={() => handleRemoveParticipant(p.reactId)} className="p-2 text-red-500 hover:bg-red-100 rounded-md">&times;</button></div>
                                    {p.role === 'Oponente Crítico' && (
                                        <div className="col-span-12 mt-2">
                                            <label className="text-xs font-medium text-gray-700">Intensidad ({p.intensity}/10)</label>
                                            <input type="range" min="1" max="10" value={p.intensity} onChange={e => handleUpdateParticipant(p.reactId, 'intensity', Number(e.target.value))} className="w-full"/>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button onClick={handleAddParticipant} className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-800">+ {t('titansForum.debate.addParticipant')}</button>
                    </Accordion>

                     <Accordion title="Fuentes de Conocimiento" defaultOpen>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">{t('titansForum.debate.knowledgeBase')}</label>
                            <p className="text-xs text-gray-500 mb-2">Ctrl+Click para seleccionar varios. Estos documentos son accesibles para los Titanes internos.</p>
                            <select multiple value={internalFiles} onChange={e => setInternalFiles(Array.from(e.target.selectedOptions, (option: any) => option.value))} className="w-full h-32 border border-gray-300 rounded-md p-2">
                                {knowledgeSources.map(ks => <option key={ks.name} value={ks.name}>{ks.name}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                             <label className="block text-sm font-medium text-gray-700">{t('titansForum.debate.externalFiles')}</label>
                             <input type="file" multiple onChange={e => setExternalFiles(Array.from(e.target.files || []))} className="mt-1 block w-full text-sm"/>
                        </div>
                    </Accordion>

                    <button onClick={handleExecuteSimulation} disabled={isLoading} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                        {isLoading ? t('titansForum.debate.simulating') : t('titansForum.debate.runSimulation')}
                    </button>
                </div>

                {/* --- TRANSCRIPT PANEL --- */}
                <div className="bg-slate-900 text-white p-6 rounded-lg flex flex-col">
                    <div className="flex justify-between items-center mb-4 flex-shrink-0">
                        <h3 className="text-xl font-semibold">{t('titansForum.debate.result')}</h3>
                        {transcript && (
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(transcript);
                                    setIsCopied(true);
                                    setTimeout(() => setIsCopied(false), 2000);
                                }}
                                className={`text-xs py-1 px-3 rounded flex items-center gap-2 transition-colors border ${isCopied ? 'bg-green-600 border-green-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white border-slate-600'}`}
                                title="Copiar Transcripción"
                            >
                                <span>{isCopied ? '✅' : '📋'}</span> {isCopied ? 'Copiado' : 'Copiar'}
                            </button>
                        )}
                    </div>
                    {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>}
                    <div className="flex-grow bg-black/30 rounded-md p-4 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full"><p className="animate-pulse">Generando transcripción...</p></div>
                        ) : transcript ? (
                            <pre className="whitespace-pre-wrap font-sans text-sm">{transcript}</pre>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400">La transcripción aparecerá aquí...</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

import React, { useState, useEffect } from 'react';
import { AGENTS_CODEX } from '../../data/agentsCodex';
import type { View, CharacterProfile, Task, AutoSolution } from '../../types';
import { generateAutomaticSolution } from '../../services/geminiService';
import type { Chat } from '../../services/geminiService';

// Icons for the multimedia sections
const ImageIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>);
const AudioIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.858 12h.01M12 12h.01M18.142 12h.01M4 12a8 8 0 1116 0 8 8 0 01-16 0z" /></svg>);
const VideoIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>);
const CodeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>);


const AgentCard: React.FC<{ character: CharacterProfile; onSelect: (character: CharacterProfile) => void }> = ({ character, onSelect }) => {
    return (
        <div className="bg-gray-800 text-white rounded-2xl shadow-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-cyan-500/20 hover:shadow-2xl hover:transform hover:-translate-y-1">
            <div className="p-6">
                <h3 className="text-2xl font-bold text-cyan-400">{character.claveName}</h3>
                <p className="text-sm uppercase text-gray-400 tracking-wider">{character.archetype}</p>
            </div>
            <div className="px-6 py-4 bg-gray-900/50">
                <p className="text-gray-300 italic">"{character.mantra}"</p>
            </div>

            <div className="p-6 flex-grow space-y-3">
                <div className="flex items-start gap-4 p-3 bg-gray-700/50 rounded-lg">
                    <ImageIcon />
                    <div>
                        <h4 className="font-semibold">Imagen</h4>
                        <p className="text-xs text-gray-400 mt-1">Un retrato de personaje de alta calidad que capture su esencia.</p>
                    </div>
                </div>
                <div className="flex items-start gap-4 p-3 bg-gray-700/50 rounded-lg">
                    <AudioIcon />
                    <div>
                        <h4 className="font-semibold">Audio</h4>
                        <p className="text-xs text-gray-400 mt-1">{character.audio.description} (Voz: {character.audio.voice}; Sonido: {character.audio.soundDesign})</p>
                    </div>
                </div>
                 <div className="flex items-start gap-4 p-3 bg-gray-700/50 rounded-lg">
                    <VideoIcon />
                    <div>
                        <h4 className="font-semibold">Video</h4>
                        <p className="text-xs text-gray-400 mt-1">{character.video.description}</p>
                    </div>
                </div>
                 <div className="flex items-start gap-4 p-3 bg-gray-700/50 rounded-lg">
                    <CodeIcon />
                    <div>
                        <h4 className="font-semibold">Código</h4>
                        <p className="text-xs text-gray-400 mt-1">{character.code.description}</p>
                    </div>
                </div>
            </div>

            <div className="p-6 mt-auto">
                <button
                    onClick={() => onSelect(character)}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-gray-900 font-bold py-3 px-4 rounded-lg transition-colors"
                >
                    Abrir Espacio de Trabajo
                </button>
            </div>
        </div>
    );
};

// Component to render the structured automatic solution
const AutoSolutionDisplay: React.FC<{ solution: AutoSolution }> = ({ solution }) => {
    return (
        <div className="animate-fade-in">
            <div className="text-sm text-gray-300">
                <strong className="text-cyan-400">AVATAR (JUAN C COLLINS): </strong>
                <pre className="whitespace-pre-wrap font-sans">{solution.introduccion}</pre>
            </div>
            <div className="text-sm text-gray-300 mt-4 pl-4 border-l-2 border-gray-600 space-y-4">
                <p>He preparado una 'Solución Energética Termal Completa' para usted:</p>
                <div>
                    <p className="font-semibold">{solution.analisisCostos.titulo}</p>
                    <p>{solution.analisisCostos.descripcion}</p>
                    <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                        <li>{solution.analisisCostos.opcionA}</li>
                        <li>{solution.analisisCostos.opcionB}</li>
                        <li>{solution.analisisCostos.ahorro}</li>
                    </ul>
                </div>
                <div>
                    <p className="font-semibold">{solution.protocoloLimpieza.titulo}</p>
                    <p>{solution.protocoloLimpieza.descripcion}</p>
                    <ol className="list-decimal list-inside ml-4 mt-1 space-y-1">
                        {solution.protocoloLimpieza.pasos.map((paso, index) => (
                            <li key={index}>{paso}</li>
                        ))}
                    </ol>
                </div>
                 <p className="mt-2">{solution.recomendacionFinal}</p>
            </div>
        </div>
    );
};


interface TitansAtriumProps {
    titans: CharacterProfile[];
    onUpdateTitan: (titan: CharacterProfile) => void;
    setView: (view: View) => void;
    onOpenWorkstation: (titan: CharacterProfile) => void;
    knowledgeSources: { name: string; content: string }[];
    onSaveTask: (task: Task, navigate?: boolean) => void;
    onNavigateToForum: (context: { instructions: string; files: { name: string; content: string }[] }) => void;
    crisisContext: any | null;
    onCrisisHandled: () => void;
    onNavigateToExpertCommand: (context: any) => void;
    onStartCinematicAudit: (solution: AutoSolution) => void;
}

export const TitansAtrium: React.FC<TitansAtriumProps> = ({ titans, onUpdateTitan, setView, onOpenWorkstation, onSaveTask, onNavigateToForum, knowledgeSources, crisisContext, onCrisisHandled, onNavigateToExpertCommand, onStartCinematicAudit }) => {
    const [autoSolution, setAutoSolution] = useState<AutoSolution | null>(null);
    const [isGeneratingAutoSolution, setIsGeneratingAutoSolution] = useState(false);
    const [autoSolutionError, setAutoSolutionError] = useState('');

    useEffect(() => {
        const generateAndSetAutoSolution = async () => {
            setIsGeneratingAutoSolution(true);
            setAutoSolution(null);
            setAutoSolutionError('');
            try {
                const fullCrisisContext = {
                    activo: 'Módulo 7: EcoHornet CTP-20',
                    alarma: 'Alarma 7: Temperatura del gas demasiado alta (172°C)',
                    diagnostico: 'Causa probable: Depósitos de hollín por pellets no conformes (Humedad > 10%)',
                    manual: 'Manual CTP 2020 (7).pdf',
                    seccionesClave: ['2.1', '2.5', '7.2', '7.3'],
                };
                const solution = await generateAutomaticSolution(fullCrisisContext);
                setAutoSolution(solution);
            } catch (error) {
                console.error("Error generating automatic solution:", error);
                setAutoSolutionError(error instanceof Error ? error.message : "Un error desconocido ocurrió al generar la solución.");
            } finally {
                setIsGeneratingAutoSolution(false);
            }
        };
        
        if (crisisContext?.active && !autoSolution && !isGeneratingAutoSolution && !autoSolutionError) {
            generateAndSetAutoSolution();
        }
    }, [crisisContext, autoSolution, isGeneratingAutoSolution, autoSolutionError]);

    const handleResetAndGoBack = () => {
        onCrisisHandled();
        setAutoSolution(null);
        setIsGeneratingAutoSolution(false);
        setAutoSolutionError('');
    };

    if (crisisContext?.active) {
        const ChatMessage = ({ sender, message, special }: { sender?: string; message: string; special?: boolean }) => (
            <div className={`text-sm ${special ? 'text-center italic text-gray-500 py-2' : ''}`}>
                {!special && <strong className="text-cyan-400">{sender}: </strong>}
                <span className={special ? '' : 'text-gray-300'}>{message}</span>
            </div>
        );

        return (
            <div className="bg-gray-900 text-white p-8 rounded-2xl shadow-lg min-h-full">
                <style>{`
                  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                  .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
                `}</style>
                <header className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-red-400">Atrio: Intervención de Crisis en Progreso (M7: ALARMA 7)</h2>
                </header>

                <div className="space-y-8 animate-fade-in">
                    <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
                        <h3 className="text-xl font-bold text-cyan-400 mb-4">Visualizador de Protocolo (En Tiempo Real)</h3>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3"><span className="text-green-400">✅</span> <strong>[PASO 1: DETECTADO]</strong> Alarma 7: Temp. Gases Excesiva (172°C)</li>
                            <li className="flex items-center gap-3"><span className="text-green-400">✅</span> <strong>[PASO 2: TRIAJE]</strong> Dominio Protegido (EcoHornet) Identificado</li>
                            <li className="flex items-center gap-3"><span className="text-green-400">✅</span> <strong>[PASO 3: ESCALADO]</strong> Notificando al Consultor Humano (Juan C Collins)... (Esperando decisión: Manual o Automática...)</li>
                        </ul>
                    </div>

                    <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
                        <h3 className="text-xl font-bold text-cyan-400 mb-4">[ Chat de Intervención: Director de Orquesta ]</h3>
                        <div className="space-y-3 bg-gray-900/50 p-4 rounded-md">
                            <ChatMessage sender="DIRECTOR" message="Alerta Crítica ALARMA 7 recibida del Módulo 7. Activando Protocolo de Intervención Experta." />
                            <ChatMessage sender="DIRECTOR" message="Notificación enviada al Consultor Principal (Humano). En espera de decisión de intervención..." />
                            <ChatMessage sender="DIRECTOR" message="Decisión recibida: Modo Automático. Convocando al Avatar (IA) 'Juan C Collins' para gestionar la solución..." />
                            
                            {isGeneratingAutoSolution && <ChatMessage special message="[ El Avatar (IA) Juan C Collins está analizando la situación y preparando una solución completa... ]" />}
                            {autoSolutionError && <ChatMessage sender="SYSTEM ERROR" message={autoSolutionError} />}
                            {autoSolution && <AutoSolutionDisplay solution={autoSolution} />}
                        </div>
                        
                        {autoSolution && (
                            <div className="mt-6">
                                <button
                                    onClick={() => onStartCinematicAudit(autoSolution)}
                                    className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    [ Iniciar Protocolo de Auditoría Cinemática (Modo Seguro) ]
                                </button>
                            </div>
                        )}

                        <div className="mt-4 p-3 bg-gray-900 rounded-md text-center text-gray-500 italic text-sm">
                            (Chat deshabilitado en Modo Observador)
                        </div>
                    </div>
                    
                    <div className="text-center mt-8">
                      <button onClick={handleResetAndGoBack} className="text-cyan-400 hover:text-cyan-300">&larr; Volver a la selección de Titanes</button>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
    <div className="bg-gray-900 p-8 rounded-2xl shadow-lg min-h-full">
        <header className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white">El Atrio de los Titanes</h2>
            <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto">
                Selecciona un Titán para acceder a su espacio de trabajo, gestionar sus asistentes IA o iniciar una conversación.
            </p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {titans.map(character => (
                <AgentCard key={character.claveName} character={character} onSelect={onOpenWorkstation} />
            ))}
        </div>
    </div>
    );
};
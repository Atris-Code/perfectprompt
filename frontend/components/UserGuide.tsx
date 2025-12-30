import React, { useState, useRef } from 'react';
import { ContentType } from '../types';
import { generateNarrativeAudio } from '../services/geminiService';
import { useMarco } from '../contexts/MarcoContext';

// Audio decoding helpers
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


// These modals are simplified placeholders for the visual aid.
const ModalPlaceholder: React.FC<{ title: string; onClose: () => void; children: React.ReactNode; actionButton: React.ReactNode; }> = ({ title, onClose, children, actionButton }) => (
    <div role="dialog" aria-modal="true" className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <header className="p-4 border-b flex justify-between items-center"><h3 className="font-bold text-lg">{title}</h3><button onClick={onClose} className="p-2 -mr-2">&times;</button></header>
            <div className="p-6">{children}</div>
            <footer className="p-4 border-t flex justify-end">{actionButton}</footer>
        </div>
    </div>
);

interface UserGuideProps {
  setView: (view: 'creator' | 'library' | 'pro' | 'academia' | 'editor' | 'gallery' | 'pro-layouts' | 'tasks') => void;
  setContentType: (type: ContentType) => void;
  setVideoModeToAgent: () => void;
}

export const UserGuide: React.FC<UserGuideProps> = ({ setView, setContentType, setVideoModeToAgent }) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const { setIsMarcoSpeaking } = useMarco();
  const [audioState, setAudioState] = useState<{ loadingId: string | null; playingId: string | null; errorId: string | null }>({ loadingId: null, playingId: null, errorId: null });
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const stopCurrentAudio = () => {
    if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current.disconnect();
        audioSourceRef.current = null;
    }
    setAudioState(prev => ({ ...prev, playingId: null }));
  };

  const handlePlayAudio = async (sectionId: string, text: string) => {
    if (audioState.playingId === sectionId) {
        stopCurrentAudio();
        setIsMarcoSpeaking(false);
        return;
    }
    
    stopCurrentAudio();
    setAudioState({ loadingId: sectionId, playingId: null, errorId: null });
    setIsMarcoSpeaking(true);

    try {
        const base64Audio = await generateNarrativeAudio(text);

        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const ctx = audioContextRef.current;

        const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
        
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.start();
        
        audioSourceRef.current = source;
        setAudioState({ loadingId: null, playingId: sectionId, errorId: null });

        source.onended = () => {
            if (audioSourceRef.current === source) {
                setAudioState(prev => ({ ...prev, playingId: null }));
                audioSourceRef.current = null;
                setIsMarcoSpeaking(false);
            }
        };

    } catch (error) {
        console.error("Error generating or playing audio:", error);
        setAudioState({ loadingId: null, playingId: null, errorId: sectionId });
        setIsMarcoSpeaking(false);
    }
  };
  
  const handleExploreLibrary = () => {
    setActiveModal(null);
    setView('library');
  };

  const handleGoToVideoBuilder = () => {
     setActiveModal(null);
     setContentType(ContentType.Video);
     setView('creator');
  };
  
  const handleActivateAgent = () => {
    setActiveModal(null);
    setVideoModeToAgent();
  };

  const steps = [
    {
        id: 'step1',
        title: 'Paso 1: Elige tu Estilo Artístico (El "Qué")',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>,
        text: 'Todo gran proyecto comienza con una visión estética. Tu primer paso es definir el ADN visual de tu creación. Explora la "Biblioteca de Estilos Artísticos", un catálogo con 100 estilos que abarcan desde el Renacimiento hasta el Cyberpunk. No necesitas ser un experto en historia del arte; simplemente elige el estilo que evoque la sensación que buscas. ¿Quieres que tu escena sea elegante como el "Art Deco", caótica como el "Glitch Art" o serena como la pintura "Sumi-e"? Aquí es donde lo decides.',
        action: () => setActiveModal('styles')
    },
    {
        id: 'step2',
        title: 'Paso 2: Define la Cinematografía (El "Cómo")',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
        text: 'Una vez que tienes el estilo, necesitas dirigir la cámara. La "Biblioteca de Presets de Video" es tu equipo de filmación virtual. En lugar de escribir instrucciones complejas desde cero, puedes seleccionar y combinar presets modulares para definir el movimiento de la cámara, la iluminación, los efectos visuales, la atmósfera e incluso el diseño de sonido. ¿Necesitas un travelling épico? ¿La estética de una película de 8mm? ¿Una atmósfera de terror gótico? Combina estos bloques para decirle a la IA exactamente cómo filmar tu escena.',
        action: () => setActiveModal('scenes')
    },
    {
        id: 'step3',
        title: 'Paso 3: Activa al Guionista (El "Porqué")',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
        text: 'Si tu proyecto es más que una sola imagen y necesita una narrativa, activa al "Agente Guionista Documental". Esta IA especializada tomará tu tema y lo convertirá en un guion de serie documental completo. Lo más importante es que, en cada escena, el agente utilizará de forma inteligente las bibliotecas de Estilos y Presets que exploraste en los pasos anteriores para generar la dirección de cámara y los prompts visuales, uniendo la historia con la cinematografía.',
        action: () => setActiveModal('script')
    },
  ];

  return (
    <div className="h-full w-full bg-white p-10 rounded-lg shadow-md overflow-y-auto">
        {activeModal && (
            <ModalPlaceholder title={`Apoyo Visual: ${activeModal}`} onClose={() => setActiveModal(null)} actionButton={
                <button 
                  onClick={() => {
                      if (activeModal === 'styles') handleExploreLibrary();
                      else if (activeModal === 'scenes') handleGoToVideoBuilder();
                      else if (activeModal === 'script') handleActivateAgent();
                      else setActiveModal(null);
                  }} 
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Ir al módulo
                </button>
            }>
                <p>Esta es una previsualización de la funcionalidad '{activeModal}'.</p>
            </ModalPlaceholder>
        )}
        
        <div className="text-center w-full max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800">Guía Rápida: Tu Flujo de Trabajo Co-Creativo</h2>
            <p className="mt-4 text-lg text-gray-600">
                Bienvenido al Creador de Prompts. Esta es una suite de herramientas diseñada para la co-creación. Tu rol es el del director creativo: tú aportas la visión y la intención. Nuestro rol es darte los bloques de construcción y los agentes especializados para materializar esa visión en un prompt de nivel profesional.
            </p>
             <p className="mt-2 text-md text-gray-600">
                Este flujo de trabajo está pensado para que te concentres en la creatividad, no en la sintaxis. Sigue estos tres pasos para pasar de una idea a un resultado espectacular.
            </p>
        </div>
        <div className="mt-12 w-full max-w-5xl mx-auto space-y-10">
            {steps.map((step, index) => (
                <div key={index} className="flex items-start gap-6">
                    <div className="flex-shrink-0 bg-blue-50 p-4 rounded-full shadow-sm border border-blue-100">
                        {step.icon}
                    </div>
                    <div className="flex-1 pt-2">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            {step.title}
                            <button
                                onClick={() => handlePlayAudio(step.id, step.text)}
                                disabled={audioState.loadingId === step.id}
                                className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 hover:bg-gray-300 transition-colors disabled:opacity-50"
                                aria-label={`Escuchar ${step.title}`}
                            >
                                {audioState.loadingId === step.id ? '🔄' : audioState.playingId === step.id ? '⏹️' : audioState.errorId === step.id ? '⚠️' : '🔊'}
                            </button>
                        </h3>
                        <p className="mt-2 text-gray-600 leading-relaxed">{step.text}</p>
                        <button onClick={step.action} className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                            Ver Apoyo Visual →
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { CharacterProfile, ChatMessage, Task, Assistant } from '../types';
import { ContentType } from '../types';
import { generateNarrativeAudio, generateNarrativeFields, delegateToAssistant } from '../services/geminiService';
import { useMarco } from '../contexts/MarcoContext';
import { DelegateTaskModal } from './DelegateTaskModal';

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

// Helper to convert AudioBuffer to a WAV Blob for download
function audioBufferToWav(buffer: AudioBuffer): Blob {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const arrayBuffer = new ArrayBuffer(length);
    const view = new DataView(arrayBuffer);
    let pos = 0;

    const setUint16 = (data: number) => {
        view.setUint16(pos, data, true);
        pos += 2;
    };
    const setUint32 = (data: number) => {
        view.setUint32(pos, data, true);
        pos += 4;
    };

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
            sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
            view.setInt16(pos, sample, true);
            pos += 2;
        }
        offset++;
    }
    return new Blob([view], { type: 'audio/wav' });
}


interface NarrativeFields {
    objective: string;
    audience: string;
    conflictPoint: string;
    uvp: string;
}

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

interface AgentChatModalProps {
  agent: CharacterProfile;
  isOpen: boolean;
  onClose: () => void;
  chatHistory: ChatMessage[];
  onSendMessage: (message: string, file?: { name: string; type: string; data: string; }) => void;
  isAgentReplying: boolean;
  onSaveTask: (task: Task) => void;
  onAssistantResponse: (response: ChatMessage) => void;
  knowledgeSources: { name: string; content: string }[];
}

const InteractiveMessage: React.FC<{ text: string; onAction: (action: string, context: string) => void }> = ({ text, onAction }) => {
    // Regex to capture the action and the content of the interactive tag
    const parts = text.split(/<interactive action="([^"]+)">([^<]+)<\/interactive>/g);
    
    return (
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {parts.map((part, i) => {
                if (i % 3 === 1) { // This is the action captured by the regex, we don't render it directly
                    return null;
                }
                if (i % 3 === 2) { // This is the content inside the tag
                    const action = parts[i - 1]; // The action is the previous part in the array
                    return (
                        <button 
                            key={i} 
                            onClick={() => onAction(action, part)}
                            className="bg-blue-900/50 hover:bg-blue-800/70 text-cyan-300 font-semibold py-1 px-2 rounded-md border border-blue-700/50 transition-colors mx-1"
                        >
                            {part}
                        </button>
                    );
                }
                // Regular text part, handle markdown bolding
                const boldedParts = part.split(/\*\*(.*?)\*\*/g);
                return boldedParts.map((boldPart, j) => 
                    j % 2 === 1 ? <strong key={`${i}-${j}`}>{boldPart}</strong> : <span key={`${i}-${j}`}>{boldPart}</span>
                );
            })}
        </p>
    );
};

export const AgentChatModal: React.FC<AgentChatModalProps> = ({
  agent,
  isOpen,
  onClose,
  chatHistory,
  onSendMessage,
  isAgentReplying,
  onSaveTask,
  onAssistantResponse,
  knowledgeSources
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [attachedFile, setAttachedFile] = useState<{ name: string; type: string; data: string; } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDelegateModalOpen, setIsDelegateModalOpen] = useState(false);
  
  const { setIsMarcoSpeaking } = useMarco();
  const [audioState, setAudioState] = useState<{ loadingId: string | null; playingId: string | null; errorId: string | null }>({ loadingId: null, playingId: null, errorId: null });
  const [generatedAudioBlobs, setGeneratedAudioBlobs] = useState<Map<string, Blob>>(new Map());
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const [narrativeAnalysis, setNarrativeAnalysis] = useState<Record<string, { loading: boolean; error: string; data: NarrativeFields | null }>>({});

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [chatHistory, isAgentReplying]);
  
  const stopCurrentAudio = useCallback(() => {
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current.disconnect();
        audioSourceRef.current = null;
      }
      setAudioState(prev => ({ ...prev, playingId: null }));
      setIsMarcoSpeaking(false);
  }, [setIsMarcoSpeaking]);

  useEffect(() => {
    return () => {
      stopCurrentAudio();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [stopCurrentAudio]);
  
  const handlePlayAudio = useCallback(async (messageId: string, text: string) => {
    if (audioState.playingId === messageId) {
        stopCurrentAudio();
        return;
    }
    
    stopCurrentAudio();
    setAudioState({ loadingId: messageId, playingId: null, errorId: null });
    setIsMarcoSpeaking(true);

    try {
        const base64Audio = await generateNarrativeAudio(text);

        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const ctx = audioContextRef.current;

        const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
        const wavBlob = audioBufferToWav(audioBuffer);
        setGeneratedAudioBlobs(prev => new Map(prev).set(messageId, wavBlob));

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.start();
        
        audioSourceRef.current = source;
        setAudioState({ loadingId: null, playingId: messageId, errorId: null });

        source.onended = () => {
            if (audioSourceRef.current === source) {
                setAudioState(prev => ({ ...prev, playingId: null }));
                audioSourceRef.current = null;
                setIsMarcoSpeaking(false);
            }
        };
    } catch (error) {
        console.error("Error generating or playing audio:", error);
        setAudioState({ loadingId: null, playingId: null, errorId: messageId });
        setIsMarcoSpeaking(false);
    }
  }, [audioState.playingId, stopCurrentAudio, setIsMarcoSpeaking]);

  useEffect(() => {
    const lastMessage = chatHistory[chatHistory.length - 1];
    if (lastMessage && lastMessage.role === 'model' && agent.claveName === 'Marco, el Narrador' && !generatedAudioBlobs.has(lastMessage.id)) {
        handlePlayAudio(lastMessage.id, lastMessage.text);
    }
  }, [chatHistory, agent.claveName, generatedAudioBlobs, handlePlayAudio]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'es-ES';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
    };
    
    recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                 setInputMessage(inputMessage + event.results[i][0].transcript);
            }
        }
        if(finalTranscript){
          setInputMessage(current => current + finalTranscript);
        }
    };
    
    recognitionRef.current = recognition;
  }, [inputMessage]);

  const toggleListening = () => {
      if (!recognitionRef.current) return;
      if (isListening) {
          recognitionRef.current.stop();
      } else {
          setInputMessage(''); // Clear input before starting
          recognitionRef.current.start();
      }
  };
  
  const handleAnalyzeNarrative = async (messageId: string, text: string) => {
    if (narrativeAnalysis[messageId]?.data) {
        setNarrativeAnalysis(prev => ({...prev, [messageId]: { ...prev[messageId], data: null }}));
        return;
    }
    setNarrativeAnalysis(prev => ({ ...prev, [messageId]: { loading: true, error: '', data: null }}));
    try {
      const result = await generateNarrativeFields({ text });
      setNarrativeAnalysis(prev => ({ ...prev, [messageId]: { loading: false, error: '', data: result }}));
    } catch (e) {
      setNarrativeAnalysis(prev => ({ ...prev, [messageId]: { loading: false, error: e instanceof Error ? e.message : 'Error', data: null }}));
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() && !attachedFile) return;
    onSendMessage(inputMessage.trim(), attachedFile || undefined);
    setInputMessage('');
    setAttachedFile(null);
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setAttachedFile({ name: file.name, type: file.type, data: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => setAttachedFile(null);

  const handleDelegateResponse = (assistantName: string, responseText: string) => {
    const assistantMessage: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'model',
        text: `**Respuesta de ${assistantName}:**\n\n${responseText}`,
    };
    onAssistantResponse(assistantMessage);
  };

  const getChatAsText = () => {
    return chatHistory.map(msg => `[${msg.role === 'user' ? 'TÚ' : agent.claveName.split(',')[0]}]: ${msg.text}`).join('\n\n');
  };

  const handleDownloadChat = () => {
    const chatContent = getChatAsText();
    const blob = new Blob([chatContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat_con_${agent.claveName.replace(/[\s,]/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveAsTask = () => {
    const chatContent = getChatAsText();
     const newTask: Task = {
        id: `chat-recap-${Date.now()}`,
        title: `Resumen de Chat con ${agent.claveName}`,
        createdAt: Date.now(),
        status: 'Por Hacer',
        contentType: ContentType.Texto,
        formData: {
            objective: `Resumir la conversación con ${agent.claveName}`,
            specifics: {
                [ContentType.Texto]: { rawData: chatContent },
                [ContentType.Imagen]: {},
                [ContentType.Video]: {},
                [ContentType.Audio]: {},
                [ContentType.Codigo]: {},
            },
        },
    };
    onSaveTask(newTask);
    alert('Chat guardado como tarea en el Gestor de Tareas.');
  };
  
  const handleInteractiveAction = (action: string, context: string) => {
    let followUpMessage = '';
    switch (action) {
        case 'explain_tir':
            followUpMessage = `Kairos, explícame en más detalle el cálculo detrás de '${context}'. ¿Qué supuestos utilizaste en la simulación Monte-Carlo para llegar a ese resultado?`;
            break;
        case 'explain_reactor_config':
            followUpMessage = `Hefesto, dame más detalles sobre la configuración que mencionaste: '${context}'. ¿Por qué es la óptima para NFU?`;
            break;
        case 'explain_yield':
             followUpMessage = `Hefesto, ¿cómo se desglosa el rendimiento de '${context}'? ¿Qué factores influyen más en este resultado?`;
            break;
        default:
            followUpMessage = `Explica más sobre '${context}'.`;
    }
    onSendMessage(followUpMessage);
  };

  if (!isOpen) return null;
  
  const activeAssistants = (agent.assistants || []).filter(a => a.status === 'ACTIVE');

  return (
    <>
      {isDelegateModalOpen && (
        <DelegateTaskModal
          assistants={activeAssistants}
          knowledgeSources={knowledgeSources}
          onClose={() => setIsDelegateModalOpen(false)}
          onDelegate={handleDelegateResponse}
        />
      )}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-modal-title"
        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div
          className="bg-gray-800 text-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="p-5 border-b border-gray-700 flex justify-between items-center bg-gray-900/50 flex-shrink-0">
            <div>
              <h3 id="chat-modal-title" className="text-xl font-bold text-cyan-400">Conversando con {agent.claveName}</h3>
              <p className="text-sm text-gray-400">{agent.archetype}</p>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={handleSaveAsTask} className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700">Guardar</button>
                <button onClick={handleDownloadChat} className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300">Descargar</button>
                <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700" aria-label="Cerrar chat">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
          </header>

          <main className="flex-grow p-6 overflow-y-auto space-y-4">
            {chatHistory.map((msg) => (
              <div key={msg.id}>
                <div className={`flex items-end gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                   {msg.role === 'model' && (
                    <div className="w-8 h-8 rounded-full bg-cyan-500 flex-shrink-0 flex items-center justify-center text-gray-900 font-bold text-sm">
                      {agent.claveName.charAt(0)}
                    </div>
                  )}
                  <div className={`max-w-md lg:max-w-lg p-3 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 rounded-br-none' : 'bg-gray-700 rounded-bl-none'}`}>
                    <InteractiveMessage text={msg.text} onAction={handleInteractiveAction} />
                    {msg.file && <img src={msg.file.data} alt={msg.file.name} className="mt-2 rounded-lg max-w-xs" />}
                  </div>
                  <div className="flex items-center gap-1 self-center">
                      {msg.role === 'model' && agent.claveName === 'Marco, el Narrador' && (
                        <>
                          <button onClick={() => handlePlayAudio(msg.id, msg.text)} disabled={audioState.loadingId === msg.id} className="p-2 rounded-full hover:bg-gray-700 text-gray-400" aria-label="Escuchar">
                             {audioState.loadingId === msg.id ? '🔄' : audioState.playingId === msg.id ? '⏹️' : audioState.errorId === msg.id ? '⚠️' : '🎙️'}
                          </button>
                          {generatedAudioBlobs.has(msg.id) && (
                              <a href={URL.createObjectURL(generatedAudioBlobs.get(msg.id)!)} download={`narracion_marco_${msg.id}.wav`} className="p-2 rounded-full hover:bg-gray-700 text-gray-400" aria-label="Descargar audio">
                                  📥
                              </a>
                          )}
                        </>
                      )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm">TÚ</div>
                  )}
                </div>
              </div>
            ))}
            {isAgentReplying && (
              <div className="flex items-start gap-3">
                 <div className="w-8 h-8 rounded-full bg-cyan-500 flex-shrink-0 flex items-center justify-center text-gray-900 font-bold text-sm">{agent.claveName.charAt(0)}</div>
                 <div className="max-w-md lg:max-w-lg p-3 rounded-2xl bg-gray-700 rounded-bl-none flex items-center">
                    <div className="animate-pulse flex space-x-1"><div className="w-2 h-2 bg-cyan-300 rounded-full"></div><div style={{animationDelay: '0.2s'}} className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div><div style={{animationDelay: '0.4s'}} className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div></div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </main>
          <footer className="p-4 bg-gray-900/50 border-t border-gray-700 flex-shrink-0">
              {attachedFile && (
                  <div className="flex items-center justify-between bg-gray-700 px-3 py-1 rounded-full mb-2 text-sm">
                      <span className="truncate pr-2">{attachedFile.name}</span>
                      <button onClick={handleRemoveFile} className="text-gray-400 hover:text-white">&times;</button>
                  </div>
              )}
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <div className="flex items-center gap-1 border-r border-gray-600 pr-2">
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 rounded-full hover:bg-gray-700 transition-colors text-gray-400" title="Adjuntar archivo">📎</button>
                      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
                      <button type="button" onClick={() => setIsDelegateModalOpen(true)} disabled={activeAssistants.length === 0} className="p-2 rounded-full hover:bg-gray-700 transition-colors text-gray-400 disabled:opacity-50" title="Delegar a asistente">👥</button>
                  </div>
                  <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Escribe tu mensaje o usa el micrófono..."
                      disabled={isAgentReplying}
                      className="flex-grow bg-gray-700 text-white px-4 py-2 rounded-full border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <button type="button" onClick={toggleListening} className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-500/30 text-red-400 animate-pulse' : 'hover:bg-gray-700 text-gray-400'}`} title="Usar micrófono">🎤</button>
                  <button type="submit" disabled={(!inputMessage.trim() && !attachedFile) || isAgentReplying} className="bg-cyan-500 text-gray-900 p-2 rounded-full hover:bg-cyan-400 disabled:bg-gray-600 transform rotate-90" aria-label="Enviar">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                  </button>
              </form>
          </footer>
        </div>
      </div>
    </>
  );
};

export default AgentChatModal;
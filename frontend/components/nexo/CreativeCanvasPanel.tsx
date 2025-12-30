import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { generateNexoResponse } from '../../services/geminiService';

interface CreativeCanvasPanelProps {
  isVisible: boolean;
  contextData?: any;
}

export const CreativeCanvasPanel: React.FC<CreativeCanvasPanelProps> = ({ isVisible, contextData }) => {
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Procesando...');
  const [inputValue, setInputValue] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Initial Greeting
  useEffect(() => {
    if (isVisible && messages.length === 0 && contextData) {
      setIsLoading(true);
      setLoadingText('Inicializando Nexo...');
      generateNexoResponse(contextData, "Preséntate brevemente y resume el contexto técnico que has recibido.")
        .then(response => {
          setMessages([{ role: 'ai', text: response }]);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }
  }, [isVisible, contextData]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    const newMessages = [...messages, { role: 'user' as const, text }];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);
    setLoadingText('Sintetizando Narrativa...');

    try {
      const response = await generateNexoResponse(contextData, text);
      setMessages([...newMessages, { role: 'ai', text: response }]);
    } catch (error) {
      setMessages([...newMessages, { role: 'ai', text: "Error de conexión con el núcleo neural." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div 
        className={`absolute top-0 right-0 h-full bg-slate-950 border-l border-orange-500/30 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] transition-transform duration-1000 ease-out ${isVisible ? 'translate-x-0 w-[40%]' : 'translate-x-full w-[40%]'}`}
    >
      <div className="p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 border-b border-orange-900/30 pb-4">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]"></div>
            <span className="text-orange-400 font-mono text-sm tracking-wider">🔗 CONTEXTO SINCRONIZADO: #FASE3</span>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 ${msg.role === 'ai' ? 'bg-gradient-to-br from-orange-500 to-purple-600' : 'bg-slate-700'}`}>
                        {msg.role === 'ai' ? 'NEXO' : 'TÚ'}
                    </div>
                    <div className={`relative p-4 rounded-2xl text-sm leading-relaxed shadow-inner max-w-[85%] group ${msg.role === 'ai' ? 'bg-slate-900 rounded-tl-none text-slate-300 border border-slate-800' : 'bg-slate-800 rounded-tr-none text-white'}`}>
                        {msg.role === 'ai' ? (
                            <>
                                <ReactMarkdown 
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        strong: ({node, ...props}) => <span className="font-bold text-orange-400" {...props} />,
                                        ul: ({node, ...props}) => <ul className="list-disc pl-4 space-y-1 my-2" {...props} />,
                                        ol: ({node, ...props}) => <ol className="list-decimal pl-4 space-y-1 my-2" {...props} />,
                                        li: ({node, ...props}) => <li className="text-slate-300" {...props} />,
                                        p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                                        h1: ({node, ...props}) => <h1 className="text-lg font-bold text-cyan-400 mb-2" {...props} />,
                                        h2: ({node, ...props}) => <h2 className="text-base font-bold text-cyan-300 mb-2" {...props} />,
                                        h3: ({node, ...props}) => <h3 className="text-sm font-bold text-cyan-200 mb-1" {...props} />,
                                        code: ({node, ...props}) => <code className="bg-slate-800 px-1 py-0.5 rounded text-xs font-mono text-pink-400" {...props} />,
                                    }}
                                >
                                    {msg.text}
                                </ReactMarkdown>
                                <button 
                                    onClick={() => handleCopy(msg.text, idx)}
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white p-1.5 rounded text-xs flex items-center gap-1"
                                    title="Copiar respuesta"
                                >
                                    {copiedIndex === idx ? (
                                        <><span>✅</span></>
                                    ) : (
                                        <><span>📋</span></>
                                    )}
                                </button>
                            </>
                        ) : (
                            msg.text
                        )}
                    </div>
                </div>
            ))}
            {isLoading && (
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">NEXO</div>
                    <div className="bg-slate-900 p-4 rounded-2xl rounded-tl-none border border-slate-800 text-slate-300 text-sm flex items-center gap-3">
                        <div className="flex gap-1">
                            <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce delay-100"></span>
                            <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce delay-200"></span>
                        </div>
                        <span className="text-orange-400/80 font-mono text-xs animate-pulse">{loadingText}</span>
                    </div>
                </div>
            )}
        </div>

        {/* Action Widgets */}
        <div className="mt-6 space-y-3">
            <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">Sugerencias Basadas en Datos</div>
            
            <button 
                onClick={() => handleSendMessage("Genera un post para LinkedIn celebrando este hito de eficiencia del 78.4%. Tono triunfal.")}
                className="w-full p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-orange-500/50 rounded-lg flex items-center gap-3 transition-all group text-left"
            >
                <div className="w-8 h-8 rounded bg-blue-900/30 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">📢</div>
                <div>
                    <div className="text-slate-200 text-sm font-medium">Crear Post LinkedIn</div>
                    <div className="text-xs text-slate-500">Tono: Triunfal / Innovador</div>
                </div>
            </button>

            <button 
                onClick={() => handleSendMessage("Describe una imagen metafórica del Bio-oil como 'Oro Líquido' en un entorno de laboratorio futurista.")}
                className="w-full p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/50 rounded-lg flex items-center gap-3 transition-all group text-left"
            >
                <div className="w-8 h-8 rounded bg-purple-900/30 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">🎨</div>
                <div>
                    <div className="text-slate-200 text-sm font-medium">Visualizar "Oro Líquido"</div>
                    <div className="text-xs text-slate-500">Metáfora Visual: Bio-oil</div>
                </div>
            </button>

            <button 
                onClick={() => handleSendMessage("Redacta la sección de metodología para el informe técnico, enfocándote en la temperatura de 550°C y el uso de Spirulina.")}
                className="w-full p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-green-500/50 rounded-lg flex items-center gap-3 transition-all group text-left"
            >
                <div className="w-8 h-8 rounded bg-green-900/30 text-green-400 flex items-center justify-center group-hover:scale-110 transition-transform">📄</div>
                <div>
                    <div className="text-slate-200 text-sm font-medium">Redactar Metodología</div>
                    <div className="text-xs text-slate-500">Formato: Académico Estándar</div>
                </div>
            </button>
        </div>

        {/* Input Area */}
        <div className="mt-6 relative">
            <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                placeholder="Escribe tu instrucción creativa..." 
                className="w-full bg-slate-900 border border-slate-700 rounded-full py-3 px-6 text-slate-300 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
            />
            <button 
                onClick={() => handleSendMessage(inputValue)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white hover:bg-orange-500 transition-colors"
            >
                →
            </button>
        </div>
      </div>
    </div>
  );
};


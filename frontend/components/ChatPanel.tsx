import React, { useState, useRef, useEffect } from 'react';
import type { CharacterProfile, ChatMessage } from '../types';

interface ChatPanelProps {
    agent: CharacterProfile;
    chatHistory: ChatMessage[];
    onSendMessage: (message: string) => void;
    isAgentReplying: boolean;
    onActionClick?: (actionId: string, messageId: string) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ agent, chatHistory, onSendMessage, isAgentReplying, onActionClick }) => {
    const [inputMessage, setInputMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, isAgentReplying]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;
        onSendMessage(inputMessage.trim());
        setInputMessage('');
    };

    return (
        <div className="bg-gray-800 text-white rounded-lg shadow-lg flex flex-col h-full border border-gray-700">
            <header className="p-4 border-b border-gray-700 bg-gray-900/30 flex-shrink-0">
                <h3 className="font-bold text-lg text-cyan-400">Panel B: Chat con {agent.claveName.split(',')[0]}</h3>
                <p className="text-xs text-gray-400">{agent.archetype}</p>
            </header>
            <main className="flex-grow p-4 overflow-y-auto space-y-4">
                {chatHistory.map((msg) => (
                    <div key={msg.id} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'model' && (
                            <div className="w-8 h-8 rounded-full bg-cyan-500 flex-shrink-0 flex items-center justify-center text-gray-900 font-bold text-sm">
                                {agent.claveName.charAt(0)}
                            </div>
                        )}
                        <div className={`max-w-md p-3 rounded-2xl ${msg.isSystem ? 'bg-gray-600 text-gray-300 italic' : (msg.role === 'user' ? 'bg-blue-600 rounded-br-none' : 'bg-gray-700 rounded-bl-none')}`}>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            {msg.actions && onActionClick && (
                                <div className="mt-4 pt-3 border-t border-gray-600 space-y-2">
                                    {msg.actions.map(action => (
                                        <button
                                            key={action.id}
                                            onClick={() => onActionClick(action.id, msg.id)}
                                            disabled={msg.actionsDisabled}
                                            className="w-full text-left text-sm font-semibold bg-blue-500/20 text-cyan-300 hover:bg-blue-500/40 px-3 py-2 rounded-md transition-colors disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                                        >
                                            {action.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm">TÚ</div>
                        )}
                    </div>
                ))}
                {isAgentReplying && (
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-cyan-500 flex-shrink-0 flex items-center justify-center text-gray-900 font-bold text-sm">{agent.claveName.charAt(0)}</div>
                        <div className="max-w-md p-3 rounded-2xl bg-gray-700 rounded-bl-none flex items-center">
                            <div className="animate-pulse flex space-x-1">
                                <div className="w-2 h-2 bg-cyan-300 rounded-full"></div>
                                <div style={{ animationDelay: '0.2s' }} className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                                <div style={{ animationDelay: '0.4s' }} className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </main>
            <footer className="p-4 bg-gray-900/50 border-t border-gray-700 flex-shrink-0">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Escribe tu mensaje..."
                        disabled={isAgentReplying}
                        className="flex-grow bg-gray-700 text-white px-4 py-2 rounded-full border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <button type="submit" disabled={!inputMessage.trim() || isAgentReplying} className="bg-cyan-500 text-gray-900 p-2 rounded-full hover:bg-cyan-400 disabled:bg-gray-600 transform rotate-90">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                    </button>
                </form>
            </footer>
        </div>
    );
};
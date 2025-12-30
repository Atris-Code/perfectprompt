/**
 * Multimedia Content Panel Component
 * 
 * Panel con tabs para mostrar el contenido multimedia generado:
 * - Tab 1: Documento técnico (Markdown renderizado)
 * - Tab 2: Prompt para infografía
 * - Tab 3: Guion de video
 */

import React, { useState } from 'react';
import type { MultimediaContent } from '../../services/multimediaGenerator';

interface MultimediaContentPanelProps {
    content: MultimediaContent;
    onCopy: (text: string) => void;
}

type TabType = 'document' | 'infographic' | 'video';

export const MultimediaContentPanel: React.FC<MultimediaContentPanelProps> = ({
    content,
    onCopy
}) => {
    const [activeTab, setActiveTab] = useState<TabType>('document');

    return (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">📦 Contenido Multimedia Generado</h3>
                <p className="text-sm text-gray-600 mt-1">
                    Contenido profesional listo para usar en 3 formatos
                </p>
            </div>

            {/* Tabs Navigation */}
            <div className="flex gap-1 px-4 pt-4 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('document')}
                    className={`flex items-center gap-2 px-4 py-2 font-semibold rounded-t-lg transition-colors ${activeTab === 'document'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    <span>📄</span>
                    <span>Documento</span>
                </button>
                <button
                    onClick={() => setActiveTab('infographic')}
                    className={`flex items-center gap-2 px-4 py-2 font-semibold rounded-t-lg transition-colors ${activeTab === 'infographic'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    <span>📊</span>
                    <span>Infografía</span>
                </button>
                <button
                    onClick={() => setActiveTab('video')}
                    className={`flex items-center gap-2 px-4 py-2 font-semibold rounded-t-lg transition-colors ${activeTab === 'video'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    <span>🎬</span>
                    <span>Video</span>
                </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
                {activeTab === 'document' && (
                    <DocumentTab content={content.textDocument} onCopy={onCopy} />
                )}
                {activeTab === 'infographic' && (
                    <InfographicTab prompt={content.infographicPrompt} onCopy={onCopy} />
                )}
                {activeTab === 'video' && (
                    <VideoTab script={content.videoScript} onCopy={onCopy} />
                )}
            </div>
        </div>
    );
};

/**
 * Tab de documento técnico
 */
const DocumentTab: React.FC<{ content: string; onCopy: (text: string) => void }> = ({
    content,
    onCopy
}) => {
    const copyDocument = () => {
        onCopy(content);
        const btn = document.activeElement as HTMLButtonElement;
        if (btn) {
            const originalText = btn.textContent;
            btn.textContent = '✓ Copiado';
            setTimeout(() => {
                btn.textContent = originalText || '📋 Copiar Documento';
            }, 2000);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h4 className="font-bold text-gray-900">Documento Técnico Ejecutivo</h4>
                    <p className="text-sm text-gray-500">Resumen profesional en formato Markdown</p>
                </div>
                <button
                    onClick={copyDocument}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold"
                >
                    📋 Copiar Documento
                </button>
            </div>

            {/* Render simple del markdown (sin parser, solo texto formateado) */}
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 leading-relaxed">
                    {content}
                </pre>
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-900">
                    💡 <strong>Tip:</strong> Este documento está listo para copiar y pegar en Word, Google Docs o cualquier editor de Markdown.
                </p>
            </div>
        </div>
    );
};

/**
 * Tab de prompt para infografía
 */
const InfographicTab: React.FC<{ prompt: string; onCopy: (text: string) => void }> = ({
    prompt,
    onCopy
}) => {
    const copyPrompt = () => {
        onCopy(prompt);
        const btn = document.activeElement as HTMLButtonElement;
        if (btn) {
            const originalText = btn.textContent;
            btn.textContent = '✓ Copiado';
            setTimeout(() => {
                btn.textContent = originalText || '📋 Copiar Prompt';
            }, 2000);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h4 className="font-bold text-gray-900">Prompt para Infografía</h4>
                    <p className="text-sm text-gray-500">Optimizado con Visual Core System Prompt</p>
                </div>
                <button
                    onClick={copyPrompt}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold"
                >
                    📋 Copiar Prompt
                </button>
            </div>

            <div className="p-6 bg-slate-900 text-slate-100 rounded-lg font-mono text-sm max-h-96 overflow-y-auto leading-relaxed shadow-inner">
                <pre className="whitespace-pre-wrap">
                    {prompt}
                </pre>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
                    <p className="text-xs font-semibold text-purple-900 mb-1">🎨 DALL-E 3</p>
                    <p className="text-xs text-purple-700">OpenAI / ChatGPT Plus</p>
                </div>
                <div className="p-3 bg-pink-50 border border-pink-200 rounded-md">
                    <p className="text-xs font-semibold text-pink-900 mb-1">🖼️ Midjourney</p>
                    <p className="text-xs text-pink-700">Discord Bot</p>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-xs font-semibold text-green-900 mb-1">⚡ Stable Diffusion</p>
                    <p className="text-xs text-green-700">Replicate / RunPod</p>
                </div>
            </div>

            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-900">
                    💡 <strong>Tip:</strong> Este prompt incluye el Visual Core System Prompt completo para garantizar coherencia visual automática.
                </p>
            </div>
        </div>
    );
};

/**
 * Tab de guion de video
 */
const VideoTab: React.FC<{ script: ReturnType<typeof MultimediaContentPanel>['content']['videoScript']; onCopy: (text: string) => void }> = ({
    script,
    onCopy
}) => {
    const copyScript = () => {
        const scriptText = JSON.stringify(script, null, 2);
        onCopy(scriptText);
        const btn = document.activeElement as HTMLButtonElement;
        if (btn) {
            const originalText = btn.textContent;
            btn.textContent = '✓ Copiado';
            setTimeout(() => {
                btn.textContent = originalText || '📋 Copiar Guion';
            }, 2000);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h4 className="font-bold text-gray-900">Guion de Video (60 segundos)</h4>
                    <p className="text-sm text-gray-500">Para YouTube Shorts / Instagram Reels / TikTok</p>
                </div>
                <button
                    onClick={copyScript}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold"
                >
                    📋 Copiar Guion
                </button>
            </div>

            {/* Escenas del video */}
            <div className="space-y-4 mb-6">
                {script.scenes.map(scene => (
                    <div
                        key={scene.number}
                        className="border-l-4 border-blue-600 pl-4 py-3 bg-gray-50 rounded-r-lg hover:bg-blue-50 transition-colors"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                                Escena {scene.number}
                            </span>
                            <span className="text-xs text-gray-500 font-mono">
                                {scene.duration}s
                            </span>
                        </div>
                        <div className="space-y-2">
                            <div>
                                <p className="text-xs font-semibold text-gray-600 mb-1">📹 VISUAL:</p>
                                <p className="text-sm text-gray-800">
                                    {scene.visual}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-600 mb-1">🎙️ AUDIO (Narración):</p>
                                <p className="text-sm text-gray-800 italic">
                                    "{scene.audio}"
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Información adicional */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <p className="text-xs font-semibold text-purple-900 mb-1">🎨 ESTILO VISUAL</p>
                    <p className="text-sm text-purple-800">{script.style}</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                    <p className="text-xs font-semibold text-blue-900 mb-1">⏱️ DURACIÓN TOTAL</p>
                    <p className="text-sm text-blue-800">{script.duration} segundos</p>
                </div>
            </div>

            {script.visualNotes && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                    <p className="text-xs font-semibold text-yellow-900 mb-2">📝 NOTAS PARA EL EDITOR</p>
                    <p className="text-sm text-yellow-800">{script.visualNotes}</p>
                </div>
            )}

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-900">
                    💡 <strong>Tip:</strong> Este guion está optimizado para el formato vertical (9:16). Puedes editarlo en CapCut, Adobe Premiere Rush, o InShot.
                </p>
            </div>
        </div>
    );
};

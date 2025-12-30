/**
 * Nexo Sinérgico - InsightCard Component
 * Displays AI-generated insights with cyberpunk styling
 */
import React, { useState } from 'react';
import { useTranslations } from '../../contexts/LanguageContext';

interface HighlightedMetric {
    label: string;
    value: string;
    trend: 'positive' | 'negative' | 'neutral';
}

interface VisualAsset {
    type: string;
    url: string;
    alt_text: string;
    prompt_used: string;
    aspect_ratio: string;
}

interface NarrativeContent {
    headline: string;
    sub_headline: string;
    body_markdown: string;
    call_to_action?: string;
    highlighted_metrics: HighlightedMetric[];
}

interface UIHints {
    theme_mode: string;
    primary_color_hex: string;
    secondary_color_hex: string;
    card_border_style: string;
    icon: string;
}

interface Action {
    id: string;
    label: string;
    icon: string;
}

export interface InsightCardData {
    request_id: string;
    timestamp: string;
    status: string;
    generated_for_role: string;
    visual_asset: VisualAsset;
    narrative_content: NarrativeContent;
    ui_hints: UIHints;
    available_actions: Action[];
}

interface InsightCardProps {
    data: InsightCardData;
    onClose: () => void;
    onAction?: (actionId: string) => void;
}

export const InsightCard: React.FC<InsightCardProps> = ({ data, onClose, onAction }) => {
    const { t } = useTranslations();
    const [showPrompt, setShowPrompt] = useState(false);

    const handleAction = (actionId: string) => {
        switch (actionId) {
            case 'download_pdf':
                alert('📄 Función de descarga de PDF en desarrollo.\n\nEste reporte se exportará como PDF ejecutable.');
                if (onAction) onAction(actionId);
                break;

            case 'share_linkedin':
                alert('🔗 Función de publicación en LinkedIn en desarrollo.\n\nEste insight se compartirá como publicación profesional.');
                if (onAction) onAction(actionId);
                break;

            case 'regenerate':
                if (confirm('🔄 ¿Regenerar este insight con nueva narrativa?')) {
                    if (onAction) onAction(actionId);
                }
                break;

            default:
                if (onAction) onAction(actionId);
        }
    };

    const getTrendColor = (trend: string) => {
        switch (trend) {
            case 'positive':
                return '#00FF88'; // Green
            case 'negative':
                return '#FF6B6B'; // Red
            default:
                return '#9CA3AF'; // Gray
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'positive':
                return '↗';
            case 'negative':
                return '↘';
            default:
                return '→';
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="relative max-w-4xl w-full bg-slate-900 rounded-xl shadow-2xl overflow-hidden animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
                style={{
                    borderColor: data.ui_hints.primary_color_hex,
                    borderWidth: '2px',
                    borderStyle: 'solid',
                    boxShadow: `0 0 30px ${data.ui_hints.primary_color_hex}40`,
                }}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-800/90 hover:bg-slate-700 flex items-center justify-center transition-colors"
                    style={{ color: data.ui_hints.primary_color_hex }}
                >
                    ✕
                </button>

                {/* Header Badge */}
                <div className="p-6 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-16 h-16 rounded-xl flex items-center justify-center text-5xl shadow-lg"
                            style={{
                                backgroundColor: `${data.ui_hints.primary_color_hex}30`,
                                color: data.ui_hints.primary_color_hex,
                                boxShadow: `0 0 20px ${data.ui_hints.primary_color_hex}50`
                            }}
                        >
                            ⚡
                        </div>
                        <div className="flex-1">
                            <h2
                                className="text-2xl font-bold"
                                style={{ color: data.ui_hints.primary_color_hex }}
                            >
                                {data.narrative_content.headline}
                            </h2>
                            <p className="text-slate-400 text-sm mt-1">
                                {data.narrative_content.sub_headline}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Visual Asset */}
                <div className="relative bg-black">
                    <img
                        src={data.visual_asset.url}
                        alt={data.visual_asset.alt_text}
                        className="w-full h-auto object-cover max-h-96"
                        onMouseEnter={() => setShowPrompt(true)}
                        onMouseLeave={() => setShowPrompt(false)}
                    />

                    {/* Prompt Tooltip */}
                    {showPrompt && (
                        <div className="absolute bottom-4 left-4 right-4 bg-black/90 text-white text-xs p-3 rounded backdrop-blur-sm border border-slate-600">
                            <p className="font-mono">{data.visual_asset.prompt_used}</p>
                        </div>
                    )}
                </div>

                {/* Content Body */}
                <div className="p-6 space-y-6">
                    {/* Narrative Body */}
                    <div className="prose prose-invert max-w-none">
                        <p className="text-slate-300 leading-relaxed">
                            {data.narrative_content.body_markdown.split('**').map((part, i) =>
                                i % 2 === 0 ? (
                                    <span key={i}>{part}</span>
                                ) : (
                                    <strong key={i} style={{ color: data.ui_hints.primary_color_hex }}>
                                        {part}
                                    </strong>
                                )
                            )}
                        </p>
                    </div>

                    {/* Highlighted Metrics */}
                    {data.narrative_content.highlighted_metrics.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {data.narrative_content.highlighted_metrics.map((metric, index) => (
                                <div
                                    key={index}
                                    className="p-4 rounded-lg border border-slate-700 bg-slate-800/50"
                                >
                                    <div className="text-xs text-slate-400 mb-1">{metric.label}</div>
                                    <div className="flex items-baseline gap-2">
                                        <span
                                            className="text-2xl font-bold font-mono"
                                            style={{ color: getTrendColor(metric.trend) }}
                                        >
                                            {metric.value}
                                        </span>
                                        <span
                                            className="text-lg"
                                            style={{ color: getTrendColor(metric.trend) }}
                                        >
                                            {getTrendIcon(metric.trend)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Call to Action */}
                    {data.narrative_content.call_to_action && (
                        <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                            <p className="text-sm text-slate-300 italic">
                                💡 {data.narrative_content.call_to_action}
                            </p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                        {data.available_actions.map((action) => (
                            <button
                                key={action.id}
                                onClick={() => handleAction(action.id)}
                                className="px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 active:scale-95"
                                style={{
                                    backgroundColor: `${data.ui_hints.primary_color_hex}20`,
                                    color: data.ui_hints.primary_color_hex,
                                    border: `1px solid ${data.ui_hints.primary_color_hex}60`,
                                }}
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer Meta */}
                <div className="px-6 py-3 bg-slate-800/50 border-t border-slate-700">
                    <p className="text-xs text-slate-500">
                        Generado: {new Date(data.timestamp).toLocaleString('es-ES')} | ID: {data.request_id.split('-')[0]}
                    </p>
                </div>
            </div>

            <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
        </div>
    );
};

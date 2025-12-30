import React, { useState } from 'react';
import type { PostExperimentReport } from '../../types';

interface PostExperimentPanelProps {
    report: PostExperimentReport;
}

export const PostExperimentPanel: React.FC<PostExperimentPanelProps> = ({ report }) => {
    const [activeTab, setActiveTab] = useState<'economic' | 'academic' | 'tasks'>('economic');

    const getImpactColor = (verdict: string) => {
        if (!verdict) return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
        if (verdict.includes('ALTO')) return 'text-green-400 bg-green-500/10 border-green-500/30';
        if (verdict.includes('MEDIO')) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
        return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    };

    const getSignificanceColor = (isSignificant: boolean) => {
        return isSignificant
            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
            : 'text-orange-400 bg-orange-500/10 border-orange-500/30';
    };

    return (
        <div className="mt-8 rounded-lg border border-cyan-500/30 bg-slate-800/50 backdrop-blur-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-b border-cyan-500/30">
                <div className="flex items-center gap-3">
                    <div className="text-2xl">🧠</div>
                    <div>
                        <h3 className="text-xl font-semibold text-cyan-400">Análisis Post-Experimental</h3>
                        <p className="text-sm text-slate-400">Inteligencia automática sobre resultados</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-700">
                <button
                    onClick={() => setActiveTab('economic')}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition-all ${activeTab === 'economic'
                            ? 'bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-500'
                            : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
                        }`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-lg">💰</span>
                        <span>Análisis Económico</span>
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('academic')}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition-all ${activeTab === 'academic'
                            ? 'bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-500'
                            : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
                        }`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-lg">📚</span>
                        <span>Análisis Académico</span>
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('tasks')}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition-all ${activeTab === 'tasks'
                            ? 'bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-500'
                            : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
                        }`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-lg">🎨</span>
                        <span>Tareas Generadas ({report.triggered_tasks.length})</span>
                    </div>
                </button>
            </div>

            {/* Content */}
            <div className="p-6">
                {/* Economic Tab */}
                {activeTab === 'economic' && report.economic && (
                    <div className="space-y-4 animate-fadeIn">
                        {/* Verdict Banner */}
                        <div className={`p-4 rounded-lg border ${getImpactColor(report.economic.financial_verdict)}`}>
                            <div className="flex items-center gap-3">
                                <div className="text-3xl">🎯</div>
                                <div>
                                    <div className="text-sm font-medium opacity-70">Veredicto Financiero</div>
                                    <div className="text-lg font-bold">{report.economic.financial_verdict}</div>
                                </div>
                            </div>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                                <div className="text-sm text-slate-400 mb-1">Comparación</div>
                                <div className="text-lg font-semibold text-white">{report.economic.comparison_id}</div>
                            </div>
                            <div className="p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                                <div className="text-sm text-slate-400 mb-1">Ganancia de Eficiencia</div>
                                <div className="text-2xl font-bold text-emerald-400">
                                    {report.economic.efficiency_gain_percent.toFixed(2)}%
                                </div>
                            </div>
                        </div>

                        {/* Savings Highlight */}
                        <div className="p-6 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30">
                            <div className="text-center">
                                <div className="text-sm text-green-400 mb-2">💵 Ahorro Anual Proyectado</div>
                                <div className="text-4xl font-bold text-green-400 mb-1">
                                    ${report.economic.annual_projected_savings.toLocaleString()}
                                </div>
                                <div className="text-xs text-slate-400">
                                    Basado en {7920} horas operativas anuales
                                </div>
                            </div>
                        </div>

                        {/* Cost Breakdown */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                                <div className="text-xs text-blue-400 mb-2">✅ Mejor Reactor</div>
                                <div className="text-sm text-white font-medium mb-1">{report.economic.winner.id}</div>
                                <div className="text-lg font-bold text-blue-400">${report.economic.winner.cost.toFixed(2)}</div>
                                <div className="text-xs text-slate-500">por ejecución</div>
                            </div>
                            <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                                <div className="text-xs text-red-400 mb-2">❌ Peor Reactor</div>
                                <div className="text-sm text-white font-medium mb-1">{report.economic.loser.id}</div>
                                <div className="text-lg font-bold text-red-400">${report.economic.loser.cost.toFixed(2)}</div>
                                <div className="text-xs text-slate-500">por ejecución</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Academic Tab */}
                {activeTab === 'academic' && report.academic && (
                    <div className="space-y-4 animate-fadeIn">
                        {/* Significance Banner */}
                        <div className={`p-4 rounded-lg border ${getSignificanceColor(report.academic.is_significant)}`}>
                            <div className="flex items-center gap-3">
                                <div className="text-3xl">{report.academic.is_significant ? '✅' : '⚠️'}</div>
                                <div>
                                    <div className="text-sm font-medium opacity-70">Significancia Estadística</div>
                                    <div className="text-lg font-bold">
                                        {report.academic.is_significant ? 'SIGNIFICATIVO' : 'NO CONCLUYENTE'}
                                    </div>
                                    <div className="text-xs opacity-70">p-value: {report.academic.p_value.toFixed(4)}</div>
                                </div>
                            </div>
                        </div>

                        {/* Hypothesis */}
                        <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-600">
                            <div className="text-sm text-cyan-400 font-medium mb-2">📋 Hipótesis</div>
                            <div className="text-white">{report.academic.hypothesis}</div>
                        </div>

                        {/* Statistics Comparison */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                                <div className="text-xs text-blue-400 mb-2">Grupo Control</div>
                                <div className="text-sm text-white">{report.academic.control_stats.label}</div>
                            </div>
                            <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
                                <div className="text-xs text-purple-400 mb-2">Grupo Test</div>
                                <div className="text-sm text-white">{report.academic.test_stats.label}</div>
                            </div>
                        </div>

                        {/* Statistical Metrics */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                                <div className="text-sm text-slate-400 mb-1">T-Statistic</div>
                                <div className="text-2xl font-bold text-cyan-400">{report.academic.t_statistic.toFixed(4)}</div>
                            </div>
                            <div className="p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                                <div className="text-sm text-slate-400 mb-1">Delta (Δ)</div>
                                <div className="text-2xl font-bold text-yellow-400">{report.academic.delta.toFixed(2)}</div>
                            </div>
                        </div>

                        {/* Academic Abstract */}
                        <div className="p-6 rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30">
                            <div className="text-sm text-purple-400 font-medium mb-3">📄 Abstract Científico</div>
                            <div className="text-sm text-slate-300 leading-relaxed italic">
                                "{report.academic.academic_abstract}"
                            </div>
                        </div>
                    </div>
                )}

                {/* Tasks Tab */}
                {activeTab === 'tasks' && (
                    <div className="space-y-4 animate-fadeIn">
                        {report.triggered_tasks.length > 0 ? (
                            <>
                                <div className="text-sm text-slate-400 mb-4">
                                    El sistema ha identificado <span className="text-cyan-400 font-semibold">{report.triggered_tasks.length}</span> oportunidad(es) creativa(s) basadas en los resultados:
                                </div>
                                {report.triggered_tasks.map((task, index) => {
                                    const [priority, ...taskParts] = task.split(':');
                                    const taskName = taskParts.join(':').trim();
                                    const priorityColor = priority.includes('HIGH')
                                        ? 'bg-red-500/10 border-red-500/30 text-red-400'
                                        : priority.includes('MEDIUM')
                                            ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                                            : 'bg-blue-500/10 border-blue-500/30 text-blue-400';

                                    return (
                                        <div key={index} className={`p-4 rounded-lg border ${priorityColor}`}>
                                            <div className="flex items-start gap-3">
                                                <div className="text-2xl">🎯</div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-xs font-bold px-2 py-1 rounded bg-current/20">
                                                            {priority.trim()}
                                                        </span>
                                                    </div>
                                                    <div className="text-base font-medium">{taskName}</div>
                                                    <div className="text-xs opacity-70 mt-2">
                                                        Esta tarea se generó automáticamente según las reglas de orquestación
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🎨</div>
                                <div className="text-slate-400">No se generaron tareas automáticas</div>
                                <div className="text-sm text-slate-500 mt-2">
                                    Las reglas de orquestación no se activaron con estos resultados
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* No Data Messages */}
                {activeTab === 'economic' && !report.economic && (
                    <div className="text-center py-12 text-slate-400">
                        <div className="text-4xl mb-3">💰</div>
                        <div>Análisis económico no disponible</div>
                    </div>
                )}
                {activeTab === 'academic' && !report.academic && (
                    <div className="text-center py-12 text-slate-400">
                        <div className="text-4xl mb-3">📚</div>
                        <div>Análisis académico no disponible</div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-slate-800/50 border-t border-slate-700 text-xs text-slate-500 flex justify-between items-center">
                <div>Generado: {new Date(report.timestamp).toLocaleString()}</div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span>Sistema activo</span>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

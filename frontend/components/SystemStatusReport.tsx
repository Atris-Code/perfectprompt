import React from 'react';
import { AGENTS_CODEX } from '../data/agentsCodex';

const KpiCard: React.FC<{ value: number; label: string; icon: React.ReactNode }> = ({ value, label, icon }) => (
    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 flex items-center gap-4">
        <div className="bg-slate-700 p-3 rounded-lg text-cyan-400">{icon}</div>
        <div>
            <p className="text-4xl font-bold font-mono">{value}</p>
            <p className="text-sm text-slate-400">{label}</p>
        </div>
    </div>
);

export const SystemStatusReport: React.FC = () => {
    const totalTitans = AGENTS_CODEX.length;
    const totalAssistants = AGENTS_CODEX.reduce((sum, titan) => sum + (titan.assistants?.length || 0), 0);
    const totalSkills = AGENTS_CODEX.reduce((sum, titan) => sum + (titan.skillModules?.length || 0), 0);

    const TitanIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>);
    const AssistantIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>);
    const SkillIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>);

    return (
        <div className="bg-slate-900 text-white p-8 rounded-lg min-h-full font-sans">
            <header className="text-center mb-10">
                <h1 className="text-4xl font-bold">Reporte de Estado del Sistema</h1>
                <p className="text-slate-400 mt-2">Un resumen de las capacidades y la estructura de los agentes IA.</p>
            </header>

            <section className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                <KpiCard value={totalTitans} label="Titanes Activos" icon={<TitanIcon />} />
                <KpiCard value={totalAssistants} label="Asistentes Especializados" icon={<AssistantIcon />} />
                <KpiCard value={totalSkills} label="Módulos de Habilidad" icon={<SkillIcon />} />
            </section>

            <section>
                <h2 className="text-3xl font-bold mb-6 border-b border-slate-700 pb-3">Desglose por Titán</h2>
                <div className="space-y-8">
                    {AGENTS_CODEX.map(titan => (
                        <div key={titan.claveName} className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                            <h3 className="text-2xl font-bold text-cyan-400">{titan.claveName}</h3>
                            <p className="text-sm uppercase text-slate-400 tracking-wider mb-6">{titan.archetype}</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-slate-900/50 p-4 rounded-md">
                                    <h4 className="font-semibold text-lg mb-3">Asistentes ({titan.assistants?.length || 0})</h4>
                                    {titan.assistants && titan.assistants.length > 0 ? (
                                        <ul className="list-disc list-inside space-y-2 text-slate-300 text-sm">
                                            {titan.assistants.map(asst => (
                                                <li key={asst.id}>
                                                    {asst.name}
                                                    <span className={`ml-2 text-xs font-bold px-2 py-0.5 rounded-full ${asst.status === 'ACTIVE' ? 'bg-green-500/20 text-green-300' : 'bg-slate-600 text-slate-400'}`}>{asst.status}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-slate-500 italic">Sin asistentes asignados.</p>
                                    )}
                                </div>
                                <div className="bg-slate-900/50 p-4 rounded-md">
                                    <h4 className="font-semibold text-lg mb-3">Módulos de Habilidad ({titan.skillModules?.length || 0})</h4>
                                     {titan.skillModules && titan.skillModules.length > 0 ? (
                                        <ul className="list-disc list-inside space-y-2 text-slate-300 text-sm">
                                            {titan.skillModules.map(skill => (
                                                <li key={skill.id}>
                                                    {skill.name}
                                                    <span className={`ml-2 text-xs font-bold px-2 py-0.5 rounded-full ${skill.status === 'ACTIVE' ? 'bg-green-500/20 text-green-300' : 'bg-slate-600 text-slate-400'}`}>{skill.status}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-slate-500 italic">Sin módulos de habilidad asignados.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default SystemStatusReport;
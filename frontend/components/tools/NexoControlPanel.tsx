import React from 'react';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h3 className="text-xl font-bold text-cyan-400 mb-4 border-b border-slate-700 pb-3">{title}</h3>
        {children}
    </div>
);

const ActionItem: React.FC<{ title: string; state: string; task: string; stateColor: string; icon: React.ReactNode }> = ({ title, state, task, stateColor, icon }) => (
    <div className="bg-slate-700/50 p-4 rounded-md border border-slate-600 flex items-start gap-4 transition-all hover:bg-slate-700 hover:border-blue-500 cursor-pointer">
        <div className="text-blue-400 mt-1 flex-shrink-0">{icon}</div>
        <div className="flex-1">
            <div className="flex justify-between items-center">
                <h4 className="font-semibold text-white">{title}</h4>
                <span className={`px-2 py-1 text-xs font-bold rounded-full text-black ${stateColor}`}>{state}</span>
            </div>
            <p className="text-sm text-slate-400 mt-1"><strong>Tarea:</strong> {task}</p>
        </div>
    </div>
);

export const NexoControlPanel: React.FC = () => {
    return (
        <div className="bg-slate-900 text-white p-8 rounded-lg min-h-full font-sans">
            <header className="text-center mb-10 border-b-2 border-red-500/50 pb-6">
                <div className="flex items-center justify-center gap-4 mb-4">
                    <span className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></span>
                    <span className="w-4 h-4 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                    <h1 className="text-3xl font-bold text-red-400 uppercase tracking-wider">Alerta de Gobernanza Crítica</h1>
                    <span className="w-4 h-4 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                    <span className="w-4 h-4 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></span>
                </div>
            </header>

            <div className="max-w-4xl mx-auto space-y-8">
                <Section title="Síntesis del Director del Nexo">
                    <div className="prose prose-invert max-w-none text-slate-300 space-y-3">
                        <p>"Se ha iniciado un <strong>Conflicto de Gobernanza de Nivel 1.</strong></p>
                        <p>Un Investigador_User ha reportado un <strong>Riesgo Técnico Severo</strong> (sim_789) que indica una posible falla de rendimiento del 50% en el Módulo 3.</p>
                        <p>Inmediatamente después, un Industrial_User ha solicitado un <strong>Veto de Publicación</strong>, activando nuestra regla de 'Conflicto de Interés' del ProjectContract.sol.</p>
                        <p>De acuerdo con el protocolo, la Votación de Gobernanza (Prop_Veto_789) ha sido creada pero está <strong>bloqueada</strong> en estado de '<strong>Debate en Progreso</strong>'. Un 'Debate de Titanes' ha sido generado automáticamente."</p>
                    </div>
                </Section>

                <Section title="Impacto Simulado en el Proyecto (Nexo)">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                        <div className="bg-slate-700 p-4 rounded-lg text-center">
                            <p className="text-sm text-slate-400">TIR del Proyecto (Actual)</p>
                            <p className="text-4xl font-bold font-mono text-green-400">9.38%</p>
                        </div>
                         <div className="bg-red-900/50 p-4 rounded-lg text-center border-2 border-red-500">
                            <p className="text-sm text-red-300">TIR EN RIESGO (Si sim_789 es correcta)</p>
                            <p className="text-4xl font-bold font-mono text-red-400">-5.2%</p>
                            <p className="font-semibold text-red-300">(¡PÉRDIDA TOTAL!)</p>
                        </div>
                        <div className="bg-yellow-900/50 p-4 rounded-lg text-center border-2 border-yellow-500">
                            <p className="text-sm text-yellow-300">ESTADO DEL PROYECTO</p>
                            <p className="text-4xl font-bold font-mono text-yellow-400 animate-pulse">CONGELADO</p>
                        </div>
                    </div>
                    <p className="text-sm text-slate-400 text-center mt-4">Todos los pagos de hitos y publicaciones externas están pausados hasta la resolución de la Propuesta Prop_Veto_789.</p>
                </Section>

                <Section title="Acciones Inmediatas (Líder de Proyecto)">
                    <p className="text-sm text-slate-400 mb-4">Tu única prioridad es gestionar este conflicto. Tu poder de voto está bloqueado. Tu rol ahora es de Moderación.</p>
                    <div className="space-y-4">
                        <ActionItem 
                            title="MODERAR EL DEBATE DE TITANES (Prop_Veto_789)"
                            state="Activo"
                            task="Asegurar que el 'Moderador/Sintetizador' asignado guíe la discusión entre el Investigador y el Industrial hacia una conclusión basada en hechos."
                            stateColor="bg-green-400"
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                        />
                         <ActionItem 
                            title="ANALIZAR SIMULACIÓN EN CONFLICTO (sim_789)"
                            state="En cuarentena"
                            task="Abrir la simulación M3 en un 'sandbox' para verificar independientemente los hallazgos del Investigador."
                            stateColor="bg-yellow-400"
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>}
                        />
                         <ActionItem 
                            title="PREPARAR COMUNICACIÓN DE CRISIS (M1)"
                            state="Borrador (Confidencial)"
                            task='Usar el "Ala Creativa" para preparar dos borradores de email: Borrador A (Si el riesgo es FALSO): "Resolución de Alerta: Falsa Alarma". Borrador B (Si el riesgo es REAL): "Acción Estratégica Urgente: Reporte de Riesgo Técnico".'
                            stateColor="bg-gray-400"
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                        />
                    </div>
                </Section>
            </div>
        </div>
    );
};
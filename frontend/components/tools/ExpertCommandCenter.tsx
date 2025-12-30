import React, { useState, useEffect, useCallback } from 'react';
import type { AutoSolution } from '../../types';
import { generateAutomaticSolution } from '../../services/geminiService';

interface ExpertCommandCenterProps {
    context: any; // The crisis context from EcoHornetTwin
    onBack: () => void;
    onStartCinematicAudit: (solution: AutoSolution) => void;
}

const CrisisContextPanel: React.FC<{ context: any }> = ({ context }) => (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 h-full">
        <h3 className="text-xl font-bold text-cyan-400 mb-4">Contexto de Crisis (Director)</h3>
        <div className="space-y-3 text-sm">
            <p><strong>Activo:</strong> {context.activo}</p>
            <p><strong>Alarma:</strong> <span className="text-red-400 font-semibold">{context.alarma}</span></p>
            <p><strong>Diagnóstico (IA):</strong> {context.diagnostico}</p>
            <p><strong>Manual de Referencia:</strong> {context.manual}</p>
            <p><strong>Secciones Relevantes:</strong> {context.seccionesClave?.join(', ')}</p>
        </div>
    </div>
);

const PrivateCommandPanel: React.FC<{
    autoSolution: AutoSolution | null;
    step: 'initial' | 'step1' | 'step2';
    onHefestoClick: () => void;
    onKairosClick: () => void;
    onCopy: (text: string, type: 'Protocolo' | 'Análisis') => void;
}> = ({ autoSolution, step, onHefestoClick, onKairosClick, onCopy }) => {

    const protocoloText = autoSolution ? `${autoSolution.protocoloLimpieza.titulo}\n\n${autoSolution.protocoloLimpieza.pasos.map((p, i) => `${i + 1}. ${p}`).join('\n')}` : '';
    const analisisText = autoSolution ? `${autoSolution.analisisCostos.titulo}\n${autoSolution.analisisCostos.descripcion}\n- ${autoSolution.analisisCostos.opcionA}\n- ${autoSolution.analisisCostos.opcionB}\n- ${autoSolution.analisisCostos.ahorro}` : '';
    
    return (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 h-full">
            <h3 className="text-xl font-bold text-cyan-400 mb-4">Panel de Comando Privado</h3>
            <div className="space-y-4">
                {/* Botón 1 */}
                <button onClick={onHefestoClick} disabled={step !== 'initial'} className="w-full text-left p-3 rounded-lg font-mono text-sm transition-colors bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed">
                    <span className="text-green-400">//Hefesto:</span> Generar Protocolo Limpieza (Sección 7.2, 7.3)
                </button>
                {step >= 'step1' && autoSolution && (
                     <div className="p-4 bg-gray-900/50 rounded-lg animate-fade-in">
                        <h4 className="font-semibold text-green-400">{autoSolution.protocoloLimpieza.titulo}</h4>
                        <ol className="list-decimal list-inside text-sm mt-2 space-y-1">
                            {autoSolution.protocoloLimpieza.pasos.map((paso, i) => <li key={i}>{paso}</li>)}
                        </ol>
                        <button onClick={() => onCopy(protocoloText, 'Protocolo')} className="mt-3 text-xs bg-slate-600 hover:bg-slate-500 px-3 py-1 rounded-md">Copiar Protocolo</button>
                    </div>
                )}
                {/* Botón 2 */}
                <button onClick={onKairosClick} disabled={step !== 'step1'} className="w-full text-left p-3 rounded-lg font-mono text-sm transition-colors bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed">
                    <span className="text-yellow-400">//Kairos:</span> Analizar Costo Pellets (Sección 2.5)
                </button>
                 {step >= 'step2' && autoSolution && (
                     <div className="p-4 bg-gray-900/50 rounded-lg animate-fade-in">
                         <h4 className="font-semibold text-yellow-400">{autoSolution.analisisCostos.titulo}</h4>
                        <p className="text-sm mt-2">{autoSolution.analisisCostos.descripcion}</p>
                         <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                            <li>{autoSolution.analisisCostos.opcionA}</li>
                            <li>{autoSolution.analisisCostos.opcionB}</li>
                            <li className="font-bold">{autoSolution.analisisCostos.ahorro}</li>
                        </ul>
                        <button onClick={() => onCopy(analisisText, 'Análisis')} className="mt-3 text-xs bg-slate-600 hover:bg-slate-500 px-3 py-1 rounded-md">Copiar Análisis</button>
                    </div>
                )}
                 {/* Botón 3 (Simulado) */}
                <button disabled className="w-full text-left p-3 rounded-lg font-mono text-sm transition-colors bg-slate-800 text-slate-500 cursor-not-allowed">
                    <span className="text-purple-400">//Marco:</span> Borrador Notificación Garantía (Sección 2.1, 2.5)
                </button>
            </div>
        </div>
    );
}

export const ExpertCommandCenter: React.FC<ExpertCommandCenterProps> = ({ context, onBack, onStartCinematicAudit }) => {
    const [autoSolution, setAutoSolution] = useState<AutoSolution | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [step, setStep] = useState<'initial' | 'step1' | 'step2'>('initial');
    const [chatContent, setChatContent] = useState('');
    const [copyNotification, setCopyNotification] = useState('');

    const fullCrisisContext = {
        activo: 'Módulo 7: EcoHornet CTP-20',
        alarma: `Alarma ${context?.context?.alarm || 7}: Temperatura del gas demasiado alta (${context?.context?.tempGases?.toFixed(1) || '172.0'}°C)`,
        diagnostico: 'Causa probable: Depósitos de hollín por pellets no conformes (Humedad > 10%)',
        manual: 'Manual CTP 2020 (7).pdf',
        seccionesClave: ['2.1', '2.5', '7.2', '7.3'],
    };
    
    useEffect(() => {
        if (context?.active) {
            const getSolution = async () => {
                setIsLoading(true);
                setError('');
                try {
                    const solution = await generateAutomaticSolution(context);
                    setAutoSolution(solution);
                } catch (err) {
                    setError(err instanceof Error ? err.message : "Un error desconocido ocurrió al generar la solución automática.");
                } finally {
                    setIsLoading(false);
                }
            };
            getSolution();
        } else {
            setIsLoading(false);
            setError("No se ha proporcionado un contexto de crisis válido.");
        }
    }, [context]);
    
    useEffect(() => {
        if (autoSolution) {
             const template = `Hola, soy Juan. He sido notificado de la Alarma 7 en su activo ${fullCrisisContext.activo || 'M7'}.

[PEGA AQUÍ EL ANÁLISIS DE KAIROS]

${autoSolution.recomendacionFinal}

[PEGA AQUÍ EL PROTOCOLO DE HEFESTO]

Quedo a su disposición.`;
            setChatContent(template);
        }
    }, [autoSolution, fullCrisisContext.activo]);

    const handleCopy = (text: string, type: 'Protocolo' | 'Análisis') => {
        navigator.clipboard.writeText(text);
        setCopyNotification(`${type} copiado al portapapeles.`);
        setTimeout(() => setCopyNotification(''), 2000);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white p-8 rounded-2xl">
                <svg className="animate-spin h-10 w-10 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <p className="mt-4 font-semibold">El Avatar (IA) está analizando la crisis y preparando la solución...</p>
            </div>
        );
    }
    
     if (error) {
        return (
             <div className="bg-gray-900 text-white p-8 rounded-2xl">
                <h2 className="text-2xl font-bold text-red-400 text-center">Error de Intervención</h2>
                <p className="text-center mt-4">{error}</p>
                <button onClick={onBack} className="mt-6 block mx-auto bg-blue-600 px-4 py-2 rounded-lg">Volver</button>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 text-white p-8 rounded-2xl shadow-lg min-h-full font-sans">
            <style>{`.animate-fade-in { animation: fadeIn 0.5s ease-out forwards; } @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
            
            <header className="text-center mb-8">
                <h2 className="text-3xl font-bold">Centro de Comando Experto: Intervención ALARMA 7</h2>
                <p className="text-slate-400 mt-2">Sigue el flujo de trabajo para generar la "Solución Completa".</p>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <CrisisContextPanel context={fullCrisisContext} />
                <PrivateCommandPanel 
                    autoSolution={autoSolution}
                    step={step}
                    onHefestoClick={() => setStep('step1')}
                    onKairosClick={() => setStep('step2')}
                    onCopy={handleCopy}
                />
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="text-xl font-bold text-cyan-400 mb-4">Sinergia Humano-IA: CHAT DE CRISIS (Público)</h3>
                 {copyNotification && (
                    <div className="absolute top-5 right-5 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-fade-in">
                        {copyNotification}
                    </div>
                )}
                <p className="text-sm text-slate-400 mb-4">
                    **Tu Valor:** No eres un simple "copia-pega". Ahora aplicas tu autoridad y experiencia. Edita y sintetiza los bloques de IA en una respuesta única y coherente para el cliente.
                </p>
                <textarea 
                    value={chatContent}
                    onChange={(e) => setChatContent(e.target.value)}
                    rows={12}
                    className="w-full p-3 bg-gray-900 border border-gray-600 rounded-md text-slate-200 font-mono text-sm focus:ring-2 focus:ring-cyan-500"
                    placeholder="Combina aquí los elementos para tu respuesta final..."
                />
                 <div className="mt-6 text-center">
                    <button
                        onClick={() => autoSolution && onStartCinematicAudit(autoSolution)}
                        disabled={!autoSolution}
                        className="w-full md:w-1/2 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-500"
                    >
                        [ Iniciar Auditoría Cinemática ]
                    </button>
                </div>
            </div>
        </div>
    );
};
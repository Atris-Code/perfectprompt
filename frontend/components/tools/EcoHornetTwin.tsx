
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
// FIX: Changed to a standard import for Chat and GenerateContentResponse to resolve a potential build issue where methods were being stripped from the Chat object, causing a 'not callable' error.
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import type { View, ChatMessage, AutoSolution } from '../../types';
import { ECOHORNET_CTP_MANUAL } from '../../data/knowledgeBase';
import { useTranslations } from '../../contexts/LanguageContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type HMIPanel = 'controlPanel' | 'materials' | 'trends' | 'security' | 'crisisSimulation' | 'technicalAssistant' | 'ioPanel';

interface EcoHornetTwinProps {
    setView: (view: View) => void;
    setExpertCommandContext: (context: any) => void;
}

const PERSONAS = [
    { id: 'operator', nameKey: 'ecoHornet.personas.operator' },
    { id: 'instructor', nameKey: 'ecoHornet.personas.instructor' },
    { id: 'investor', nameKey: 'ecoHornet.personas.investor' },
    { id: 'student', nameKey: 'ecoHornet.personas.student' },
    { id: 'policymaker', nameKey: 'ecoHornet.personas.policymaker' },
    { id: 'generalPublic', nameKey: 'ecoHornet.personas.generalPublic' },
];

const PERSONA_PROMPTS: Record<string, string> = {
    operator: "Enfoque: Operador Autorizado (Predeterminado). Tono: Directo, técnico, procedimental, centrado en la seguridad. Prioridad: 'Qué hacer', 'Qué no hacer' y 'Cómo hacerlo'.",
    instructor: "Enfoque: Instructor (Formador de Operadores). Tono: Educativo, metódico, enfocado en el 'porqué' de las acciones y las consecuencias. Prioridad: Enseñar las mejores prácticas, los riesgos y la lógica detrás de las reglas.",
    investor: "Enfoque: Inversor. Tono: Persuasivo, estratégico, centrado en el valor. Prioridad: Eficiencia, innovación, patentes, reducción de costos operativos y ventajas de mercado.",
    student: "Enfoque: Alumno / Estudiante (Ingeniería/Técnico). Tono: Descriptivo, analítico, centrado en los principios de funcionamiento. Prioridad: Comprender el diseño, los componentes y el flujo del proceso.",
    policymaker: "Enfoque: Policymaker (Regulador). Tono: Formal, objetivo, centrado en el cumplimiento y la seguridad pública. Prioridad: Emisiones, certificaciones, seguridad y normativas.",
    generalPublic: "Enfoque: Público General. Tono: Sencillo, claro, centrado en los beneficios. Prioridad: ¿Qué es? ¿Es ecológico? ¿Es seguro?",
};


const TabButton: React.FC<{ id: HMIPanel; activeTab: HMIPanel; onClick: (id: HMIPanel) => void; label: string }> = ({ id, activeTab, onClick, label }) => (
    <button
        onClick={() => onClick(id)}
        className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
            activeTab === id
            ? 'border-blue-500 text-blue-400'
            : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
        }`}
    >
        {label}
    </button>
);

const BannerDisplay: React.FC<{ banner: { phase: 'connecting' | 'ok' | 'error'; text: string } }> = ({ banner }) => {
    const styles = {
        ok: { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-400', icon: '✅' },
        connecting: { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-400', icon: '🔄' },
        error: { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-400', icon: '❌' },
    };
    const style = styles[banner.phase];

    return (
        <div className={`${style.bg} ${style.text} p-3 rounded-md border ${style.border} mb-6 text-sm flex items-center gap-3`}>
            <span className={`text-lg ${banner.phase === 'connecting' ? 'animate-spin' : ''}`}>{style.icon}</span>
            <p className="font-semibold">{banner.text}</p>
        </div>
    );
};

const ToggleSwitch: React.FC<{ label: string; isEnabled: boolean; onToggle: () => void; description: string; colorClass?: string; }> = ({ label, isEnabled, onToggle, description, colorClass = 'peer-checked:bg-red-600' }) => (
    <div className="bg-slate-900/50 p-4 rounded-lg">
        <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-300">{label}</span>
            <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={isEnabled} onChange={onToggle} className="sr-only peer" />
                <div className={`w-11 h-6 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${colorClass}`}></div>
            </label>
        </div>
        <p className="text-xs text-slate-500 mt-2">{description}</p>
    </div>
);

const LedIndicator: React.FC<{ label: string; active: boolean; code: string; }> = ({ label, active, code }) => (
    <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg">
        <div className={`w-5 h-5 rounded-full border-2 border-slate-900 flex-shrink-0 ${active ? 'bg-green-400 shadow-[0_0_8px_theme(colors.green.400)]' : 'bg-slate-600'}`}></div>
        <div className="flex-grow">
            <p className="text-sm font-semibold text-slate-300">{label}</p>
            <p className="text-xs font-mono text-slate-500">{code}</p>
        </div>
    </div>
);

const AnalogIndicator: React.FC<{ label: string; value: number; unit: string; code: string; }> = ({ label, value, unit, code }) => (
    <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
        <div>
            <p className="text-sm font-semibold text-slate-300">{label}</p>
            <p className="text-xs font-mono text-slate-500">{code}</p>
        </div>
        <p className="text-2xl font-mono text-cyan-400">{value.toFixed(1)} <span className="text-base text-slate-400">{unit}</span></p>
    </div>
);

const MaterialsPanel: React.FC<{
    pelletMoisture: number;
    onMoistureChange: (value: number) => void;
    binderContent: number;
    onBinderChange: (value: number) => void;
    pelletHopperLevel: number;
    onHopperLevelChange: (value: number) => void;
}> = ({ pelletMoisture, onMoistureChange, binderContent, onBinderChange, pelletHopperLevel, onHopperLevelChange }) => {
    const { t } = useTranslations();
    return (
        <div className="p-6 rounded-lg bg-slate-800 border border-slate-700 max-w-lg mx-auto">
            <h4 className="text-lg font-bold text-cyan-400">{t('hmiEcoHornet.simulation.pelletQuality')}</h4>
            <div className="space-y-6 mt-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 flex justify-between">
                        <span>{t('hmiEcoHornet.simulation.pelletMoisture', { value: pelletMoisture })}</span>
                    </label>
                    <input type="range" min="5" max="25" step="1" value={pelletMoisture} onChange={e => onMoistureChange(Number(e.target.value))} className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 flex justify-between">
                         <span>{t('hmiEcoHornet.simulation.binderContent', { value: binderContent })}</span>
                    </label>
                    <input type="range" min="0" max="5" step="0.5" value={binderContent} onChange={e => onBinderChange(Number(e.target.value))} className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-300 flex justify-between">
                        <span>Cantidad de Pellets en Tolva ({pelletHopperLevel.toFixed(1)}%)</span>
                    </label>
                    <input type="range" min="0" max="100" step="0.5" value={pelletHopperLevel} onChange={e => onHopperLevelChange(Number(e.target.value))} className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"/>
                </div>
            </div>
        </div>
    );
};

const TrendsPanel: React.FC<{ history: { time: number; tempGases: number }[], activeAlarm: number | null, pelletMoisture: number }> = ({ history, activeAlarm, pelletMoisture }) => {
    const { t } = useTranslations();
    const chartData = history.map(d => ({...d, time: new Date(d.time).toLocaleTimeString() }));
    
    const alarmDiagnostics: Record<number, { title: string, text: string }> = {
        4: {
            title: 'Diagnóstico: Alarma 4 - Encendido Fallado',
            text: `La simulación falló 3 intentos de ignición. Causa Raíz: La Humedad de Pellets (${pelletMoisture}%) excede el límite operativo del 10% (Sección 5.1).`
        },
        3: {
            title: 'Diagnóstico: Alarma 3 - No hay pellets',
            text: 'El sistema detectó que el motor del sinfín (X14) funcionó durante el tiempo máximo sin que el sensor de pellets (X46) detectara material (Sección 5.1). Causa Raíz: Falta de pellets en la tolva de alimentación.'
        },
        7: {
            title: t('hmiEcoHornet.trends.alarmDiagnosisTitle'),
            text: t('hmiEcoHornet.trends.alarmDiagnosisText'),
        }
    };
    
    const diagnostic = activeAlarm ? alarmDiagnostics[activeAlarm] : null;

    return (
        <div className="space-y-6">
            <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h4 className="text-lg font-bold text-cyan-400">{t('hmiEcoHornet.trends.title')}</h4>
                <div className="h-96 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="time" tick={{ fill: '#9ca3af', fontSize: 12 }} label={{ value: t('hmiEcoHornet.trends.timeAxis'), position: 'insideBottom', offset: -10, fill: '#9ca3af' }} />
                            <YAxis domain={[0, 220]} tick={{ fill: '#9ca3af', fontSize: 12 }} label={{ value: t('hmiEcoHornet.trends.tempAxis'), angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #374151' }} />
                            <Legend />
                            <Line type="monotone" dataKey="tempGases" name={t('ecoHornet.params.tempGases')} stroke="#ef4444" dot={false} strokeWidth={2} />
                            <Line type="monotone" dataKey={() => 170} name="Umbral de Alarma" stroke="#f97316" dot={false} strokeDasharray="5 5" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
            {diagnostic && (
                <div className="p-6 rounded-lg bg-slate-800 border border-slate-700 animate-fade-in">
                     <h4 className="text-lg font-bold text-cyan-400">{diagnostic.title}</h4>
                     <p className="mt-2 text-slate-300">{diagnostic.text}</p>
                </div>
            )}
        </div>
    );
};

const SecurityPanel: React.FC<{ alarmLog: string[] }> = ({ alarmLog }) => {
    return (
        <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
            <h4 className="text-lg font-bold text-cyan-400 mb-4">Registro de Seguridad y Alarmas</h4>
            <div className="bg-slate-900/50 p-4 rounded-md h-96 overflow-y-auto font-mono text-sm space-y-2">
                {alarmLog.length > 0 ? alarmLog.map((log, i) => {
                    const isWarning = log.includes('ADVERTENCIA');
                    const isFailure = log.includes('FALLO');
                    const isAlarm = log.includes('ALARMA');
                    const isCritical = isFailure || isAlarm;
                    const color = isCritical ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-slate-400';
                    const fontWeight = isCritical ? 'font-bold' : 'font-normal';
                    return <p key={i} className={`${color} ${fontWeight}`}>{log}</p>;
                }) : <p className="text-slate-500 italic">No hay alarmas registradas.</p>}
            </div>
        </div>
    );
};

const CrisisSimulationPanel: React.FC<{
    failAlarms: Record<string, boolean>;
    onToggleFailAlarm: (key: string) => void;
}> = ({ failAlarms, onToggleFailAlarm }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-lg bg-slate-800 border border-slate-700 space-y-4">
                <h4 className="text-lg font-bold text-cyan-400">Simulación de Fallos de Componentes</h4>
                <ToggleSwitch label="Fallo Sensor de Flujo" isEnabled={failAlarms['flowSensor']} onToggle={() => onToggleFailAlarm('flowSensor')} description="Simula una lectura errónea o nula del sensor de flujo de pellets." />
                <ToggleSwitch label="Fallo Sensor de Gases" isEnabled={failAlarms['gasSensor']} onToggle={() => onToggleFailAlarm('gasSensor')} description="Simula una lectura de temperatura de gases fija o incorrecta." />
                <ToggleSwitch label="Fallo del SAI (UPS)" isEnabled={failAlarms['ups']} onToggle={() => onToggleFailAlarm('ups')} description="Simula un corte de energía sin respaldo del Sistema de Alimentación Ininterrumpida." />
                <ToggleSwitch label="Fallo Actuador Válvula" isEnabled={failAlarms['actuator']} onToggle={() => onToggleFailAlarm('actuator')} description="Simula que la válvula de alimentación de pellets se queda atascada." />
                <ToggleSwitch label="Fallo Extractor de Humos" isEnabled={failAlarms['extractor']} onToggle={() => onToggleFailAlarm('extractor')} description="Simula una parada o reducción de velocidad del extractor de humos." />
            </div>
             <div className="p-6 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                <p className="text-slate-500 italic">Más escenarios de crisis en futuras implementaciones.</p>
            </div>
        </div>
    );
};

const IOPanel: React.FC<{ boilerState: any; isSimulating: boolean; timeWithoutPellets: number; }> = ({ boilerState, isSimulating, timeWithoutPellets }) => {
    const isPelletSensorDetecting = boilerState.pelletHopperLevel > 5;
    const isAugerOn = isSimulating && !isPelletSensorDetecting && timeWithoutPellets > 0 && boilerState.estadoCaldera !== 'Error';

    const ioStatus = {
        x7: boilerState.estadoQuemador === 'Encendido',
        x14: isAugerOn,
        x46: isPelletSensorDetecting,
    };
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h4 className="text-lg font-bold text-cyan-400 mb-4">Entradas (DI) y Salidas (DO) Digitales</h4>
                <div className="space-y-3">
                    <LedIndicator label="X7 Aprindere (Encendido)" active={ioStatus.x7} code={`Estado: ${ioStatus.x7 ? 'ACTIVO' : 'INACTIVO'}`} />
                    <LedIndicator label="X14 Alimentare peleti (Sinfín)" active={ioStatus.x14} code={`Estado: ${ioStatus.x14 ? 'ENCENDIDO' : 'APAGADO'}`} />
                    <LedIndicator label="X46 senzor peleti (Sensor Pellets)" active={ioStatus.x46} code={`Estado: ${ioStatus.x46 ? 'DETECTANDO' : 'APAGADO'}`} />
                </div>
            </div>
             <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                 <h4 className="text-lg font-bold text-cyan-400 mb-4">Entradas Analógicas (AI)</h4>
                 <div className="space-y-3">
                    <AnalogIndicator label="Temperatura Gases Salida" value={boilerState.tempGases} unit="°C" code="B1 temp gaz ardere"/>
                    <AnalogIndicator label="Temperatura Pared Reactor" value={boilerState.reactorWallTemp} unit="°C" code="B2 temp perete"/>
                    <AnalogIndicator label="Temperatura Núcleo" value={boilerState.thermocoupleCoreTemp} unit="°C" code="B3 temp nucleu"/>
                    <AnalogIndicator label="Temperatura Impulsión" value={boilerState.tempImpulsion} unit="°C" code="B4 temp impuls"/>
                    <AnalogIndicator label="Presión Caldera" value={boilerState.presion} unit="bar" code="Presiune"/>
                </div>
            </div>
        </div>
    );
};

const SpecializedAgentChat: React.FC = () => {
    const { t } = useTranslations();
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
        { id: 'init-msg', role: 'model', text: t('ecoHornet.assistant.welcome') }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedPersona, setSelectedPersona] = useState('operator');
    const chatSessionRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string || '' });
        const personaPrompt = PERSONA_PROMPTS[selectedPersona] || PERSONA_PROMPTS.operator;
        const systemInstruction = `Eres un asistente técnico experto en la tecnología ecoHORNET. Tu conocimiento se basa EXCLUSIVAMENTE en el siguiente documento:\n\n---\n${ECOHORNET_CTP_MANUAL}\n---\n\nTu personalidad y enfoque deben adaptarse a la audiencia seleccionada. Actualmente, tu enfoque es:\n${personaPrompt}\n\nResponde únicamente basándote en la información del documento. Si la pregunta no puede ser respondida con el documento, indícalo claramente.`;
        
        chatSessionRef.current = ai.chats.create({
            model: 'gemini-2.5-pro',
            config: { systemInstruction },
        });
    }, [selectedPersona]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, isLoading]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;

        const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: 'user', text: userInput };
        setChatHistory(prev => [...prev, userMessage]);
        const currentInput = userInput;
        setUserInput('');
        setIsLoading(true);
        setError('');

        try {
            if (!chatSessionRef.current) throw new Error("Chat session not initialized.");
            const response: GenerateContentResponse = await chatSessionRef.current.sendMessage({ message: currentInput });
            const agentMessage: ChatMessage = { id: `model-${Date.now()}`, role: 'model', text: response.text };
            setChatHistory(prev => [...prev, agentMessage]);
        } catch (err) {
            setError(err instanceof Error ? err.message : t('ecoHornet.assistant.error'));
            const errorMessage: ChatMessage = { id: `error-${Date.now()}`, role: 'model', text: t('ecoHornet.assistant.error') };
            setChatHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg h-full flex flex-col">
            <div className="p-4 border-b border-slate-700">
                <label htmlFor="persona-select" className="block text-sm font-medium text-slate-400 mb-2">{t('ecoHornet.assistant.selectPersona')}</label>
                <select id="persona-select" value={selectedPersona} onChange={e => setSelectedPersona(e.target.value)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md">
                    {PERSONAS.map(p => <option key={p.id} value={p.id}>{t(p.nameKey)}</option>)}
                </select>
            </div>
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {chatHistory.map((msg, index) => (
                    <div key={msg.id || index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-cyan-500 flex-shrink-0 flex items-center justify-center font-bold">A</div>}
                        <div className={`max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-600' : 'bg-slate-700'}`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isLoading && <p className="text-sm text-slate-400 animate-pulse">Asistente está escribiendo...</p>}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-slate-700">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input type="text" value={userInput} onChange={e => setUserInput(e.target.value)} placeholder={t('ecoHornet.assistant.inputPlaceholder')} className="flex-grow bg-slate-700 px-4 py-2 rounded-full border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                    <button type="submit" disabled={isLoading || !userInput.trim()} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold p-2 rounded-full disabled:bg-slate-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

const KpiCard: React.FC<{ title: string; value: string; unit: string; }> = ({ title, value, unit }) => (
    <div className="bg-slate-900/50 p-3 rounded-lg text-center">
        <h5 className="text-xs text-slate-400 truncate">{title}</h5>
        <p className="text-2xl font-bold font-mono mt-1">{value}</p>
        <p className="text-xs text-slate-500">{unit}</p>
    </div>
);

const BoilerDiagram: React.FC<{ tempGases: number, burnerState: string }> = ({ tempGases, burnerState }) => {
    const getGasColor = () => {
        if (tempGases >= 170) return '#ef4444'; // red-500
        if (tempGases > 130) return '#f97316'; // orange-500
        return '#6b7280'; // gray-500
    };

    return (
        <div className="relative w-full h-full flex items-center justify-center">
             <style>{`
                @keyframes flicker {
                    0%, 100% { opacity: 1; transform: scaleY(1); }
                    50% { opacity: 0.7; transform: scaleY(0.95); }
                }
                .flame {
                    animation: flicker 0.5s infinite ease-in-out;
                }
            `}</style>
            <svg viewBox="0 0 200 300" className="w-auto h-full max-h-[280px]">
                <defs>
                    <linearGradient id="boilerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{stopColor: '#475569'}} />
                        <stop offset="50%" style={{stopColor: '#64748b'}} />
                        <stop offset="100%" style={{stopColor: '#475569'}} />
                    </linearGradient>
                     <linearGradient id="flameGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#fde047" />
                        <stop offset="80%" stopColor="#f97316" />
                        <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                </defs>
                
                {/* Boiler Body */}
                <rect x="50" y="30" width="100" height="240" rx="10" fill="url(#boilerGradient)" stroke="#334155" strokeWidth="2" />
                <text x="100" y="150" textAnchor="middle" fill="#cbd5e1" fontSize="14" fontWeight="bold">Caldera</text>

                {/* Burner */}
                <rect x="130" y="200" width="60" height="70" rx="5" fill="#475569" stroke="#334155" strokeWidth="2" />
                 <text x="160" y="235" textAnchor="middle" fill="#cbd5e1" fontSize="12">Quema.</text>
                 
                {burnerState === 'Encendido' && (
                    <path d="M 140 200 Q 160 180 180 200 L 160 210 Z" fill="url(#flameGradient)" className="flame" />
                )}

                {/* Gas Path */}
                 <path d="M 160 200 C 160 100, 80 120, 80 30 L 80 10" stroke={getGasColor()} strokeWidth="8" fill="none" strokeLinecap="round" />
                 <text x="80" y="5" textAnchor="middle" fill="#cbd5e1" fontSize="12">Salida de Humos</text>
            </svg>
        </div>
    );
};

interface ControlPanelTabProps extends Pick<EcoHornetTwinProps, 'setView' | 'setExpertCommandContext'> {
    isSimulating: boolean;
    boilerState: any;
    currentTime: Date;
    handleSimulationToggle: (start: boolean) => void;
    handleResetSimulation: () => void;
    activeAlarm: number | null;
}

const ControlPanelTab: React.FC<ControlPanelTabProps> = (props) => {
    const { t } = useTranslations();
    const { 
        boilerState, currentTime, handleSimulationToggle, handleResetSimulation,
        setExpertCommandContext, setView, activeAlarm
    } = props;

    const ALARM_CONTEXTS: Record<number, any> = {
        3: { activo: 'Módulo 7: EcoHornet CTP-20', alarm: `Alarma 3: No hay pellets en el búnker.`, diagnostico: 'El motor del sinfín (X14) funcionó durante el tiempo máximo sin que el sensor de pellets (X46) detectara material. Causa Raíz: Falta de pellets en la tolva de alimentación.', seccionesClave: ['6.1'], manual: 'Manual CTP 2020 (7).pdf' },
        4: { activo: 'Módulo 7: EcoHornet CTP-20', alarm: `Alarma 4: Encendido fallado.`, diagnostico: `La simulación falló 3 intentos de ignición. Causa Raíz: La Humedad de Pellets excede el límite operativo del 10%.`, seccionesClave: ['6.2'], manual: 'Manual CTP 2020 (7).pdf' },
        7: { activo: 'Módulo 7: EcoHornet CTP-20', alarm: `Alarma 7: Temperatura del gas demasiado alta (${boilerState.tempGases.toFixed(1)}°C)`, diagnostico: 'Causa probable: Depósitos de hollín por pellets no conformes (Humedad > 10%)', seccionesClave: ['2.1', '2.5', '7.2', '7.3'], manual: 'Manual CTP 2020 (7).pdf' }
    };
    
    const alarmMessage = activeAlarm ? `ALERTA CRÍTICA (ALARMA ${activeAlarm})` : 'EN LÍNEA';
    const systemStatus = activeAlarm ? 'ALERTA' : 'EN LÍNEA';

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                <div className={`lg:col-span-1 p-4 rounded-lg text-center ${systemStatus === 'ALERTA' ? 'bg-red-900/50 border-2 border-red-500 animate-pulse' : 'bg-green-900/50 border-2 border-green-500'}`}>
                    <h3 className="text-xl font-bold">{alarmMessage}</h3>
                </div>
                <div className="text-center">
                    <h3 className="text-5xl font-mono tracking-tight">{currentTime.toLocaleTimeString('es-ES')}</h3>
                    <p className="text-slate-400">{currentTime.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                 <div className="text-right">
                    {systemStatus === 'ALERTA' && (
                        <button onClick={() => { 
                            if (activeAlarm && ALARM_CONTEXTS[activeAlarm]) {
                                setExpertCommandContext({ active: true, context: ALARM_CONTEXTS[activeAlarm] });
                                setView('expert-command-center');
                            }
                        }} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg">
                            Iniciar Consulta de Experto
                        </button>
                    )}
                 </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 rounded-lg bg-slate-800 border border-slate-700 space-y-4">
                    <h4 className="text-lg font-bold text-cyan-400">{t('hmiEcoHornet.panels.mainParams')}</h4>
                    <div className="text-center space-y-4 pt-4">
                        <div><p className="text-slate-400">{t('ecoHornet.params.tempImpulsion')}</p><p className="text-4xl font-mono">{boilerState.tempImpulsion.toFixed(1)}<span className="text-2xl text-slate-500">°C</span></p></div>
                        <div><p className="text-slate-400">{t('ecoHornet.params.tempGases')}</p><p className="text-4xl font-mono">{boilerState.tempGases.toFixed(1)}<span className="text-2xl text-slate-500">°C</span></p></div>
                        <div><p className="text-slate-400">{t('ecoHornet.params.presion')}</p><p className="text-4xl font-mono">{boilerState.presion.toFixed(2)}<span className="text-2xl text-slate-500">bar</span></p></div>
                    </div>
                </div>
                <div className="p-6 rounded-lg bg-slate-800 border border-slate-700 space-y-6">
                    <h4 className="text-lg font-bold text-cyan-400">{t('hmiEcoHornet.panels.operationalStatus')}</h4>
                    <div className="flex justify-between items-center"><span className="text-slate-400">{t('ecoHornet.params.estadoCaldera')}:</span> <span className={`px-2 py-1 text-sm font-bold rounded ${/Alarma|Error/.test(boilerState.estadoCaldera) ? 'bg-red-500' : 'bg-green-700'}`}>{boilerState.estadoCaldera}</span></div>
                    <div className="flex justify-between items-center"><span className="text-slate-400">{t('ecoHornet.params.estadoQuemador')}:</span> <span className={`px-2 py-1 text-sm font-bold rounded ${/Emergencia|Error/.test(boilerState.estadoQuemador) ? 'bg-red-700' : 'bg-green-500'}`}>{boilerState.estadoQuemador}</span></div>
                </div>
                <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                    <h4 className="text-lg font-bold text-cyan-400 mb-2">{t('hmiEcoHornet.panels.boilerDiagram')}</h4>
                    <BoilerDiagram tempGases={boilerState.tempGases} burnerState={boilerState.estadoQuemador} />
                </div>
                <div className="p-6 rounded-lg bg-slate-800 border border-slate-700 space-y-4">
                     <h4 className="text-lg font-bold text-cyan-400">Controles de Simulación</h4>
                     <button onClick={() => handleSimulationToggle(true)} disabled={props.isSimulating} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg disabled:bg-slate-600 text-xl">Iniciar</button>
                     <button onClick={() => handleSimulationToggle(false)} disabled={!props.isSimulating} className="w-full bg-slate-600 hover:bg-slate-500 text-white font-bold py-4 rounded-lg disabled:bg-slate-700 text-xl">Detener</button>
                     <button onClick={handleResetSimulation} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-lg text-xl">Resetear</button>
                </div>
            </div>
        </div>
    );
};

export const EcoHornetTwin: React.FC<EcoHornetTwinProps> = (props) => {
    const { t } = useTranslations();
    const { setView } = props;
    const [activeTab, setActiveTab] = useState<HMIPanel>('controlPanel');
    const [banner, setBanner] = useState<{ phase: 'connecting' | 'ok' | 'error'; text: string }>({ phase: 'connecting', text: 'Verificando conexión con el backend...' });

    const [isSimulating, setIsSimulating] = useState(false);
    
    const [boilerState, setBoilerState] = useState({
        tempImpulsion: 65.3,
        tempGases: 107.7,
        presion: 1.48,
        estadoCaldera: 'Parada' as 'Error' | 'Alarma' | 'Operando' | 'Parada' | 'Calefacción' | 'Arranque',
        estadoQuemador: 'En Espera' as 'En Espera' | 'Encendido' | 'Error',
        pelletHopperLevel: 100,
        reactorWallTemp: 110.5,
        thermocoupleCoreTemp: 112.8,
    });

    const [alarmLog, setAlarmLog] = useState<string[]>([]);
    const [history, setHistory] = useState<{ time: number; tempGases: number }[]>([]);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activeAlarm, setActiveAlarm] = useState<number | null>(null);

    const [pelletMoisture, setPelletMoisture] = useState(8);
    const [binderContent, setBinderContent] = useState(1);
    
    const [failAlarms, setFailAlarms] = useState<Record<string, boolean>>({
        'flowSensor': false, 'gasSensor': false, 'ups': false, 'actuator': false, 'extractor': false
    });

    const ignitionTimeoutRef = useRef<number[]>([]);
    const timeWithoutPelletsRef = useRef(0);

    const addEventToLogs = useCallback((message: string, type: 'alarm' | 'event') => {
        const timestamp = new Date().toISOString().slice(11, 19);
        const fullMessage = `> ${timestamp}: ${message}`;
        setAlarmLog(prev => [fullMessage, ...prev].slice(0, 100));
    }, []);

    const handleResetSimulation = useCallback(() => {
        ignitionTimeoutRef.current.forEach(clearTimeout);
        ignitionTimeoutRef.current = [];
        timeWithoutPelletsRef.current = 0;
        setIsSimulating(false);
        setBoilerState({
            tempImpulsion: 65.3, tempGases: 107.7, presion: 1.48,
            estadoCaldera: 'Parada', estadoQuemador: 'En Espera',
            pelletHopperLevel: 100, reactorWallTemp: 110.5, thermocoupleCoreTemp: 112.8
        });
        setAlarmLog([]);
        setHistory([]);
        setPelletMoisture(8);
        setBinderContent(1);
        setActiveAlarm(null);
        setFailAlarms({ flowSensor: false, gasSensor: false, ups: false, actuator: false, extractor: false });
    }, []);

  const handleSimulationToggle = useCallback((start: boolean) => {
    if (!start) {
        setIsSimulating(false);
        setBoilerState(prev => ({...prev, estadoCaldera: 'Parada', estadoQuemador: 'En Espera'}));
        ignitionTimeoutRef.current.forEach(clearTimeout);
        ignitionTimeoutRef.current = [];
        return;
    }
  
    handleResetSimulation(); // Use useCallback version
    setBoilerState(prev => ({...prev, estadoCaldera: 'Arranque'}));

    if (pelletMoisture > 10) {
        let attempts = 0;
        const tryIgnition = () => {
            attempts++;
            addEventToLogs(`Intento de encendido ${attempts}/3...`, 'event');
            const timeoutId = window.setTimeout(() => {
                addEventToLogs(`FALLO: Encendido fallido (humedad > 10%).`, 'alarm');
                if (attempts < 3) {
                    tryIgnition();
                } else {
                    addEventToLogs(`FALLO: ALARMA 4: Encendido fallado.`, 'alarm');
                    setBoilerState(prev => ({...prev, estadoCaldera: 'Error', estadoQuemador: 'Error'}));
                    setActiveAlarm(4);
                }
            }, 2000);
            ignitionTimeoutRef.current.push(timeoutId);
        };
        tryIgnition();
    } else {
        addEventToLogs(`Intento de encendido 1/1... Éxito.`, 'event');
        setTimeout(() => {
            setIsSimulating(true);
            setBoilerState(prev => ({...prev, estadoCaldera: 'Calefacción', estadoQuemador: 'Encendido'}));
        }, 1000);
    }
  }, [pelletMoisture, handleResetSimulation, addEventToLogs]);

  useEffect(() => {
    if (!isSimulating) return;

    const simulationLoop = setInterval(() => {
        setBoilerState(prev => {
            let { pelletHopperLevel, tempGases } = prev;
            let newEstadoCaldera = prev.estadoCaldera;
            
            pelletHopperLevel = Math.max(0, pelletHopperLevel - 0.2);

            const isPelletSensorDetecting = pelletHopperLevel > 5;
            if (!isPelletSensorDetecting) {
                timeWithoutPelletsRef.current += 1;
                if (timeWithoutPelletsRef.current > 120) {
                    if (!activeAlarm) {
                        addEventToLogs("FALLO: ALARMA 3: No hay pellets en el búnker.", 'alarm');
                        newEstadoCaldera = 'Error';
                        setActiveAlarm(3);
                        setIsSimulating(false);
                    }
                }
            } else {
                timeWithoutPelletsRef.current = 0;
            }

            // Temperature increases if moisture is high (incomplete combustion)
            if (pelletMoisture > 10) {
                tempGases = Math.min(210, prev.tempGases + (Math.random() * 0.5));
            } else { // Normal operation temp fluctuation
                tempGases = prev.tempGases + (115 - prev.tempGases) * 0.1 + (Math.random() - 0.5);
            }

            if (tempGases > 170) {
                if (!activeAlarm) {
                    addEventToLogs(`ALERTA CRÍTICA: ALARMA 7: Temperatura del gas demasiado alta (${tempGases.toFixed(1)}°C)`, 'alarm');
                    newEstadoCaldera = 'Alarma';
                    setActiveAlarm(7);
                    setIsSimulating(false); // Stop simulation on alarm
                }
            }
            
            setHistory(h => [...h.slice(-99), { time: Date.now(), tempGases: tempGases }]);
            setCurrentTime(new Date());

            return {
                ...prev,
                pelletHopperLevel,
                tempGases,
                estadoCaldera: newEstadoCaldera,
                presion: 1.48 + (Math.random() - 0.5) * 0.05,
                tempImpulsion: 65.3 + (Math.random() - 0.5) * 2,
                reactorWallTemp: tempGases * 0.9 + (Math.random() - 0.5) * 5,
                thermocoupleCoreTemp: tempGases * 1.05 + (Math.random() - 0.5) * 5
            };
        });
    }, 1000);

    return () => clearInterval(simulationLoop);
  }, [isSimulating, pelletMoisture, activeAlarm, addEventToLogs]);

  useEffect(() => {
    setTimeout(() => {
        setBanner({ phase: 'ok', text: '¡Éxito! Conexión con el backend (200 OK) • v1.0.0 • MySQL 9.5.0 (1 ms)' });
    }, 1500);
  }, []);

  const TABS: { id: HMIPanel; label: string }[] = [
      { id: 'controlPanel', label: t('hmiEcoHornet.tabs.controlPanel') },
      { id: 'trends', label: t('hmiEcoHornet.tabs.trendsAndKpis') },
      { id: 'ioPanel', label: 'E/S (Entradas/Salidas)' },
      { id: 'materials', label: t('hmiEcoHornet.tabs.materials') },
      { id: 'security', label: t('hmiEcoHornet.tabs.security') },
      { id: 'crisisSimulation', label: t('hmiEcoHornet.tabs.crisisSimulation') },
      { id: 'technicalAssistant', label: t('hmiEcoHornet.tabs.technicalAssistant') }
  ];
  
  const renderContent = () => {
      switch (activeTab) {
          case 'controlPanel': return <ControlPanelTab {...props} isSimulating={isSimulating} boilerState={boilerState} currentTime={currentTime} handleSimulationToggle={handleSimulationToggle} handleResetSimulation={handleResetSimulation} activeAlarm={activeAlarm} />;
          case 'materials': return <MaterialsPanel pelletMoisture={pelletMoisture} onMoistureChange={setPelletMoisture} binderContent={binderContent} onBinderChange={setBinderContent} pelletHopperLevel={boilerState.pelletHopperLevel} onHopperLevelChange={(val) => setBoilerState(p => ({...p, pelletHopperLevel: val}))} />;
          case 'trends': return <TrendsPanel history={history} activeAlarm={activeAlarm} pelletMoisture={pelletMoisture} />;
          case 'security': return <SecurityPanel alarmLog={alarmLog} />;
          case 'crisisSimulation': return <CrisisSimulationPanel failAlarms={failAlarms} onToggleFailAlarm={(key) => setFailAlarms(prev => ({...prev, [key]: !prev[key]}))} />;
          case 'technicalAssistant': return <SpecializedAgentChat />;
          case 'ioPanel': return <IOPanel boilerState={boilerState} isSimulating={isSimulating} timeWithoutPellets={timeWithoutPelletsRef.current} />;
          default: return <div className="text-slate-500">Contenido no disponible.</div>;
      }
  };

  return (
      <div className="bg-slate-900 text-white p-6 rounded-lg min-h-full font-sans flex flex-col relative">
           <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
            `}</style>
          <header className="text-center mb-6 relative">
              <h2 className="text-3xl font-bold">{t('hmiEcoHornet.title')}</h2>
              <p className="mt-1 text-md text-slate-400">{t('hmiEcoHornet.subtitle')}</p>
              <button onClick={() => setView('hyperion-9')} className="absolute top-1/2 -translate-y-1/2 right-0 flex items-center gap-2 bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors px-4 py-2 rounded-lg text-sm font-semibold">
                   &larr; Volver a SMC Hyperion-9
              </button>
          </header>
          
          <BannerDisplay banner={banner} />

          <div className="border-b border-slate-700">
              <nav className="-mb-px flex space-x-2 overflow-x-auto">
                  {TABS.map(tab => <TabButton key={tab.id} id={tab.id} activeTab={activeTab} onClick={setActiveTab} label={tab.label} />)}
              </nav>
          </div>
          <main className="flex-grow mt-6">
               {renderContent()}
          </main>
      </div>
  );
};

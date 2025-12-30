import React, { useState } from 'react';
import type { AegisState, AegisEvent, CharacterProfile } from '../../types';
import { useTranslations } from '../../contexts/LanguageContext';

interface Aegis9Props {
    aegisState: AegisState;
    setAegisState: React.Dispatch<React.SetStateAction<AegisState>>;
    titans: CharacterProfile[];
}

const ncsLevelInfo: Record<AegisState['ncsLevel'], { label: string; shortLabel: string; color: string; ringColor: string; description: string }> = {
    1: { label: "Verde", shortLabel: "Normal", color: "text-green-400", ringColor: "ring-green-500", description: "Operaciones normales, sin amenazas detectadas." },
    2: { label: "Azul", shortLabel: "Vigilancia", color: "text-blue-400", ringColor: "ring-blue-500", description: "Atención elevada, monitoreo de anomalías menores." },
    3: { label: "Amarilla", shortLabel: "Precaución", color: "text-yellow-400", ringColor: "ring-yellow-500", description: "Amenaza potencial detectada. Protocolos de contención activados." },
    4: { label: "Naranja", shortLabel: "Peligro", color: "text-orange-400", ringColor: "ring-orange-500", description: "Amenaza confirmada. Respuesta de seguridad en curso." },
    5: { label: "Roja", shortLabel: "Crítica", color: "text-red-400", ringColor: "ring-red-500", description: "Amenaza crítica. Bloqueo total y respuesta de emergencia." },
};

const SectorButton: React.FC<{ sector: string, current: AegisState['activeSector'], isHot?: boolean, onClick: (sector: string) => void }> = ({ sector, current, isHot, onClick }) => (
    <button
        onClick={() => onClick(sector)}
        className={`px-3 py-3 text-sm font-semibold rounded-md transition-all duration-200 w-full h-full text-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800
            ${current === sector 
                ? 'bg-blue-600 text-white ring-blue-500' 
                : isHot
                ? 'bg-yellow-600 text-white hover:bg-yellow-500 ring-yellow-400'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600 ring-slate-600'
            }`}
    >
        {sector}
    </button>
);

export const Aegis9: React.FC<Aegis9Props> = ({ aegisState, setAegisState, titans }) => {
    const { t } = useTranslations();
    const [command, setCommand] = useState('');
    const info = ncsLevelInfo[aegisState.ncsLevel];
    const highRiskScenarioActive = aegisState.activeSector === 'Laboratorio P-07 (Zona Roja)' || aegisState.ncsLevel >= 3;

    const handleTransmitDirective = () => {
        if (!command.trim()) return;

        setAegisState(prevState => {
            const newDirectiveEvent: AegisEvent = {
                id: `evt-directive-${Date.now()}`,
                timestamp: Date.now(),
                sector: 'Director de Seguridad',
                type: 'Seguridad',
                level: 'Info',
                message: `Nueva directiva: "${command.trim()}"`,
            };
            
            return {
                ...prevState,
                directorDirective: command.trim(),
                events: [newDirectiveEvent, ...prevState.events].slice(0, 50).sort((a,b) => b.timestamp - a.timestamp),
            };
        });

        setCommand('');
    };
    
    const handleGenerateSystemReport = () => {
        const totalTitans = titans.length;
        const totalAssistants = titans.reduce((sum, titan) => sum + (titan.assistants?.length || 0), 0);
        const activeAssistants = titans.reduce((sum, titan) => sum + (titan.assistants?.filter(a => a.status === 'ACTIVE').length || 0), 0);
        const totalSkills = titans.reduce((sum, titan) => sum + (titan.skillModules?.length || 0), 0);
        const activeSkills = titans.reduce((sum, titan) => sum + (titan.skillModules?.filter(s => s.status === 'ACTIVE').length || 0), 0);

        const reportMessage = `Auditoría de Agentes finalizada. Estado: ${totalTitans} Titanes, ${activeAssistants}/${totalAssistants} Asistentes activos, ${activeSkills}/${totalSkills} Habilidades activas.`;

        const newEvent: AegisEvent = {
            id: `evt-report-${Date.now()}`,
            timestamp: Date.now(),
            sector: 'Auditoría Interna (Linceo)',
            type: 'Seguridad',
            level: 'Info',
            message: reportMessage,
        };

        setAegisState(prevState => ({
            ...prevState,
            events: [newEvent, ...prevState.events].slice(0, 50).sort((a, b) => b.timestamp - a.timestamp),
        }));
    };

    return (
        <div className="bg-slate-900 text-white min-h-full p-6 font-sans">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* --- SECCIÓN SUPERIOR --- */}
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-6">
                        <div className="relative flex items-center justify-center">
                            <div className={`absolute w-36 h-36 rounded-full ${info.ringColor} opacity-20 animate-ping`}></div>
                            <div className={`w-36 h-36 rounded-full ring-8 ${info.ringColor}/50 flex items-center justify-center`}>
                                <span className="text-7xl font-bold">{aegisState.ncsLevel}</span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <h4 className={`text-3xl font-bold ${info.color}`}>{t('aegis.alert')} {info.label}</h4>
                            <p className="text-slate-400 mt-2">{aegisState.directorDirective || info.description}</p>
                            <button className="mt-4 px-3 py-1.5 bg-slate-700 text-slate-300 rounded-md font-semibold text-xs uppercase">{t('aegis.status')}: BLANCO</button>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                     <h3 className="text-lg font-bold mb-4">{t('aegis.tacticalMap')}</h3>
                    <div className="grid grid-cols-4 grid-rows-3 gap-2 h-full">
                        <div className="col-span-1 row-span-3 grid grid-rows-3 gap-2">
                             <SectorButton sector="Acceso Norte" current={aegisState.activeSector} onClick={(s) => setAegisState(p => ({...p, activeSector: s}))} />
                             <SectorButton sector="Sala de Control Central" current={aegisState.activeSector} onClick={(s) => setAegisState(p => ({...p, activeSector: s}))} />
                             <SectorButton sector="Pasillo Delta" current={aegisState.activeSector} onClick={(s) => setAegisState(p => ({...p, activeSector: s}))} />
                        </div>
                        <div className="col-span-2 row-span-1 grid grid-cols-2 gap-2">
                            <SectorButton sector="Almacén de Materias" current={aegisState.activeSector} onClick={(s) => setAegisState(p => ({...p, activeSector: s}))} />
                            <SectorButton sector="Laboratorio P-01" current={aegisState.activeSector} isHot={aegisState.activeSector === 'Phoenix'} onClick={(s) => setAegisState(p => ({...p, activeSector: s}))} />
                        </div>
                         <div className="col-span-2 row-span-1 grid grid-cols-2 gap-2">
                            <SectorButton sector="Centro de Datos" current={aegisState.activeSector} onClick={(s) => setAegisState(p => ({...p, activeSector: s}))} />
                             <SectorButton sector="Planta de Energía" current={aegisState.activeSector} onClick={(s) => setAegisState(p => ({...p, activeSector: s}))} />
                        </div>
                        <div className="col-span-1 row-span-3 grid grid-rows-3 gap-2">
                            <SectorButton sector="Laboratorio P-07 (Zona Roja)" current={aegisState.activeSector} isHot onClick={(s) => setAegisState(p => ({...p, activeSector: s}))} />
                             <SectorButton sector="Phoenix" current={aegisState.activeSector} isHot onClick={(s) => setAegisState(p => ({...p, activeSector: s}))} />
                             <SectorButton sector="Salida de Emergencia Sur" current={aegisState.activeSector} onClick={(s) => setAegisState(p => ({...p, activeSector: s}))} />
                        </div>
                         <div className="col-span-2 row-span-1 grid grid-cols-2 gap-2">
                            <SectorButton sector={t('aegis.sectorVulcano')} current={aegisState.activeSector} isHot onClick={(s) => setAegisState(p => ({...p, activeSector: s}))} />
                             <div className="text-center text-xs text-slate-500 flex items-center justify-center">{t('aegis.exteriorPerimeter')}</div>
                         </div>
                    </div>
                </div>
                
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                    <h3 className="text-lg font-bold mb-4">{t('aegis.eventFeed')}</h3>
                    <div className="space-y-3 h-64 overflow-y-auto pr-2 custom-scrollbar">
                        {aegisState.events.length > 0 ? (
                            aegisState.events.map(event => {
                                const levelClasses: Record<AegisEvent['level'], { text: string; label: string }> = {
                                    'Alerta': { text: 'text-red-400', label: '[ALERTA]' },
                                    'Advertencia': { text: 'text-yellow-400', label: '[ADVERTENCIA]' },
                                    'Vigilancia': { text: 'text-blue-400', label: '[VIGILANCIA]' },
                                    'Info': { text: 'text-slate-400', label: '[INFO]' },
                                };
                                return (
                                    <div key={event.id} className="text-sm">
                                        <span className="font-mono text-slate-500 mr-2">{new Date(event.timestamp).toLocaleTimeString('es-ES')}</span>
                                        <span className={`font-bold mr-2 ${levelClasses[event.level]?.text || 'text-gray-400'}`}>{levelClasses[event.level]?.label}</span>
                                        <span>{event.message}</span>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-slate-500 italic text-center py-8">{t('aegis.noEvents')}</p>
                        )}
                    </div>
                </div>

                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                     <h3 className="text-lg font-bold mb-4">{t('aegis.commandInterface')}</h3>
                     <textarea
                        value={command}
                        onChange={(e) => setCommand(e.target.value)}
                        rows={3}
                        className="w-full p-3 bg-slate-900 border border-slate-600 rounded-md text-slate-200 text-sm font-mono focus:ring-2 focus:ring-blue-500"
                        placeholder={t('aegis.commandPlaceholder')}
                     />
                     <button onClick={handleTransmitDirective} className="w-full mt-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-lg">
                        {t('aegis.transmitDirective')}
                     </button>
                      <div className="mt-3">
                         <h3 className="text-lg font-bold mb-2">Auditoría de Sistema (Linceo)</h3>
                         <button onClick={handleGenerateSystemReport} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg">
                             Ejecutar Auditoría de Agentes Activos
                         </button>
                     </div>
                </div>

                {/* --- SECCIÓN INFERIOR --- */}
                {highRiskScenarioActive && (
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                            <h3 className="text-lg font-bold mb-4">{t('aegis.highRiskWorkflow')}</h3>
                            <div className="space-y-3 text-sm text-slate-300">
                                <p><strong>{t('aegis.scenario')}:</strong> {t('aegis.scenarioDesc')}</p>
                                <ol className="list-decimal list-inside space-y-2 mt-2">
                                    <li><strong>{t('aegis.step1Title')}</strong><br/><span className="text-xs text-slate-400 pl-4">{t('aegis.step1Desc')} <strong className="text-green-400">{t('aegis.resultValidKey')}</strong></span></li>
                                    <li><strong>{t('aegis.step2Title')}</strong><br/><span className="text-xs text-slate-400 pl-4">{t('aegis.step2Desc')} <strong className="text-green-400">{t('aegis.resultValidBiometrics')}</strong></span></li>
                                    <li><strong>{t('aegis.step3Title')}</strong><br/><span className="text-xs text-slate-400 pl-4">{t('aegis.step3Desc')}</span></li>
                                    <li><strong>{t('aegis.step4Title')}</strong><br/><span className="text-xs text-slate-400 pl-4">{t('aegis.step4Desc')}</span></li>
                                </ol>
                            </div>
                        </div>
                        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                             <h3 className="text-lg font-bold mb-4">{t('aegis.ledger')}</h3>
                             <div className="space-y-3 font-mono text-xs text-slate-400 h-64 overflow-y-auto pr-2 custom-scrollbar">
                                <div className="p-3 bg-slate-900/50 rounded"><strong>Block #1</strong><br/>{t('aegis.block1')}<br/>Hash: a1b2...</div>
                                <div className="p-3 bg-slate-900/50 rounded"><strong>Block #2</strong><br/>{t('aegis.block2')}<br/>Hash: c3d4...</div>
                                <div className="p-3 bg-slate-900/50 rounded"><strong>Block #3</strong><br/>{t('aegis.block3')}<br/>Hash: e5f6...</div>
                             </div>
                        </div>
                    </div>
                )}
            </div>
             <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #1e293b; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
            `}</style>
        </div>
    );
};
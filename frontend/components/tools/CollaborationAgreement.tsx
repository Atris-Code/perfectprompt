import React, { useState, useEffect } from 'react';
import { Accordion } from '../form/Accordion';
import { FormSelect } from '../form/FormControls';
import { useTranslations } from '../../contexts/LanguageContext';

const Slider: React.FC<{ label: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; name: string }> = ({ label, value, onChange, name }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 flex justify-between">
            <span>{label}</span>
            <span className="font-mono">{value.toFixed(1)}%</span>
        </label>
        <input type="range" id={name} name={name} min="0" max="100" step="0.1" value={value} onChange={onChange} className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-500" />
    </div>
);

type Role = 'investigadores' | 'inversores' | 'comunidades' | 'industriales';
type Profile = 'CIENTIFICA' | 'FINANCIERA' | 'IMPACTO_SOCIAL' | 'REWARD';

const ROLES_MAP: Record<Role, string> = {
    investigadores: 'INVESTIGADOR_ROLE',
    inversores: 'INVERSOR_ROLE',
    comunidades: 'COMUNIDAD_ROLE',
    industriales: 'INDUSTRIAL_ROLE',
};

const PROFILES: { key: Profile, name: string }[] = [
    { key: 'CIENTIFICA', name: 'Propuestas Científicas (M3)' },
    { key: 'FINANCIERA', name: 'Propuestas Financieras (M5)' },
    { key: 'IMPACTO_SOCIAL', name: 'Propuestas de Impacto Social (M6)' },
    { key: 'REWARD', name: 'Propuestas de Recompensa (REWARD)' },
];

// Datos simulados que representarían el estado actual en la Blockchain
const mockOnChainData = {
    conflictRules: {
        VETO_PUBLICACION_INDUSTRIAL: 'PENALIZE_50_REPUTATION',
        DECLARACION_INTERES_INVERSOR: 'ANNUL_VOTE_AND_PENALIZE_100',
    },
    votingWeights: {
        CIENTIFICA: { investigadores: 50, inversores: 25, comunidades: 15, industriales: 10 },
        FINANCIERA: { investigadores: 15, inversores: 60, comunidades: 10, industriales: 15 },
        IMPACTO_SOCIAL: { investigadores: 10, inversores: 10, comunidades: 60, industriales: 20 },
        REWARD: { investigadores: 70, inversores: 5, comunidades: 15, industriales: 10 },
    },
    vetoPower: false,
};


export const CollaborationAgreement: React.FC = () => {
    const { t } = useTranslations();
    const [conflictRules, setConflictRules] = useState({
        VETO_PUBLICACION_INDUSTRIAL: 'REQUIRE_2_3_COUNCIL_VOTE',
        DECLARACION_INTERES_INVERSOR: 'ANNUL_VOTE_AND_PENALIZE_100',
    });
    
    const [votingWeights, setVotingWeights] = useState<Record<Profile, Record<Role, number>>>({
        CIENTIFICA: { investigadores: 60, inversores: 20, comunidades: 10, industriales: 10 },
        FINANCIERA: { investigadores: 20, inversores: 45, comunidades: 15, industriales: 20 },
        IMPACTO_SOCIAL: { investigadores: 20, inversores: 20, comunidades: 40, industriales: 20 },
        REWARD: { investigadores: 60, inversores: 10, comunidades: 20, industriales: 10 },
    });

    const [activeProfile, setActiveProfile] = useState<Profile>('CIENTIFICA');
    const [vetoPower, setVetoPower] = useState(true);
    
    const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'deploying' | 'success' | 'failed' | 'loading' | 'loaded'>('idle');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [generatedJson, setGeneratedJson] = useState('');

    // State for GPR Simulator
    const [simulationScenario, setSimulationScenario] = useState<'negative' | 'positive'>('negative');
    const [logMessages, setLogMessages] = useState<string[]>([]);
    const [isSimulating, setIsSimulating] = useState(false);

    const handleConflictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setConflictRules(prev => ({ ...prev, [name]: value }));
    };

    const handleWeightChange = (changedRole: Role, newValue: number) => {
        setVotingWeights(prev => {
            const newWeightsForProfile = { ...prev[activeProfile] };
            const oldValue = newWeightsForProfile[changedRole];
            const delta = newValue - oldValue;
            
            const otherRoles = (Object.keys(newWeightsForProfile) as Role[]).filter(r => r !== changedRole);
            const sumOfOthers = otherRoles.reduce((sum, role) => sum + newWeightsForProfile[role], 0);

            if (sumOfOthers > 0) {
                const ratio = (sumOfOthers - delta) / sumOfOthers;
                otherRoles.forEach(role => {
                    newWeightsForProfile[role] *= ratio;
                });
            } else if (otherRoles.length > 0) {
                const distributedValue = (100 - newValue) / otherRoles.length;
                otherRoles.forEach(role => {
                    newWeightsForProfile[role] = distributedValue;
                });
            }
            
            newWeightsForProfile[changedRole] = newValue;

            const total = (Object.values(newWeightsForProfile) as number[]).reduce((sum: number, v: number) => sum + v, 0);
            const diff = 100 - total;
            if (Math.abs(diff) > 0.001) {
                newWeightsForProfile[changedRole] += diff;
            }
            
            Object.keys(newWeightsForProfile).forEach(key => {
                newWeightsForProfile[key as Role] = Math.max(0, Math.min(100, newWeightsForProfile[key as Role]));
            });

            return { ...prev, [activeProfile]: newWeightsForProfile };
        });
    };

    const handleDeployRules = () => {
        const payload = {
            conflictRules: Object.entries(conflictRules).map(([ruleId, action]) => ({ ruleId, action })),
            governanceModel: {
                votingProfiles: (Object.entries(votingWeights) as [Profile, Record<Role, number>][]).map(([profileKey, weights]) => ({
                    type: profileKey,
                    weights: (Object.entries(weights) as [Role, number][]).map(([roleKey, weight]) => ({
                        role: ROLES_MAP[roleKey],
                        weight: Math.round(weight)
                    }))
                })),
                communityVetoEnabled: vetoPower
            }
        };

        setGeneratedJson(JSON.stringify(payload, null, 2));
        setIsModalOpen(true);
        setDeploymentStatus('deploying');
        
        setTimeout(() => {
            setDeploymentStatus('success');
        }, 3000);
    };

    const handleLoadFromBlockchain = () => {
        setIsModalOpen(true);
        setDeploymentStatus('loading');
        
        setTimeout(() => {
            setConflictRules(mockOnChainData.conflictRules);
            // Ensure all profiles are loaded, including the new REWARD one if it exists in mock
            const loadedWeights = { ...votingWeights, ...mockOnChainData.votingWeights };
            setVotingWeights(loadedWeights as Record<Profile, Record<Role, number>>);
            setVetoPower(mockOnChainData.vetoPower);
            setDeploymentStatus('loaded');
        }, 2000);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setDeploymentStatus('idle');
    };

    const handleStartSimulation = () => {
        setIsSimulating(true);
        setLogMessages([]);
        const steps = simulationScenario === 'negative'
            ? [t('gprSimulator.log.neg1'), t('gprSimulator.log.neg2'), t('gprSimulator.log.neg3'), t('gprSimulator.log.neg4'), t('gprSimulator.log.neg5'), t('gprSimulator.log.neg6'), t('gprSimulator.log.neg7'), t('gprSimulator.log.neg8')]
            : [t('gprSimulator.log.pos1'), t('gprSimulator.log.pos2'), t('gprSimulator.log.pos3'), t('gprSimulator.log.pos4'), t('gprSimulator.log.pos5'), t('gprSimulator.log.pos6'), t('gprSimulator.log.pos7')];

        steps.forEach((step, index) => {
            setTimeout(() => {
                setLogMessages(prev => [...prev, step]);
                if (index === steps.length - 1) {
                    setIsSimulating(false);
                }
            }, (index + 1) * 1500);
        });
    };

    const renderModalContent = () => {
        switch (deploymentStatus) {
            case 'deploying': return (<div className="text-center"><p className="animate-pulse">Desplegando en Testnet... (Simulado)</p><p className="text-sm text-gray-500 mt-2">Enviando transacción a la API del Backend. El Oracle tomará la tarea...</p></div>);
            case 'success': return (<div className="text-center text-green-700"><p className="font-bold text-xl">¡Reglas Desplegadas con Éxito!</p><p className="text-sm mt-2">El Oracle ha confirmado las transacciones en la blockchain. El estado se ha actualizado a "COMPLETADO".</p></div>);
            case 'loading': return (<div className="text-center"><p className="animate-pulse">Cargando estado desde la Blockchain... (Simulado)</p><p className="text-sm text-gray-500 mt-2">Realizando `llamadas` paralelas al contrato inteligente...</p></div>);
            case 'loaded': return (<div className="text-center text-green-700"><p className="font-bold text-xl">¡Estado Cargado con Éxito!</p><p className="text-sm mt-2">La UI ha sido poblada con la 'fuente de la verdad' desde el Smart Contract.</p></div>);
            default: return null;
        }
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg">
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={closeModal}>
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full" onClick={e => e.stopPropagation()}>
                        <h3 className="font-bold text-lg mb-4">Simulación de Interacción con Blockchain</h3>
                        {renderModalContent()}
                        {deploymentStatus === 'success' && (<Accordion title="JSON Payload Enviado" defaultOpen={false}><pre className="bg-gray-100 p-4 rounded-md text-xs max-h-64 overflow-auto">{generatedJson}</pre></Accordion>)}
                        <div className="text-right mt-4"><button onClick={closeModal} className="px-4 py-2 bg-blue-600 text-white rounded">Cerrar</button></div>
                    </div>
                </div>
            )}
            <header className="text-center mb-10"><h2 className="text-3xl font-bold text-gray-900">Módulo 6: Arquitecto de Gobernanza Distribuida</h2><p className="mt-2 text-md text-gray-600">Diseña las reglas inmutables de colaboración, poder y resolución de conflictos para tu proyecto híbrido.</p></header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <Accordion title="1. Gestión de Conflictos (Mediador de Ecosistema)" defaultOpen><p className="text-sm text-gray-600 mb-4">Define las reglas automáticas que se ejecutarán en la blockchain para garantizar la transparencia.</p><div className="space-y-4"><div className="bg-gray-50 p-4 rounded-lg border"><h4 className="font-semibold text-gray-800 mb-2">Regla de Veto de Publicación</h4><p className="text-sm text-gray-600 mb-2"><strong>Condición:</strong> Un 'Industrial' intenta vetar la publicación de un 'Investigador'.</p><FormSelect label="Acción:" name="VETO_PUBLICACION_INDUSTRIAL" value={conflictRules.VETO_PUBLICACION_INDUSTRIAL} onChange={handleConflictChange}><option value="REQUIRE_2_3_COUNCIL_VOTE">Requerir voto de 2/3 del Concilio</option><option value="PENALIZE_50_REPUTATION">Penalización de Reputación (-50 pts)</option></FormSelect></div><div className="bg-gray-50 p-4 rounded-lg border"><h4 className="font-semibold text-gray-800 mb-2">Regla de Declaración de Intereses</h4><p className="text-sm text-gray-600 mb-2"><strong>Condición:</strong> Un 'Inversor' no declara un interés en tecnología competidora.</p><FormSelect label="Acción:" name="DECLARACION_INTERES_INVERSOR" value={conflictRules.DECLARACION_INTERES_INVERSOR} onChange={handleConflictChange}><option value="ANNUL_VOTE_AND_PENALIZE_100">Anular voto y penalizar (-100 pts)</option><option value="PUBLIC_NOTIFICATION">Notificación pública a stakeholders</option></FormSelect></div></div></Accordion>
                <Accordion title="2. Gobernanza Distribuida (DAO-light)" defaultOpen>
                    <div className="border-b border-gray-200 mb-4">
                        <nav className="-mb-px flex flex-wrap gap-x-6" aria-label="Tabs">
                            {PROFILES.map(profile => (
                                <button
                                    key={profile.key}
                                    onClick={() => setActiveProfile(profile.key)}
                                    className={`whitespace-nowrap py-4 px-2 border-b-2 font-medium text-sm ${activeProfile === profile.key 
                                        ? 'border-blue-500 text-blue-600' 
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                >
                                    {profile.name}
                                </button>
                            ))}
                        </nav>
                    </div>
                    <div className="space-y-4">
                        {(Object.keys(votingWeights[activeProfile]) as Role[]).map(role => (
                            <Slider
                                key={`${activeProfile}-${role}`}
                                label={`Peso de Voto: ${role.charAt(0).toUpperCase() + role.slice(1)}`}
                                name={role}
                                value={votingWeights[activeProfile][role]}
                                onChange={(e) => handleWeightChange(role, parseFloat(e.target.value))}
                            />
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t">
                        <label className="flex items-center cursor-pointer p-3 bg-gray-100 rounded-md">
                            <input type="checkbox" checked={vetoPower} onChange={(e) => setVetoPower(e.target.checked)} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                            <span className="ml-3 text-gray-700 font-semibold">Activar Poder de Veto para Comunidades Locales</span>
                        </label>
                    </div>
                </Accordion>
            </div>

             <Accordion title={t('gprSimulator.title')} defaultOpen>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <FormSelect label={t('gprSimulator.selectScenario')} value={simulationScenario} onChange={(e) => setSimulationScenario(e.target.value as 'negative' | 'positive')}>
                        <option value="negative">{t('gprSimulator.negativeLoop')}</option>
                        <option value="positive">{t('gprSimulator.positiveLoop')}</option>
                    </FormSelect>
                    <button onClick={handleStartSimulation} disabled={isSimulating} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                        {isSimulating ? t('gprSimulator.running') : t('gprSimulator.start')}
                    </button>
                </div>
                <div className="mt-4">
                    <h4 className="font-semibold text-gray-800">{t('gprSimulator.logTitle')}</h4>
                    <div className="mt-2 p-4 bg-gray-900 text-white font-mono text-sm rounded-lg h-64 overflow-y-auto space-y-2">
                        {logMessages.map((msg, index) => (
                            <p key={index} className="animate-fade-in">{`> ${msg}`}</p>
                        ))}
                        {isSimulating && !logMessages.length && <p className="animate-pulse">{t('gprSimulator.log.starting')}</p>}
                    </div>
                </div>
            </Accordion>
            
            <div className="mt-8 flex justify-center items-center gap-4">
                 <button onClick={handleLoadFromBlockchain} disabled={deploymentStatus !== 'idle'} className="bg-white border-2 border-blue-600 text-blue-600 font-bold py-3 px-8 rounded-lg hover:bg-blue-50 disabled:bg-gray-200 disabled:text-gray-400 disabled:border-gray-400 transition-colors">Cargar desde Blockchain</button>
                <button onClick={handleDeployRules} disabled={deploymentStatus !== 'idle'} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors">{deploymentStatus === 'deploying' ? 'Desplegando...' : deploymentStatus === 'success' ? '¡Desplegado!' : 'Desplegar Reglas de Gobernanza'}</button>
            </div>
             <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};
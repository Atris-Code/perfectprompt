import React from 'react';
import type { Certification, GovernanceEvent } from '../types';

interface UserProfileProps {
    certifications: Certification[];
    history: GovernanceEvent[];
}

export const UserProfile: React.FC<UserProfileProps> = ({ certifications, history }) => {
    const getPointClasses = (points: string) => {
        if (points.startsWith('+')) return 'bg-green-500/20 text-green-300';
        if (points.startsWith('-')) return 'bg-red-500/20 text-red-300';
        if (points === 'EN DEBATE' || points === 'DEBATE ACTIVO') return 'bg-yellow-500/20 text-yellow-300';
        return 'bg-gray-600 text-gray-300';
    };

    return (
        <div className="bg-gray-900 text-white p-8 rounded-lg min-h-full font-sans">
            <header className="text-center mb-10">
                <h1 className="text-4xl font-bold">Perfil de Usuario</h1>
                <p className="text-gray-400 mt-2">La cara humana y comprensible de un sistema backend complejo.</p>
            </header>

            <div className="max-w-4xl mx-auto space-y-12">
                {/* 1. Member Summary */}
                <section className="bg-gray-800 p-8 rounded-2xl border border-gray-700">
                    <h2 className="text-2xl font-bold text-cyan-400 mb-6">1. Resumen del Miembro (Quién Eres)</h2>
                    <div className="flex items-center gap-8">
                        <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center font-bold text-4xl text-cyan-400 border-2 border-cyan-500">I</div>
                        <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-4">
                            <div><p className="text-sm text-gray-400">Avatar y Nombre</p><p className="font-semibold text-lg">Investigador_User</p></div>
                            <div><p className="text-sm text-gray-400">Rol Principal</p><p className="font-semibold text-lg">Investigador</p></div>
                            <div><p className="text-sm text-gray-400">Miembro del Proyecto</p><p className="font-semibold text-lg">Proyecto Nexo Sinérgico</p></div>
                            <div><p className="text-sm text-gray-400">Miembro desde</p><p className="font-semibold text-lg">01 Enero 2025</p></div>
                            <div className="bg-gray-700/50 p-3 rounded-md"><p className="text-sm text-yellow-400">Puntuación de Reputación (Off-Chain)</p><p className="font-bold text-2xl text-yellow-300">1050 pts</p></div>
                            <div className="bg-gray-700/50 p-3 rounded-md"><p className="text-sm text-purple-400">Multiplicador de Voto (On-Chain)</p><p className="font-bold text-2xl text-purple-300">1.05x</p></div>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-6">Sincronizado con la blockchain hace 3 horas por el Oráculo</p>
                </section>
                
                <section className="bg-gray-800 p-8 rounded-2xl border border-gray-700">
                    <h2 className="text-2xl font-bold text-cyan-400 mb-6">Certificaciones Obtenidas (NFTs)</h2>
                    {certifications.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {certifications.map(cert => (
                                <div key={cert.id} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                                    <h3 className="font-bold text-lg text-yellow-300">{cert.nftMetadata.name}</h3>
                                    <p className="text-xs text-gray-400">Acuñado: {cert.mintDate}</p>
                                    <p className="text-sm mt-2">{cert.nftMetadata.description}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">No tienes certificaciones todavía.</p>
                    )}
                </section>

                {/* 2. Influence Panel */}
                <section className="bg-gray-800 p-8 rounded-2xl border border-gray-700">
                    <h2 className="text-2xl font-bold text-cyan-400 mb-6">2. El Panel de Influencia (Qué Poder Tienes)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-semibold text-lg mb-4">Poder de Voto Actual</h3>
                            <p className="text-sm text-gray-400 mb-4">Tu poder de voto es tu <strong className="text-gray-200">(Peso Base del Rol)</strong> x <strong className="text-gray-200">(Multiplicador de Reputación)</strong>.</p>
                            <ul className="space-y-3 text-sm">
                                <li><strong>Para Propuestas Científicas (M3):</strong><br/><span className="font-mono text-gray-300">(60% Peso Base) x 1.05x = <span className="font-bold text-white">63.0%</span> de peso de voto efectivo</span></li>
                                <li><strong>Para Propuestas Financieras (M5):</strong><br/><span className="font-mono text-gray-300">(20% Peso Base) x 1.05x = <span className="font-bold text-white">21.0%</span> de peso de voto efectivo</span></li>
                                <li><strong>Para Propuestas de Recompensa (REWARD):</strong><br/><span className="font-mono text-gray-300">(60% Peso Base) x 1.05x = <span className="font-bold text-white">63.0%</span> de peso de voto efectivo</span></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-4">Progreso de Reputación (Gamificación)</h3>
                            <div className="w-full bg-gray-700 rounded-full h-6 relative overflow-hidden">
                                <div className="bg-blue-500 h-6 rounded-full" style={{ width: '50%' }}></div>
                                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">50 / 100 pts</span>
                            </div>
                            <p className="text-sm text-center text-gray-400 mt-2">1050 pts (Multiplicador actual: 1.05x)</p>
                            <p className="text-sm text-center text-gray-300">Estás a <strong className="text-white">50 pts</strong> de alcanzar el siguiente nivel de multiplicador (1.10x).</p>
                        </div>
                    </div>
                </section>

                {/* 3. Governance History */}
                <section className="bg-gray-800 p-8 rounded-2xl border border-gray-700">
                    <h2 className="text-2xl font-bold text-cyan-400 mb-6">3. El Historial de Gobernanza (La Prueba de Tu Valor)</h2>
                    <div className="relative">
                        <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-700"></div>
                        <div className="space-y-8">
                            {history.map((item, index) => (
                                <div key={index} className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0 z-10"></div>
                                    <div className="flex-1 -mt-2">
                                        <div className="flex justify-between items-baseline">
                                            <p className="text-sm text-gray-500">{item.date}</p>
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${getPointClasses(item.points)}`}>{item.points}</span>
                                        </div>
                                        <h3 className="font-bold text-lg mt-1">{item.title}</h3>
                                        <div className="mt-2 text-sm space-y-2">
                                            {item.details.map((detail, dIndex) => (
                                                <p key={dIndex}>
                                                    <strong className="text-gray-400">{detail.label}:</strong> 
                                                    {detail.link ? (
                                                        <button onClick={(e) => e.preventDefault()} className="text-blue-400 hover:underline ml-1 bg-transparent border-none p-0 cursor-pointer text-left">
                                                            {detail.value}
                                                        </button>
                                                    ) : (
                                                        <span className="ml-1 text-gray-300">{detail.value}</span>
                                                    )}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};
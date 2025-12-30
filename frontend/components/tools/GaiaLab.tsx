import React from 'react';
import type { GaiaLabState } from '../../types';
import { Accordion } from '../form/Accordion';

interface GaiaLabProps {
    gaiaLabState: GaiaLabState;
    onTakeSample: () => void;
    onSimulateBatch?: () => void;
    vulcanoGCRLevel?: number;
    vulcanoPurity?: number;
    vulcanoIsRunning?: boolean;
}

const KpiCard: React.FC<{ label: string; value: string | number; unit: string; }> = ({ label, value, unit }) => (
    <div className="bg-slate-700 p-4 rounded-lg text-center">
        <p className="text-sm text-slate-400">{label}</p>
        <p className="text-3xl font-bold font-mono text-white mt-1">
            {typeof value === 'number' ? value.toFixed(2) : value}
            <span className="text-lg text-slate-300 ml-1">{unit}</span>
        </p>
    </div>
);

export const GaiaLab: React.FC<GaiaLabProps> = ({ gaiaLabState, onTakeSample, onSimulateBatch, vulcanoGCRLevel = 0, vulcanoPurity = 0, vulcanoIsRunning = false }) => {
    const { isNewBatchReady, sampleId, analysisResults, quality } = gaiaLabState;
    const isAnalysisComplete = !!analysisResults;
    const isVulcanoConnected = vulcanoGCRLevel > 0 && vulcanoIsRunning;
    const hasGCRButStopped = vulcanoGCRLevel > 0 && !vulcanoIsRunning;

    return (
        <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-2xl h-full flex flex-col font-sans">
            <header className="text-center mb-6">
                <h2 className="text-3xl font-bold">Laboratorio de Calidad "Gaia"</h2>
                <p className="mt-2 text-md text-slate-400">Análisis y clasificación de lotes de biochar para su valorización.</p>
                {/* Vulcano Connection Status */}
                <div className="mt-4 flex items-center justify-center gap-2">
                    {isVulcanoConnected ? (
                        <div className="flex items-center gap-2 bg-green-900/30 border border-green-600 px-4 py-2 rounded-lg">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-green-300 text-sm font-semibold">Conectado a Módulo Vulcano</span>
                            <span className="text-slate-300 text-xs ml-2">GCR Silo: {vulcanoGCRLevel.toFixed(1)} kg | Pureza: {vulcanoPurity.toFixed(1)}%</span>
                        </div>
                    ) : hasGCRButStopped ? (
                        <div className="flex items-center gap-2 bg-orange-900/30 border border-orange-600 px-4 py-2 rounded-lg">
                            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                            <span className="text-orange-300 text-sm font-semibold">⚠ Vulcano Detenido</span>
                            <span className="text-slate-300 text-xs ml-2">GCR Silo: {vulcanoGCRLevel.toFixed(1)} kg disponible (planta parada)</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 bg-slate-700/30 border border-slate-600 px-4 py-2 rounded-lg">
                            <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                            <span className="text-slate-400 text-sm">Esperando conexión con Vulcano...</span>
                        </div>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-grow">
                {/* Columna 1: Muestreo y Acciones */}
                <div className="lg:col-span-1 space-y-6">
                    <Accordion title="1. Panel de Muestreo" defaultOpen>
                        <div className="flex flex-col items-center justify-center p-4">
                            {isNewBatchReady ? (
                                <div className="text-center mb-4">
                                    <p className="text-green-400 font-semibold animate-pulse mb-1">¡Nuevo lote de GCR listo para analizar!</p>
                                    {(isVulcanoConnected || hasGCRButStopped) && (
                                        <p className="text-xs text-slate-400">
                                            Origen: Módulo Vulcano (Silo GCR)
                                            {hasGCRButStopped && <span className="text-orange-400"> - ⚠ Planta detenida</span>}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-slate-400 mb-4">Esperando nuevo lote de GCR desde el Módulo Vulcano...</p>
                            )}
                            <button
                                onClick={onTakeSample}
                                disabled={!isNewBatchReady || !!analysisResults}
                                className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed mb-2"
                            >
                                {analysisResults ? 'Muestra Tomada' : 'Tomar Muestra del Lote'}
                            </button>
                            {onSimulateBatch && !isNewBatchReady && !isVulcanoConnected && !hasGCRButStopped && (
                                <button
                                    onClick={onSimulateBatch}
                                    className="w-full bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 text-sm"
                                >
                                    🧪 Simular Nuevo Lote (Testing)
                                </button>
                            )}
                        </div>
                    </Accordion>
                    <Accordion title="3. Panel de Clasificación (Agente Hefesto)" defaultOpen>
                        <div className="flex flex-col items-center justify-center p-4 text-center">
                            {!quality ? (
                                <p className="text-slate-500">Esperando resultados del análisis...</p>
                            ) : (
                                <>
                                    <p className="text-sm text-slate-400">Lote de Muestra: <span className="font-mono">{sampleId}</span></p>
                                    <div className={`mt-4 px-6 py-3 rounded-lg border-2 ${quality === 'PREMIUM' ? 'border-yellow-500 bg-gradient-to-br from-yellow-600 to-amber-700' : 'border-gray-400 bg-gradient-to-br from-gray-600 to-gray-700'}`}>
                                        <p className="text-xs uppercase tracking-widest text-white/80">Veredicto de Hefesto</p>
                                        <p className={`text-2xl font-bold ${quality === 'PREMIUM' ? 'text-white' : 'text-white'}`}>
                                            {quality === 'PREMIUM' ? 'CALIDAD PREMIUM' : 'CALIDAD ESTÁNDAR'}
                                        </p>
                                        <p className="text-xs text-white/70 mt-1">
                                            {quality === 'PREMIUM' ? '(Apto para Terra Preta y créditos de carbono)' : '(Apto para enmienda general)'}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </Accordion>
                </div>

                {/* Columna 2: Análisis */}
                <div className="lg:col-span-2">
                    <Accordion title="2. Panel de Análisis (Simulado)" defaultOpen>
                        {!analysisResults ? (
                            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547a2 2 0 00-.547 1.806l.477 2.387a6 6 0 00.517 3.86l.158.318a6 6 0 00.517 3.86l2.387.477a2 2 0 001.806-.547a2 2 0 00.547-1.806l-.477-2.387a6 6 0 00-.517-3.86l-.158-.318a6 6 0 01-.517-3.86l.477-2.387a2 2 0 01.547-1.806z" /><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 10.25l2.387.477a2 2 0 011.022.547l-2.387-.477a6 6 0 01-3.86-.517l-.318-.158a6 6 0 00-3.86-.517l-2.387-.477a2 2 0 00-1.806.547a2 2 0 00-.547 1.806l.477 2.387a6 6 0 00.517 3.86l.158.318a6 6 0 00.517 3.86l2.387.477a2 2 0 001.806-.547a2 2 0 00.547-1.806l-.477-2.387a6 6 0 00-.517-3.86l-.158-.318a6 6 0 01-.517-3.86l.477-2.387a2 2 0 01.547-1.806z" /></svg>
                                <p>Esperando muestra para análisis...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-6 p-4">
                                <KpiCard label="Carbono Fijo" value={analysisResults.carbon} unit="%" />
                                <KpiCard label="Nivel de pH" value={analysisResults.ph} unit="" />
                                <KpiCard label="Porosidad (BET)" value={analysisResults.porosity} unit="m²/g" />
                                <KpiCard label="Contenido de Cenizas" value={analysisResults.ash} unit="%" />
                            </div>
                        )}
                    </Accordion>
                </div>
            </div>
        </div>
    );
};
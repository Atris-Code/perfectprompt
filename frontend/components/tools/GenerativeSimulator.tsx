
import React, { useState, useEffect, useCallback } from 'react';
import type { Task } from '../../types';
import { ContentType } from '../../types';

interface GenerativeSimulatorProps {
    onSaveTask: (task: Task, navigate?: boolean) => void;
    onCreateReportFromSimulation: (data: any) => void;
}

export const GenerativeSimulator: React.FC<GenerativeSimulatorProps> = ({ onSaveTask, onCreateReportFromSimulation }) => {
    const [temperature, setTemperature] = useState(873.15);
    const [catalystRatio, setCatalystRatio] = useState(10);
    const [results, setResults] = useState<{ liquid: number, gas: number, solid: number } | null>(null);
    const [quality, setQuality] = useState<'standard' | 'high'>('standard');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSimulate = useCallback(async () => {
        setIsLoading(true);
        setError('');
        setResults(null);

        // Simulate async operation and potential failure
        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
            // Simulate VRAM error on high quality, based on Linceo's report E-451
            if (quality === 'high' && Math.random() > 0.3) { // 70% chance of failure on high
                throw new Error('E-451: Timeout en la asignación de recursos VRAM. La GPU no pudo renderizar el escenario de alta fidelidad. Por favor, intenta de nuevo o utiliza la calidad Estándar.');
            }

            const tempFactor = 1 - (Math.abs(temperature - 873.15) / 500);
            const ratioFactor = 1 - (Math.abs(catalystRatio - 10) / 20);
            
            const baseLiquid = 80.25;
            const liquid = baseLiquid * tempFactor * ratioFactor * (quality === 'high' ? 1.05 : 1); // slight boost for high quality
            const gas = 19.74 + (100 - liquid - 19.74 - 0.01) * 0.8;
            const solid = 100 - liquid - gas;

            setResults({ 
                liquid: Math.max(0, liquid), 
                gas: Math.max(0, gas), 
                solid: Math.max(0, solid) 
            });
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error desconocido en la simulación.');
        } finally {
            setIsLoading(false);
        }
    }, [temperature, catalystRatio, quality]);
    
    const handleCreateReport = () => {
        if (!results) return;
        
        const rawData = `
### Parámetros de Simulación Generativa
- Temperatura de Pirólisis: ${temperature.toFixed(2)} K
- Relación Catalizador/PP: ${catalystRatio.toFixed(1)} %
- Calidad de Simulación: ${quality === 'high' ? 'Alta Fidelidad' : 'Estándar'}

### Resultados de Rendimiento Obtenidos
- Líquidos (Combustibles): ${results.liquid.toFixed(2)}%
- Gases: ${results.gas.toFixed(2)}%
- Sólidos (Coque): ${results.solid.toFixed(2)}%

### Contexto
Simulación basada en el paper "Pirólisis Catalítica de Residuos de Polipropileno". Se requiere un análisis editorial de estos resultados para publicación técnica.
`.trim();

        const task: Task = {
            id: `gen-sim-report-${Date.now()}`,
            title: `Reporte Editorial: Simulación Generativa (${new Date().toLocaleDateString()})`,
            createdAt: Date.now(),
            status: 'Por Hacer',
            contentType: ContentType.Texto,
            eventType: 'ExecutiveReport',
            formData: {
                objective: "Redactar un reporte editorial técnico analizando los resultados de la simulación generativa de pirólisis catalítica y su impacto en la economía circular.",
                tone: "Analítico / Profesional",
                specifics: {
                    [ContentType.Texto]: {
                        type: "Informe Técnico",
                        audience: "Ingenieros de Proceso / Editorial Técnica",
                        rawData: rawData,
                        narrativeCatalyst: "Informe de Comparativa de Materiales" 
                    },
                    [ContentType.Imagen]: {},
                    [ContentType.Video]: {},
                    [ContentType.Audio]: {},
                    [ContentType.Codigo]: {},
                }
            },
            isIntelligent: true,
            agentId: 'Redactor de Ensayos'
        };

        onSaveTask(task, true);
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-3xl font-bold text-center mb-2">Simulador Generativo (Collins)</h2>
            <p className="text-center text-gray-600 mb-8">Basado en "Pirólisis Catalítica de Residuos de Polipropileno".</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-6 rounded-lg border">
                    <h3 className="font-bold text-lg mb-4">Parámetros Operativos</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 flex justify-between">
                                <span>Temperatura de Pirólisis (K)</span>
                                <span className="font-mono">{temperature.toFixed(2)} K</span>
                            </label>
                            <input type="range" min="773" max="973" step="1" value={temperature} onChange={e => setTemperature(Number(e.target.value))} className="w-full" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 flex justify-between">
                                <span>Relación Catalizador/PP (%)</span>
                                <span className="font-mono">{catalystRatio.toFixed(1)} %</span>
                            </label>
                            <input type="range" min="0" max="20" step="0.5" value={catalystRatio} onChange={e => setCatalystRatio(Number(e.target.value))} className="w-full" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Calidad de Simulación</label>
                            <div className="flex gap-4 mt-2">
                                <label className="flex items-center"><input type="radio" name="quality" value="standard" checked={quality === 'standard'} onChange={() => setQuality('standard')} className="mr-2" /> Estándar</label>
                                <label className="flex items-center"><input type="radio" name="quality" value="high" checked={quality === 'high'} onChange={() => setQuality('high')} className="mr-2" /> Alta Fidelidad</label>
                            </div>
                        </div>
                        <button onClick={handleSimulate} disabled={isLoading} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                           {isLoading ? 'Simulando...' : 'Ejecutar Simulación'}
                        </button>
                    </div>
                </div>
                 <div className="bg-gray-50 p-6 rounded-lg border">
                    <h3 className="font-bold text-lg mb-4">Resultados de Simulación (Rendimiento %)</h3>
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full"><p className="text-gray-500 animate-pulse">Calculando...</p></div>
                    ) : error ? (
                         <div className="p-4 bg-red-100 text-red-800 rounded-md">
                            <p className="font-bold">Error en la Simulación</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    ) : results ? (
                        <div className="space-y-2">
                            <p className="text-lg">Líquidos (Combustibles): <strong className="text-2xl font-mono text-blue-600 float-right">{results.liquid.toFixed(2)}%</strong></p>
                            <p className="text-lg">Gases: <strong className="text-2xl font-mono text-green-600 float-right">{results.gas.toFixed(2)}%</strong></p>
                            <p className="text-lg">Sólidos (Coque): <strong className="text-2xl font-mono text-gray-700 float-right">{results.solid.toFixed(2)}%</strong></p>
                        </div>
                    ) : (
                        <p className="text-gray-500">Ajusta los parámetros y ejecuta la simulación.</p>
                    )}
                </div>
                 <div className="md:col-span-2">
                    <button onClick={handleCreateReport} disabled={!results} className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-400">
                        Crear Reporte para Editorial (vía Gestor de Tareas)
                    </button>
                </div>
            </div>
        </div>
    );
};

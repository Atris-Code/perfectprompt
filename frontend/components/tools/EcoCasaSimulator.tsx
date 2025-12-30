import React, { useState } from 'react';

const ratingScale = {
    A: { score: 90, consumption: [0, 50], emissions: [0, 10], costFactor: 0.8 },
    B: { score: 80, consumption: [51, 100], emissions: [11, 20], costFactor: 1.0 },
    C: { score: 70, consumption: [101, 160], emissions: [21, 35], costFactor: 1.3 },
    D: { score: 60, consumption: [161, 230], emissions: [36, 55], costFactor: 1.7 },
    E: { score: 50, consumption: [231, 310], emissions: [56, 80], costFactor: 2.2 },
    F: { score: 40, consumption: [311, 400], emissions: [81, 110], costFactor: 2.8 },
    G: { score: 0, consumption: [401, 999], emissions: [111, 999], costFactor: 3.5 }
};

const BASE_ANNUAL_COST_G = 2500; // Costo base anual para una calificación G (ejemplo)

type Rating = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
interface SimulationResults {
    score: number;
    rating: Rating;
    consumption: number;
    emissions: number;
    cost: number;
}

const getRatingFromScore = (score: number): Rating => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    if (score >= 50) return 'E';
    if (score >= 40) return 'F';
    return 'G';
};

const estimateValues = (rating: Rating, climateZone: string) => {
    const climateCostMultipliers: Record<string, number> = { 'warm': 0.7, 'temperate': 1.0, 'continental': 1.2, 'cold': 1.5 };
    const multiplier = climateCostMultipliers[climateZone] || 1.0;

    const scale = ratingScale[rating];
    const consumption = ((scale.consumption[0] + scale.consumption[1]) / 2) * multiplier;
    const emissions = ((scale.emissions[0] + scale.emissions[1]) / 2) * multiplier;
    const cost = (BASE_ANNUAL_COST_G / ratingScale['G'].costFactor * scale.costFactor) * multiplier;
    return { 
        consumption: Math.round(consumption), 
        emissions: Math.round(emissions), 
        cost: Math.round(cost) 
    };
};

interface EcoCasaSimulatorProps {
    onCreateReport: (reportPackage: { narrativeReport: string; rawData: any }) => void;
    onNavigateToArchitecturalSynth: (preset: any) => void;
}

export const EcoCasaSimulator: React.FC<EcoCasaSimulatorProps> = ({ onCreateReport, onNavigateToArchitecturalSynth }) => {
    const [climateZone, setClimateZone] = useState('');
    const [year, setYear] = useState('2007_2013');
    const [insulation, setInsulation] = useState('low');
    const [heating, setHeating] = useState('condensing_boiler');
    const [orientation, setOrientation] = useState('mixed_other');

    const [improveInsulation, setImproveInsulation] = useState(false);
    const [improveWindows, setImproveWindows] = useState(false);
    const [improveHeating, setImproveHeating] = useState(false);
    const [improveSolarWaterHeater, setImproveSolarWaterHeater] = useState(false);
    const [improveLighting, setImproveLighting] = useState(false);


    const [initialResults, setInitialResults] = useState<SimulationResults | null>(null);
    const [improvedResults, setImprovedResults] = useState<SimulationResults | null>(null);
    
    const [showDiagnosis, setShowDiagnosis] = useState(false);
    const [showImprovements, setShowImprovements] = useState(false);

    const handleRunDiagnosis = () => {
        if (!climateZone) {
            alert('Por favor, selecciona una Zona Climática.');
            return;
        }

        // Este multiplicador PENALIZA los climas más fríos, resultando en un score inicial más bajo.
        const climateScoreMultiplier: Record<string, number> = { warm: 1.2, temperate: 1.0, continental: 0.8, cold: 0.6 };
        const multiplier = climateScoreMultiplier[climateZone] || 1.0;

        // El score base ahora se determina por el año de construcción, reflejando las normativas vigentes.
        const yearBaseScores: Record<string, number> = {
            'pre_1979': 5,      // Sin normativa, muy ineficiente
            '1980_2006': 15,    // Normativa básica NBE
            '2007_2013': 25,    // CTE inicial
            '2014_2019': 35,    // CTE mejorado
            'post_2020': 45     // Alta eficiencia (nZEB)
        };
        let score = yearBaseScores[year] || 25; // Default to a mid-range score

        const insulationScores: Record<string, number> = { low: 0, medium: 15, high: 30 };
        score += insulationScores[insulation] || 0;
        
        const heatingScores: Record<string, number> = { 'electric_radiators': -10, 'old_boiler': 0, 'condensing_boiler': 10, 'heat_pump': 25 };
        score += heatingScores[heating] || 10;
        
        const orientationScores: Record<string, number> = { south: 5, mixed_other: 0 };
        score += orientationScores[orientation] || 0;
        
        score *= multiplier;
        
        score = Math.min(100, Math.max(0, score));
        const rating = getRatingFromScore(score);
        const estimates = estimateValues(rating, climateZone);

        setInitialResults({ score, rating, ...estimates });
        setShowDiagnosis(true);
        setShowImprovements(false);
        setImprovedResults(null);
    };

    const handleRunImprovement = () => {
        if (!initialResults) return;
        
        // Este multiplicador AUMENTA el impacto de las mejoras en climas más fríos.
        const climateImprovementMultiplier: Record<string, number> = { warm: 0.7, temperate: 1.0, continental: 1.2, cold: 1.5 };
        const multiplier = climateImprovementMultiplier[climateZone] || 1.0;

        // Un buen aislamiento es menos efectivo en casas más antiguas por puentes térmicos.
        const insulationEffectiveness: Record<string, number> = { 'pre_1979': 0.7, '1980_2006': 0.85, '2007_2013': 1.0, '2014_2019': 1.1, 'post_2020': 1.2 };
        const effectiveness = insulationEffectiveness[year] || 1.0;
        
        let improvedScore = initialResults.score;

        if (improveInsulation) improvedScore += 20 * multiplier * effectiveness;
        if (improveWindows) improvedScore += 15 * multiplier;
        if (improveHeating) {
            const heatingScores: Record<string, number> = { 'electric_radiators': -10, 'old_boiler': 0, 'condensing_boiler': 10, 'heat_pump': 25 };
            const currentHeatingScore = heatingScores[heating];
            const heatPumpScore = heatingScores['heat_pump'];
            if (currentHeatingScore < heatPumpScore) {
                improvedScore += (heatPumpScore - currentHeatingScore) * multiplier;
            }
        }
        if (improveSolarWaterHeater) improvedScore += 12 * multiplier;
        if (improveLighting) improvedScore += 8 * multiplier;


        improvedScore = Math.min(100, Math.max(0, improvedScore));
        const improvedRating = getRatingFromScore(improvedScore);
        const improvedEstimates = estimateValues(improvedRating, climateZone);

        setImprovedResults({ score: improvedScore, rating: improvedRating, ...improvedEstimates });
        setShowImprovements(true);
    };

    const handleSendToEditorial = () => {
        if (!initialResults || !improvedResults) {
            alert("Por favor, ejecuta el diagnóstico y la simulación de mejoras primero.");
            return;
        }
        
        const savingsEuros = initialResults.cost - improvedResults.cost;
        const savingsPercentage = initialResults.cost > 0 ? (savingsEuros / initialResults.cost) * 100 : 0;

        const climateZoneMap: Record<string, string> = {
            warm: "alpha/A/B (Muy Cálida/Cálida)", temperate: "C (Templada)",
            continental: "D (Continental)", cold: "E (Fría/Montaña)"
        };
        const yearMap: Record<string, string> = {
            'pre_1979': 'antes de 1979', '1980_2006': 'entre 1980 y 2006', '2007_2013': 'entre 2007 y 2013',
            '2014_2019': 'entre 2014 y 2019', 'post_2020': 'después de 2020'
        };
        const insulationMap: Record<string, string> = { low: 'deficiente', medium: 'medio', high: 'alto' };
        const heatingMap: Record<string, string> = { 'electric_radiators': 'radiadores eléctricos', 'old_boiler': 'caldera antigua', 'condensing_boiler': 'caldera de condensación', 'heat_pump': 'bomba de calor' };

        const improvementsList = [
            improveInsulation && "aislamiento de envolvente",
            improveWindows && "cambio de ventanas",
            improveHeating && "actualización del sistema de calefacción a bomba de calor",
            improveSolarWaterHeater && "instalación de calentador solar de agua",
            improveLighting && "actualización a iluminación 100% LED"
        ].filter(Boolean);

        const improvementsText = improvementsList.length > 1 
            ? improvementsList.slice(0, -1).join(', ') + ' y ' + improvementsList.slice(-1)
            : improvementsList[0] || 'ninguna mejora';

        const narrativeReport = `Se ha simulado la viabilidad de la rehabilitación energética para una vivienda construida ${yearMap[year]} en una Zona Climática ${climateZoneMap[climateZone]}. Con un estado inicial de aislamiento ${insulationMap[insulation]} y un sistema de calefacción de ${heatingMap[heating]}, la calificación energética estimada es '${initialResults.rating}'. Al aplicar mejoras clave como ${improvementsText}, la calificación potencial asciende a '${improvedResults.rating}', lo que se traduciría en un ahorro anual en la factura de aproximadamente ${Math.round(savingsEuros)}€ (${savingsPercentage.toFixed(1)}%). Se recomienda una verificación por un técnico cualificado para obtener un Certificado de Eficiencia Energética (CEE) oficial.`;

        const reportPackage = {
            narrativeReport,
            rawData: {
                location: climateZoneMap[climateZone],
                year: yearMap[year],
                insulation: insulationMap[insulation],
                heating: heatingMap[heating],
                orientation,
                initial: initialResults,
                improvements: { 
                    insulation: improveInsulation, 
                    windows: improveWindows, 
                    heating: improveHeating,
                    solarWater: improveSolarWaterHeater,
                    lighting: improveLighting,
                },
                final: improvedResults,
                savings: { euros: savingsEuros, percentage: savingsPercentage },
            }
        };
        
        onCreateReport(reportPackage);
    };
    
    const handleVisualize = () => {
        if (!initialResults || !improvedResults) return;

        const improvements = { 
            insulation: improveInsulation, 
            windows: improveWindows, 
            heating: improveHeating,
            solarWater: improveSolarWaterHeater,
            lighting: improveLighting,
        };

        onNavigateToArchitecturalSynth({
            preset: 'Vivienda Sostenible (EcoCasa)',
            initialRating: initialResults.rating,
            improvedRating: improvedResults.rating,
            improvements,
            location: climateZone
        });
    };

    const savingsEuros = initialResults && improvedResults ? initialResults.cost - improvedResults.cost : 0;
    const savingsPercentage = initialResults && improvedResults && initialResults.cost > 0 ? (savingsEuros / initialResults.cost) * 100 : 0;
    
    return (
        <div className="p-8 font-sans ecocasa-body">
            <h1 className="text-3xl font-bold text-center mb-8">Simulador EcoCasa Score</h1>
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="ecocasa-card p-6 rounded-lg">
                        <h2 className="text-xl font-semibold mb-4 border-b pb-2 border-gray-600">1. Diagnóstico Inicial</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="climate-zone" className="block text-sm font-semibold text-red-400">*Zona Climática (CTE España):</label>
                                <select id="climate-zone" value={climateZone} onChange={e => setClimateZone(e.target.value)} className="ecocasa-input-field w-full p-2 rounded mt-1" required>
                                    <option value="" disabled>Selecciona una zona...</option>
                                    <option value="warm">alpha/A/B (Muy Cálida/Cálida)</option>
                                    <option value="temperate">C (Templada)</option>
                                    <option value="continental">D (Continental)</option>
                                    <option value="cold">E (Fría/Montaña)</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="year" className="block text-sm">Año de Construcción:</label>
                                <select id="year" value={year} onChange={e => setYear(e.target.value)} className="ecocasa-input-field w-full p-2 rounded mt-1">
                                    <option value="pre_1979">Antes de 1979 (Sin normativa)</option>
                                    <option value="1980_2006">1980 - 2006 (Normativa básica NBE)</option>
                                    <option value="2007_2013">2007 – 2013 (CTE inicial)</option>
                                    <option value="2014_2019">2014 – 2019 (CTE mejorado)</option>
                                    <option value="post_2020">Después de 2020 (Alta eficiencia)</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="insulation" className="block text-sm">Aislamiento de Envolvente:</label>
                                <select id="insulation" value={insulation} onChange={e => setInsulation(e.target.value)} className="ecocasa-input-field w-full p-2 rounded mt-1">
                                    <option value="low">Deficiente (Sin aislamiento, ventanas viejas)</option>
                                    <option value="medium">Medio (Doble acristalamiento, algo de aislamiento)</option>
                                    <option value="high">Alto (Aislamiento total, ventanas eficientes)</option>
                                </select>
                            </div>
                             <div>
                                <label htmlFor="heating" className="block text-sm">Sistema de Calefacción y ACS:</label>
                                <select id="heating" value={heating} onChange={e => setHeating(e.target.value)} className="ecocasa-input-field w-full p-2 rounded mt-1">
                                    <option value="electric_radiators">Radiadores Eléctricos</option>
                                    <option value="old_boiler">Caldera antigua (Gasóleo/Gas)</option>
                                    <option value="condensing_boiler">Caldera de condensación</option>
                                    <option value="heat_pump">Bomba de calor / Aerotermia</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="orientation" className="block text-sm">Orientación Predominante:</label>
                                <select id="orientation" value={orientation} onChange={e => setOrientation(e.target.value)} className="ecocasa-input-field w-full p-2 rounded mt-1">
                                    <option value="south">Sur Predominante</option>
                                    <option value="mixed_other">Norte / Este / Oeste / Mixta</option>
                                </select>
                            </div>
                            <button onClick={handleRunDiagnosis} className="bg-blue-600 w-full py-2 rounded">Simular Diagnóstico</button>
                        </div>
                    </div>

                    <div className="ecocasa-card p-6 rounded-lg">
                        <h2 className="text-xl font-semibold mb-4 border-b pb-2 border-gray-600">2. Simular Mejoras</h2>
                        <div className="space-y-3">
                            <label className="flex items-center ecocasa-improvement-card p-3 rounded cursor-pointer">
                                <input type="checkbox" checked={improveInsulation} onChange={e => setImproveInsulation(e.target.checked)} className="mr-3 h-5 w-5" /> Mejorar Aislamiento Envolvente
                            </label>
                            <label className="flex items-center ecocasa-improvement-card p-3 rounded cursor-pointer">
                                <input type="checkbox" checked={improveWindows} onChange={e => setImproveWindows(e.target.checked)} className="mr-3 h-5 w-5" /> Cambiar Ventanas
                            </label>
                            <label className="flex items-center ecocasa-improvement-card p-3 rounded cursor-pointer">
                                <input type="checkbox" checked={improveHeating} onChange={e => setImproveHeating(e.target.checked)} className="mr-3 h-5 w-5" /> Actualizar Sistema Calefacción (a Bomba Calor)
                            </label>
                            <label className="flex items-center ecocasa-improvement-card p-3 rounded cursor-pointer">
                                <input type="checkbox" checked={improveSolarWaterHeater} onChange={e => setImproveSolarWaterHeater(e.target.checked)} className="mr-3 h-5 w-5" /> Instalar Calentador Solar de Agua
                            </label>
                            <label className="flex items-center ecocasa-improvement-card p-3 rounded cursor-pointer">
                                <input type="checkbox" checked={improveLighting} onChange={e => setImproveLighting(e.target.checked)} className="mr-3 h-5 w-5" /> Actualizar a Iluminación 100% LED
                            </label>
                        </div>
                        <button onClick={handleRunImprovement} disabled={!initialResults} className="bg-green-600 w-full py-2 rounded mt-4 disabled:bg-gray-500 disabled:cursor-not-allowed">Simular Impacto Mejoras</button>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    {showDiagnosis && initialResults && (
                        <div className="ecocasa-card p-6 rounded-lg">
                            <h2 className="text-xl font-semibold mb-4">Resultados del Diagnóstico</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className={`ecocasa-output-box ecocasa-rating-${initialResults.rating} rounded text-center`}>
                                    <p className="text-sm">Calificación Energética Estimada</p>
                                    <p className="text-6xl font-bold">{initialResults.rating}</p>
                                </div>
                                <div className="space-y-2">
                                    <p>Consumo Estimado: <strong className="text-lg text-yellow-400">{initialResults.consumption}</strong> kWh/m² año</p>
                                    <p>Emisiones Estimadas: <strong className="text-lg text-red-400">{initialResults.emissions}</strong> kgCO₂/m² año</p>
                                    <p>Gasto Anual Estimado: <strong className="text-lg text-orange-400">~{initialResults.cost.toLocaleString()}</strong> €</p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {showImprovements && improvedResults && initialResults && (
                         <div className="ecocasa-card p-6 rounded-lg">
                            <h2 className="text-xl font-semibold mb-4">Resultados Tras Mejoras</h2>
                            <div className="grid md:grid-cols-3 gap-4 items-center">
                                <div className={`ecocasa-output-box ecocasa-rating-${initialResults.rating} rounded text-center`}>
                                    <p className="text-xs">ANTES</p>
                                    <p className="text-4xl font-bold">{initialResults.rating}</p>
                                </div>
                                <div className="text-center text-3xl font-bold text-gray-400">→</div>
                                <div className={`ecocasa-output-box ecocasa-rating-${improvedResults.rating} rounded text-center`}>
                                    <p className="text-xs">DESPUÉS</p>
                                    <p className="text-4xl font-bold">{improvedResults.rating}</p>
                                </div>
                            </div>
                            <div className="mt-4 text-center">
                                <p>Ahorro Potencial Estimado en Factura Anual:</p>
                                <strong className="text-3xl text-green-400">{savingsPercentage.toFixed(1)}%</strong>
                                (<strong className="text-lg">~{Math.round(savingsEuros).toLocaleString()}</strong> €)
                            </div>
                             <div className="mt-4 p-3 bg-yellow-900 border border-yellow-700 rounded text-yellow-100 text-xs">
                                <p><strong>IMPORTANTE:</strong> Esta simulación es orientativa y simplificada. No sustituye a un Certificado de Eficiencia Energética (CEE) oficial realizado por un técnico cualificado, necesario para la venta o alquiler. Los resultados reales dependen de la zona climática exacta, geometría, U-valores específicos, puentes térmicos y uso real del inmueble.</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                                <button onClick={handleSendToEditorial} className="bg-purple-600 w-full py-2 rounded">Enviar Análisis a la Editorial</button>
                                <button onClick={handleVisualize} className="bg-indigo-600 w-full py-2 rounded">Visualizar Diseño en Dashboard</button>
                            </div>
                        </div>
                    )}

                    <div className="ecocasa-card p-6 rounded-lg text-sm text-gray-300">
                        <h2 className="text-lg font-semibold mb-3">Implicaciones Legales (CEE España)</h2>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Obligatorio para vender o alquilar (RD 390/2021)[cite: 818].</li>
                            <li>La etiqueta debe incluirse en toda publicidad[cite: 819].</li>
                            <li>Validez general: 10 años[cite: 820].</li>
                            <li>Excepción: Si la calificación es G, validez reducida a 5 años[cite: 821].</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
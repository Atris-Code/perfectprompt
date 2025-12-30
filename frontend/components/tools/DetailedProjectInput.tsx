import React, { useState } from 'react';
import type { DetailedProjectData } from '../../types';

interface DetailedProjectInputProps {
    onSave: (data: DetailedProjectData) => void;
}

const presets: Record<string, DetailedProjectData> = {
    "vivienda-unifamiliar": {
        projectName: "Vivienda Unifamiliar Estándar",
        location: "Madrid, España, Csa",
        housingType: "Unifamiliar",
        area: "150",
        occupants: "4",
        projectStage: "Anteproyecto",
        orientation: "Fachada principal al sur",
        walls: "Ladrillo con cámara de aire y 10cm de aislamiento",
        roof: "Cubierta inclinada con 15cm de aislamiento",
        windows: "Doble vidrio con rotura de puente térmico, marco de aluminio",
        solarProtection: "Persianas enrollables",
        hvac: "Caldera de gas de condensación y radiadores",
        hotWater: "Caldera de gas con acumulación",
        lighting: "80% LED",
        appliances: "Clase A+",
        waterSaving: "Grifería estándar",
        renewableEnergy: "Ninguna",
        wasteManagement: "Separación básica",
        simSoftware: "EnergyPlus",
        climateData: "TMY3 Madrid",
        simScenarios: "Escenario Base (Cumplimiento CTE)",
        simAssumptions: "Ocupación estándar, tarifas reguladas",
    },
    "edificio-multifamiliar": {
        projectName: "Edificio Multifamiliar Eficiente",
        location: "Barcelona, España, Csa",
        housingType: "Multifamiliar",
        area: "85",
        occupants: "3",
        projectStage: "Proyecto Ejecutivo",
        orientation: "Fachada principal al sur, patios interiores",
        walls: "Fachada ventilada con 12cm de lana de roca",
        roof: "Cubierta verde con 20cm de aislamiento",
        windows: "Triple vidrio bajo emisivo (Low-E), marco de madera",
        solarProtection: "Lamas orientables y toldos",
        hvac: "Sistema de aerotermia centralizado con suelo radiante-refrescante",
        hotWater: "Aerotermia con apoyo de paneles solares térmicos",
        lighting: "100% LED con control de presencia",
        appliances: "Clase A+++",
        waterSaving: "Recogida de aguas grises, grifería de bajo flujo",
        renewableEnergy: "Sistema fotovoltaico de 15 kWp",
        wasteManagement: "Espacio para compostaje comunitario",
        simSoftware: "OpenStudio",
        climateData: "TMY3 Barcelona",
        simScenarios: "Escenario nZEB (nearly Zero-Energy Building)",
        simAssumptions: "Ocupación variable, tarifas con discriminación horaria",
    }
};

export const DetailedProjectInput: React.FC<DetailedProjectInputProps> = ({ onSave }) => {
    const [formData, setFormData] = useState<DetailedProjectData>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const presetKey = e.target.value;
        if (presets[presetKey]) {
            setFormData(presets[presetKey]);
        } else {
            setFormData({});
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="detailed-project-container">
            <h1 className="text-3xl font-bold text-center mb-8">Entrada Detallada de Proyecto Sostenible</h1>
            
             <div className="mb-6">
                <label htmlFor="preset-loader" className="block text-sm font-medium mb-2">Cargar Preset de Proyecto (Semi-automatización)</label>
                <select id="preset-loader" onChange={handlePresetChange} className="input-field w-full p-2 rounded">
                    <option value="">Seleccionar un preset...</option>
                    <option value="vivienda-unifamiliar">Vivienda Unifamiliar Estándar</option>
                    <option value="edificio-multifamiliar">Edificio Multifamiliar Eficiente</option>
                </select>
            </div>

            <form id="project-form" className="space-y-4" onSubmit={handleSubmit}>
                <details open>
                    <summary>A. Datos Generales del Proyecto</summary>
                    <div className="section-content grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label>Nombre del Proyecto:</label><input type="text" name="projectName" placeholder="Ej: Prototipo Azaleas" value={formData.projectName || ''} onChange={handleChange} className="input-field w-full p-2 rounded mt-1" /></div>
                        <div><label>Ubicación (Ciudad, Clima Köppen):</label><input type="text" name="location" placeholder="Ej: Mérida, Yucatán (Aw)" value={formData.location || ''} onChange={handleChange} className="input-field w-full p-2 rounded mt-1" /></div>
                        <div><label>Tipo de Vivienda:</label><select name="housingType" value={formData.housingType || ''} onChange={handleChange} className="input-field w-full p-2 rounded mt-1"><option>Unifamiliar</option><option>Multifamiliar</option><option>Prototipo</option></select></div>
                        <div><label>Área Construida (m²):</label><input type="number" name="area" placeholder="Ej: 120" value={formData.area || ''} onChange={handleChange} className="input-field w-full p-2 rounded mt-1" /></div>
                        <div><label>N° Ocupantes Proyectados:</label><input type="number" name="occupants" placeholder="Ej: 4" value={formData.occupants || ''} onChange={handleChange} className="input-field w-full p-2 rounded mt-1" /></div>
                        <div><label>Etapa del Proyecto:</label><select name="projectStage" value={formData.projectStage || ''} onChange={handleChange} className="input-field w-full p-2 rounded mt-1"><option>Diseño Conceptual</option><option>Anteproyecto</option><option>Proyecto Ejecutivo</option><option>Existente</option></select></div>
                    </div>
                </details>

                <details>
                    <summary>B. Características Constructivas Clave</summary>
                    <div className="section-content grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label>Orientación:</label><input type="text" name="orientation" placeholder="Ej: Fachada principal al este..." value={formData.orientation || ''} onChange={handleChange} className="input-field w-full p-2 rounded mt-1" /></div>
                        <div><label>Muros Exteriores (Material, Espesor, Aislamiento):</label><input type="text" name="walls" placeholder="Ej: Block concreto 15cm + EPS 5cm" value={formData.walls || ''} onChange={handleChange} className="input-field w-full p-2 rounded mt-1" /></div>
                        <div><label>Cubierta/Techo (Material, Espesor, Aislamiento):</label><input type="text" name="roof" placeholder="Ej: Losa concreto 10cm + Lana Mineral 10cm" value={formData.roof || ''} onChange={handleChange} className="input-field w-full p-2 rounded mt-1" /></div>
                        <div><label>Ventanas (Tipo, Marco, FS, U-value):</label><input type="text" name="windows" placeholder="Ej: Doble Low-E, PVC, FS 0.35, U 2.0" value={formData.windows || ''} onChange={handleChange} className="input-field w-full p-2 rounded mt-1" /></div>
                        <div><label>Protección Solar:</label><input type="text" name="solarProtection" placeholder="Ej: Voladizos 1.2m N/S, persianas E/W" value={formData.solarProtection || ''} onChange={handleChange} className="input-field w-full p-2 rounded mt-1" /></div>
                    </div>
                </details>

                <details>
                    <summary>C. Sistemas de Eficiencia y Sostenibilidad</summary>
                    <div className="section-content grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label>Climatización:</label><input type="text" name="hvac" placeholder="Ej: Minisplits inverter SEER 18" value={formData.hvac || ''} onChange={handleChange} className="input-field w-full p-2 rounded mt-1" /></div>
                        <div><label>Agua Caliente:</label><input type="text" name="hotWater" placeholder="Ej: Calentador solar + apoyo gas" value={formData.hotWater || ''} onChange={handleChange} className="input-field w-full p-2 rounded mt-1" /></div>
                        <div><label>Iluminación:</label><input type="text" name="lighting" placeholder="Ej: 100% LED alta eficiencia" value={formData.lighting || ''} onChange={handleChange} className="input-field w-full p-2 rounded mt-1" /></div>
                        <div><label>Electrodomésticos:</label><input type="text" name="appliances" placeholder="Ej: Refrigerador A+++, Lavadora A+++" value={formData.appliances || ''} onChange={handleChange} className="input-field w-full p-2 rounded mt-1" /></div>
                        <div><label>Ahorro de Agua:</label><input type="text" name="waterSaving" placeholder="Ej: Bajo flujo, doble descarga, recolección pluvial" value={formData.waterSaving || ''} onChange={handleChange} className="input-field w-full p-2 rounded mt-1" /></div>
                        <div><label>Energía Renovable:</label><input type="text" name="renewableEnergy" placeholder="Ej: Sistema FV 3 kWp" value={formData.renewableEnergy || ''} onChange={handleChange} className="input-field w-full p-2 rounded mt-1" /></div>
                        <div><label>Gestión de Residuos:</label><input type="text" name="wasteManagement" placeholder="Ej: Separación, compostaje" value={formData.wasteManagement || ''} onChange={handleChange} className="input-field w-full p-2 rounded mt-1" /></div>
                    </div>
                </details>

                <details>
                    <summary>D. Parámetros de Simulación</summary>
                    <div className="section-content grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label>Software/Herramienta:</label><input type="text" name="simSoftware" placeholder="Ej: EnergyPlus vía OpenStudio" value={formData.simSoftware || ''} onChange={handleChange} className="input-field w-full p-2 rounded mt-1" /></div>
                        <div><label>Datos Climáticos:</label><input type="text" name="climateData" placeholder="Ej: TMY3 Mérida" value={formData.climateData || ''} onChange={handleChange} className="input-field w-full p-2 rounded mt-1" /></div>
                        <div className="md:col-span-2"><label>Escenarios Simulados:</label><textarea name="simScenarios" placeholder="Ej: Escenario 1: Base vs Escenario 2: Optimizado" value={formData.simScenarios || ''} onChange={handleChange} className="input-field w-full p-2 rounded h-20 mt-1"></textarea></div>
                        <div className="md:col-span-2"><label>Suposiciones Clave:</label><textarea name="simAssumptions" placeholder="Ej: Ocupación CONAVI, Tarifas CFE HM" value={formData.simAssumptions || ''} onChange={handleChange} className="input-field w-full p-2 rounded h-20 mt-1"></textarea></div>
                    </div>
                </details>

                <details>
                    <summary>E. Resultados Clave de Simulación (Opcional)</summary>
                    <div className="section-content grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label>Score EcoCasa Obtenido:</label><input type="number" name="ecoScore" value={formData.ecoScore || ''} onChange={handleChange} className="input-field w-full p-2 rounded mt-1" /></div>
                        <div><label>Nivel de Certificación:</label><input type="text" name="ecoLevel" value={formData.ecoLevel || ''} onChange={handleChange} className="input-field w-full p-2 rounded mt-1" /></div>
                        <div><label>Consumo Energía Anual (kWh/año):</label><input type="number" name="energyConsumption" value={formData.energyConsumption || ''} onChange={handleChange} className="input-field w-full p-2 rounded mt-1" /></div>
                        <div><label>% Reducción Energía vs Base:</label><input type="number" name="energyReduction" value={formData.energyReduction || ''} onChange={handleChange} className="input-field w-full p-2 rounded mt-1" /></div>
                        <div><label>Consumo Agua Anual (L/año):</label><input type="number" name="waterConsumption" value={formData.waterConsumption || ''} onChange={handleChange} className="input-field w-full p-2 rounded mt-1" /></div>
                        <div><label>% Reducción Agua vs Base:</label><input type="number" name="waterReduction" value={formData.waterReduction || ''} onChange={handleChange} className="input-field w-full p-2 rounded mt-1" /></div>
                        <div><label>Emisiones CO2e Evitadas (ton/año):</label><input type="number" name="co2Avoided" value={formData.co2Avoided || ''} onChange={handleChange} className="input-field w-full p-2 rounded mt-1" /></div>
                        <div><label>Ahorro Económico Anual (€):</label><input type="number" name="economicSavings" value={formData.economicSavings || ''} onChange={handleChange} className="input-field w-full p-2 rounded mt-1" /></div>
                    </div>
                </details>

                <button type="submit" id="start-analysis" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded w-full mt-6">
                    Iniciar Análisis / Simulación Avanzada
                </button>
            </form>
        </div>
    );
};

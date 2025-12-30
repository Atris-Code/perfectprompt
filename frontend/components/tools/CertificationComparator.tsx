
import React from 'react';
import type { Task, View } from '../../types';
import { ContentType } from '../../types';

interface CertificationComparatorProps {
  onSaveTask: (task: Task) => void;
  setView: (view: View) => void;
}

const comparisonData = [
    {
        feature: 'Enfoque Principal',
        leed: 'Holístico (Sostenibilidad general)',
        breeam: 'Holístico (Sostenibilidad general)',
        passivhaus: 'Rendimiento Energético y Confort',
        dgnb: 'Holístico (Ciclo de Vida Completo)',
        leed_desc: 'Evalúa un edificio en múltiples categorías como energía, agua y materiales.',
        breeam_desc: 'Similar a LEED, evalúa un edificio en un amplio rango de categorías de sostenibilidad.',
        passivhaus_desc: 'Se enfoca casi exclusivamente en lograr una eficiencia energética y un confort térmico extremos.',
        dgnb_desc: 'Evalúa la sostenibilidad a lo largo de todo el ciclo de vida, dando la misma importancia a las esferas ambiental, económica y social.'
    },
    {
        feature: 'Sistema',
        leed: 'Puntos y "menú" de créditos',
        breeam: 'Puntos y "menú" de créditos',
        passivhaus: 'Estándar de rendimiento (Pasa/No Pasa)',
        dgnb: 'Puntos en 6 áreas de calidad',
        leed_desc: 'Un proyecto debe cumplir prerrequisitos y luego suma puntos eligiendo créditos opcionales.',
        breeam_desc: 'Sistema de puntos holístico con categorías y pesos diferentes a LEED.',
        passivhaus_desc: 'El edificio debe cumplir unos requisitos numéricos muy estrictos para certificarse. No hay puntos.',
        dgnb_desc: 'Evalúa y puntúa el proyecto en seis áreas clave: Calidad Ambiental, Económica, Sociocultural, Técnica, de Proceso y de Emplazamiento.'
    },
    {
        feature: 'Origen / Fortaleza',
        leed: 'EE.UU. (Global)',
        breeam: 'Reino Unido (Europa)',
        passivhaus: 'Alemania (Global)',
        dgnb: 'Alemania (Europa)',
        leed_desc: 'Es el sistema más reconocido a nivel global, originario de Estados Unidos.',
        breeam_desc: 'Estándar de origen británico, líder en Europa y adaptado a sus normativas.',
        passivhaus_desc: 'Estándar alemán del Passivhaus Institut, reconocido globalmente por su rigor energético.',
        dgnb_desc: 'Sistema alemán de "segunda generación", considerado uno de los más avanzados y rigurosos.'
    },
    {
        feature: 'Prioriza...',
        leed: 'Valor de mercado, agua, materiales, energía.',
        breeam: 'Ecología, residuos, gestión, energía.',
        passivhaus: 'Eficiencia energética, hermeticidad, confort térmico.',
        dgnb: 'Balance entre pilares (eco, econ, social), LCA.',
        leed_desc: 'Da un peso importante a la ubicación, la eficiencia en agua y los materiales, además de la energía.',
        breeam_desc: 'Tiene un fuerte enfoque en la gestión del proceso constructivo, el uso del suelo y la ecología.',
        passivhaus_desc: 'La prioridad absoluta es minimizar la demanda de energía para calefacción y refrigeración.',
        dgnb_desc: 'Busca un equilibrio equitativo entre la sostenibilidad ambiental, económica y social, analizando todo el ciclo de vida (LCA).'
    },
    {
        feature: 'Beneficio Clave',
        leed: 'Reconocimiento de marca, valor de activo.',
        breeam: 'Adaptación a normativa UE, valor de activo.',
        passivhaus: 'Ahorro energético radical (90%), confort extremo.',
        dgnb: 'Rentabilidad económica, optimización de costes a largo plazo.',
        leed_desc: 'Aumenta el valor del inmueble y atrae a inquilinos corporativos de primer nivel por su reconocimiento internacional.',
        breeam_desc: 'Perfectamente alineado con la legislación y las mejores prácticas de la UE, lo que reduce riesgos regulatorios.',
        passivhaus_desc: 'Reduce la demanda de calefacción y refrigeración hasta en un 90%, resultando en facturas energéticas mínimas.',
        dgnb_desc: 'Demuestra que un edificio sostenible es una inversión segura y rentable a largo plazo, funcionando como una herramienta de planificación y optimización financiera.'
    }
];

const leedData = {
    requirements: [
        "Ubicación y Transporte (LT)",
        "Emplazamientos Sostenibles (SS)",
        "Eficiencia en Agua (WE)",
        "Energía y Atmósfera (EA)",
        "Materiales y Recursos (MR)",
        "Calidad Ambiental Interior (IEQ)",
        "Innovación (IN) y Prioridad Regional (RP)"
    ],
    levels: [
        "Certificado (40-49 puntos)",
        "Silver (50-59 puntos)",
        "Gold (60-79 puntos)",
        "Platinum (80+ puntos)"
    ],
    benefits: [
        "Valor de Mercado: Aumenta el valor del inmueble y acelera su venta o alquiler.",
        "Branding y Reputación: Demuestra un compromiso corporativo tangible con la sostenibilidad.",
        "Ahorro Operativo: Consumo significativamente menor de energía y agua.",
        "Salud y Productividad: El énfasis en la calidad del aire interior se traduce en ocupantes más sanos."
    ],
    expertAdvice: "Si tu objetivo es un activo comercial con reconocimiento internacional y un enfoque de sostenibilidad amplio (transporte, agua, etc.), LEED es una de tus mejores opciones."
};

const breeamData = {
    requirements: [
        "Gestión", "Salud y Bienestar", "Energía", "Transporte", "Agua", "Materiales", "Residuos", "Uso del Suelo y Ecología", "Contaminación"
    ],
    levels: [
        "Aceptable", "Bueno", "Muy Bueno", "Excelente", "Excepcional"
    ],
    benefits: [
        "Adaptación Europea: Perfectamente alineado con la legislación y las mejores prácticas de la UE y el Reino Unido.",
        "Valor del Activo: Incrementa el valor de renta y venta del edificio.",
        "Reducción de Riesgos: Su enfoque en la gestión y la ecología ayuda a mitigar riesgos regulatorios y ambientales.",
        "Ahorro Operativo: Garantiza una reducción de costes de funcionamiento (energía, agua, mantenimiento)."
    ],
    expertAdvice: "Si tu proyecto está en Europa y buscas una certificación que encaje perfectamente en el contexto normativo local, BREEAM es ideal, especialmente para activos comerciales."
};

const passivhausData = {
    requirements: [
        "Aislamiento Térmico Superior",
        "Eliminación de Puentes Térmicos",
        "Ventanas de Altas Prestaciones",
        "Hermeticidad al Aire (≤ 0.6 renovaciones/hora a 50Pa)",
        "Ventilación Mecánica con Recuperación de Calor (>75% eficiencia)",
        "Demanda de Calefacción/Refrigeración ≤ 15 kWh/(m²a)"
    ],
    levels: [
        "Passivhaus Classic", "Passivhaus Plus (genera algo de energía renovable)", "Passivhaus Premium (genera un excedente de energía)"
    ],
    benefits: [
        "Ahorro Energético Extremo: Reduce la demanda de calefacción/refrigeración hasta en un 90%.",
        "Confort Térmico Insuperable: Temperatura interior estable y homogénea todo el año (20-25°C).",
        "Calidad de Aire Superior: Aire fresco y filtrado 24/7, libre de polvo y contaminantes.",
        "Durabilidad: La construcción meticulosa previene problemas de humedades y condensaciones."
    ],
    expertAdvice: "Si tu prioridad absoluta es el confort térmico, la calidad del aire y una factura energética casi nula, especialmente para viviendas o edificios de oficinas, Passivhaus es el estándar a seguir."
};

const dgnbData = {
    requirements: [
        "Enfoque Holístico de Seis Calidades: Calidad Ambiental, Calidad Económica, Calidad Sociocultural y Funcional, Calidad Técnica, Calidad del Proceso, Calidad del Emplazamiento.",
        "Evaluación del Ciclo de Vida Completo (LCA): Considera el impacto y los costes desde la extracción de materias primas hasta la demolición y el reciclaje."
    ],
    levels: [
        "Certificado DGNB Bronce",
        "Certificado DGNB Plata",
        "Certificado DGNB Oro",
        "Certificado DGNB Platino"
    ],
    benefits: [
        "Fuerte Enfoque Económico: Integra la rentabilidad económica como un pilar fundamental, demostrando que un edificio sostenible es una inversión segura y rentable a largo plazo.",
        "Herramienta de Planificación y Optimización: Funciona como un sistema de 'segunda generación' que asegura una calidad global de sostenibilidad equilibrando rendimiento ambiental, viabilidad económica y confort.",
        "Visión Integral del Ciclo de Vida: A diferencia de otros sellos, analiza los costes e impactos en todas las fases del edificio, no solo en la de uso.",
        "Calidad Técnica y de Proceso Garantizada: Evalúa la durabilidad, el mantenimiento y la gestión del proyecto para garantizar soluciones robustas y eficientes."
    ],
    expertAdvice: "DGNB es la certificación ideal para inversores y promotores inmobiliarios que buscan una herramienta de optimización que equilibre la sostenibilidad con la rentabilidad a largo plazo y la calidad constructiva."
};

// FIX: Export the CertificationComparator component to make it available for import in other modules.
export const CertificationComparator: React.FC<CertificationComparatorProps> = ({ onSaveTask, setView }) => {

    const handleGenerateSummary = (certName: string, data: { requirements: string[]; levels: string[]; benefits: string[] }) => {
        const rawData = `
### Requisitos Clave de ${certName}
${data.requirements.map(r => `- ${r}`).join('\n')}

### Niveles de Certificación
${data.levels.map(l => `- ${l}`).join('\n')}

### Beneficios Principales
${data.benefits.map(b => `- ${b}`).join('\n')}
        `.trim();

        const newTask: Task = {
            id: `task-summary-${certName.toLowerCase()}-${Date.now()}`,
            title: `Resumen Interactivo: Certificación ${certName}`,
            createdAt: Date.now(),
            status: 'Por Hacer',
            contentType: ContentType.Texto,
            formData: {
                objective: `Generar un resumen ejecutivo claro y conciso sobre los aspectos clave de la certificación ${certName}, basado en los datos proporcionados.`,
                tone: 'Informativo / Profesional',
                specifics: {
                    [ContentType.Texto]: {
                        type: 'Informe Ejecutivo',
                        audience: 'Equipo de Proyecto / Clientes',
                        rawData: rawData
                    },
                    [ContentType.Imagen]: {},
                    [ContentType.Video]: {},
                    [ContentType.Audio]: {},
                    [ContentType.Codigo]: {},
                }
            },
            eventType: 'ExecutiveReport'
        };

        onSaveTask(newTask);
        setView('tasks');
    };


    return (
        <div className="bg-white p-8 rounded-lg shadow-md mb-16">
            <header className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-900">Comparador de Certificaciones Sostenibles</h2>
                <p className="mt-2 text-md text-gray-600">LEED / BREEAM / Passivhaus / DGNB</p>
            </header>

            <div className="overflow-x-auto mb-12">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-4 border border-gray-300 font-semibold">Característica</th>
                            <th className="p-4 border border-gray-300 font-semibold">LEED</th>
                            <th className="p-4 border border-gray-300 font-semibold">BREEAM</th>
                            <th className="p-4 border border-gray-300 font-semibold">Passivhaus</th>
                            <th className="p-4 border border-gray-300 font-semibold">DGNB</th>
                        </tr>
                    </thead>
                    <tbody>
                        {comparisonData.map((row, index) => (
                            <tr key={index} className="odd:bg-white even:bg-gray-50">
                                <td className="p-4 border border-gray-300 font-semibold">{row.feature}</td>
                                <td className="p-4 border border-gray-300" title={row.leed_desc}>{row.leed}</td>
                                <td className="p-4 border border-gray-300" title={row.breeam_desc}>{row.breeam}</td>
                                <td className="p-4 border border-gray-300" title={row.passivhaus_desc}>{row.passivhaus}</td>
                                <td className="p-4 border border-gray-300" title={row.dgnb_desc}>{row.dgnb}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="space-y-6">
                <details className="bg-gray-50 p-4 rounded-lg border">
                    <summary className="font-bold text-xl cursor-pointer text-green-700">LEED (Leadership in Energy and Environmental Design)</summary>
                    <div className="mt-4 space-y-4">
                        <div><h3 className="font-semibold text-lg">Requisitos Clave:</h3><ul className="list-disc list-inside ml-4 text-gray-700"> {leedData.requirements.map(item => <li key={item}>{item}</li>)}</ul></div>
                        <div><h3 className="font-semibold text-lg">Niveles de Certificación:</h3><ul className="list-disc list-inside ml-4 text-gray-700">{leedData.levels.map(item => <li key={item}>{item}</li>)}</ul></div>
                        <div><h3 className="font-semibold text-lg">Beneficios Principales:</h3><ul className="list-disc list-inside ml-4 text-gray-700">{leedData.benefits.map(item => <li key={item}>{item}</li>)}</ul></div>
                        <div className="p-3 bg-green-100 border-l-4 border-green-500 text-green-800"><p><strong>Consejo del Experto:</strong> {leedData.expertAdvice}</p></div>
                        <div className="pt-4 text-center">
                            <button onClick={() => handleGenerateSummary('LEED', leedData)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">Generar Resumen Interactivo</button>
                        </div>
                    </div>
                </details>

                <details className="bg-gray-50 p-4 rounded-lg border">
                    <summary className="font-bold text-xl cursor-pointer text-blue-700">BREEAM (Building Research Establishment Environmental Assessment Method)</summary>
                    <div className="mt-4 space-y-4">
                        <div><h3 className="font-semibold text-lg">Requisitos Clave:</h3><ul className="list-disc list-inside ml-4 text-gray-700">{breeamData.requirements.map(item => <li key={item}>{item}</li>)}</ul></div>
                        <div><h3 className="font-semibold text-lg">Niveles de Certificación:</h3><ul className="list-disc list-inside ml-4 text-gray-700">{breeamData.levels.map(item => <li key={item}>{item}</li>)}</ul></div>
                        <div><h3 className="font-semibold text-lg">Beneficios Principales:</h3><ul className="list-disc list-inside ml-4 text-gray-700">{breeamData.benefits.map(item => <li key={item}>{item}</li>)}</ul></div>
                        <div className="p-3 bg-blue-100 border-l-4 border-blue-500 text-blue-800"><p><strong>Consejo del Experto:</strong> {breeamData.expertAdvice}</p></div>
                        <div className="pt-4 text-center">
                            <button onClick={() => handleGenerateSummary('BREEAM', breeamData)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">Generar Resumen Interactivo</button>
                        </div>
                    </div>
                </details>

                <details className="bg-gray-50 p-4 rounded-lg border">
                    <summary className="font-bold text-xl cursor-pointer text-purple-700">Passivhaus (Casa Pasiva)</summary>
                     <div className="mt-4 space-y-4">
                        <div><h3 className="font-semibold text-lg">Requisitos Clave (Los 5 Pilares):</h3><ul className="list-disc list-inside ml-4 text-gray-700">{passivhausData.requirements.map(item => <li key={item}>{item}</li>)}</ul></div>
                        <div><h3 className="font-semibold text-lg">Niveles de Certificación:</h3><ul className="list-disc list-inside ml-4 text-gray-700">{passivhausData.levels.map(item => <li key={item}>{item}</li>)}</ul></div>
                        <div><h3 className="font-semibold text-lg">Beneficios Principales:</h3><ul className="list-disc list-inside ml-4 text-gray-700">{passivhausData.benefits.map(item => <li key={item}>{item}</li>)}</ul></div>
                        <div className="p-3 bg-purple-100 border-l-4 border-purple-500 text-purple-800"><p><strong>Consejo del Experto:</strong> {passivhausData.expertAdvice}</p></div>
                         <div className="pt-4 text-center">
                            <button onClick={() => handleGenerateSummary('Passivhaus', passivhausData)} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">Generar Resumen Interactivo</button>
                        </div>
                    </div>
                </details>

                 <details className="bg-gray-50 p-4 rounded-lg border">
                    <summary className="font-bold text-xl cursor-pointer text-yellow-700">DGNB (Consejo Alemán de Construcción Sostenible)</summary>
                     <div className="mt-4 space-y-4">
                        <div><h3 className="font-semibold text-lg">Requisitos Clave:</h3><ul className="list-disc list-inside ml-4 text-gray-700">{dgnbData.requirements.map(item => <li key={item}>{item}</li>)}</ul></div>
                        <div><h3 className="font-semibold text-lg">Niveles de Certificación:</h3><ul className="list-disc list-inside ml-4 text-gray-700">{dgnbData.levels.map(item => <li key={item}>{item}</li>)}</ul></div>
                        <div><h3 className="font-semibold text-lg">Beneficios Principales:</h3><ul className="list-disc list-inside ml-4 text-gray-700">{dgnbData.benefits.map(item => <li key={item}>{item}</li>)}</ul></div>
                        <div className="p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800"><p><strong>Consejo del Experto:</strong> {dgnbData.expertAdvice}</p></div>
                         <div className="pt-4 text-center">
                            <button onClick={() => handleGenerateSummary('DGNB', dgnbData)} className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">Generar Resumen Interactivo</button>
                        </div>
                    </div>
                </details>
            </div>
        </div>
    );
};

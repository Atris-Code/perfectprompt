import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, Sector, Sankey, TooltipProps
} from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import type { Task } from '../../types';
import { ContentType } from '../../types';
import { useTranslations } from '../../contexts/LanguageContext';
import { Accordion } from '../form/Accordion';

declare var html2canvas: any;

interface EnergyExplorerProps {
    onSaveTask: (task: Task) => void;
}

const COLORS = ['#0ea5e9', '#f97316', '#8b5cf6', '#10b981', '#ef4444', '#eab308', '#64748b'];
const FOSSIL_COLORS = { Oil: '#475569', Coal: '#1e293b', Natural_gas: '#64748b', Hydroelectricity: '#3b82f6', Nuclear_energy: '#a855f7', Renewables: '#22c55e' };
const ARG_COLORS = { 'Gas Natural': '#0ea5e9', 'Petróleo': '#64748b', 'Hidráulica': '#3b82f6', 'Nuclear': '#a855f7', 'Carbón Mineral': '#1e293b', 'Renovables*': '#22c55e' };
const OIL_PROJECT_COLORS = ['#059669', '#0d9488', '#0e7490', '#0369a1', '#075985', '#0c4a6e'];


// --- CHART COMPONENTS ---

const CustomTooltip: React.FC<TooltipProps<ValueType, NameType>> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg text-sm">
          <p className="font-bold mb-2">{label}</p>
          {payload.map((pld, index) => (
            pld && pld.color && <div key={index} style={{ color: pld.color }}>
              {`${pld.name}: ${pld.value?.toLocaleString(undefined, {maximumFractionDigits: 1})}`}
            </div>
          ))}
        </div>
      );
    }
    return null;
};

const SankeyCustomTooltip: React.FC<TooltipProps<ValueType, NameType>> = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0];
        if (data.payload && data.payload.source && data.payload.target) {
            const sourceName = data.payload.source.name;
            const targetName = data.payload.target.name;
            const value = data.value;
            return (
                <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg text-sm">
                    <p className="font-bold">{`${sourceName} → ${targetName}`}</p>
                    <p className="text-blue-600">{`${value?.toLocaleString()} (valor estimado)`}</p>
                </div>
            );
        }
    }
    return null;
};


const ArgentinaSankeyChart: React.FC<{ chartInfo: any }> = ({ chartInfo }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(0);

    useEffect(() => {
        if (containerRef.current) {
            const observer = new ResizeObserver(entries => {
                if (entries[0]) setWidth(entries[0].contentRect.width);
            });
            observer.observe(containerRef.current);
            return () => observer.disconnect();
        }
    }, []);

    const argentinaSankeyData = useMemo(() => ({
        nodes: [
            // Column 1: Energías Primarias (0-5)
            { name: 'Gas Natural' }, { name: 'Petróleo' }, { name: 'E. Hidráulica' }, { name: 'E. Nuclear' }, { name: 'Carbón' }, { name: 'Renovables' },
            // Column 2: Centros de Transformación (6-7)
            { name: 'Refinerías' }, { name: 'Plantas de Gas' },
            // Column 3: Energías Secundarias (8-12)
            { name: 'Gas de Red' }, { name: 'Combustibles Líquidos' }, { name: 'Gas Licuado' }, { name: 'Otros Derivados' }, { name: 'Biocombustibles' },
            // Column 4: Centros de Transformación 2 (13)
            { name: 'Centrales Eléctricas' },
            // Column 5: Energía Eléctrica (14)
            { name: 'Energía Eléctrica' },
            // Column 6: Sectores de Consumo (15-21)
            { name: 'Transporte' }, { name: 'Industria' }, { name: 'Residencial' }, { name: 'Comercial/Público' }, { name: 'Agropecuario' },
            { name: 'No Energético' }, { name: 'Pérdidas' },
        ],
        links: [
            // Primarias -> Transformación / Consumo / Centrales
            { source: 0, target: 7, value: 25 }, // Gas Natural -> Plantas de Gas
            { source: 0, target: 13, value: 30 }, // Gas Natural -> Centrales Eléctricas
            { source: 0, target: 16, value: 20 }, // Gas Natural -> Industria
            { source: 0, target: 17, value: 5 },  // Gas Natural -> Residencial
            { source: 1, target: 6, value: 45 }, // Petróleo -> Refinerías
            { source: 2, target: 13, value: 7 }, // Hidráulica -> Centrales Eléctricas
            { source: 3, target: 13, value: 3 }, // Nuclear -> Centrales Eléctricas
            { source: 4, target: 13, value: 2 }, // Carbón -> Centrales Eléctricas
            { source: 5, target: 13, value: 1 }, // Renovables (Biomasa, etc.) -> Centrales Eléctricas
            { source: 5, target: 12, value: 2 }, // Renovables -> Biocombustibles

            // Transformación 1 -> Secundarias
            { source: 7, target: 8, value: 24 }, // Plantas de Gas -> Gas de Red
            { source: 6, target: 9, value: 30 }, // Refinerías -> Combustibles Líquidos (Gas Oil, Naftas)
            { source: 6, target: 10, value: 5 }, // Refinerías -> Gas Licuado
            { source: 6, target: 11, value: 8 }, // Refinerías -> Otros Derivados
            
            // Secundarias -> Centrales Eléctricas
            { source: 8, target: 13, value: 5 }, // Gas de Red -> Centrales Eléctricas
            { source: 9, target: 13, value: 3 }, // Combustibles Líquidos -> Centrales Eléctricas

            // Centrales Eléctricas -> Energía Eléctrica + Pérdidas
            { source: 13, target: 14, value: 40 }, // Centrales -> Eléctrica
            { source: 13, target: 21, value: 30 }, // Centrales -> Pérdidas

            // Secundarias -> Consumo Final
            { source: 8, target: 16, value: 10 }, // Gas de Red -> Industria
            { source: 8, target: 17, value: 8 },  // Gas de Red -> Residencial
            { source: 8, target: 18, value: 3 },  // Gas de Red -> Comercial
            { source: 9, target: 15, value: 25 }, // Combustibles Líquidos -> Transporte
            { source: 9, target: 19, value: 5 },  // Combustibles Líquidos -> Agropecuario
            { source: 10, target: 17, value: 5 }, // Gas Licuado -> Residencial
            { source: 11, target: 20, value: 8 }, // Otros Derivados -> No Energético
            { source: 12, target: 15, value: 2 }, // Biocombustibles -> Transporte

            // Energía Eléctrica -> Consumo Final
            { source: 14, target: 16, value: 15 }, // Eléctrica -> Industria
            { source: 14, target: 17, value: 12 }, // Eléctrica -> Residencial
            { source: 14, target: 18, value: 8 },  // Eléctrica -> Comercial
            { source: 14, target: 19, value: 3 },  // Eléctrica -> Agropecuario
            { source: 14, target: 21, value: 2 },  // Eléctrica -> Pérdidas
        ]
    }), []);

    const nodeColors: Record<string, string> = useMemo(() => ({
        'Gas Natural': '#f8b481',
        'Petróleo': '#a08b7e',
        'E. Hidráulica': '#a5d9e3',
        'E. Nuclear': '#d3c4e3',
        'Carbón': '#7f7f7f',
        'Renovables': '#c4d79b',
        'Gas de Red': '#fcd3af',
        'Combustibles Líquidos': '#c6b9b1',
        'Gas Licuado': '#d9d1cd',
        'Otros Derivados': '#d9d1cd',
        'Biocombustibles': '#d9e5be',
        'Energía Eléctrica': '#f78a83',
        'Pérdidas': '#f78a83',
    }), []);

    const dataWithColors = useMemo(() => ({
        nodes: argentinaSankeyData.nodes.map(node => ({
            ...node,
            color: nodeColors[node.name] || '#e5e7eb', // default gray
        })),
        links: argentinaSankeyData.links,
    }), [argentinaSankeyData, nodeColors]);

    return (
        <div ref={containerRef}>
            <ResponsiveContainer width="100%" height={600}>
                <Sankey
                    data={dataWithColors}
                    node={({ x, y, width: rectWidth, height, index, payload }) => {
                        const isRight = x > width / 2;
                        return (
                            <g>
                                <rect x={x} y={y} width={rectWidth} height={height} fill={(payload as any).color} />
                                <text
                                    x={isRight ? x - 8 : x + rectWidth + 8}
                                    y={y + height / 2}
                                    textAnchor={isRight ? 'end' : 'start'}
                                    dy="0.35em"
                                    className="text-xs fill-gray-800 font-semibold"
                                >
                                    {(payload as any).name}
                                </text>
                            </g>
                        );
                    }}
                    link={(props: any) => ({
                        stroke: props.source.color,
                        strokeOpacity: 0.7
                    })}
                    nodePadding={30}
                    margin={{ top: 20, right: 150, bottom: 20, left: 150 }}
                >
                    <Tooltip content={<SankeyCustomTooltip />} />
                </Sankey>
            </ResponsiveContainer>
        </div>
    );
};

const ArgentinaDonutChart: React.FC<{ chartInfo: any }> = ({ chartInfo }) => {
    if (!chartInfo) return <div className="text-center p-8">Chart data not available.</div>;

    const totalMtep = parseFloat(chartInfo.oferta_total_2024.replace(',', '.'));
    const compositionData = Object.entries(chartInfo.data_composicion)
        .filter(([key]) => key !== 'carbon_based')
        .map(([name, valueStr], index) => ({
            name: name.replace(/_/g, ' '),
            value: parseFloat((valueStr as string).replace(',', '.')),
            color: COLORS[index % COLORS.length]
        }));
    
    const CustomDonutTooltip: React.FC<TooltipProps<ValueType, NameType>> = ({ active, payload }) => {
        if (active && payload && payload.length && payload[0] && payload[0].payload) {
            const dataEntry = payload[0].payload as any;
            const color = dataEntry.color;

            if (dataEntry.name && typeof dataEntry.value === 'number' && color) {
                const { name, value } = dataEntry;
                const mtep = (value / 100 * totalMtep).toFixed(2);
                
                return (
                  <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg text-sm">
                    <p className="font-bold">{name}</p>
                    <p style={{ color }}>{`${value.toFixed(1)}% (${mtep} Mtep)`}</p>
                  </div>
                );
            }
        }
        
        return null;
    };

    return (
        <ResponsiveContainer width="100%" height={400}>
            <PieChart>
                <Pie
                    data={compositionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={150}
                    innerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                >
                    {compositionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip content={<CustomDonutTooltip />} />
                <Legend wrapperStyle={{fontSize: '0.875rem'}}/>
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold fill-gray-800">
                    {totalMtep.toFixed(2)} Mtep
                </text>
                 <text x="50%" y="50%" dy="1.5em" textAnchor="middle" className="text-sm fill-gray-500">
                    Oferta Total 2024
                </text>
            </PieChart>
        </ResponsiveContainer>
    );
};

const FossilFuelsChart: React.FC<{ chartInfo: any }> = ({ chartInfo }) => {
    if (!chartInfo) return null;
    const data = [
        { year: '2000', Oil: 38, Coal: 25, Natural_gas: 20, Hydroelectricity: 6, Nuclear_energy: 5, Renewables: 0.5 },
        { year: '2005', Oil: 36, Coal: 27, Natural_gas: 21, Hydroelectricity: 6, Nuclear_energy: 5, Renewables: 1 },
        { year: '2010', Oil: 34, Coal: 30, Natural_gas: 23, Hydroelectricity: 6, Nuclear_energy: 5, Renewables: 2 },
        { year: '2015', Oil: 32, Coal: 29, Natural_gas: 24, Hydroelectricity: 6, Nuclear_energy: 4.5, Renewables: 3 },
        { year: '2020', Oil: 31, Coal: 27, Natural_gas: 25, Hydroelectricity: 6, Nuclear_energy: 4, Renewables: 6 },
        { year: '2022', Oil: 30, Coal: 30, Natural_gas: 25, Hydroelectricity: 6, Nuclear_energy: 4, Renewables: 7 },
    ];

    return (
        <div>
            <h3 className="text-xl font-semibold text-center text-gray-800 mb-1">Participación en la Energía Primaria Global (%)</h3>
             <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis unit="%" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    {Object.keys(FOSSIL_COLORS).map(key => (
                         <Line key={key} type="monotone" dataKey={key} name={key.replace(/_/g, ' ')} stroke={FOSSIL_COLORS[key as keyof typeof FOSSIL_COLORS]} strokeWidth={3} dot={false} />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

const ArgentinaEvolutionChart: React.FC<{ chartInfo: any }> = ({ chartInfo }) => {
    if (!chartInfo) return null;
    const data = [
      { year: 1970, 'Gas Natural': 20, 'Petróleo': 70, 'Hidráulica': 5, 'Nuclear': 0, 'Carbón Mineral': 3, 'Renovables*': 2 },
      { year: 1980, 'Gas Natural': 30, 'Petróleo': 60, 'Hidráulica': 6, 'Nuclear': 1, 'Carbón Mineral': 2, 'Renovables*': 1 },
      { year: 1990, 'Gas Natural': 45, 'Petróleo': 45, 'Hidráulica': 5, 'Nuclear': 2, 'Carbón Mineral': 1, 'Renovables*': 2 },
      { year: 2000, 'Gas Natural': 50, 'Petróleo': 40, 'Hidráulica': 4, 'Nuclear': 3, 'Carbón Mineral': 1, 'Renovables*': 2 },
      { year: 2011, 'Gas Natural': 55, 'Petróleo': 35, 'Hidráulica': 4, 'Nuclear': 2, 'Carbón Mineral': 2, 'Renovables*': 2 },
    ];
    return (
        <div>
            <h3 className="text-xl font-semibold text-center text-gray-800 mb-1">Evolución de la Matriz Energética Primaria Argentina (%)</h3>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data} layout="vertical" stackOffset="expand">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" unit="%" tickFormatter={(tick) => `${tick * 100}`} />
                    <YAxis type="category" dataKey="year" width={60} />
                    <Tooltip formatter={(value: number) => `${(value * 100).toFixed(1)}%`} />
                    <Legend />
                    {Object.keys(ARG_COLORS).map(key => (
                        <Bar key={key} dataKey={key} stackId="a" fill={ARG_COLORS[key as keyof typeof ARG_COLORS]} />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

const ParisAgreementChart: React.FC<{ chartInfo: any }> = ({ chartInfo }) => {
    if (!chartInfo) return null;
    const data = [
      { year: '2000', Current_Trajectory: 25, Net_Zero: 25 },
      { year: '2010', Current_Trajectory: 30, Net_Zero: 30 },
      { year: '2022', Current_Trajectory: 37, Net_Zero: 35 },
      { year: '2030', Current_Trajectory: 36, Net_Zero: 20 },
      { year: '2040', Current_Trajectory: 34, Net_Zero: 8 },
      { year: '2050', Current_Trajectory: 32, Net_Zero: 2 },
    ];
    return (
        <div>
            <h3 className="text-xl font-semibold text-center text-gray-800 mb-1">Emisiones Globales de CO2e (Gt)</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="Current_Trajectory" name="Trayectoria Actual" stroke="#f87171" strokeWidth={3} />
                    <Line type="monotone" dataKey="Net_Zero" name="Escenario Net Zero" stroke="#4ade80" strokeWidth={3} strokeDasharray="5 5" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

const InvestmentChart: React.FC<{ chartInfo: any }> = ({ chartInfo }) => {
    if (!chartInfo) return null;
    const projects = ["Liza 1", "Liza 2", "Payara", "Yellowtail", "Uaru", "Hammerhead"];
    const data = [
        { year: 2020, "Liza 1": 0.1, "Liza 2": 0, Payara: 0, Yellowtail: 0, Uaru: 0, Hammerhead: 0 },
        { year: 2022, "Liza 1": 0.15, "Liza 2": 0.2, Payara: 0, Yellowtail: 0, Uaru: 0, Hammerhead: 0 },
        { year: 2023, "Liza 1": 0.15, "Liza 2": 0.22, Payara: 0.25, Yellowtail: 0, Uaru: 0, Hammerhead: 0 },
        { year: 2025, "Liza 1": 0.15, "Liza 2": 0.22, Payara: 0.25, Yellowtail: 0.25, Uaru: 0, Hammerhead: 0 },
        { year: 2026, "Liza 1": 0.15, "Liza 2": 0.22, Payara: 0.25, Yellowtail: 0.25, Uaru: 0.25, Hammerhead: 0 },
        { year: 2027, "Liza 1": 0.15, "Liza 2": 0.22, Payara: 0.25, Yellowtail: 0.25, Uaru: 0.25, Hammerhead: 0.25 },
        { year: 2029, "Liza 1": 0.15, "Liza 2": 0.22, Payara: 0.25, Yellowtail: 0.25, Uaru: 0.25, Hammerhead: 0.25 },
    ];
    return (
        <div>
            <h3 className="text-xl font-semibold text-center text-gray-800 mb-1">Proyección de Crecimiento de Producción de Petróleo (M B/D)</h3>
             <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    {projects.map((proj, i) => (
                        <Bar key={proj} dataKey={proj} stackId="a" fill={OIL_PROJECT_COLORS[i % OIL_PROJECT_COLORS.length]} />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};


export const EnergyExplorer: React.FC<EnergyExplorerProps> = ({ onSaveTask }) => {
    const { t } = useTranslations();
    const [energyData, setEnergyData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/data/datos_energia_interactiva.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setEnergyData(data);
            } catch (e) {
                console.error("Failed to fetch energy data:", e);
                setError("No se pudieron cargar los datos de energía.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSaveSnippet = useCallback(async (chartRef: React.RefObject<HTMLDivElement>, title: string) => {
        if (!chartRef.current) return;

        try {
            const canvas = await html2canvas(chartRef.current, { backgroundColor: '#ffffff', scale: 2 });
            const image = canvas.toDataURL('image/png');
            
            const task: Task = {
                id: `snippet-${Date.now()}`,
                title: `Snippet de Informe: ${title}`,
                createdAt: Date.now(),
                status: 'Por Hacer',
                contentType: ContentType.Texto,
                formData: {
                    objective: `Insertar el análisis de '${title}' en un informe.`,
                    specifics: {
                        [ContentType.Texto]: {
                            rawData: `**Análisis para ${title}**\n\nEste es un resumen de los datos y la visualización correspondiente.`
                        },
                        [ContentType.Imagen]: {},
                        [ContentType.Video]: {},
                        [ContentType.Audio]: {},
                        [ContentType.Codigo]: {},
                    }
                },
                result: {
                    text: `## ${title}\n\n![Visualización de ${title}](${image})`
                }
            };
            
            onSaveTask(task);
            alert(`Snippet para '${title}' guardado como una nueva tarea.`);

        } catch (error) {
            console.error("Error al generar el snippet:", error);
            alert("No se pudo generar el snippet de la visualización.");
        }
    }, [onSaveTask]);
    
    const chartInfo = useMemo(() => {
        if (!energyData) return {};
        const info: Record<string, any> = {};
        energyData.datos_extraidos.forEach((d: any) => {
            info[d.id] = d;
        });
        return info;
    }, [energyData]);

    const sankeyRef = useRef<HTMLDivElement>(null);
    const argentinaDonutRef = useRef<HTMLDivElement>(null);
    const fossilFuelRef = useRef<HTMLDivElement>(null);
    const argentinaEvoRef = useRef<HTMLDivElement>(null);
    const parisAgreementRef = useRef<HTMLDivElement>(null);
    const investmentRef = useRef<HTMLDivElement>(null);
    
    if (loading) {
        return <div className="text-center p-8">Cargando datos de energía...</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-500">{error}</div>;
    }

    return (
        <div className="bg-gray-50 p-6 rounded-2xl shadow-lg">
            <header className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-900">{t('view.energyExplorer')}</h2>
                <p className="mt-2 text-md text-gray-600">Un dashboard interactivo sobre el panorama energético global y argentino.</p>
            </header>
            <div className="space-y-4">
                <Accordion title="Balance Energético Argentino (Sankey)" defaultOpen={true}>
                     <div ref={sankeyRef} className="p-4 bg-white">
                        <ArgentinaSankeyChart chartInfo={chartInfo.diagrama_sankey_mundial} />
                        <div className="text-right mt-4">
                            <button onClick={() => handleSaveSnippet(sankeyRef, 'Balance Energético Argentino')} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg text-sm">Generar Snippet</button>
                        </div>
                    </div>
                </Accordion>

                <Accordion title="Situación Energética Argentina (Actual)" defaultOpen>
                    <div ref={argentinaDonutRef} className="p-4 bg-white">
                        <h3 className="text-xl font-semibold text-center text-gray-800 mb-4">Argentina: situación actual (2024)</h3>
                        <ArgentinaDonutChart chartInfo={chartInfo.argentina_situacion_actual_2024} />
                        <div className="text-right mt-4">
                             <button onClick={() => handleSaveSnippet(argentinaDonutRef, chartInfo.argentina_situacion_actual_2024.titulo)} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg text-sm">Generar Snippet</button>
                        </div>
                    </div>
                </Accordion>
                
                 <Accordion title="Rol de los Combustibles Fósiles" defaultOpen>
                    <div ref={fossilFuelRef} className="p-4 bg-white">
                        <FossilFuelsChart chartInfo={chartInfo.rol_fosiles_consumo_mundial} />
                        <div className="text-right mt-4">
                            <button onClick={() => handleSaveSnippet(fossilFuelRef, chartInfo.rol_fosiles_consumo_mundial.titulo)} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg text-sm">Generar Snippet</button>
                        </div>
                    </div>
                </Accordion>

                <Accordion title="Evolución Energética Argentina (1970-2011)" defaultOpen>
                    <div ref={argentinaEvoRef} className="p-4 bg-white">
                        <ArgentinaEvolutionChart chartInfo={chartInfo.evolucion_energia_primaria_argentina} />
                         <div className="text-right mt-4">
                             <button onClick={() => handleSaveSnippet(argentinaEvoRef, chartInfo.evolucion_energia_primaria_argentina.titulo)} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg text-sm">Generar Snippet</button>
                        </div>
                    </div>
                </Accordion>

                <Accordion title="Escenarios Acuerdo de París" defaultOpen>
                    <div ref={parisAgreementRef} className="p-4 bg-white">
                         <ParisAgreementChart chartInfo={chartInfo.evolucion_energia_acuerdo_paris_emisiones} />
                          <div className="text-right mt-4">
                             <button onClick={() => handleSaveSnippet(parisAgreementRef, chartInfo.evolucion_energia_acuerdo_paris_emisiones.titulo)} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg text-sm">Generar Snippet</button>
                        </div>
                    </div>
                </Accordion>

                <Accordion title="Inversiones y Tendencias" defaultOpen>
                     <div ref={investmentRef} className="p-4 bg-white">
                        <InvestmentChart chartInfo={chartInfo.crecimiento_produccion_petroleo} />
                         <div className="text-right mt-4">
                            <button onClick={() => handleSaveSnippet(investmentRef, chartInfo.crecimiento_produccion_petroleo.titulo)} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg text-sm">Generar Snippet</button>
                        </div>
                    </div>
                </Accordion>
            </div>
        </div>
    );
};
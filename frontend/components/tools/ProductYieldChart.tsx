import React, { useState, useRef, useEffect, useCallback } from 'react';

// Declare html2canvas to satisfy TypeScript since it's loaded via script tag
declare const html2canvas: any;

interface YieldDataPoint {
  temperatura: number;
  bio_aceite: number;
  carbon: number;
  gas: number;
  esEstimado?: boolean;
}

interface ProductYieldChartProps {
  data: YieldDataPoint[];
  title: string;
}

interface TooltipData {
  visible: boolean;
  x: number;
  y: number;
  data: YieldDataPoint;
}

const series = [
    { name: 'Bio-aceite', key: 'bio_aceite' as const, color: '#67e8f9' }, // cyan-300
    { name: 'Carbón', key: 'carbon' as const, color: '#fb923c' },     // orange-400
    { name: 'Gas', key: 'gas' as const, color: '#c084fc' },          // purple-400
];

// Function to generate a smooth path through points using cubic bezier curves
const createSmoothPath = (points: {x: number, y: number}[]) => {
    if (points.length < 2) return '';

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];

        const p0 = i > 0 ? points[i - 1] : p1;
        const p3 = i < points.length - 2 ? points[i + 2] : p2;

        const tension = 0.4;
        const cp1x = p1.x + (p2.x - p0.x) * tension / 2;
        const cp1y = p1.y + (p2.y - p0.y) * tension / 2;
        const cp2x = p2.x - (p3.x - p1.x) * tension / 2;
        const cp2y = p2.y - (p3.y - p1.y) * tension / 2;
        
        // A simple line for two points, curve for more
        if (points.length === 2) {
             path += ` L ${p2.x} ${p2.y}`;
        } else {
             path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
        }
    }
    return path;
}


const ProductYieldChart: React.FC<ProductYieldChartProps> = ({ data, title }) => {
    const [tooltip, setTooltip] = useState<TooltipData | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 350 });

    useEffect(() => {
        const observer = new ResizeObserver(entries => {
            if (entries[0]) {
                const { width } = entries[0].contentRect;
                setDimensions(prev => ({ ...prev, width }));
            }
        });
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }
        return () => observer.disconnect();
    }, []);

    const padding = { top: 20, right: 20, bottom: 80, left: 50 };
    const chartWidth = dimensions.width > 0 ? dimensions.width - padding.left - padding.right : 0;
    const chartHeight = dimensions.height - padding.top - padding.bottom;

    const temperatures = data.map(d => d.temperatura);
    const minTemp = Math.min(...temperatures, 400);
    const maxTemp = Math.max(...temperatures, 600);

    const xScale = (temp: number) => padding.left + ((temp - minTemp) / (maxTemp - minTemp)) * chartWidth;
    const yScale = (yieldVal: number) => padding.top + chartHeight - (yieldVal / 100) * chartHeight;

    const handleMouseEnter = (e: React.MouseEvent, pointData: YieldDataPoint) => {
        const svgRect = svgRef.current?.getBoundingClientRect();
        if (!svgRect || chartWidth <= 0) return;
        
        const xPos = xScale(pointData.temperatura) - 70; // Position tooltip to the left
        const yPos = e.clientY - svgRect.top - 60; // Position tooltip above cursor
        
        setTooltip({
            visible: true,
            x: xPos,
            y: yPos,
            data: pointData
        });
    };
    
    const handleMouseLeave = () => {
        setTooltip(null);
    };
    
    const handleDownloadPNG = useCallback(async () => {
        if (!containerRef.current) return;
        if (typeof html2canvas === 'undefined') {
            console.error('html2canvas library not loaded. Cannot download PNG.');
            alert("La librería para generar imágenes (html2canvas) no se pudo cargar. Comprueba tu conexión a internet y refresca la página.");
            return;
        }
        try {
            const canvas = await html2canvas(containerRef.current, {
                backgroundColor: '#ffffff',
                scale: 2
            });
            const link = document.createElement('a');
            link.download = `${title.replace(/[\s,]/g, '_')}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Error al descargar PNG:', error);
        }
    }, [title]);

    const handleDownloadCSV = useCallback(() => {
        const headers = ['Temperatura (°C)', 'Bio-aceite (%)', 'Carbón (%)', 'Gas (%)'];
        const csvContent = [
            headers.join(','),
            ...data.map(d => `${d.temperatura},${d.bio_aceite},${d.carbon},${d.gas}`)
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        link.download = `${title.replace(/[\s,]/g, '_')}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }, [data, title]);

    const yAxisLabels = [0, 20, 40, 60, 80, 100];
    const xAxisLabels = data.map(d => d.temperatura);

    return (
        <div ref={containerRef} className="bg-white p-6 rounded-lg text-gray-700 relative font-sans">
            <h4 className="font-bold text-lg text-gray-800 mb-4">{title}</h4>
            <div className="absolute top-4 right-4 flex gap-2">
                <button onClick={handleDownloadPNG} className="text-xs font-semibold bg-gray-200 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-300">PNG</button>
                <button onClick={handleDownloadCSV} className="text-xs font-semibold bg-gray-200 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-300">CSV</button>
            </div>
            <div className="relative">
                <svg 
                    ref={svgRef} 
                    width="100%" 
                    height={dimensions.height} 
                    viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
                    onMouseLeave={handleMouseLeave}
                >
                    {chartWidth > 0 && <>
                        {/* Y Axis and Grid Lines */}
                        {yAxisLabels.map(label => (
                            <g key={`y-axis-${label}`}>
                                <text x={padding.left - 10} y={yScale(label)} dy="0.32em" textAnchor="end" className="text-xs fill-current text-gray-500">{label}</text>
                                <line
                                    x1={padding.left} y1={yScale(label)}
                                    x2={padding.left + chartWidth} y2={yScale(label)}
                                    className="stroke-current text-gray-200" strokeDasharray="2,3"
                                />
                            </g>
                        ))}
                        <text x={-padding.top - chartHeight / 2} y="15" transform="rotate(-90)" textAnchor="middle" className="text-sm fill-current text-gray-500">Rendimiento (%)</text>
                        
                        {/* X Axis */}
                        {xAxisLabels.map(label => (
                             <text key={`x-axis-${label}`} x={xScale(label)} y={padding.top + chartHeight + 20} textAnchor="middle" className="text-xs fill-current text-gray-500">{label}</text>
                        ))}
                        <text x={padding.left + chartWidth/2} y={padding.top + chartHeight + 45} textAnchor="middle" className="text-sm fill-current text-gray-500">Temperatura (°C)</text>

                        {/* Lines */}
                        {series.map(s => (
                            <path
                                key={s.key}
                                d={createSmoothPath(data.map(d => ({ x: xScale(d.temperatura), y: yScale(d[s.key]) })))}
                                fill="none"
                                stroke={s.color}
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                        ))}

                        {/* Data Points */}
                        {data.map((d, i) => (
                            <g key={`point-group-${i}`} onMouseEnter={(e) => handleMouseEnter(e, d)} className="cursor-pointer">
                                <rect x={xScale(d.temperatura) - 10} y={padding.top} width="20" height={chartHeight} fill="transparent" />
                                {series.map(s => (
                                     <circle key={`point-${s.key}-${i}`} cx={xScale(d.temperatura)} cy={yScale(d[s.key])} r="5" fill={s.color} stroke="white" strokeWidth="2" className="pointer-events-none" />
                                ))}
                            </g>
                        ))}
                        
                         {/* Legend */}
                        <g transform={`translate(${padding.left + chartWidth / 2 - 135}, ${padding.top + chartHeight + 40})`}>
                            {series.map((s, i) => (
                                <g key={s.key} transform={`translate(${i * 90}, 20)`}>
                                    <rect x="0" y="-5" width="20" height="10" fill={s.color} rx="3" />
                                    <text x="28" y="4" className="text-xs fill-current text-gray-600">{s.name}</text>
                                </g>
                            ))}
                        </g>
                    </>}
                </svg>
                
                {tooltip && (
                    <div
                        className="absolute bg-gray-800/80 backdrop-blur-sm border border-gray-600 rounded-md p-3 text-sm text-white shadow-lg pointer-events-none transition-opacity"
                        style={{
                            left: `${tooltip.x}px`,
                            top: `${tooltip.y}px`,
                            minWidth: '150px'
                        }}
                    >
                        <p className="font-bold mb-2 border-b border-gray-600 pb-1">{tooltip.data.temperatura} °C</p>
                        <ul className="space-y-1">
                            {series.map(s => (
                                <li key={s.key} className="flex justify-between items-center gap-2">
                                    <span style={{ color: s.color }}>● {s.name}</span>
                                    <span className="font-mono ml-2 font-bold">{tooltip.data[s.key].toFixed(1)}%</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductYieldChart;
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { SIMULATION_ENGINE } from '../../data/pyrolysisMaterials';
import type { BiomassPyrolysisMode } from '../../types';

interface ChartDataPoint {
  mode: string;
  temperature: number;
  liquido: number;
  solido: number;
  gas: number;
}

interface TooltipData {
  visible: boolean;
  x: number;
  y: number;
  data: ChartDataPoint;
}

const series = [
    { name: 'Bio-aceite', key: 'liquido' as const, color: '#22d3ee' }, // cyan-400
    { name: 'Biochar', key: 'solido' as const, color: '#f97316' },     // orange-500
    { name: 'Gas', key: 'gas' as const, color: '#a855f7' },          // purple-500
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
        const cp1x = p1.x + (p2.x - p0.x) * tension;
        const cp1y = p1.y + (p2.y - p0.y) * tension;
        const cp2x = p2.x - (p3.x - p1.x) * tension;
        const cp2y = p2.y - (p3.y - p1.y) * tension;
        
        path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return path;
}


const ModeYieldChart: React.FC = () => {
    const [tooltip, setTooltip] = useState<TooltipData | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 400 });

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
    
    const chartData = useMemo(() => {
        const parseTemp = (tempStr: string): number => {
            if (tempStr.includes('-')) {
                const parts = tempStr.split('-').map(Number);
                return (parts[0] + parts[1]) / 2;
            }
            if (tempStr.includes('>')) {
                return Number(tempStr.replace('>', ''));
            }
            return Number(tempStr);
        };

        const dataPoints: ChartDataPoint[] = SIMULATION_ENGINE.biomass_pyrolysis_modes.map(mode => ({
            mode: mode.nombre,
            temperature: parseTemp(mode.condiciones_tipicas.temperatura_C),
            ...mode.rendimiento_base_porcentaje,
        }));
        
        return dataPoints.sort((a, b) => a.temperature - b.temperature);
    }, []);

    const padding = { top: 20, right: 20, bottom: 80, left: 50 };
    const chartWidth = dimensions.width > 0 ? dimensions.width - padding.left - padding.right : 0;
    const chartHeight = dimensions.height - padding.top - padding.bottom;

    const temperatures = chartData.map(d => d.temperature);
    const minTemp = Math.min(...temperatures);
    const maxTemp = Math.max(...temperatures);

    const xScale = (temp: number) => padding.left + ((temp - minTemp) / (maxTemp - minTemp)) * chartWidth;
    const yScale = (yieldVal: number) => padding.top + chartHeight - (yieldVal / 100) * chartHeight;

    const handleMouseMove = (e: React.MouseEvent) => {
        const svgRect = svgRef.current?.getBoundingClientRect();
        if (!svgRect || chartWidth <= 0) return;

        const xPos = e.clientX - svgRect.left;
        
        const closestPoint = chartData.reduce((prev, curr) => {
            return (Math.abs(xScale(curr.temperature) - xPos) < Math.abs(xScale(prev.temperature) - xPos) ? curr : prev);
        });

        if (Math.abs(xScale(closestPoint.temperature) - xPos) < (chartWidth / chartData.length / 2)) {
             setTooltip({
                visible: true,
                x: xScale(closestPoint.temperature),
                y: e.clientY - svgRect.top,
                data: closestPoint,
            });
        } else {
            setTooltip(null);
        }
    };
    
    const handleMouseLeave = () => {
        setTooltip(null);
    };
    
    const yAxisLabels = [0, 20, 40, 60, 80, 100];
    const xAxisLabels = chartData.map(d => d.temperature);

    return (
        <div ref={containerRef} className="bg-slate-700 p-6 rounded-lg text-gray-300 relative font-sans">
             <h4 className="font-bold text-lg text-white mb-4">Rendimiento vs. Temperatura</h4>
            <div className="relative">
                <svg 
                    ref={svgRef} 
                    width="100%" 
                    height={dimensions.height} 
                    viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                >
                    {chartWidth > 0 && <>
                        {/* Y Axis and Grid Lines */}
                        {yAxisLabels.map(label => (
                            <g key={`y-axis-${label}`}>
                                <text x={padding.left - 10} y={yScale(label)} dy="0.32em" textAnchor="end" className="text-xs fill-current text-gray-400">{label}</text>
                                <line
                                    x1={padding.left} y1={yScale(label)}
                                    x2={padding.left + chartWidth} y2={yScale(label)}
                                    className="stroke-current text-gray-600" strokeDasharray="2,3"
                                />
                            </g>
                        ))}
                        <text x={-padding.top - chartHeight / 2} y="15" transform="rotate(-90)" textAnchor="middle" className="text-sm fill-current text-gray-400">Rendimiento (%)</text>
                        
                        {/* X Axis */}
                        {xAxisLabels.map(label => (
                             <text key={`x-axis-${label}`} x={xScale(label)} y={padding.top + chartHeight + 20} textAnchor="middle" className="text-xs fill-current text-gray-400">{label}</text>
                        ))}
                        <text x={padding.left + chartWidth/2} y={padding.top + chartHeight + 45} textAnchor="middle" className="text-sm fill-current text-gray-400">Temperatura Media (°C)</text>

                        {/* Lines */}
                        {series.map(s => (
                            <path
                                key={s.key}
                                d={createSmoothPath(chartData.map(d => ({ x: xScale(d.temperature), y: yScale(d[s.key]) })))}
                                fill="none"
                                stroke={s.color}
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                        ))}

                        {/* Data Points */}
                        {chartData.map((d, i) => (
                            <g key={`point-group-${i}`}>
                                {series.map(s => (
                                     <circle key={`point-${s.key}-${i}`} cx={xScale(d.temperature)} cy={yScale(d[s.key])} r="5" fill={s.color} stroke="#1f2937" strokeWidth="2" className="pointer-events-none" />
                                ))}
                            </g>
                        ))}
                        
                         {/* Legend */}
                        <g transform={`translate(${padding.left + chartWidth / 2 - 135}, ${padding.top + chartHeight + 40})`}>
                            {series.map((s, i) => (
                                <g key={s.key} transform={`translate(${i * 90}, 20)`}>
                                    <rect x="0" y="-5" width="20" height="10" fill={s.color} rx="3" />
                                    <text x="28" y="4" className="text-xs fill-current text-gray-300">{s.name}</text>
                                </g>
                            ))}
                        </g>

                         {/* Tooltip Indicator */}
                        {tooltip && tooltip.visible && (
                            <line
                                x1={tooltip.x} y1={padding.top}
                                x2={tooltip.x} y2={padding.top + chartHeight}
                                className="stroke-current text-gray-400"
                                strokeDasharray="4,4"
                            />
                        )}
                    </>}
                </svg>
                
                {tooltip && tooltip.visible && (
                    <div
                        className="absolute bg-slate-800/80 backdrop-blur-sm border border-slate-600 rounded-md p-3 text-sm text-white shadow-lg pointer-events-none transition-opacity"
                        style={{
                            left: `${tooltip.x + 10}px`,
                            top: `${tooltip.y - 60}px`,
                            minWidth: '150px'
                        }}
                    >
                        <p className="font-bold mb-2 border-b border-slate-600 pb-1">{tooltip.data.mode}</p>
                        <p className="text-xs text-gray-400 mb-2">{tooltip.data.temperature} °C (media)</p>
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

export default ModeYieldChart;

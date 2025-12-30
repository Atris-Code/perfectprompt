import React from 'react';
import type { GroupedExperimentResults } from '../../services/experimentEngine';

interface ResultsTableProps {
    results: GroupedExperimentResults;
    kpiName: string;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ results, kpiName }) => {
    const allResults = [
        ...results.groupA.map(r => ({ ...r, group: 'A' as const })),
        ...results.groupB.map(r => ({ ...r, group: 'B' as const })),
        ...results.groupC.map(r => ({ ...r, group: 'C' as const }))
    ].sort((a, b) => a.reactorId.localeCompare(b.reactorId));

    // Encontrar valores max/min para highlighting
    const allValues = allResults.map(r => r.kpiValue);
    const maxValue = Math.max(...allValues);
    const minValue = Math.min(...allValues);

    return (
        <div className="bg-slate-800 rounded-lg p-6 overflow-x-auto">
            <h3 className="text-2xl font-bold text-cyan-300 mb-4">
                📊 Resultados Detallados
            </h3>
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b-2 border-slate-600">
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold">Reactor</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold">Grupo</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold">Preset Utilizado</th>
                        <th className="text-right py-3 px-4 text-slate-300 font-semibold">{kpiName}</th>
                    </tr>
                </thead>
                <tbody>
                    {allResults.map(result => {
                        const isMax = result.kpiValue === maxValue;
                        const isMin = result.kpiValue === minValue;

                        return (
                            <tr
                                key={result.reactorId}
                                className={`border-b border-slate-700 hover:bg-slate-700/50 transition-colors ${isMax ? 'bg-green-900/20' : isMin ? 'bg-red-900/20' : ''
                                    }`}
                            >
                                <td className="py-3 px-4 font-mono text-white font-bold">
                                    {result.reactorId}
                                </td>
                                <td className="py-3 px-4">
                                    <span className={`px-3 py-1 rounded-md text-xs font-bold ${result.group === 'A' ? 'bg-blue-600 text-white' :
                                            result.group === 'B' ? 'bg-green-600 text-white' :
                                                'bg-purple-600 text-white'
                                        }`}>
                                        Grupo {result.group}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-slate-300 truncate max-w-xs">
                                    {result.presetName}
                                </td>
                                <td className="py-3 px-4 text-right">
                                    <span className={`font-mono font-bold text-lg ${isMax ? 'text-green-400' :
                                            isMin ? 'text-red-400' :
                                                'text-white'
                                        }`}>
                                        {result.kpiValue.toFixed(2)}
                                    </span>
                                    {isMax && <span className="ml-2 text-green-400 text-xs">🏆 MAX</span>}
                                    {isMin && <span className="ml-2 text-red-400 text-xs">⚠ MIN</span>}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <div className="mt-4 text-xs text-slate-400 flex gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-600 rounded"></div>
                    <span>Grupo A (Control)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-600 rounded"></div>
                    <span>Grupo B (Test 1)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-600 rounded"></div>
                    <span>Grupo C (Test 2)</span>
                </div>
            </div>
        </div>
    );
};

import React, { useMemo } from 'react';
import type { PyrolysisMaterial } from '../../types';

interface MaterialComparisonProps {
  materials: PyrolysisMaterial[];
  onClose: () => void;
}

const getProperty = (obj: any, path: string): any => {
    return path.split('.').reduce((o, key) => (o && o[key] !== undefined ? o[key] : undefined), obj);
};

const formatHeader = (path: string) => {
    const parts = path.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const formatCategory = (category: string) => {
    return category.replace('propiedades.', '').replace(/([A-Z])/g, ' $1').replace(/\b\w/g, l => l.toUpperCase()).replace(/_/g, ' ');
}

const MaterialComparison: React.FC<MaterialComparisonProps> = ({ materials, onClose }) => {
    const groupedProperties = useMemo(() => {
        const allProperties: Record<string, any[]> = {};

        const extractPaths = (obj: any, prefix = ''): string[] => {
            let paths: string[] = [];
            for (const key in obj) {
                if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                    paths = [...paths, ...extractPaths(obj[key], prefix + key + '.')];
                } else if (key !== 'esEstimado' && obj[key] !== undefined && obj[key] !== null) {
                    paths.push(prefix + key);
                }
            }
            return paths;
        };

        const allPaths = new Set<string>();
        materials.forEach(m => {
            if ('propiedades' in m) {
                extractPaths(m.propiedades, 'propiedades.').forEach(path => allPaths.add(path));
            }
        });

        allPaths.forEach(path => {
            allProperties[path] = materials.map(m => getProperty(m, path));
        });

        const grouped: Record<string, Record<string, any[]>> = {};
        for (const path in allProperties) {
            const parts = path.split('.');
            const category = parts.slice(0, 2).join('.');
            if (!grouped[category]) {
                grouped[category] = {};
            }
            grouped[category][path] = allProperties[path];
        }

        return grouped;
    }, [materials]);

    const getMinMax = (values: any[]) => {
        const numbers = values.filter(v => typeof v === 'number' && !isNaN(v));
        if (numbers.length < 2) {
            return { min: null, max: null };
        }
        return { min: Math.min(...numbers), max: Math.max(...numbers) };
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-xl shadow-2xl max-w-6xl w-full flex flex-col max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="p-6 border-b flex justify-between items-center bg-gray-50 flex-shrink-0">
                    <h3 className="text-2xl font-bold text-gray-900">Tabla de Comparación de Materiales</h3>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                <main className="p-8 overflow-auto">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead className="sticky top-0 bg-white shadow-sm">
                                <tr>
                                    <th className="p-3 font-semibold text-left text-gray-600 border-b-2 border-gray-200">Propiedad</th>
                                    {materials.map(m => (
                                        <th key={m.id} className="p-3 font-bold text-center text-gray-800 border-b-2 border-gray-200 w-40" title={m.nombre}>
                                            <span className="truncate block">{m.nombre}</span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(groupedProperties).map(([category, properties]) => (
                                    <React.Fragment key={category}>
                                        <tr>
                                            <td colSpan={materials.length + 1} className="p-3 bg-gray-100 text-gray-800 font-bold text-base">
                                                {formatCategory(category)}
                                            </td>
                                        </tr>
                                        {Object.entries(properties).map(([path, values]) => {
                                            const { min, max } = getMinMax(values);
                                            return (
                                                <tr key={path} className="even:bg-gray-50">
                                                    <td className="p-3 text-gray-600 border-b border-gray-200">{formatHeader(path)}</td>
                                                    {values.map((value, index) => {
                                                        const isMin = typeof value === 'number' && value === min && min !== max;
                                                        const isMax = typeof value === 'number' && value === max && min !== max;
                                                        const cellClass = `p-3 font-mono text-center border-b border-gray-200
                                                            ${isMin ? 'bg-red-100 text-red-800 font-bold' : ''}
                                                            ${isMax ? 'bg-green-100 text-green-800 font-bold' : ''}
                                                        `;
                                                        return (
                                                            <td key={`${materials[index].id}-${path}`} className={cellClass}>
                                                                {value !== undefined && value !== null ? String(value) : '-'}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            );
                                        })}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </main>
                 <footer className="p-4 bg-gray-50 border-t flex-shrink-0 flex justify-end gap-4 items-center">
                    <div className="flex items-center gap-2 text-xs"><span className="w-3 h-3 bg-red-100 border border-red-300 rounded-sm"></span> Valor Mínimo</div>
                    <div className="flex items-center gap-2 text-xs"><span className="w-3 h-3 bg-green-100 border border-green-300 rounded-sm"></span> Valor Máximo</div>
                </footer>
            </div>
             <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default MaterialComparison;
import React, { useState, useEffect, useMemo } from 'react';
import { PHYSICAL_QUANTITIES, PhysicalQuantity } from '../data/units';

// Helper para formatear números para la visualización en formato europeo (coma decimal).
// Usa notación exponencial para números muy grandes o pequeños.
const formatNumber = (num: number): string => {
    if (num === 0) return '0';
    // Usar notación exponencial para números muy pequeños o muy grandes para legibilidad
    if (Math.abs(num) > 0 && (Math.abs(num) < 1e-6 || Math.abs(num) > 1e12)) {
        return num.toExponential(6).replace('.', ',');
    }
    // Usar 'de-DE' para obtener puntos como separadores de miles y coma como decimal
    return num.toLocaleString('de-DE', { maximumFractionDigits: 10 });
};

// Helper para parsear un string en formato europeo a un número estándar de JS.
const parseNumber = (str: string): number => {
    // Elimina los puntos (separadores de miles) y reemplaza la coma decimal por un punto.
    const sanitized = str.replace(/\./g, '').replace(',', '.');
    return parseFloat(sanitized);
};


export const UnitConverter: React.FC = () => {
    const [selectedQuantityName, setSelectedQuantityName] = useState<string>(PHYSICAL_QUANTITIES[1].name); // Default a Longitud
    const [values, setValues] = useState<Record<string, string>>({});
    const [lastChanged, setLastChanged] = useState<{ symbol: string; value: string } | null>(null);

    const selectedQuantity = useMemo(() => {
        return PHYSICAL_QUANTITIES.find(q => q.name === selectedQuantityName) || PHYSICAL_QUANTITIES[0];
    }, [selectedQuantityName]);
    
    // Resetea el estado cuando cambia la magnitud física
    useEffect(() => {
        const initialValues: Record<string, string> = {};
        selectedQuantity.units.forEach(u => {
            initialValues[u.symbol] = '';
        });
        setValues(initialValues);
        setLastChanged(null);
    }, [selectedQuantity]);

    // La lógica principal de conversión
    useEffect(() => {
        if (!lastChanged || !lastChanged.value.trim()) {
            if(lastChanged && lastChanged.value.trim() === '') {
               handleClear();
            }
            return;
        }

        const fromUnit = selectedQuantity.units.find(u => u.symbol === lastChanged.symbol);
        if (!fromUnit) return;

        const fromValueNum = parseNumber(lastChanged.value);

        // Si el input no es un número válido, mantiene el valor en el campo actual y limpia los demás
        if (isNaN(fromValueNum)) {
             const newValues: Record<string, string> = {};
             selectedQuantity.units.forEach(u => {
                newValues[u.symbol] = (u.symbol === lastChanged.symbol) ? lastChanged.value : '';
             });
             setValues(newValues);
             return;
        }

        const valueInBase = fromValueNum * fromUnit.toBase;

        const newValues: Record<string, string> = {};
        selectedQuantity.units.forEach(toUnit => {
            if (toUnit.symbol === lastChanged.symbol) {
                newValues[toUnit.symbol] = lastChanged.value; // Mantiene el input original del usuario
            } else {
                const convertedValue = valueInBase / toUnit.toBase;
                newValues[toUnit.symbol] = formatNumber(convertedValue);
            }
        });

        setValues(newValues);

    }, [lastChanged, selectedQuantity]);

    const handleValueChange = (symbol: string, value: string) => {
        setValues(prev => ({ ...prev, [symbol]: value }));
        setLastChanged({ symbol, value });
    };
    
    const handleClear = () => {
        const clearedValues: Record<string, string> = {};
        selectedQuantity.units.forEach(u => {
            clearedValues[u.symbol] = '';
        });
        setValues(clearedValues);
        setLastChanged(null);
    };

    const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedQuantityName(e.target.value);
    };
    
    // Divide las unidades en dos columnas para una mejor visualización
    const half = Math.ceil(selectedQuantity.units.length / 2);
    const firstColumnUnits = selectedQuantity.units.slice(0, half);
    const secondColumnUnits = selectedQuantity.units.slice(half);

    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg">
            <header className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-900">Conversor de Unidades Físicas</h2>
                <p className="mt-2 text-md text-gray-600">Una herramienta para tu agente científico híbrido.</p>
            </header>
            
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="w-full sm:w-auto flex-grow">
                        <label htmlFor="quantity-select" className="block text-sm font-medium text-gray-700 mb-1">Magnitud Física:</label>
                        <select
                            id="quantity-select"
                            value={selectedQuantity.name}
                            onChange={handleQuantityChange}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            {PHYSICAL_QUANTITIES.map(q => <option key={q.name} value={q.name}>{q.name}</option>)}
                        </select>
                    </div>
                    <button 
                        onClick={handleClear}
                        className="w-full sm:w-auto px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md shadow-sm hover:bg-gray-300 transition-colors self-end"
                    >
                        Limpiar
                    </button>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {/* Primera Columna */}
                        <div className="space-y-4">
                            {firstColumnUnits.map((unit) => (
                                <div key={unit.symbol}>
                                    <label htmlFor={`unit-${unit.symbol}`} className="text-sm font-medium text-gray-800">{unit.name} ({unit.symbol})</label>
                                    <input
                                        id={`unit-${unit.symbol}`}
                                        type="text"
                                        value={values[unit.symbol] || ''}
                                        onChange={(e) => handleValueChange(unit.symbol, e.target.value)}
                                        placeholder="0"
                                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>
                            ))}
                        </div>
                        {/* Segunda Columna */}
                        <div className="space-y-4">
                             {secondColumnUnits.map((unit) => (
                                <div key={unit.symbol}>
                                    <label htmlFor={`unit-${unit.symbol}`} className="text-sm font-medium text-gray-800">{unit.name} ({unit.symbol})</label>
                                    <input
                                        id={`unit-${unit.symbol}`}
                                        type="text"
                                        value={values[unit.symbol] || ''}
                                        onChange={(e) => handleValueChange(unit.symbol, e.target.value)}
                                        placeholder="0"
                                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
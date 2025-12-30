import React, { useState, useEffect } from 'react';
import { getOracleRecommendation } from '../../services/geminiService';
import type { OracleRecommendation } from '../../types';

interface CatalyticOracleProps {
    selectedMaterialName: string;
}

export const CatalyticOracle: React.FC<CatalyticOracleProps> = ({ selectedMaterialName }) => {
    const [recommendation, setRecommendation] = useState<OracleRecommendation | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const isGenericMaterial = !selectedMaterialName || 
                                  selectedMaterialName === "No definido" || 
                                  selectedMaterialName === "Biomasa Teórica" || 
                                  selectedMaterialName === "Mezcla Personalizada";

        if (isGenericMaterial) {
            setRecommendation(null);
            setError('');
            setIsLoading(false);
            return;
        }

        const fetchRecommendation = async () => {
            setIsLoading(true);
            setError('');
            setRecommendation(null);
            try {
                const result = await getOracleRecommendation(selectedMaterialName);
                setRecommendation(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error al consultar el oráculo.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        const debounceTimer = setTimeout(() => {
            fetchRecommendation();
        }, 1000); // Debounce to avoid rapid firing

        return () => clearTimeout(debounceTimer);
    }, [selectedMaterialName]);

    const isGenericMaterial = !selectedMaterialName || 
                              selectedMaterialName === "No definido" || 
                              selectedMaterialName === "Biomasa Teórica" || 
                              selectedMaterialName === "Mezcla Personalizada";

    return (
        <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
            <h4 className="text-md font-bold text-white mb-3">Sugerencia del Oráculo Catalítico</h4>
            
            {isLoading && (
                <div className="flex items-center justify-center h-24">
                    <div className="text-center text-slate-300">
                        <svg className="animate-spin h-6 w-6 text-slate-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <p className="mt-2 text-xs">Consultando conocimiento profundo...</p>
                    </div>
                </div>
            )}
            
            {error && <p className="text-sm text-red-400">{error}</p>}

            {!isLoading && !error && !recommendation && (
                <p className="text-sm text-slate-400 h-24 flex items-center justify-center text-center">
                    {isGenericMaterial
                        ? "El oráculo solo da sugerencias para materiales específicos, no para mezclas o biomasa teórica."
                        : "Seleccione una materia prima para recibir una sugerencia catalítica."
                    }
                </p>
            )}

            {recommendation && (
                <div className="space-y-3 animate-fade-in">
                    <div>
                        <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Catalizador Recomendado</h5>
                        <p className="font-bold text-lg text-teal-300">{recommendation.catalystName}</p>
                    </div>
                     <div>
                        <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Justificación Científica</h5>
                        <p className="text-sm text-slate-200 mt-1">{recommendation.justification}</p>
                    </div>
                     <div>
                        <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fuente(s)</h5>
                        <p className="text-xs text-slate-300 mt-1 italic">{recommendation.citations.join(', ')}</p>
                    </div>
                </div>
            )}
             <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
};
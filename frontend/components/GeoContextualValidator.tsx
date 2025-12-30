import React from 'react';
import type { GeoContextualData } from '../types';

interface GeoContextualValidatorProps {
  data: GeoContextualData | null;
  isLoading: boolean;
  error: string;
  onValidate: () => void;
  locationInput: string;
}

const VGCResultDisplay: React.FC<{ data: GeoContextualData }> = ({ data }) => {
    if (data.validationMode === 'FACTUAL') {
        return (
            <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-gray-600">Certificación:</span>
                    <span className="font-mono text-green-700 bg-green-100 px-2 py-0.5 rounded-md text-xs">LUGAR FÍSICO VERIFICADO</span>
                </div>
                <p><strong className="font-semibold text-gray-700">Coordenadas (Sim):</strong> {data.latitude}, {data.longitude}</p>
                <p><strong className="font-semibold text-gray-700">Clima (Sim):</strong> {data.climate}</p>
                <p><strong className="font-semibold text-gray-700">Audio Ambiental (Sim):</strong> {data.ambientAudio}</p>
            </div>
        );
    }
    if (data.validationMode === 'CONTEXTUAL') {
        return (
             <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-gray-600">Certificación:</span>
                    <span className="font-mono text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md text-xs">CONTEXTO NARRATIVO VERIFICADO</span>
                </div>
                <p><strong className="font-semibold text-gray-700">Contexto:</strong> {data.context}</p>
                <p><strong className="font-semibold text-gray-700">Condiciones Simbólicas:</strong> {data.symbolicConditions}</p>
                <p><strong className="font-semibold text-gray-700">Audio Simbólico:</strong> {data.symbolicAudio}</p>
            </div>
        );
    }
    return null;
};

export const GeoContextualValidator: React.FC<GeoContextualValidatorProps> = ({ data, isLoading, error, onValidate, locationInput }) => {
    return (
        <div className="space-y-3">
            <button
                type="button"
                onClick={onValidate}
                disabled={isLoading || !locationInput}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Validando...
                    </>
                ) : (
                    'Certificar Localización (VGC)'
                )}
            </button>
            <div className="mt-2 p-4 border rounded-lg bg-white text-sm min-h-[100px] flex items-center justify-center">
                {isLoading && (
                    <div className="text-center text-gray-500">
                        <svg className="animate-spin h-6 w-6 text-gray-400 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <p>El SAH está analizando el contexto...</p>
                    </div>
                )}
                {error && <p className="text-red-600 text-center">{error}</p>}
                {data && <VGCResultDisplay data={data} />}
                {!isLoading && !error && !data && (
                    <p className="text-gray-500 text-center">
                        Los resultados de la validación geo-contextual aparecerán aquí.
                    </p>
                )}
            </div>
        </div>
    );
};
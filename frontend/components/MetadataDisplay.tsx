import React from 'react';

interface MetadataDisplayProps {
    metadata: any;
    onDownloadJson: () => void;
}

const MetadataRow: React.FC<{ label: string; value: any }> = ({ label, value }) => {
    if (value === undefined || value === null || String(value).trim() === '') return null;
    return (
        <div className="flex justify-between items-center text-sm py-2 border-b border-gray-200 last:border-b-0">
            <dt className="font-medium text-gray-600 truncate pr-2">{label}</dt>
            <dd className="text-gray-800 text-right font-mono text-xs md:text-sm break-all">{String(value)}</dd>
        </div>
    );
};

const MetadataDisplay: React.FC<MetadataDisplayProps> = ({ metadata, onDownloadJson }) => {
    // Helper para formatear la velocidad de obturación
    const formatExposureTime = (time: number) => {
        if (!time) return null;
        if (time < 1) {
            const fraction = 1 / time;
            // Redondear a valores comunes de obturador
            const commonSpeeds = [1, 2, 4, 8, 15, 30, 60, 125, 250, 500, 1000, 2000, 4000, 8000];
            const closest = commonSpeeds.reduce((prev, curr) => 
                (Math.abs(curr - fraction) < Math.abs(prev - fraction) ? curr : prev)
            );
            return '1-' + closest + ' s';
        }
        return time + ' s';
    };
    
    // Helper para formatear la fecha
    const formatDateTime = (date: any) => {
      if (!date) return null;
      try {
        return new Date(date).toLocaleString('es-ES', {
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', second: '2-digit',
        });
      } catch (e) {
        return String(date);
      }
    }

    return (
        <div className="my-6 p-6 bg-white border border-gray-200 rounded-lg shadow-sm animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-3">
                <h4 className="text-lg font-bold text-gray-800">Metadatos Extraídos</h4>
                <button
                    onClick={onDownloadJson}
                    className="flex items-center justify-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-xs w-full sm:w-auto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Descargar JSON
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Ajustes de Cámara */}
                <div className="space-y-2">
                    <h5 className="font-semibold text-blue-700 border-b pb-1 mb-2">Ajustes de Cámara</h5>
                    <dl>
                        <MetadataRow label="Cámara" value={metadata.Model} />
                        <MetadataRow label="Lente" value={metadata.LensModel} />
                        <MetadataRow label="Distancia Focal" value={metadata.FocalLength ? `${metadata.FocalLength}mm` : null} />
                        <MetadataRow label="Apertura" value={metadata.FNumber ? `f-${metadata.FNumber}` : null} />
                        <MetadataRow label="Velocidad Obturación" value={formatExposureTime(metadata.ExposureTime)} />
                        <MetadataRow label="ISO" value={metadata.ISO} />
                        <MetadataRow label="Modo Exposición" value={metadata.ExposureProgram} />
                        <MetadataRow label="Balance de Blancos" value={metadata.WhiteBalance} />
                        <MetadataRow label="Flash" value={metadata.Flash} />
                    </dl>
                </div>

                {/* Información de Imagen */}
                <div className="space-y-2">
                     <h5 className="font-semibold text-blue-700 border-b pb-1 mb-2">Información de Imagen</h5>
                    <dl>
                        <MetadataRow label="Dimensiones" value={metadata.ImageWidth && metadata.ImageHeight ? `${metadata.ImageWidth} x ${metadata.ImageHeight}` : null} />
                        <MetadataRow label="Fecha y Hora" value={formatDateTime(metadata.DateTimeOriginal)} />
                        <MetadataRow label="Software" value={metadata.Software} />
                        <MetadataRow label="Artista/Autor" value={metadata.Artist} />
                        <MetadataRow label="Copyright" value={metadata.Copyright} />
                    </dl>
                </div>
            </div>
             <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default MetadataDisplay;

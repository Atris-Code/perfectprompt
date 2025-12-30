import React, { useState, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { TextPassportPDF } from './TextPassportPDF';
import type { FormData } from '../types';
import type { StyleDefinition } from '../types';

interface PDFPreviewModalProps {
  onClose: () => void;
  onDownload: () => void;
  isDownloading: boolean;
  formData: FormData;
  generatedPrompt: string;
  allStyles: StyleDefinition[];
}

const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({ onClose, onDownload, isDownloading, formData, generatedPrompt, allStyles }) => {
  const [selectedThemeStyle, setSelectedThemeStyle] = useState<string>('');

  const stylesWithPalettes = useMemo(() => {
    return allStyles.filter(style => style.color_palette && style.category !== 'video_personalizado');
  }, [allStyles]);

  const selectedPalette = useMemo(() => {
    if (!selectedThemeStyle) return null;
    const style = stylesWithPalettes.find(s => s.style === selectedThemeStyle);
    return style?.color_palette || null;
  }, [selectedThemeStyle, stylesWithPalettes]);
  
  return ReactDOM.createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-preview-title"
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-gray-200 rounded-xl shadow-2xl max-w-4xl w-full flex flex-col max-h-[95vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 border-b bg-white flex justify-between items-center rounded-t-lg flex-shrink-0">
          <h3 id="pdf-preview-title" className="text-xl font-bold text-gray-800">Previsualización de PDF</h3>
          
          <div className="flex items-center gap-2">
            <label htmlFor="theme-selector" className="text-sm font-medium text-gray-700 whitespace-nowrap">Tema de Marca:</label>
            <select 
              id="theme-selector" 
              value={selectedThemeStyle} 
              onChange={(e) => setSelectedThemeStyle(e.target.value)}
              className="w-48 px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white text-sm"
            >
              <option value="">Tema por Defecto</option>
              {stylesWithPalettes.map(style => (
                <option key={style.id_style} value={style.style}>{style.style}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={onClose} 
            className="p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors"
            aria-label="Cerrar modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        
        <div className="p-8 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          <div className="mx-auto shadow-2xl bg-white" style={{ width: '210mm', height: '297mm' }}>
            <TextPassportPDF formData={formData} generatedPrompt={generatedPrompt} palette={selectedPalette} />
          </div>
        </div>
        
        <footer className="p-4 bg-white border-t rounded-b-lg flex justify-end flex-shrink-0">
          <button 
            onClick={onDownload} 
            disabled={isDownloading}
            className="flex items-center justify-center bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Descargando...
              </>
            ) : 'Descargar PDF'}
          </button>
        </footer>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
      `}</style>
    </div>,
    document.body
  );
};

export default PDFPreviewModal;
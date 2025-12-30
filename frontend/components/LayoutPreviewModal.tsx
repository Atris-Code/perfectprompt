import React, { useState, useMemo } from 'react';
import type { ProLayout, LayoutBlockId } from '../types';
import { PDFPage } from './pdf/PDFPage';
import type { StyleDefinition } from '../types';

interface LayoutPreviewModalProps {
  layout: ProLayout;
  pml: string;
  previewContent: Record<string, string>;
  onClose: () => void;
  allStyles: StyleDefinition[];
}

const LayoutPreviewModal: React.FC<LayoutPreviewModalProps> = ({ layout, pml, previewContent, onClose, allStyles }) => {
  const [selectedThemeStyle, setSelectedThemeStyle] = useState<string>('');
  const [isPmlCopied, setIsPmlCopied] = useState(false);

  const stylesWithPalettes = useMemo(() => {
    return allStyles.filter(style => style.color_palette && style.category !== 'video_personalizado');
  }, [allStyles]);

  const selectedPalette = useMemo(() => {
    if (!selectedThemeStyle) return null;
    const style = stylesWithPalettes.find(s => s.style === selectedThemeStyle);
    return style?.color_palette || null;
  }, [selectedThemeStyle, stylesWithPalettes]);

  const cssVariables = useMemo(() => {
    const vars: Record<string, string> = {
        '--bg-image': '#D1D5DB', // gray-300
        '--bg-data': '#6B7280', // gray-500
        '--bg-fcn': '#3B82F6', // blue-500
        '--bg-prompt': '#1F2937', // gray-800
        '--bg-title': '#F3F4F6', // gray-100
        '--bg-video': '#4B5563', // gray-600
        '--bg-history': '#A855F7', // purple-500
        '--text-light': '#FFFFFF',
        '--text-dark': '#000000',
    };

    if (selectedPalette) {
        vars['--bg-image'] = selectedPalette.dominant[2] || vars['--bg-image'];
        vars['--bg-data'] = selectedPalette.dominant[1] || vars['--bg-data'];
        vars['--bg-fcn'] = selectedPalette.accent[0] || vars['--bg-fcn'];
        vars['--bg-prompt'] = selectedPalette.dominant[0] || vars['--bg-prompt'];
        vars['--bg-title'] = selectedPalette.dominant[3] || vars['--bg-title'];
    }
    
    return vars;
  }, [selectedPalette]);

  const commonBlockClasses = "flex items-center justify-center text-[10px] font-mono leading-tight w-full h-full p-2 text-center";

  const contentBlocks: Record<LayoutBlockId, React.ReactNode> = {
      image: <div className={`${commonBlockClasses}`} style={{ backgroundColor: 'var(--bg-image)', color: 'var(--text-dark)' }}>{previewContent.image}</div>,
      data: <div className={`${commonBlockClasses} whitespace-pre-wrap`} style={{ backgroundColor: 'var(--bg-data)', color: 'var(--text-light)' }}>{previewContent.data}</div>,
      fcn: <div className={`${commonBlockClasses} whitespace-pre-wrap`} style={{ backgroundColor: 'var(--bg-fcn)', color: 'var(--text-light)' }}>{previewContent.fcn}</div>,
      prompt: <div className={`${commonBlockClasses} whitespace-pre-wrap text-left`} style={{ backgroundColor: 'var(--bg-prompt)', color: 'var(--text-light)' }}>{previewContent.prompt}</div>,
      title: <div className="p-2 h-full w-full" style={{ backgroundColor: 'var(--bg-title)'}}><h4 className="font-sans font-bold text-sm leading-tight" style={{ color: 'var(--text-dark)' }}>{previewContent.title}</h4></div>,
      video: <div className={`${commonBlockClasses}`} style={{ backgroundColor: 'var(--bg-video)', color: 'var(--text-light)' }}>{previewContent.video}</div>,
      history: <div className={`${commonBlockClasses}`} style={{ backgroundColor: 'var(--bg-history)', color: 'var(--text-light)' }}>{previewContent.history}</div>,
  };

  const handleCopyPml = () => {
    navigator.clipboard.writeText(pml).then(() => {
        setIsPmlCopied(true);
        setTimeout(() => setIsPmlCopied(false), 2500);
    });
  };

  const handleSaveLayout = () => {
    // Placeholder for future functionality
    alert("La funcionalidad para guardar layouts personalizados estará disponible próximamente.");
    console.log("Guardar layout:", layout);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="layout-preview-title"
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-5xl w-full flex flex-col max-h-[95vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 border-b bg-gray-50 flex justify-between items-center flex-shrink-0">
          <h3 id="layout-preview-title" className="text-xl font-bold text-gray-800">Previsualización con IA: {layout.title}</h3>
          
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

          <button onClick={onClose} aria-label="Cerrar" className="p-2 rounded-full hover:bg-gray-200"><svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </header>
        
        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 p-6 overflow-y-auto">
          {/* Columna de Previsualización */}
          <div>
            <h4 className="font-bold text-gray-700 mb-3">Ejemplo de Contenido Renderizado</h4>
            <div className="w-full aspect-[1/1.414] bg-white border-2 border-gray-300 rounded-lg overflow-hidden flex flex-col p-4" style={cssVariables as React.CSSProperties}>
               <PDFPage structure={layout.structure} contentBlocks={contentBlocks} />
            </div>
          </div>

          {/* Columna de PML */}
          <div>
            <h4 className="font-bold text-gray-700 mb-3">Prompt Maestro de Layout (PML)</h4>
            <div className="bg-gray-800 text-gray-100 rounded-lg p-4 h-full flex flex-col">
              <p className="text-sm text-gray-300 mb-4">La IA utilizará este prompt estructurado para combinar tu selección de layout con el contenido y los datos, asegurando un resultado coherente.</p>
              <pre className="whitespace-pre-wrap text-xs leading-relaxed font-mono bg-black/30 p-3 rounded-md flex-grow">{pml}</pre>
            </div>
          </div>
        </div>

        <footer className="p-4 bg-white border-t rounded-b-lg flex justify-end items-center gap-3 flex-shrink-0">
          <button
            onClick={handleCopyPml}
            className="font-semibold py-2 px-4 rounded-md transition-colors bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200 text-sm"
          >
            {isPmlCopied ? '¡Copiado!' : 'Copiar Prompt'}
          </button>
          <button
            onClick={handleSaveLayout}
            className="font-semibold py-2 px-4 rounded-md transition-colors bg-blue-600 text-white hover:bg-blue-700 text-sm"
          >
            Guardar Layout
          </button>
        </footer>

      </div>
       <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default LayoutPreviewModal;
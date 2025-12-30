import React, { useMemo } from 'react';
import type { FormData } from '../types';
import { TextDataBlock, TextBlock } from './pdf/contentBlocks';

interface TextPassportPDFProps {
  formData: FormData;
  generatedPrompt: string;
  palette?: { dominant: string[]; accent: string[] } | null;
}

export const TextPassportPDF: React.FC<TextPassportPDFProps> = ({ formData, generatedPrompt, palette }) => {
  const textSpecifics = formData.specifics.Texto;

  const cssVariables = useMemo(() => {
    let vars = {
        '--primary-color': '#111827',
        '--secondary-color': '#4B5563',
        '--accent-color': '#3B82F6',
        '--subtle-bg-color': '#F9FAFB',
        '--body-text-color': '#374151',
    };

    if (palette) {
        vars['--primary-color'] = palette.dominant[0] || vars['--primary-color'];
        vars['--secondary-color'] = palette.dominant[1] || vars['--secondary-color'];
        vars['--accent-color'] = palette.accent[0] || vars['--accent-color'];
        vars['--subtle-bg-color'] = palette.dominant[3] || palette.dominant[2] || vars['--subtle-bg-color'];
        vars['--body-text-color'] = palette.dominant[1] || vars['--body-text-color'];
    }
    
    return Object.entries(vars).map(([key, value]) => `${key}: ${value};`).join(' ');
  }, [palette]);

  return (
    <div id="text-pdf-content" className="p-16 bg-white w-full h-full text-black" style={{ fontFamily: "'Inter', sans-serif" }}>
       <style>{`
        #text-pdf-content { ${cssVariables} }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
        .font-helvetica { font-family: 'Inter', sans-serif; }
        .font-consolas { font-family: Consolas, 'Courier New', monospace; }
        .bg-code-block { background-color: #F0F0F0; }
        @media print {
          body { -webkit-print-color-adjust: exact; }
        }
      `}</style>
      
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="mb-10 pb-5 border-b-2" style={{ borderColor: 'var(--primary-color)' }}>
          <h1 className="text-4xl font-bold leading-tight" style={{ color: 'var(--primary-color)' }}>{formData.objective}</h1>
          <p className="text-xl mt-3" style={{ color: 'var(--secondary-color)' }}>{textSpecifics?.type || 'Documento de Texto'}</p>
        </header>

        {/* Metadata section */}
        <section className="mb-10">
            <TextDataBlock formData={formData} />
        </section>

        {/* Main content */}
        <main className="flex-grow">
          <TextBlock content={generatedPrompt} />
        </main>
        
        {/* Footer */}
        <footer className="mt-auto pt-4 border-t text-xs text-center" style={{ color: 'var(--secondary-color)', borderColor: 'var(--primary-color)' }}>
            Generado con el Creador de Prompt Perfecto
        </footer>
      </div>
    </div>
  );
};
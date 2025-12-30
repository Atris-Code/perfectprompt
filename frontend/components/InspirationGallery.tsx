import React, { useState, useMemo } from 'react';
import { GALLERY_ITEMS } from '../data/galleryItems';
import type { FormData, InspirationItem } from '../types';
import { ContentType } from '../types';

interface InspirationCardProps {
  item: InspirationItem;
  onUseInspiration: (formData: Partial<FormData>) => void;
  onCopyPrompt: (prompt: string, id: string) => void;
  isCopied: boolean;
}

const InspirationCard: React.FC<InspirationCardProps> = ({ item, onUseInspiration, onCopyPrompt, isCopied }) => (
  <div className="relative aspect-video group overflow-hidden rounded-lg shadow-lg bg-gradient-to-br from-gray-700 via-gray-800 to-black transition-all duration-500 ease-in-out transform hover:scale-102 hover:shadow-2xl">
    <div className="absolute inset-0 flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-500 opacity-50 group-hover:text-yellow-300 group-hover:opacity-100 transition-all duration-500 ease-in-out group-hover:scale-110 transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    </div>
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent transition-opacity duration-300"></div>
    <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
      <h3 className="font-bold text-2xl drop-shadow-md">{item.title}</h3>
      <div className="opacity-0 max-h-0 group-hover:max-h-full group-hover:opacity-100 transition-all duration-500 ease-in-out mt-2">
        <p className="text-sm mt-2 drop-shadow">{item.description}</p>
        <div className="flex flex-wrap gap-2 mt-4">
          <button 
            onClick={() => onUseInspiration(item.formData)} 
            className="flex-grow inline-flex items-center justify-center font-semibold py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors text-xs bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" clipRule="evenodd" /></svg>
            Usar como Plantilla
          </button>
          <button 
            onClick={() => onCopyPrompt(item.prompt, item.id)} 
            className="flex-grow inline-flex items-center justify-center font-semibold py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors text-xs bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-500"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a3 3 0 003 3h4a3 3 0 003-3V7a3 3 0 00-3-3H8zm0 2h4a1 1 0 011 1v4a1 1 0 01-1 1H8a1 1 0 01-1-1V7a1 1 0 011-1z" clipRule="evenodd" /></svg>
            {isCopied ? '¡Copiado!' : 'Copiar Prompt'}
          </button>
        </div>
      </div>
    </div>
  </div>
);


export const InspirationGallery: React.FC<{ onUseInspiration: (formData: Partial<FormData>) => void; }> = ({ onUseInspiration }) => {
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [yearFilter, setYearFilter] = useState('All');

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    GALLERY_ITEMS.forEach(item => {
        const date = item.formData.specifics?.[ContentType.Imagen]?.creationDate;
        if (date) {
            const year = date.substring(0, 4);
            years.add(year);
        }
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a)); // Sort descending
  }, []);

  const filteredItems = useMemo(() => {
    return GALLERY_ITEMS.filter(item => {
        if (yearFilter === 'All') {
            return true;
        }
        const itemYear = item.formData.specifics?.[ContentType.Imagen]?.creationDate?.substring(0, 4);
        return itemYear === yearFilter;
    });
  }, [yearFilter]);

  const handleCopyPrompt = (prompt: string, id: string) => {
    navigator.clipboard.writeText(prompt).then(() => {
      setCopiedPromptId(id);
      setTimeout(() => setCopiedPromptId(null), 2500);
    });
  };

  return (
    <div>
      <header className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-gray-900">Galería de Inspiración: Estilos en Acción</h2>
        <p className="mt-2 text-md text-gray-600 max-w-3xl mx-auto">
          Cada imagen es un "antecedente" visual que puedes usar como punto de partida. El "motivo de inspiración" es la descripción de cómo se logró. ¡Úsalos como plantillas para tu próxima creación!
        </p>
      </header>
      
       <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-4">
            <label htmlFor="year-filter" className="font-semibold text-gray-700">Filtrar por Año:</label>
            <select
                id="year-filter"
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
                <option value="All">Todos los Años</option>
                {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                ))}
            </select>
        </div>
      </div>
      
      <div className="mb-10 flex justify-center">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="flex-shrink-0 bg-blue-100 text-blue-600 rounded-full p-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-blue-700 text-2xl">{filteredItems.length}</p>
            <p className="text-sm text-gray-600">Plantillas de Inspiración</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredItems.map(item => (
          <InspirationCard 
            key={item.id} 
            item={item} 
            onUseInspiration={onUseInspiration}
            onCopyPrompt={handleCopyPrompt}
            isCopied={copiedPromptId === item.id}
          />
        ))}
      </div>
    </div>
  );
};
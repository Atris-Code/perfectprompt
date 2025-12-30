import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CLASSIFIED_STYLES } from '../data/styles';
// FIX: Changed import of 'VideoPreset' from '../data/videoPresets' to '../types' to resolve export errors.
import type { StyleDefinition, VideoPreset } from '../types';
import { SENSATION_CATEGORIES } from '../data/sensations';
import { ALL_VIDEO_PRESETS } from '../data/videoPresets';
import PromptContributionModal from './AddStyleModal';

const InspirationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
  </svg>
);

const EditorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" strokeWidth={1.5} viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
);

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Vanguardia y Arte Moderno': (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <title>Disruptivo y Caótico</title>
       <path strokeLinecap="round" strokeLinejoin="round" d="M12 1v22M2 12h20M5 5l14 14M5 19L19 5" />
    </svg>
  ),
  'Arte Digital y Nuevos Medios': (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <title>Digital y Retro-Futurista</title>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
    </svg>
  ),
   'Ilustración': (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <title>Lúdico y Caprichoso</title>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  'Dibujo Técnico y Científico': (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <title>Rigor y Precisión</title>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 21V3m0 18h6M9 3h6m0 18h6M3 9v6m0-6h18m-6 18v-6m-6-12v6m6 0v6" />
    </svg>
  ),
  'Arte Étnico y Tradicionalista': (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <title>Místico y Esotérico</title>
      <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  'Estilos Experimentales y Alternativos': (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <title>Disruptivo y Caótico</title>
       <path strokeLinecap="round" strokeLinejoin="round" d="M12 1v22M2 12h20M5 5l14 14M5 19L19 5" />
    </svg>
  ),
  'Arte Clásico y Movimientos Históricos': (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <title>Épico y Monumental</title>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16M17 7h-2M7 7h2m0 4h.01M17 11h-2m-5.01 0h.01M7 15h2m4.01 0h.01M15 15h2" />
    </svg>
  ),
  'Estilos de Video Personalizados': (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <title>Estilos de Video Personalizados</title>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  'Estilos PEP Personalizados': <EditorIcon />,
};

const ColorPalette: React.FC<{ style: StyleDefinition }> = ({ style }) => {
  if (!style.color_palette) return null;
  
  const allColors = [...style.color_palette.dominant, ...style.color_palette.accent];
  
  return (
    <div className="mt-auto pt-3 border-t">
      <div className="flex -space-x-2 overflow-hidden">
        {allColors.map((color, index) => (
          <div
            key={index}
            className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
    </div>
  );
};


const StyleCard: React.FC<{
  style: StyleDefinition;
  isCopied: boolean;
  onCopyJson: () => void;
  onApplyVideoStyle: (style: StyleDefinition) => void;
  onApplyPepStyle: (style: StyleDefinition) => void;
}> = ({ style, isCopied, onCopyJson, onApplyVideoStyle, onApplyPepStyle }) => {
  const isVideoStyle = style.category === 'video_personalizado';
  const isPepStyle = style.category === 'pep_personalizado';
  const [isPaletteCopied, setIsPaletteCopied] = useState(false);

  const handleCopyPalette = () => {
    if (!style.color_palette) return;

    const paletteString = `Dominantes: ${style.color_palette.dominant.join(', ')}\nAcentos: ${style.color_palette.accent.join(', ')}`;

    navigator.clipboard.writeText(paletteString).then(() => {
      setIsPaletteCopied(true);
      setTimeout(() => setIsPaletteCopied(false), 2500);
    });
  };


  return (
    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-blue-500 hover:scale-[1.02] transform flex flex-col">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-md text-blue-700">{style.style}</h4>
        <span className="text-xs font-semibold uppercase bg-blue-50 text-blue-700 px-2 py-1 rounded-full border border-blue-200">{style.categoryName}</span>
      </div>
      <p className="text-sm text-gray-600 flex-grow mb-3">{style.description}</p>
      
      {style.artist_inspiration && style.artist_inspiration.length > 0 && (
        <div className="text-xs text-gray-500 mb-3 flex items-start">
          <InspirationIcon />
          <span>{style.artist_inspiration.join(', ')}</span>
        </div>
      )}
      
      {style.keywords && style.keywords.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {style.keywords.map(kw => <span key={kw} className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">{kw}</span>)}
        </div>
      )}

      {isVideoStyle && style.video_presets && (
        <div className="mb-3">
            <h5 className="text-xs font-semibold text-gray-500 mb-1">Presets Incluidos:</h5>
            <div className="flex flex-wrap gap-1">
            {Object.entries(style.video_presets).map(([key, value]) => {
              if (!value) return null;
              const preset = ALL_VIDEO_PRESETS.find(p => p.preset_name === value);
              return preset ? (
                <span key={key} className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded-md border border-gray-200" title={preset.category}>{value}</span>
              ) : null;
            })}
            </div>
        </div>
      )}

      <ColorPalette style={style} />

      <div className="mt-4 pt-3 border-t flex flex-col gap-2">
        {isVideoStyle && (
          <button
            onClick={() => onApplyVideoStyle(style)}
            className="w-full inline-flex items-center justify-center font-bold py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors text-xs bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
          >
            Aplicar al Creador de Video
          </button>
        )}
        {isPepStyle && (
            <button
                onClick={() => onApplyPepStyle(style)}
                className="w-full inline-flex items-center justify-center font-bold py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors text-xs bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500"
            >
                Aplicar al Editor PEP
            </button>
        )}
        <div className="flex sm:flex-row gap-2">
            {!isVideoStyle && !isPepStyle && style.color_palette && (
                <button
                    onClick={handleCopyPalette}
                    className="w-full inline-flex items-center justify-center font-bold py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors text-xs bg-blue-100 text-blue-800 hover:bg-blue-200 focus:ring-blue-500"
                >
                    {isPaletteCopied ? '¡Copiada!' : 'Copiar Paleta'}
                </button>
            )}
            <button
                onClick={onCopyJson}
                className="w-full inline-flex items-center justify-center font-bold py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors text-xs bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500"
            >
                {isCopied ? '¡JSON Copiado!' : 'Copiar Estilo (JSON)'}
            </button>
        </div>
      </div>
    </div>
  );
};


interface StyleLibraryProps {
  allStyles: StyleDefinition[];
  onApplyVideoStyle: (style: StyleDefinition) => void;
  onApplyPepStyle: (style: StyleDefinition) => void;
}

export const StyleLibrary: React.FC<StyleLibraryProps> = ({ allStyles, onApplyVideoStyle, onApplyPepStyle }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSensation, setSelectedSensation] = useState('');
  const [copiedStyleId, setCopiedStyleId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const filteredStyles = useMemo(() => {
    return allStyles.filter(style => {
      const searchTermMatch = searchTerm.trim() === '' ||
        style.style.toLowerCase().includes(searchTerm.toLowerCase()) ||
        style.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        style.keywords?.some(kw => kw.toLowerCase().includes(searchTerm.toLowerCase())) ||
        style.artist_inspiration?.some(artist => artist.toLowerCase().includes(searchTerm.toLowerCase()));

      const categoryMatch = selectedCategory === '' || style.categoryName === selectedCategory;

      const sensationMatch = selectedSensation === '' || style.sensacion_atmosfera[0] === selectedSensation;

      return searchTermMatch && categoryMatch && sensationMatch;
    });
  }, [searchTerm, selectedCategory, selectedSensation, allStyles]);

  const stats = useMemo(() => {
    const categoryCounts: Record<string, number> = {};
    allStyles.forEach(style => {
        const category = style.categoryName;
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    // Sort categories by count desc
    const sortedByCategory = Object.entries(categoryCounts)
      .sort(([, countA], [, countB]) => countB - countA);

    return {
        total: allStyles.length,
        byCategory: sortedByCategory,
    };
  }, [allStyles]);

  const handleCopyJson = (style: StyleDefinition) => {
    const jsonString = JSON.stringify(style, null, 2);
    navigator.clipboard.writeText(jsonString).then(() => {
      setCopiedStyleId(style.id_style);
      setTimeout(() => setCopiedStyleId(null), 2500);
    });
  };

  const handleSavePrompt = (handoffJson: any) => {
    console.log("--- PROMPT CONTRIBUTION HANDOFF TO GOVERNANCE ---");
    console.log(JSON.stringify(handoffJson, null, 2));
    alert("Propuesta de prompt enviada al sistema de gobernanza. Revisa la consola para ver el payload JSON.");
    setIsModalOpen(false);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedSensation('');
  };

  return (
    <div>
      {isModalOpen && <PromptContributionModal onClose={() => setIsModalOpen(false)} onSave={handleSavePrompt} />}
      
      <header className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-gray-900">Biblioteca de Prompts</h2>
        <p className="mt-2 text-md text-gray-600 max-w-3xl mx-auto">
          Explora, filtra y utiliza una curada colección de estilos y prompts. Sube tus propias creaciones para que la comunidad las valide y ganes reputación.
        </p>
      </header>
      
      <div className="mb-8 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-6">
            <div className="text-center">
                <div className="text-4xl font-bold text-blue-700">{stats.total}</div>
                <div className="text-sm font-semibold text-gray-600 mt-1">Prompts y Estilos</div>
            </div>
            <div className="h-16 w-px bg-gray-200 hidden md:block"></div>
            {stats.byCategory.map(([category, count]) => (
                <div key={category} className="flex items-center gap-3 text-left" title={category}>
                    <div className="text-blue-600 bg-blue-50 p-3 rounded-full">
                        {CATEGORY_ICONS[category] || <div className="h-6 w-6"></div>}
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-800">{count}</div>
                        <div className="text-xs text-gray-500 max-w-[120px] truncate" title={category}>{category}</div>
                    </div>
                </div>
            ))}
        </div>
      </div>
      
      <div className="sticky top-0 bg-gray-50/80 backdrop-blur-sm z-10 py-4 mb-8 -mx-8 px-8 border-b">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">Buscar por nombre, descripción o artista</label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ej: Cyberpunk, Van Gogh, neón..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoría Artística</label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Todas las categorías</option>
              {CLASSIFIED_STYLES.map(group => <option key={group.id} value={group.category}>{group.category}</option>)}
              <option value="Estilos de Video Personalizados">Estilos de Video Personalizados</option>
              <option value="Estilos PEP Personalizados">Estilos PEP Personalizados</option>
            </select>
          </div>
          <div>
            <label htmlFor="sensation" className="block text-sm font-medium text-gray-700">Sensación / Atmósfera</label>
            <select
              id="sensation"
              value={selectedSensation}
              onChange={(e) => setSelectedSensation(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Todas las sensaciones</option>
              {SENSATION_CATEGORIES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-gray-600"><span className="font-bold text-gray-800">{filteredStyles.length}</span> de <span className="font-bold text-gray-800">{allStyles.length}</span> elementos mostrados.</p>
          <div className="flex gap-4">
              <button onClick={clearFilters} className="text-sm font-semibold text-gray-700 hover:text-blue-600">Limpiar Filtros</button>
              <button onClick={() => setIsModalOpen(true)} className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md shadow-sm">
                Subir Prompt Testeado
              </button>
          </div>
        </div>
      </div>
      
      <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredStyles.map((style) => (
          <StyleCard
            key={style.id_style}
            style={style}
            isCopied={copiedStyleId === style.id_style}
            onCopyJson={() => handleCopyJson(style)}
            onApplyVideoStyle={onApplyVideoStyle}
            onApplyPepStyle={onApplyPepStyle}
          />
        ))}
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { PRO_LAYOUTS } from '../data/proLayouts';
import type { ProLayout, LayoutStructure, LayoutItem, LayoutBlockId } from '../types';
import { generateLayoutPreview } from '../services/layoutService';
import type { StyleDefinition } from '../types';
import LayoutPreviewModal from './LayoutPreviewModal';

const LayoutPreview: React.FC<{ layout: ProLayout }> = ({ layout }) => {
    const commonBlockClasses = "flex items-center justify-center text-white text-[10px] font-mono leading-none w-full h-full";

    const contentBlocks: Record<LayoutBlockId, React.ReactNode> = {
        image: <div className={`${commonBlockClasses} bg-gray-400`}>Img</div>,
        data: <div className={`${commonBlockClasses} bg-gray-500`}>Data</div>,
        fcn: <div className={`${commonBlockClasses} bg-gray-500`}>FCN</div>,
        prompt: <div className={`${commonBlockClasses} bg-gray-800`}>Code</div>,
        title: <div className="p-1 h-full w-full"><h4 className="font-sans font-bold text-black text-[10px] leading-none">Title</h4></div>,
        video: <div className={`${commonBlockClasses} bg-gray-600`}>Vid</div>,
        history: <div className={`${commonBlockClasses} bg-purple-500`}>Hist</div>,
    };

    const renderPreviewStructure = (structure: LayoutStructure | LayoutItem): React.ReactNode => {
        if ('id' in structure) {
            const item = structure as LayoutItem;
            return contentBlocks[item.id] || null;
        }

        const struct = structure as LayoutStructure;
        const typeClass = struct.type === 'grid' ? 'grid' : 'flex';
        const directionClass = struct.direction === 'col' ? 'flex-col' : struct.direction === 'row' ? 'flex-row' : '';
        
        const getColumnsClass = (columns?: number) => {
            switch (columns) {
                case 2: return 'grid-cols-2';
                case 12: return 'grid-cols-12';
                default: return '';
            }
        };
        const columnsClass = getColumnsClass(struct.columns);
        
        const containerClasses = [
            typeClass,
            directionClass,
            columnsClass,
            'gap-1', // fixed small gap for preview
            struct.className || '',
            'w-full h-full'
        ].join(' ');

        return (
            <div className={containerClasses}>
                {struct.items.map((item, index) => {
                    const childNode = renderPreviewStructure(item);
                    
                    let wrapperClasses = 'flex min-h-0 min-w-0';
                    if ('span' in item && struct.type === 'grid') {
                        const getSpanClass = (span?: number) => {
                            switch(span) {
                                case 1: return 'col-span-1';
                                case 2: return 'col-span-2';
                                case 3: return 'col-span-3';
                                case 4: return 'col-span-4';
                                case 8: return 'col-span-8';
                                case 9: return 'col-span-9';
                                default: return '';
                            }
                        };
                        const spanClass = getSpanClass(item.span);
                         wrapperClasses += ` ${spanClass}`;
                    }
                    if ('className' in item) {
                       // Avoid adding flex classes if already present in item.className
                       if (!item.className?.includes('flex') && !item.className?.includes('grid')) {
                          // special handling for layout 6
                          if(layout.id !== 'layout-06') wrapperClasses += ' ' + item.className;
                       }
                    }

                    return <div key={index} className={wrapperClasses}>{childNode}</div>;
                })}
            </div>
        );
    };

    return <>{renderPreviewStructure(layout.structure)}</>;
};

interface LayoutCardProps {
    layout: ProLayout;
    isSelected: boolean;
    onSelect: () => void;
    onPreview: () => void;
}

const LayoutCard: React.FC<LayoutCardProps> = ({ layout, isSelected, onSelect, onPreview }) => {
    const borderClass = isSelected ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-200 hover:border-blue-400';
    return (
        <div className={`bg-white p-5 rounded-lg border-2 shadow-sm transition-all duration-300 flex flex-col transform hover:-translate-y-1 hover:shadow-lg ${borderClass}`}>
            <h3 className="font-bold text-lg text-gray-800 mb-2">{layout.title}</h3>
            <p className="text-sm text-gray-600 flex-grow mb-4">{layout.rationale}</p>
            <div className="w-full aspect-[1/1.414] bg-white border border-gray-300 rounded-md overflow-hidden flex flex-col mb-4 p-1">
                <LayoutPreview layout={layout} />
            </div>
            <div className="mt-auto pt-4 border-t border-gray-200 space-y-2">
                <button
                    onClick={onPreview}
                    className="w-full font-semibold py-2 px-4 rounded-md transition-colors bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                    Previsualizar con IA
                </button>
                <button
                    onClick={onSelect}
                    className={`w-full font-semibold py-2 px-4 rounded-md transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white hover:bg-blue-700'}`}
                >
                    {isSelected ? 'Seleccionado' : 'Seleccionar Layout'}
                </button>
            </div>
        </div>
    );
};

interface ProLayoutGalleryProps {
    selectedLayout: string;
    onSelectLayout: (layoutId: string) => void;
    allStyles: StyleDefinition[];
}

export const ProLayoutGallery: React.FC<ProLayoutGalleryProps> = ({ selectedLayout, onSelectLayout, allStyles }) => {
    const [previewingLayout, setPreviewingLayout] = useState<ProLayout | null>(null);

    const groupedLayouts = PRO_LAYOUTS.reduce((acc, layout) => {
        const categoryKey = layout.category === 'text_code' ? 'text_code' : 'visual';
        if (!acc[categoryKey]) {
            acc[categoryKey] = [];
        }
        acc[categoryKey].push(layout);
        return acc;
    }, {} as Record<'visual' | 'text_code', ProLayout[]>);

    const categoryTitles: Record<'visual' | 'text_code', string> = {
        'visual': 'Layouts para Contenido Visual',
        'text_code': 'Layouts para Contenido Técnico (Texto y Código)'
    };

    const { pml, previewContent } = previewingLayout ? generateLayoutPreview(previewingLayout) : { pml: '', previewContent: {} };

    return (
        <div>
            <header className="mb-10 text-center">
                <h2 className="text-3xl font-bold text-gray-900">Galería de Layouts Pro</h2>
                <p className="mt-2 text-md text-gray-600 max-w-3xl mx-auto">
                    Selecciona una plantilla de diseño profesional para tu "Pasaporte Visual" en PDF. Cada layout está optimizado para la claridad y la coherencia, siguiendo los principios de la Bauhaus y el Swiss Design.
                </p>
            </header>

            <div className="space-y-12">
                {(['visual', 'text_code'] as const).map(category => (
                    groupedLayouts[category] && (
                        <section key={category}>
                            <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-gray-200 pb-3">{categoryTitles[category]}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {groupedLayouts[category].map(layout => (
                                    <LayoutCard
                                        key={layout.id}
                                        layout={layout}
                                        isSelected={selectedLayout === layout.id}
                                        onSelect={() => onSelectLayout(layout.id)}
                                        onPreview={() => setPreviewingLayout(layout)}
                                    />
                                ))}
                            </div>
                        </section>
                    )
                ))}
            </div>

            {previewingLayout && (
                <LayoutPreviewModal
                    layout={previewingLayout}
                    onClose={() => setPreviewingLayout(null)}
                    pml={pml}
                    previewContent={previewContent as Record<string, string>}
                    allStyles={allStyles}
                />
            )}
        </div>
    );
};

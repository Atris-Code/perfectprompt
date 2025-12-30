import React from 'react';
import type { LayoutStructure, LayoutItem, LayoutBlockId } from '../../types';

interface PDFPageProps {
  structure: LayoutStructure;
  contentBlocks: Record<LayoutBlockId, React.ReactNode>;
}

const renderStructure = (structure: LayoutStructure | LayoutItem | (LayoutItem & { span?: number }), contentBlocks: Record<LayoutBlockId, React.ReactNode>): React.ReactNode => {
    if ('id' in structure) {
        const item = structure as LayoutItem;
        const Block = contentBlocks[item.id];
        
        if (React.isValidElement(Block)) {
            return React.cloneElement(Block as React.ReactElement<any>, { className: `${(Block.props as any).className || ''} ${item.className || ''}`.trim() });
        }
        return Block || null;
    }

    const layout = structure as LayoutStructure;
    
    // JIT-friendly classes
    const columnsClass = layout.columns === 2 ? 'grid-cols-2' : layout.columns === 12 ? 'grid-cols-12' : '';
    const gapClass = layout.gap ? `gap-${layout.gap}` : '';

    const containerClasses = [
        layout.type === 'flex' ? 'flex' : 'grid',
        layout.direction === 'col' ? 'flex-col' : '',
        layout.direction === 'row' ? 'flex-row' : '',
        columnsClass,
        gapClass,
        layout.className || ''
    ].join(' ');

    const getGridSpanClass = (span?: number) => {
        if (!span || layout.type !== 'grid') return '';
        // JIT-friendly classes
        if (span === 1) return 'col-span-1';
        if (span === 2) return 'col-span-2';
        if (span === 3) return 'col-span-3';
        if (span === 4) return 'col-span-4';
        if (span === 8) return 'col-span-8';
        return '';
    };

    return (
        <div className={containerClasses}>
            {layout.items.map((item, index) => {
                const childNode = renderStructure(item, contentBlocks);
                if ('id' in item) {
                    return (
                        <div key={index} className={getGridSpanClass(item.span)}>
                            {childNode}
                        </div>
                    );
                }
                if ('span' in item) {
                     return (
                        <div key={index} className={getGridSpanClass((item as any).span)}>
                            {childNode}
                        </div>
                    );
                }
                return <React.Fragment key={index}>{childNode}</React.Fragment>;
            })}
        </div>
    );
};

export const PDFPage: React.FC<PDFPageProps> = ({ structure, contentBlocks }) => {
    return renderStructure(structure, contentBlocks);
};
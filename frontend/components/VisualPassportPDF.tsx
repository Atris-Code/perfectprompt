import React from 'react';
import type { FormData, GenerationHistory } from '../types';
import type { NarrativeConsistencyFeedback } from '../types';
import { PRO_LAYOUTS } from '../data/proLayouts';
import { PDFPage } from './pdf/PDFPage';
import { ImageBlock, DataBlock, FcnBlock, CodeBlock, TitleBlock, VideoBlock, HistoryBlock } from './pdf/contentBlocks';

interface VisualPassportPDFProps {
  imageUrl: string;
  formData: FormData;
  generatedPromptJson: string;
  finalFcnFeedback: NarrativeConsistencyFeedback | null;
  generationHistory: GenerationHistory | null;
  metadata: any | null;
  layoutId: string;
}

const parsePromptData = (jsonString: string) => {
    try {
        const data = JSON.parse(jsonString);
        if (Array.isArray(data)) {
            const firstPrompt = data[0];
            return {
                refined_prompt: firstPrompt?.refined_prompt || '',
                technical_details: {},
            };
        }
        return {
            refined_prompt: data.refined_prompt || '',
            technical_details: data.technical_details || {},
        };
    } catch (e) {
        return {
            refined_prompt: jsonString,
            technical_details: {},
        };
    }
};

const PageWrapper: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <div className={`p-12 break-after-page bg-white font-helvetica ${className}`} style={{ minHeight: '1123px' }}>
        <h2 className="text-3xl font-bold text-gray-800 border-b-2 border-gray-200 pb-3 mb-8">{title}</h2>
        {children}
    </div>
);

export const VisualPassportPDF: React.FC<VisualPassportPDFProps> = ({ imageUrl, formData, generatedPromptJson, finalFcnFeedback, generationHistory, metadata, layoutId }) => {
    const { refined_prompt } = parsePromptData(generatedPromptJson);
    const a4Width = 794;

    const layout = PRO_LAYOUTS.find(l => l.id === layoutId);
    
    if (!layout) {
        console.error(`Layout con id "${layoutId}" no encontrado.`);
        return <div>Layout no encontrado.</div>;
    }

    const contentBlocks = {
        image: <ImageBlock imageUrl={imageUrl} />,
        data: <DataBlock formData={formData} />,
        fcn: <FcnBlock feedback={finalFcnFeedback} />,
        prompt: <CodeBlock prompt={refined_prompt} />,
        title: <TitleBlock title={formData.objective} />,
        video: <VideoBlock videoUrl={formData.specifics.Video?.videoUrl} />,
        history: <HistoryBlock history={generationHistory} />,
    };
    
    return (
        <div id="pdf-content" style={{ width: `${a4Width}px` }} className="bg-white text-gray-900">
             <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
                body { font-family: 'Inter', sans-serif; }
                .font-helvetica { font-family: 'Inter', sans-serif; } /* Using Inter as a web-safe substitute for Helvetica Neue */
                .font-consolas { font-family: Consolas, 'Courier New', monospace; }
                .bg-code-block { background-color: #EAEAEA; }
            `}</style>
            
            {/* Page 1: Cover */}
            <div className="w-full h-[1123px] flex flex-col justify-end p-12 bg-cover bg-center relative" style={{ backgroundImage: `url(${imageUrl})` }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
                <div className="relative z-10 text-white">
                    <h1 className="text-4xl font-bold text-white leading-tight drop-shadow-lg">{formData.objective}</h1>
                    <p className="text-lg text-gray-200 mt-2 drop-shadow-md">Pasaporte Visual de Creación</p>
                </div>
            </div>

            <PageWrapper title="Plan de Creación" className={layoutId === 'layout-06' ? '!p-0' : ''}>
                <PDFPage structure={layout.structure} contentBlocks={contentBlocks} />
            </PageWrapper>

            {/* Other pages can follow */}
        </div>
    );
};
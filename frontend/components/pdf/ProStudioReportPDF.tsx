import React from 'react';
import type { ProFormData } from '../../types';

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => {
    if (!value) return null;
    return (
        <div className="mb-4 break-inside-avoid">
            <h4 className="font-semibold text-sm text-gray-500 uppercase tracking-wider">{label}</h4>
            <p className="text-gray-800 mt-1 text-base">{value}</p>
        </div>
    );
};

export const ProStudioReportPDF: React.FC<{ formData: ProFormData; prompt: string }> = ({ formData, prompt }) => {
    return (
        <div id="pro-studio-pdf-content" className="p-12 bg-white" style={{ width: '794px', minHeight: '1123px', fontFamily: "'Inter', sans-serif" }}>
             <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
            `}</style>
            <header className="mb-10 pb-4 border-b-2 border-gray-800">
                <h1 className="text-4xl font-bold text-gray-900">Pro Studio Art Direction</h1>
                <p className="text-lg text-gray-600 mt-2">Professional Prompt Generation Report</p>
            </header>

            <section className="mb-8">
                <h2 className="text-2xl font-bold text-blue-700 mb-4 border-b pb-2">Art Direction</h2>
                <div className="columns-2 gap-8">
                    <DetailItem label="Concepto Artístico" value={formData.pro_concept} />
                    <DetailItem label="Narrativa y Emoción" value={formData.pro_emotion} />
                    <DetailItem label="Simbolismo Clave" value={formData.pro_symbolism} />
                    <DetailItem label="Regla de Composición" value={formData.pro_composition_rule} />
                    <DetailItem label="Teoría del Color" value={formData.pro_color_theory} />
                    <DetailItem label="Paleta Específica" value={formData.pro_specific_palette} />
                    <DetailItem label="Distancia Focal" value={formData.pro_focal_length} />
                    <DetailItem label="Velocidad de Obturación" value={formData.pro_shutter_speed} />
                    <DetailItem label="ISO" value={formData.pro_iso} />
                    <DetailItem label="Efectos de Lente" value={formData.pro_lens_effects} />
                    <DetailItem label="Post-Producción" value={formData.pro_post_production} />
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-blue-700 mb-4 border-b pb-2">Generated Cinematic Prompt</h2>
                <pre className="text-base bg-gray-100 p-6 rounded-lg whitespace-pre-wrap font-mono leading-relaxed border border-gray-200">{prompt}</pre>
            </section>
        </div>
    );
};
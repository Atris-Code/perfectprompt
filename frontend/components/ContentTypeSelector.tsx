import React from 'react';
import { ContentType } from '../types';
import { CONTENT_TYPES } from '../constants';

interface ContentTypeSelectorProps {
  selectedType: ContentType;
  onSelectType: (type: ContentType) => void;
}

const ICONS: Record<ContentType, React.ReactNode> = {
  [ContentType.Texto]: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  [ContentType.Imagen]: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  [ContentType.Video]: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
      <line x1="7" y1="2" x2="7" y2="22" />
      <line x1="17" y1="2" x2="17" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="2" y1="7" x2="7" y2="7" />
      <line x1="2" y1="17" x2="7" y2="17" />
      <line x1="17" y1="17" x2="22" y2="17" />
      <line x1="17" y1="7" x2="22" y2="7" />
      <polygon points="10 8 15 12 10 16 10 8" fill="currentColor" />
    </svg>
  ),
  [ContentType.Audio]: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.858 12h.01M12 12h.01M18.142 12h.01M4 12a8 8 0 1116 0 8 8 0 01-16 0z" />
    </svg>
  ),
  [ContentType.Codigo]: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
};

export const ContentTypeSelector: React.FC<ContentTypeSelectorProps> = ({ selectedType, onSelectType }) => {
  return (
    <div className="flex flex-wrap gap-2 md:gap-3 mb-6">
      {CONTENT_TYPES.map(({ id, label }) => {
        const isActive = selectedType === id;
        return (
          <button
            key={id}
            onClick={() => onSelectType(id)}
            className={`flex-grow flex items-center justify-center px-4 py-3 text-sm md:text-base font-semibold rounded-lg border-2 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:scale-105
              ${
                isActive
                  ? 'bg-blue-600 border-blue-700 text-white shadow-lg hover:bg-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-500'
              }`}
          >
            {ICONS[id]}
            {label}
          </button>
        );
      })}
    </div>
  );
};
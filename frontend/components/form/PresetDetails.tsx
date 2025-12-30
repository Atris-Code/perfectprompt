import React from 'react';
// FIX: Changed import of 'VideoPreset' from '../../data/videoPresets' to '../../types' to resolve export errors.
import type { VideoPreset } from '../../types';

export const PresetDetails: React.FC<{ preset: VideoPreset }> = ({ preset }) => {
  if (!preset) return null;

  const parameters = Object.entries(preset.parameters)
    .filter(([, value]) => typeof value === 'string' && value.trim() !== '' && value.toLowerCase() !== 'no especificado por este preset.')
    .map(([key, value]) => {
        const spacedKey = key.split('_').join(' ');
        const formattedKey = spacedKey
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        return { key: formattedKey, value };
    });

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm space-y-4 h-full">
      <p className="text-gray-700 font-medium">{preset.description}</p>
      
      {parameters.length > 0 && (
        <div className="border-t border-gray-200 pt-3">
          <h5 className="font-semibold text-gray-800 mb-2">Parámetros Clave:</h5>
          <ul className="space-y-1 list-disc list-inside text-gray-700">
              {parameters.map(({ key, value }) => (
                  <li key={key}>
                      <span className="font-semibold text-gray-800">{key}:</span>
                      <span className="ml-1">{value as string}</span>
                  </li>
              ))}
          </ul>
        </div>
      )}
      
      <div className="border-t border-gray-200 pt-3">
        <h5 className="font-semibold text-gray-800 mb-2">Bloque de Prompt para IA:</h5>
        <pre className="text-xs bg-gray-200 text-gray-700 p-3 rounded-md whitespace-pre-wrap font-mono">{preset.prompt_block}</pre>
      </div>

    </div>
  );
};

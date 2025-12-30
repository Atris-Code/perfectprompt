import React from 'react';
import { FormSelect } from './FormControls';
import { PresetDetails } from './PresetDetails';
// FIX: Changed import of 'VideoPreset' from '../../data/videoPresets' to '../../types' to resolve export errors.
import type { VideoPreset } from '../../types';

interface VideoPresetSelectorProps {
  label: string;
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  presets: VideoPreset[];
  presetMap: Map<string, VideoPreset>;
}

export const VideoPresetSelector: React.FC<VideoPresetSelectorProps> = ({
  label,
  id,
  name,
  value,
  onChange,
  presets,
  presetMap,
}) => {
  const selectedPreset = value ? presetMap.get(value) : null;

  return (
    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      {/* Columna Izquierda: Dropdown */}
      <FormSelect
        label={label}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
      >
        <option value="">Selecciona un preset...</option>
        {presets.map(preset => (
          <option key={preset.preset_name} value={preset.preset_name} title={preset.description}>
            {preset.preset_name}
          </option>
        ))}
      </FormSelect>
      
      {/* Columna Derecha: Detalles */}
      <div className="md:pt-8">
        {selectedPreset ? (
          <PresetDetails preset={selectedPreset} />
        ) : (
          <div className="h-full bg-white p-4 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-center text-sm text-gray-500 min-h-[150px]">
            <p>La información del preset aparecerá aquí.</p>
          </div>
        )}
      </div>
    </div>
  );
};

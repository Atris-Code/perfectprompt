import React from 'react';
import type { FormData, GeoContextualData, MapClickPayload } from '../../types';
import { Accordion } from './Accordion';
import { FormInput, FormSelect } from './FormControls';
import { GeoContextualValidator } from '../GeoContextualValidator';
import { MapComponent } from '../MapComponent';

interface GlobalControlsProps {
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onValidateLocation: () => void;
  vgcData: GeoContextualData | null;
  isVgcLoading: boolean;
  vgcError: string;
  onMapClick: (payload: MapClickPayload) => void;
}

const LANGUAGES = [
  'Español',
  'Inglés',
  'Francés',
  'Alemán',
  'Italiano',
  'Portugués',
  'Mandarín',
  'Japonés',
  'Coreano',
  'Ruso',
  'Árabe',
];

export const GlobalControls: React.FC<GlobalControlsProps> = ({ formData, handleChange, onValidateLocation, vgcData, isVgcLoading, vgcError, onMapClick }) => {
  return (
    <Accordion title="Modo Multilenguaje y Geo-Contextual (Configuración Global)" defaultOpen={true}>
      <FormSelect
        label="Idioma de Salida"
        id="outputLanguage"
        name="outputLanguage"
        value={formData.outputLanguage || ''}
        onChange={handleChange}
      >
        <option value="">Selecciona un idioma...</option>
        {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
      </FormSelect>

      <FormInput
        label="Localización (Contexto Geográfico)"
        id="location"
        name="location"
        placeholder="Ej. 'Quebec', 'Osaka', 'El corazón de un reactor de pirólisis'"
        value={formData.location || ''}
        onChange={handleChange}
      />

      <div className="space-y-3">
        <label className="font-medium text-gray-700">O selecciona un punto en el mapa:</label>
        <MapComponent 
          onMapClick={onMapClick}
          latitude={vgcData?.validationMode === 'FACTUAL' ? vgcData.latitude : undefined}
          longitude={vgcData?.validationMode === 'FACTUAL' ? vgcData.longitude : undefined}
        />
      </div>

      <GeoContextualValidator
        data={vgcData}
        isLoading={isVgcLoading}
        error={vgcError}
        onValidate={onValidateLocation}
        locationInput={formData.location || ''}
      />

      <FormInput
        label="Idioma Contextual (Dialecto/Acento)"
        id="contextualLanguage"
        name="contextualLanguage"
        placeholder="Ej. 'Francés Canadiense', 'Japonés de Osaka'"
        value={formData.contextualLanguage || ''}
        onChange={handleChange}
      />

      <FormInput
        label="Referencia Visual Clave"
        id="keyVisualReference"
        name="keyVisualReference"
        placeholder="Ej. 'Arquitectura Gótica', 'Bosques Boreales'"
        value={formData.keyVisualReference || ''}
        onChange={handleChange}
      />
    </Accordion>
  );
};
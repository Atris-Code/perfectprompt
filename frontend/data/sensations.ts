export interface SensationCategory {
  id: string;
  name: string;
  narrativePurpose: string;
}

export const SENSATION_CATEGORIES: SensationCategory[] = [
  { 
    id: 'S1', 
    name: 'Rigor y Precisión', 
    narrativePurpose: 'Retratos de autoridad, estudios detallados, ciencia.' 
  },
  { 
    id: 'S2', 
    name: 'Drama y Tensión', 
    narrativePurpose: 'Conflicto, horror, film noir, momentos de crisis.' 
  },
  { 
    id: 'S3', 
    name: 'Lúdico y Caprichoso', 
    narrativePurpose: 'Branding juvenil, fantasía suave, ternura, humor.' 
  },
  { 
    id: 'S4', 
    name: 'Sereno y Contemplativo', 
    narrativePurpose: 'Meditación, paisajes, introspección, bajo contraste.' 
  },
  { 
    id: 'S5', 
    name: 'Épico y Monumental', 
    narrativePurpose: 'Escala, grandeza, arquitectura, historia, destino.' 
  },
  { 
    id: 'S6', 
    name: 'Disruptivo y Caótico', 
    narrativePurpose: 'Paranoia, locura, subconsciente, crítica social.' 
  },
  { 
    id: 'S7', 
    name: 'Místico y Esotérico', 
    narrativePurpose: 'Simbolismo, sueños, lo arcano, espiritualidad.' 
  },
  { 
    id: 'S8', 
    name: 'Digital y Retro-Futurista', 
    narrativePurpose: 'Tecnología, decadencia urbana, nostalgia de nicho.' 
  }
];

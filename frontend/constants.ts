import { ContentType } from './types';

export const TONES = [
  'Agresivo/Competitivo',
  'Amistoso',
  'Analítico',
  'Casual',
  'Cínico',
  'Creativo',
  'Didáctico',
  'Dramático',
  'Estético',
  'Formal',
  'Humorístico',
  'Informativo',
  'Inspiracional',
  'Neutro',
  'Persuasivo',
  'Profesional',
  'Sereno',
];

export const CONTENT_TYPES = [
  { id: ContentType.Texto, label: 'Texto' },
  { id: ContentType.Imagen, label: 'Imagen' },
  { id: ContentType.Video, label: 'Video' },
  { id: ContentType.Audio, label: 'Audio' },
  { id: ContentType.Codigo, label: 'Código' },
];

export const TEXT_TYPES = [
  'Manifiesto de Marca (Mision)',
  'Guion de Voice-Over (Video)',
  'Análisis de Ciclo de Vida (LCA)',
  'Crítica Cinematográfica / Reseña Visual',
  'Pitch de Inversión (Llamada a la Acción)',
  'Protocolo Experimental (Metodología)',
  'Protocolo de Contingencia',
  'Email formal',
  'Artículo de blog',
  'Publicación para Redes Sociales',
  'Ficha Técnica de Proceso',
  'Informe de Sostenibilidad (ESG)',
  'Comunicado de Prensa',
  'Informe de Diligencia Debida',
];

export const TARGET_AUDIENCES = [
  'Inversores (Capital Riesgo)',
  'Gerentes Financieros (CFO)',
  'Analistas de Mercado',
  'Desarrollo de Negocios / Ventas',
  'Ingenieros Químicos / R&D',
  'Jefes de Planta (Operaciones)',
  'Público General',
  'Jóvenes adultos',
  'Inversores no técnicos',
  'Niños de 10 años',
];

export const MUSIC_GENRES = [
  {
    category: 'Orquestal y Cinematográfico',
    genres: [
      'Orquestal Épico (Hollywood Epic)',
      'Drama Íntimo (Intimate Drama)',
      'Aventura Mágica (Magical Adventure)',
      'Suspenso Minimalista (Minimalist Suspense)',
    ],
  },
  {
    category: 'Electrónico y Ambiental',
    genres: [
      'Ambient Glacial (Glacial Ambient)',
      'Synthwave Nostálgico (Nostalgic 80s Synthwave)',
      'Drone Contemplativo (Contemplative Drone)',
      'IDM / Glitch',
    ],
  },
  {
    category: 'Minimalista y Post-Clásico',
    genres: [
      'Piano Minimalista (Minimalist Piano)',
      'Cuerdas Procesadas (Processed Strings)',
      'Neoclásico Emotivo (Emotive Neoclassical)',
    ],
  },
  {
    category: 'Híbrido y Experimental',
    genres: [
      'Orquestal-Electrónico (Orchestral-Electronic Hybrid)',
      'Industrial Cinemático (Cinematic Industrial)',
    ],
  },
];


export const TONAL_SYNC_MAP: Record<string, { voiceTone: string; musicGenre: string; continuousAmbiance: string; }> = {
  'S2': { voiceTone: 'Dramático', musicGenre: 'Score Orquestal de Suspense, Jazz Noir', continuousAmbiance: 'Viento bajo, Lluvia constante, Pasos en seco' },
  'S4': { voiceTone: 'Sereno', musicGenre: 'Piano Minimalista, Música Ambiental (Ambient)', continuousAmbiance: 'Arroyo suave, Susurro del viento, Silencio profundo' },
  'S6': { voiceTone: 'Tenso', musicGenre: 'Industrial Techno, Ruido Blanco, Drones Atónicos', continuousAmbiance: 'Fallo digital (Glitch), Distorsión de radio, Voces ahogadas' },
  'S8': { voiceTone: 'Nostálgico', musicGenre: 'Synthwave 80s, Lofi Beats, Zumbidos Electrónicos', continuousAmbiance: 'Zumbido de neón, Estática de pantalla, Lluvia constante' },
  'S1': { voiceTone: 'Informativo (Neutro)', musicGenre: 'Score Minimalista (Solo Cuerdas), Pulsos Rítmicos', continuousAmbiance: 'Zumbido constante de maquinaria, Tictac de reloj' },
};
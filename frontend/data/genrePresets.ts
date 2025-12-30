// FIX: Changed import of 'VideoPreset' from './videoPresets' to '../types' to resolve export errors.
import type { VideoPreset, GenrePack } from '../types';
import { interviews, archivalFootage, bRoll, dramaticReenactments } from './documentaryPresets';

const cinemaVerite: VideoPreset[] = [
    interviews.find(p => p.preset_name === "Entrevista en Contexto (Verité)")!,
    bRoll.find(p => p.preset_name === "Seguimiento Flotante con Gimbal")!,
    bRoll.find(p => p.preset_name === "Detalle Simbólico (Symbolic Detail)")!,
];

const historicoExpositivo: VideoPreset[] = [
    interviews.find(p => p.preset_name === "Entrevista Formal de Experto")!,
    archivalFootage.find(p => p.preset_name === "Fotografía Antigua (Efecto Ken Burns)")!,
    dramaticReenactments.find(p => p.preset_name === "Siluetas y Sombras (Shadow Play)")!,
    bRoll.find(p => p.preset_name === "Escena Atmosférica (Atmospheric Scene)")!,
];

const naturalezaEpica: VideoPreset[] = [
    bRoll.find(p => p.preset_name === "Escena Atmosférica (Atmospheric Scene)")!,
    dramaticReenactments.find(p => p.preset_name === "Cámara Lenta Evocadora (Evocative Slow Motion)")!,
    interviews.find(p => p.preset_name === "Entrevista Íntima (Estilo Errol Morris)")!,
];

export const CLASSIFIED_GENRE_PRESETS: GenrePack[] = [
    {
        genre: "Cinéma Vérité",
        description: "Captura la realidad sin adornos, como si el espectador fuera un observador invisible, priorizando la autenticidad total.",
        presets: cinemaVerite
    },
    {
        genre: "Histórico Expositivo (Estilo Ken Burns)",
        description: "Construye documentales históricos clásicos, combinando narración, análisis de expertos y material de archivo de forma emotiva y clara.",
        presets: historicoExpositivo
    },
    {
        genre: "Naturaleza Épica (Estilo BBC)",
        description: "Captura la majestuosidad del mundo natural con un nivel de producción impecable, utilizando técnicas visuales que evocan asombro y admiración.",
        presets: naturalezaEpica
    }
];

export const ALL_GENRE_PRESETS: VideoPreset[] = [
    ...cinemaVerite,
    ...historicoExpositivo,
    ...naturalezaEpica,
];
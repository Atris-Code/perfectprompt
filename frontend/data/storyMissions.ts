
import type { View, FormData } from '../types';
import { ContentType } from '../types';

export interface StoryMission {
  id: string;
  title: string;
  directorPrompt: string;
  objective: string;
  targetView: View;
  formData?: Partial<FormData>;
  successCondition: string;
}

export const storyMissions: StoryMission[] = [
    // Misión 1: El Despertar (Módulo 1: Creativo)
    {
        id: 'mission-1',
        title: 'Misión 1: El Despertar',
        directorPrompt: "¡Estratega, bienvenido! La situación es crítica. Ciudad Káiros se ahoga en 500.000 toneladas de neumáticos NFU. El ayuntamiento está ciego al problema.",
        objective: "Tu primera misión: crear un 'shock visual'. Usa el Módulo 1: Núcleo Creativo y su 'Biblioteca de Estilos' para generar una metáfora visual poderosa que muestre la magnitud del desastre.",
        targetView: 'creator',
        formData: {
            contentType: ContentType.Imagen,
            objective: 'Una metáfora visual impactante del desastre de 500.000 toneladas de neumáticos NFU ahogando una ciudad.',
            tone: 'Dramático',
            specifics: {
                // FIX: Added empty objects for the other content types to satisfy the FormData.specifics type.
                [ContentType.Texto]: {},
                [ContentType.Imagen]: {
                    style: ['Surrealismo / Arte Conceptual', 'Estilo Distópico / Mate Painting Cinematográfico']
                },
                [ContentType.Video]: {},
                [ContentType.Audio]: {},
                [ContentType.Codigo]: {},
            }
        },
        successCondition: 'Evento Imagen_Generada_y_Guardada.'
    },
    // Misión 2: La Prueba Técnica (Módulo 3: Simulación)
    {
        id: 'mission-2',
        title: 'Misión 2: La Prueba Técnica',
        directorPrompt: "¡Buen trabajo! Tu imagen causó impacto. El ayuntamiento está escuchando, pero ahora los 'Industriales' escépticos dicen que es 'técnicamente imposible'.",
        objective: "Demuéstrales que están equivocados. Usa el Módulo 3: Simulador P-01 para ejecutar una simulación de pirolisis de NFU. Tu objetivo: un rendimiento de bio-aceite > 40%. Queremos datos, no solo arte.",
        targetView: 'hmi-control-room',
        formData: {}, // User operates HMI manually
        successCondition: 'Evento Simulacion_M3_Completada con yield_bio_oil > 0.40.'
    },
    // Misión 3: La Viabilidad (Módulo 5: Finanzas)
    {
        id: 'mission-3',
        title: 'Misión 3: La Viabilidad',
        directorPrompt: "¡Éxito! El rendimiento del 42% ha silenciado a los ingenieros. Pero ahora, los 'Inversores' preguntan: '¿Es esto rentable?'. Nuestro 'Evaluador de Viabilidad' inicial apenas marca 36/100.",
        objective: "Conviértelo en una oportunidad de oro. Usa el Módulo 5: Finanzas y Estrategia para ejecutar un Monte-Carlo que demuestre una Prob. de Rentabilidad > 80%.",
        targetView: 'strategic-risk-simulator',
        formData: {
          // Pre-fill data to make >80% profitability achievable
          // We can use a lower investment or higher prices
          specifics: {
            [ContentType.Texto]: {
              originalData: {
                keyInputs: {
                  opex: 1200000,
                  bioOilPrice: 550,
                  biocharPrice: 350,
                }
              }
            },
            [ContentType.Imagen]: {},
            [ContentType.Video]: {},
            [ContentType.Audio]: {},
            [ContentType.Codigo]: {},
          }
        },
        successCondition: 'Evento Simulacion_M5_Completada con prob_rentabilidad > 0.80.'
    },
    // Misión 4: El Consenso (Módulo 6: Gobernanza)
    {
        id: 'mission-4',
        title: 'Misión 4: El Consenso',
        directorPrompt: "¡El 96% de rentabilidad ha atraído a los inversores! Pero... ¡CONFLICTO! Las 'Comunidades Locales' están protestando, temen por el riesgo sanitario. ¡Han bloqueado el proyecto!",
        objective: "Necesitamos un consenso, no solo ganancias. Usa el Módulo 6: Arquitecto de Gobernanza para redactar y proponer la 'Regla de Veto Comunitario' en la DAO-light. ¡Gánate su confianza!",
        targetView: 'titans-debate',
        formData: {
            objective: "Redactar una propuesta de 'Regla de Veto Comunitario' para la DAO-light que aborde las preocupaciones de riesgo sanitario de la comunidad.",
        },
        successCondition: 'Evento Propuesta_M6_Desplegada.'
    },
    // Misión 5: La Recompensa (Perfil de Reputación)
    {
        id: 'mission-5',
        title: 'Misión 5: La Recompensa',
        directorPrompt: "¡Movimiento brillante, Estratega! La DAO-light ha aprobado tu propuesta. Las comunidades han dado luz verde. ¡Has salvado la ciudad!",
        objective: "Por tu contribución al consenso, el ecosistema te ha recompensado. Tu Reputación (Off-Chain) ha aumentado en +100 pts. Tu poder de voto on-chain ha crecido. Ve a tu Perfil de Usuario para ver tu nuevo estatus.",
        targetView: 'user-profile',
        formData: {},
        successCondition: 'Evento Perfil_Visitado.'
    },
    // Misión Final: Graduación
    {
        id: 'mission-final',
        title: 'Misión Final: Graduación',
        directorPrompt: "Has completado la campaña. Has aprendido a manejar los 6 módulos y has visto cómo la simulación, las finanzas y la gobernanza se conectan. El 'Modo Historia' está completo. El 'Modo Sandbox' (plataforma completa) está ahora desbloqueado. Buena suerte, Estratega.",
        objective: "La plataforma está ahora completamente desbloqueada. ¡Explora libremente!",
        targetView: 'manifesto',
        formData: {},
        successCondition: 'Campaña completada.'
    }
];

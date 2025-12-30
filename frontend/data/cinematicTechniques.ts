export interface CinematicTechnique {
  id: string;
  name: string;
  type: string;
  purpose: string;
  prompt_block: string;
}

export const CINEMATIC_TECHNIQUES: CinematicTechnique[] = [
  {
    id: "MOV_01",
    name: "Deep Tracking Push",
    type: "Movimiento",
    purpose: "Intimidad / Énfasis: Seguimiento gradual que intensifica la conexión con el sujeto.",
    prompt_block: "dynamic tracking shot slowly pushes in on the subject"
  },
  {
    id: "MOV_02",
    name: "Epic Rising Panorama",
    type: "Movimiento",
    purpose: "Escala / Revelación: Movimiento de grúa o dron que revela un entorno masivo o un contexto épico.",
    prompt_block: "sweeping crane shot ascends vertically to reveal the vast mountain range"
  },
  {
    id: "MOV_03",
    name: "Dolly Zoom (Efecto Vértigo)",
    type: "Movimiento",
    purpose: "Disociación / Pánico: Crea inestabilidad espacial, ideal para shock psicológico o intensa realización.",
    prompt_block: "dolly zoom effect emphasizes psychological distress"
  },
  {
    id: "MOV_04",
    name: "Plano Orbital (Orbital Shot)",
    type: "Movimiento",
    purpose: "Tensión / Suspenso: La cámara gira 360° alrededor del sujeto o acción, aislando el momento.",
    prompt_block: "the camera smoothly orbits around the stopped vehicles"
  },
  {
    id: "MOV_05",
    name: "Sutil Dolly Zoom (Acercamiento Misterioso)",
    type: "Movimiento",
    purpose: "Introspección / Curiosidad: Un ligero Vertigo Effect para un sutil desequilibrio psicológico.",
    prompt_block: "subtle dolly zoom on subject's eyes, conveying curiosity"
  },
  {
    id: "ANG_01",
    name: "Ángulo Bajo (Poder y Dominio)",
    type: "Ángulo",
    purpose: "Superioridad / Amenaza: Hace que el sujeto parezca imponente, poderoso o amenazante.",
    prompt_block: "dramatic low angle shot emphasizes the character's dominance"
  },
  {
    id: "ANG_02",
    name: "Ángulo Alto (Vulnerabilidad y Escala)",
    type: "Ángulo",
    purpose: "Vulnerabilidad / Aislamiento: Hace que el sujeto parezca pequeño, indefenso o perdido en el entorno.",
    prompt_block: "high-angle shot emphasizes the character's isolation"
  },
  {
    id: "ANG_03",
    name: "Ángulo Holandés (Tensión y Desequilibrio)",
    type: "Ángulo",
    purpose: "Inestabilidad / Suspense: Inclinación de la cámara para crear un mundo visualmente torcido.",
    prompt_block: "camera tilted at a sharp Dutch angle, conveying psychological suspense"
  },
  {
    id: "MOV_06",
    name: "Whip Pan (Transición Energética)",
    type: "Movimiento",
    purpose: "Urgencia / Transición Rápida: Transición borrosa y veloz entre dos sujetos o escenarios.",
    prompt_block: "fast whip pan transition to the chasing vehicle"
  },
  {
    id: "ANG_04",
    name: "Plano Cenital (Vista de Dios)",
    type: "Ángulo",
    purpose: "Detalle / Juicio: Perspectiva aérea directa, usada para composición gráfica o para transmitir destino.",
    prompt_block: "top-down cinematic shot emphasizes the composition of the food"
  },
  {
    id: "ANG_05",
    name: "Plano Subjetivo (Punto de Vista)",
    type: "Ángulo",
    purpose: "Inmersión / Identidad: La cámara actúa como los ojos del personaje, insertando al espectador en su perspectiva.",
    prompt_block: "subjective POV shot from the eyes of the character"
  }
];

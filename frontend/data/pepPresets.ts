import type { PepPreset } from '../types';

export const PEP_PRESETS: PepPreset[] = [
  {
    type: 'Fondo Blanco (Maniquí)',
    category: 'E-COMMERCE (Consistencia y Limpieza)',
    action: 'Cambiar el fondo por un color blanco puro (#FFFFFF). Eliminar imperfecciones sutiles en la tela y maximizar la textura de la lana.',
    technical_output: 'Iluminación de estudio, uniformidad de color, formato PNG transparente, render 4K, low contrast.'
  },
  {
    type: 'Look Uniforme (Alimentos)',
    category: 'E-COMMERCE (Consistencia y Limpieza)',
    action: 'Incrementar la saturación del color verde y marrón. Aplicar un look de alta nitidez (sharpness) sin sobre-exposición.',
    technical_output: 'Iluminación de estudio, render 8K, color grading profesional, shallow depth of field, high contrast.'
  },
  {
    type: 'Retoque de Piel Editorial',
    category: 'MODA (Editorial y Retoque High-End)',
    action: 'Retoque de piel a nivel editorial (smooth skin, no pores), pero manteniendo la textura general. Aplicar luz dura para un look dramático.',
    technical_output: 'Chiaroscuro lighting, color grading cinemático, high contrast, 35mm lens equivalent, fashion magazine quality.'
  },
  {
    type: 'Cambio de Atmósfera',
    category: 'MODA (Editorial y Retoque High-End)',
    action: 'Reemplazar el cielo por uno con nubes tormentosas y dramáticas. Aplicar un color grading con tonos fríos y saturados (azul y verde).',
    technical_output: 'Low key lighting, high contrast, cinematic quality, wide-angle lens, film grain.'
  },
  {
    type: 'Efecto de Luz Volumétrica',
    category: 'FOTOGRAFÍA (Estilo Creativo y Metáforas)',
    action: 'Oscurecer el fondo, dejando al sujeto silueteado. Aplicar Volumetric Lighting (God Rays) a través de una ventana lateral.',
    technical_output: 'High contrast, dark mood, cinematic lighting, 8K resolution, high atmospheric haze.'
  },
  {
    type: 'Estilo Cine de Autor',
    category: 'FOTOGRAFÍA (Estilo Creativo y Metáforas)',
    action: 'Aplicar el look de la película [Nombre de Película Famosa]. Reducir la saturación y crear un efecto de niebla (haze) suave.',
    technical_output: 'Low contrast, muted color palette, soft focus, natural lighting, film grain, vintage aesthetic.'
  },
  {
    type: 'Retoque de Piel Editorial (Prueba Exitosa)',
    category: 'SUGERENCIA PARA PRUEBA EXITOSA',
    style_reference_suggestion: 'Mantener la composición, el alto contraste (Chiaroscuro) y la estética geométrica y artística de la imagen fuente.',
    action: '**Retoque de Piel Editorial (High-End Retouch):** Suavizar y uniformar el tono de la piel y los músculos, eliminando imperfecciones y brillos no deseados. **Crucial:** Preservar completamente la textura natural de la piel y los poros para un hiperrealismo. Acentuar el contraste entre los colores primarios (rojo/azul) y el negro.',
    technical_output: 'Iluminación de alto contraste, acentuar la nitidez de las gotas de agua, 8K resolution, textura hiperrealista, estilo visual de revista de arte moderno.'
  },
  {
    type: 'Flujo de Proceso (W2E)',
    category: 'ECONOMÍA CIRCULAR Y BIOENERGÍA',
    style_reference_suggestion: 'Estilo: Dibujo Técnico de Ingeniería (axonometric view), bloques de color sólidos, etiquetado.',
    action: "Generar un diagrama de flujo esquemático que muestre la conversión 'Waste to Energy (W2E)' del sistema ecoHORNET: Bloque 1: Ingreso de Residuos Sólidos Urbanos (RSU); Bloque 2: Reactor de Pirólisis Rápida (150-900°C); Bloque 3: Separación de Productos. Mostrar las salidas clave: **Bioaceite**, **Biocarbón** (Biochar) y **Gas de Pirólisis**.",
    technical_output: 'Isométrico, Line Art, Render CAD 3D, colores primarios industriales (azul, amarillo), alta nitidez, sin sombras suaves.'
  },
  {
    type: 'Detalle de Reactor (Ilustración Científica)',
    category: 'ECONOMÍA CIRCULAR Y BIOENERGÍA',
    style_reference_suggestion: 'Estilo: Vista en Corte Explodida (exploded view), Line Art, dibujo científico.',
    action: "Generar un corte esquemático detallado del reactor de Pirólisis de Lecho Fluidizado. Resaltar la entrada de **Catalizador FCC** de equilibrio y el mecanismo de **calentamiento por recirculación de gas**. Etiquetar los componentes internos clave (lecho de arena, zona de reacción).",
    technical_output: 'Dibujo Técnico 2D o 3D con líneas de ensamblaje (exploded diagram), sin fondo, texto técnico legible, alta resolución.'
  },
  {
    type: 'Visualización de Compuesto (Corrosión)',
    category: 'ECONOMÍA CIRCULAR Y BIOENERGÍA',
    style_reference_suggestion: 'Metáfora Visual, Macro Shot, Alto Contraste.',
    action: "Generar un macro shot de la superficie interna de una tubería de acero corroída. Mostrar finas líneas de corrosión ácida (simbolizando el bajo pH del Bioaceite) con un sutil **vapor ácido verde** emanando de las grietas.",
    technical_output: 'Macro Lens, Chiaroscuro Lighting, color palette Cold Industrial Green and Rusted Orange, 8K, textura hiperrealista de metal.'
  },
  {
    type: 'Escena Industrial (Biorefinería)',
    category: 'ECONOMÍA CIRCULAR Y BIOENERGÍA',
    style_reference_suggestion: 'Estilo de Catálogo Industrial, Tonalidades Azules Dominantes, Iluminación Uniforme.',
    action: "Renderizar una instalación moderna de Biorefinería, mostrando al operario (vestido con EPI, sin casco) de espaldas revisando un panel de control. El fondo debe ser un cielo dramático (nubes tipo 'Cambio de Atmósfera'), acentuando la escala de la maquinaria.",
    technical_output: 'Low-key lighting con iluminación funcional sobre el equipo, wide-angle lens (24mm), 4K, alto contraste de color (Azul Maquinaria vs. Gris Concreto).'
  },
  {
    type: 'Ilustración de Composición (Macro Detalle)',
    category: 'ECONOMÍA CIRCULAR Y BIOENERGÍA',
    style_reference_suggestion: 'Estilo: Dibujo Científico, Micro-escala, Color-Coding de componentes.',
    action: 'Generar un close-up macro de la estructura lignocelulósica (Celulosa, Hemicelulosa y Lignina). Mostrar las cadenas poliméricas rompiéndose por efecto del calor (fragmentación de enlaces glucosídicos). Usar líneas guía para etiquetar cada componente.',
    technical_output: 'Render 8K, Macro lens, colores simbólicos por componente (ej. Celulosa en azul, Lignina en rojo), sin fondo, texto técnico legible.'
  },
  {
    type: 'Detalle de Tecnología (Quemador de Pellets)',
    category: 'ECONOMÍA CIRCULAR Y BIOENERGÍA',
    style_reference_suggestion: 'Estilo: Dibujo Técnico en Corte (Cross-section), alta temperatura.',
    action: 'Generar una vista en corte (cross-section) de una cámara de combustión de pellets. Mostrar la zona de alta temperatura (>1200°C) y el proceso de **combustión ecológica y completa** del pellet. Usar gradientes de color que simulen calor intenso.',
    technical_output: 'Render CAD, Line Art con sombreado de color, Volumetric Lighting (emisión de calor intensa), alto contraste (negro/naranja/rojo).'
  },
  {
    type: 'Flujo de Recepción y Procesamiento',
    category: 'ECONOMÍA CIRCULAR Y BIOENERGÍA',
    style_reference_suggestion: 'Estilo: Flowchart Industrial (Diagrama de bloques y equipos isométricos), ambiente limpio de planta.',
    action: 'Generar una secuencia visual de 4 pasos para la preparación de la biomasa forestal: 1. Recepción (Camión descargando). 2. Triturado (reducción de tamaño a <10mm [cite: 2829]). 3. Secado (usando calor residual). 4. Pelletizado.',
    technical_output: 'Diagrama secuencial isométrico (vista 3/4), etiquetado con flechas de flujo, fondo blanco/gris industrial, alta nitidez.'
  },
  {
    type: 'Metáfora Ecológica (Biochar - Terra Preta)',
    category: 'ECONOMÍA CIRCULAR Y BIOENERGÍA',
    style_reference_suggestion: 'Estilo: Ilustración Científica de Suelos, Textura Detallada, Comparación.',
    action: "Generar una vista en corte (cross-section) del suelo. Mostrar dos paneles comparativos: 1. Suelo Normal (sin enmienda). 2. Suelo con Biochar (partículas negras y porosas). Resaltar las partículas de Biochar reteniendo agua y nutrientes con un efecto sutilmente azul y brillante.",
    technical_output: "Macro shot, textura orgánica detallada (tierra), colores naturales intensos (verde y marrón), etiquetado: 'Biochar' vs. 'Suelo Común'."
  },
  {
    type: 'Detalle de Rotor',
    category: 'ECONOMÍA CIRCULAR Y BIOENERGÍA',
    style_reference_suggestion: 'Estilo: Dibujo Técnico en Corte (Cross-section), alta temperatura.',
    action: "Generar un corte esquemático detallado del reactor de Pirólisis de Lecho Fluidizado. Resaltar la entrada de **Catalizador FCC** de equilibrio y el mecanismo de **calentamiento por recirculación de gas**. Etiquetar los componentes internos clave (lecho de arena, zona de reacción).",
    technical_output: 'Dibujo Técnico 2D o 3D con líneas de ensamblaje (exploded diagram), sin fondo, texto técnico legible, alta resolución.'
  }
];
// FIX: Changed import of 'VideoPreset' from './videoPresets' to '../types' to resolve export errors.
import type { VideoPreset } from '../types';

// FIX: Export 'interviews' to make it available for import in other modules.
export const interviews: VideoPreset[] = [
    {
        "preset_name": "Entrevista Íntima (Estilo Errol Morris)",
        "category": "Entrevistas",
        "description": "Un estilo de entrevista personal y profundo donde el sujeto mira directamente a la cámara (y por tanto, al espectador), creando una conexión directa y sin intermediarios.",
        "parameters": {
            "camera_movement": "Cámara completamente estática.",
            "lens_and_focus": "Lente de retrato (50-85mm) con profundidad de campo muy selectiva (shallow depth of field) para aislar al sujeto. El enfoque es clavado en los ojos.",
            "visual_style": "Composición centrada. El sujeto mira directamente a la lente (efecto 'Interrotron').",
            "lighting": "Iluminación de estudio suave y controlada (soft key light, fill light, backlight) que modela el rostro y crea una atmósfera íntima.",
            "color_grading": "Colores ricos y cinematográficos, a menudo con tonos cálidos para generar cercanía.",
            "environment_dynamics": "El fondo está desenfocado y a menudo oscuro o neutro para no distraer de la expresión del sujeto."
        },
        "prompt_block": "Interview Style: An intimate, Errol Morris-style interview. Subject looks directly into the lens. Camera is static. Lens: A 50-85mm portrait lens with a very shallow depth of field, isolating the subject. Lighting: Soft, controlled, cinematic three-point lighting. Background is out-of-focus and non-distracting. Atmosphere is intimate and confessional."
    },
    {
        "preset_name": "Entrevista Formal de Experto",
        "category": "Entrevistas",
        "description": "El formato clásico para entrevistas a expertos, académicos o funcionarios, donde el sujeto mira ligeramente fuera de cámara, transmitiendo autoridad y conocimiento.",
        "parameters": {
            "camera_movement": "Cámara estática en un trípode.",
            "lens_and_focus": "Lente estándar (35-50mm). El sujeto está encuadrado siguiendo la regla de los tercios, dejando espacio en la dirección de su mirada.",
            "visual_style": "Look limpio y profesional. A menudo se utilizan dos cámaras para alternar entre un plano medio y un primer plano.",
            "lighting": "Iluminación corporativa o de estudio, brillante y uniforme, que proyecta confianza y autoridad.",
            "color_grading": "Colores neutros y balance de blancos correcto.",
            "environment_dynamics": "El fondo es relevante pero no distrae: una biblioteca, un laboratorio, una oficina."
        },
        "prompt_block": "Interview Style: A formal expert interview. The subject looks slightly off-camera. Framing follows the rule of thirds, leaving look-room. Lighting is bright, clean, and professional (corporate style). The background is relevant to the subject's expertise (e.g., a bookshelf, a lab) but softly blurred. The overall tone is authoritative and informative."
    },
    {
        "preset_name": "Entrevista en Contexto (Verité)",
        "category": "Entrevistas",
        "description": "Un estilo de entrevista documental donde la conversación ocurre en el entorno natural del sujeto mientras realiza una actividad, dando una sensación de autenticidad.",
        "parameters": {
            "camera_movement": "Cámara en mano (handheld) o en un gimbal, siguiendo al sujeto mientras se mueve y trabaja.",
            "lens_and_focus": "Lente gran angular (24-35mm) para capturar tanto al sujeto como su entorno. El enfoque sigue la acción.",
            "visual_style": "Estilo documental, crudo y auténtico.",
            "lighting": "Se utiliza la luz natural o disponible en el lugar para un máximo realismo.",
            "color_grading": "Color naturalista, que refleja la luz real del entorno.",
            "environment_dynamics": "El sujeto no está posando, sino inmerso en su trabajo o vida cotidiana. El sonido ambiente es parte de la escena."
        },
        "prompt_block": "Interview Style: A run-and-gun documentary interview. The subject is interviewed on-location, within their natural context (e.g., a workshop, a kitchen). Camera: Handheld, following the subject's actions. Lighting: Uses natural and available light. The style is authentic, immersive, and vérité."
    },
    {
        "preset_name": "Entrevista de Contraluz Anónima",
        "category": "Entrevistas",
        "description": "Un estilo utilizado para proteger la identidad de un sujeto, colocándolo a contraluz para crear una silueta. Ideal para testimonios sensibles o de 'whistleblowers'.",
        "parameters": {
            "camera_movement": "Cámara estática.",
            "lens_and_focus": "Enfoque profundo para mantener nítida la silueta contra el fondo.",
            "visual_style": "El sujeto es una silueta completamente oscura, sin detalles faciales visibles.",
            "lighting": "Una fuente de luz muy brillante (key light) colocada directamente detrás del sujeto, apuntando hacia la cámara. No hay luz de relleno frontal.",
            "color_grading": "A menudo desaturado o con un tono frío para aumentar el dramatismo y la seriedad.",
            "environment_dynamics": "El fondo suele ser una ventana brillante o un fondo de estudio iluminado. La voz del sujeto puede ser distorsionada digitalmente para mayor anonimato."
        },
        "prompt_block": "Interview Style: Anonymous whistleblower interview. The subject is completely silhouetted against a bright background (e.g., a blown-out window). Lighting: A single, hard backlight creates the silhouette, with no frontal fill light. The subject's features are obscured in shadow. The atmosphere is tense and secretive. The subject's voice is digitally pitch-shifted for anonymity."
    },
    {
        "preset_name": "Entrevista en Grupo Dinámica",
        "category": "Entrevistas",
        "description": "Captura la interacción y conversación entre múltiples personas, cambiando el foco de atención para seguir el flujo del diálogo.",
        "parameters": {
            "camera_movement": "La cámara puede estar en un slider para moverse suavemente entre los sujetos, o realizar paneos lentos.",
            "lens_and_focus": "Profundidad de campo media para mantener a varios sujetos en foco. Se utilizan cambios de foco (rack focus) para guiar la atención del espectador de un hablante a otro.",
            "visual_style": "Plano medio o plano americano que encuadra a 2-4 personas. La composición busca mostrar la conexión o tensión entre ellos.",
            "lighting": "Iluminación suave que cubre a todos los participantes de manera uniforme.",
            "color_grading": "Color natural y acogedor.",
            "environment_dynamics": "Los sujetos interactúan entre sí, no solo con el entrevistador. El sonido captura las interrupciones y el flujo natural de la conversación."
        },
        "prompt_block": "Interview Style: A dynamic group conversation. Camera: A medium shot on a slider, smoothly moving to reframe speakers. Focus: Uses rack focus to shift attention between subjects as they talk. Lighting: Soft, even lighting that covers all participants. The style captures the natural interaction and energy of a multi-person dialogue."
    }
];

// FIX: Export 'archivalFootage' to make it available for import in other modules.
export const archivalFootage: VideoPreset[] = [
    {
        "preset_name": "Fotografía Antigua (Efecto Ken Burns)",
        "category": "Material de Archivo (Archival Footage)",
        "description": "Anima fotografías estáticas con un movimiento de paneo y zoom lento y suave, una técnica clásica para dar vida a material de archivo fotográfico.",
        "parameters": {
            "camera_movement": "Panorámica (pan) y/o zoom digital muy lento y suave sobre una imagen estática.",
            "lens_and_focus": "N/A (la imagen es 2D).",
            "visual_style": "La imagen base es una fotografía en blanco y negro o sepia, con arañazos, polvo y bordes desgastados.",
            "lighting": "N/A (definido por la foto original).",
            "color_grading": "Tinte sepia o monocromático desaturado.",
            "environment_dynamics": "El movimiento revela lentamente detalles o rostros dentro de la fotografía."
        },
        "prompt_block": "Archival Style: Ken Burns effect on a vintage photograph. A slow, smooth pan and zoom movement across a static, old photo (sepia or black and white). Visuals: The photo has visible dust, scratches, and faded, worn edges. The movement is deliberate, guiding the viewer's eye to key details within the image."
    },
    {
        "preset_name": "Película de 16mm (Noticiero de Época)",
        "category": "Material de Archivo (Archival Footage)",
        "description": "Simula la estética del metraje de noticieros o películas caseras de mediados del siglo XX, grabado en película de 16mm.",
        "parameters": {
            "camera_movement": "Ligera inestabilidad y vibración del fotograma (gate weave).",
            "lens_and_focus": "Enfoque suave (soft focus) con bordes ligeramente borrosos.",
            "visual_style": "Grano de película muy pronunciado, polvo, arañazos verticales y ocasionales quemaduras de fotograma (film burn).",
            "lighting": "Exposición inconsistente con parpadeos (flicker).",
            "color_grading": "Colores desaturados y virados hacia tonos sepia o verdosos.",
            "environment_dynamics": "Relación de aspecto 4:3."
        },
        "prompt_block": "Archival Style: 16mm newsreel footage. Aspect Ratio: 4:3. Visuals: Heavy film grain, vertical scratches, dust, and sporadic film burns at transitions. Motion: A subtle, constant gate weave (frame instability) and flicker. Color: Desaturated colors, often with a sepia or faded color cast. Focus is generally soft."
    },
    {
        "preset_name": "Video VHS (Años 80 y 90)",
        "category": "Material de Archivo (Archival Footage)",
        "description": "Emula la apariencia del video analógico grabado en cintas VHS, característico de los años 80 y 90.",
        "parameters": {
            "camera_movement": "Movimiento de cámara en mano inestable, típico de las videocámaras de la época.",
            "lens_and_focus": "Baja resolución y nitidez general. Enfoque automático que a veces 'busca' (focus hunting).",
            "visual_style": "Líneas de tracking horizontales, ruido de video (video noise), y sangrado de color (color bleeding).",
            "lighting": "Iluminación a menudo dura, proveniente de la luz de la cámara.",
            "color_grading": "Colores sobresaturados, especialmente los rojos, con un balance de blancos a menudo incorrecto.",
            "environment_dynamics": "Relación de aspecto 4:3. A menudo con una superposición de texto (timestamp) con la fecha y la hora."
        },
        "prompt_block": "Archival Style: VHS recording from the 80s y 90s. Aspect Ratio: 4:3. Visuals: Low resolution, soft image, with analog video noise, horizontal tracking lines, and color bleeding. Motion: Shaky, handheld camera movement. Color: Oversaturated colors, particularly reds, with an imperfect white balance. Optional: a digital timestamp in the corner."
    },
    {
        "preset_name": "Super 8mm Film Casero",
        "category": "Material de Archivo (Archival Footage)",
        "description": "Evoca la nostalgia de las películas caseras de los años 60 y 70. Se caracteriza por sus colores cálidos, grano suave y una sensación de recuerdo personal.",
        "parameters": {
            "camera_movement": "Movimiento de cámara en mano amateur, con paneos y zooms a veces torpes.",
            "lens_and_focus": "Enfoque suave y una perceptible viñeta oscura en los bordes.",
            "visual_style": "Grano de película prominente pero orgánico. Fugas de luz (light leaks) anaranjadas o rojizas y perforaciones de película visibles en los bordes del fotograma.",
            "lighting": "A menudo sobreexpuesto por la luz del sol.",
            "color_grading": "Paleta de colores muy cálida y saturada, con un fuerte tinte amarillo o anaranjado. Los colores evocan nostalgia.",
            "environment_dynamics": "Relación de aspecto 4:3. El sonido característico de un proyector de película puede añadirse."
        },
        "prompt_block": "Archival Style: Nostalgic Super 8mm home movie. Aspect Ratio: 4:3. Visuals: Prominent film grain, warm orange light leaks, and visible film sprockets on the edges. Motion: Amateur handheld camera movement with occasional clumsy zooms. Color: A very warm, saturated color palette creating a nostalgic, dream-like feeling of a personal memory."
    },
    {
        "preset_name": "Pantalla de Ordenador Antigua (CRT)",
        "category": "Material de Archivo (Archival Footage)",
        "description": "Simula la visualización de contenido digital en un monitor de tubo de rayos catódicos (CRT) de los años 80 o 90.",
        "parameters": {
            "camera_movement": "Plano estático, como si se filmara una pantalla.",
            "lens_and_focus": "El 'contenido' de la pantalla es de baja resolución y pixelado.",
            "visual_style": "Líneas de escaneo (scanlines) horizontales visibles. Ligera curvatura de la pantalla en los bordes. Parpadeo (flicker) sutil.",
            "lighting": "El resplandor de la pantalla ilumina la escena.",
            "color_grading": "Los colores están ligeramente desvanecidos y pueden mostrar un ligero 'ghosting' o separación de RGB en los bordes de alto contraste.",
            "environment_dynamics": "Relación de aspecto 4:3. A menudo acompañado por el zumbido de baja frecuencia del monitor."
        },
        "prompt_block": "Archival Style: Retro CRT computer monitor display. Aspect Ratio: 4:3. Visuals: The screen content is low-resolution and pixelated, with visible horizontal scanlines and a subtle flicker. A slight barrel distortion mimics the curved glass of the screen. Colors are slightly faded with minor RGB ghosting on high-contrast edges."
    }
];

// FIX: Export 'bRoll' to make it available for import in other modules.
export const bRoll: VideoPreset[] = [
    {
        "preset_name": "Detalle Simbólico (Symbolic Detail)",
        "category": "Tomas de Recurso (B-Roll)",
        "description": "Un primer plano extremo o macro de un objeto que tiene una carga simbólica o metafórica, utilizado para reforzar el tema de la narración.",
        "parameters": {
            "camera_movement": "Cámara estática o un movimiento de slider muy lento y sutil para revelar el detalle.",
            "lens_and_focus": "Lente macro con una profundidad de campo extremadamente selectiva (razor-thin depth of field) para aislar el objeto.",
            "visual_style": "Estilo muy cinematográfico y cuidado, casi como la fotografía de un producto.",
            "lighting": "Iluminación dramática y con textura que resalta los detalles de la superficie del objeto (polvo, arañazos, etc.).",
            "color_grading": "Los colores pueden ser manipulados para reforzar la emoción (ej. desaturado para melancolía).",
            "environment_dynamics": "El objeto está a menudo en un contexto que le da significado. El sonido se enfoca en los detalles (ej. el tic-tac de un reloj)."
        },
        "prompt_block": "B-Roll Style: A cinematic extreme close-up (macro shot) of a symbolic object. Camera is static or on a very slow slider. Focus: Razor-thin depth of field, isolating a specific texture or detail. Lighting: Dramatic, textured lighting that reveals surface imperfections. The shot is designed to be metaphorical and visually poetic."
    },
    {
        "preset_name": "Escena Atmosférica (Atmospheric Scene)",
        "category": "Tomas de Recurso (B-Roll)",
        "description": "Un plano general amplio y a menudo sin gente, diseñado para establecer el tono, el lugar y la atmósfera de una sección del documental.",
        "parameters": {
            "camera_movement": "Plano estático en un trípode o un paneo muy lento y contemplativo.",
            "lens_and_focus": "Lente gran angular con enfoque profundo (deep focus) para mostrar la inmensidad del lugar.",
            "visual_style": "Estilo muy pictórico y compositivamente fuerte, a menudo filmado durante la 'golden hour' o la 'blue hour'.",
            "lighting": "Luz natural y atmosférica que define el estado de ánimo (ej. niebla matutina, sol de atardecer, luces de la ciudad por la noche).",
            "color_grading": "La gradación de color es clave para establecer el tono emocional de la escena.",
            "environment_dynamics": "El único movimiento es el de los elementos naturales (nubes, viento en los árboles, olas). El sonido es puramente ambiental."
        },
        "prompt_block": "B-Roll Style: A painterly, wide, establishing shot of a location to set the mood. Camera is static or panning very slowly. Focus: Deep focus to capture the entire environment. Lighting: Natural, atmospheric lighting (e.g., golden hour, misty morning) is the key element, defining the scene's emotional tone. Often there are no people in the shot."
    },
    {
        "preset_name": "Proceso en Acción (Process Shot)",
        "category": "Tomas de Recurso (B-Roll)",
        "description": "Una secuencia de planos cortos y detallados que muestran cómo se hace algo, ya sea un proceso artesanal, industrial o científico.",
        "parameters": {
            "camera_movement": "Una mezcla de planos estáticos y en cámara lenta (slow motion) para enfatizar los detalles del proceso.",
            "lens_and_focus": "Lentes macro para capturar los detalles más pequeños. El enfoque sigue la acción con precisión.",
            "visual_style": "Estilo limpio y claro, centrado en la acción. A menudo se utilizan ángulos cenitales (top-down) para una mejor comprensión.",
            "lighting": "Iluminación clara y funcional que muestra cada paso del proceso sin ambigüedad.",
            "color_grading": "Colores naturales y realistas.",
            "environment_dynamics": "Se centra en las manos de una persona trabajando o en la maquinaria en funcionamiento. El diseño de sonido es diegético y se centra en los sonidos del proceso."
        },
        "prompt_block": "B-Roll Style: A sequence of clean, detailed close-up shots showing a process. A mix of real-time and slow-motion footage. Focus: Sharp focus follows the action, often with a macro lens. Lighting: Clear, functional lighting to show every step without ambiguity. The shots are often from a top-down angle for clarity."
    },
    {
        "preset_name": "Seguimiento Flotante con Gimbal",
        "category": "Tomas de Recurso (B-Roll)",
        "description": "Un movimiento de cámara moderno y fluido que sigue a un sujeto, creando una sensación de inmersión y viaje.",
        "parameters": {
            "camera_movement": "Movimiento de cámara estabilizado con un gimbal, a menudo siguiendo a un sujeto por detrás o de lado mientras camina.",
            "lens_and_focus": "Lente gran angular (24-35mm) con una profundidad de campo relativamente selectiva para separar al sujeto del fondo.",
            "visual_style": "Estilo cinematográfico, suave y pulido.",
            "lighting": "Generalmente se utiliza luz natural, a menudo durante la 'golden hour' para un efecto más poético.",
            "color_grading": "Gradación de color cinematográfica para realzar la atmósfera del entorno.",
            "environment_dynamics": "Captura al sujeto moviéndose a través de un entorno significativo, mostrando su viaje o rutina."
        },
        "prompt_block": "B-Roll Style: A smooth, floating gimbal follow-shot. The camera tracks a subject from behind or the side as they move through an environment. Lens: A wide-angle lens with a shallow depth of field. The motion is perfectly stabilized, creating an immersive and cinematic feeling of journey and presence."
    },
    {
        "preset_name": "Plano Cenital Organizado (Knolling)",
        "category": "Tomas de Recurso (B-Roll)",
        "description": "Un plano estático desde una perspectiva cenital (top-down) que muestra objetos meticulosamente organizados en ángulos de 90 grados.",
        "parameters": {
            "camera_movement": "Cámara completamente estática, posicionada directamente sobre la escena.",
            "lens_and_focus": "Enfoque profundo para mantener todos los objetos nítidos.",
            "visual_style": "Estilo muy gráfico, limpio y minimalista. La composición se basa en la geometría y el orden.",
            "lighting": "Iluminación plana, suave y sin sombras para no crear distracciones y enfatizar la forma de los objetos.",
            "color_grading": "Colores limpios y a menudo una paleta de colores controlada.",
            "environment_dynamics": "Los objetos (herramientas, ingredientes, documentos) están perfectamente alineados sobre una superficie plana, contando una historia a través de su disposición."
        },
        "prompt_block": "B-Roll Style: A top-down 'knolling' shot. The camera is static and positioned directly overhead. Various objects are meticulously arranged in parallel or 90-degree angles on a flat surface. Lighting is flat, soft, and shadowless. The style is highly graphic, organized, and minimalist."
    }
];

// FIX: Export 'dramaticReenactments' to make it available for import in other modules.
export const dramaticReenactments: VideoPreset[] = [
    {
        "preset_name": "Recreación Cinematográfica",
        "category": "Recreaciones Dramáticas",
        "description": "Una recreación de alta calidad, con actores y vestuario, filmada con un estilo cinematográfico para dar vida a eventos pasados con gran impacto visual.",
        "parameters": {
            "camera_movement": "Movimientos de cámara deliberados y suaves (sliders, dollies) como en una película de ficción.",
            "lens_and_focus": "Lentes cinematográficas (prime lenses) con profundidad de campo selectiva para dirigir la atención.",
            "visual_style": "Look de alta producción, con atención al detalle en el vestuario, la dirección de arte y la localización.",
            "lighting": "Iluminación dramática y controlada que define el tono de la escena (ej. clave baja para misterio).",
            "color_grading": "Gradación de color cinematográfica y estilizada que unifica la paleta de colores.",
            "environment_dynamics": "Los actores recrean la acción, pero generalmente sin diálogos audibles, acompañados por la voz en off del narrador."
        },
        "prompt_block": "Dramatic Reenactment Style: A high-production, cinematic reenactment. Camera: Deliberate and smooth movements (sliders, dollies). Lighting: Controlled, dramatic lighting to set the mood. Visuals: Meticulous attention to art direction, costumes, and location. Actors perform the scene without audible dialogue, driven by the narrator's voiceover. Color is stylized and cinematic."
    },
    {
        "preset_name": "Siluetas y Sombras (Shadow Play)",
        "category": "Recreaciones Dramáticas",
        "description": "Un estilo de recreación abstracto y evocador que utiliza siluetas y sombras para sugerir eventos sin mostrarlos explícitamente, ideal para temas sensibles o misteriosos.",
        "parameters": {
            "camera_movement": "Cámara estática, enfocada en la interacción de las sombras.",
            "lens_and_focus": "Enfoque profundo para mantener nítidas tanto las figuras como las sombras que proyectan.",
            "visual_style": "Alto contraste, a menudo en blanco y negro. Las figuras son siluetas oscuras contra un fondo iluminado.",
            "lighting": "Una única fuente de luz dura colocada detrás de los actores (backlight) para crear las siluetas.",
            "color_grading": "Monocromático o con un tinte de color muy fuerte y simbólico (ej. rojo sangre, azul frío).",
            "environment_dynamics": "Las sombras de los actores en una pared cuentan la historia."
        },
        "prompt_block": "Dramatic Reenactment Style: An abstract shadow play. Visuals: Actors are shown only as dark silhouettes against a brightly lit background. High-contrast, often in black and white. Lighting: A single, hard backlight source is used to create the silhouettes. The focus is on the shape and movement of the shadows, suggesting events rather than showing them explicitly."
    },
    {
        "preset_name": "Cámara Lenta Evocadora (Evocative Slow Motion)",
        "category": "Recreaciones Dramáticas",
        "description": "Utiliza la cámara lenta para recrear un recuerdo o un momento crucial, dándole un peso poético y emocional.",
        "parameters": {
            "camera_movement": "Movimiento de cámara flotante (floating) o orbital lento alrededor de la acción.",
            "lens_and_focus": "Enfoque suave (soft focus) con una profundidad de campo muy selectiva.",
            "visual_style": "Grabado a una velocidad de fotogramas muy alta (high-frame-rate) para una reproducción en cámara lenta fluida y detallada. A menudo combinado con efectos como fugas de luz (light leaks) o partículas de polvo para una sensación de recuerdo.",
            "lighting": "Luz suave y difusa, a menudo a contraluz (backlit) para crear un halo alrededor de los sujetos.",
            "color_grading": "Colores desaturados o con un tinte cálido y nostálgico.",
            "environment_dynamics": "La acción se desarrolla a una velocidad reducida. El sonido es a menudo amortiguado o reemplazado por música emotiva."
        },
        "prompt_block": "Dramatic Reenactment Style: An evocative slow-motion memory. Motion: The scene is shot at a high frame rate and played back in slow motion. Focus: Soft focus with a shallow depth of field. Lighting: Soft, diffused, and often backlit to create an ethereal halo. Visuals are enhanced with floating dust particles or light leaks to evoke a sense of memory."
    },
    {
        "preset_name": "Fragmentos de Memoria",
        "category": "Recreaciones Dramáticas",
        "description": "Un estilo de recreación no lineal y sensorial para representar recuerdos confusos, fragmentados o traumáticos.",
        "parameters": {
            "camera_movement": "Cámara en mano muy inestable, con movimientos bruscos (whip pans) y jump cuts.",
            "lens_and_focus": "Enfoque errático (focus pulling), alternando entre detalles nítidos (un ojo, una mano) y planos completamente desenfocados.",
            "visual_style": "Secuencia de cortes muy rápidos de primeros planos extremos. Uso de obturador lento (slow shutter) para crear estelas de movimiento (motion blur).",
            "lighting": "Iluminación parpadeante o estroboscópica.",
            "color_grading": "Colores desaturados o una paleta de colores muy distorsionada para crear una sensación de desasosiego.",
            "environment_dynamics": "El sonido es clave: fragmentos de diálogo, sonidos impactantes amplificados (un portazo, un cristal roto) y un zumbido de fondo."
        },
        "prompt_block": "Dramatic Reenactment Style: Fragmented memory. A non-linear sequence of jarring jump cuts, shaky handheld camera, and erratic rack focus pulls. The shots are extreme close-ups (eyes, hands, objects). A slow shutter speed creates motion blur. The lighting is flickering. The sound design is distorted and unsettling."
    },
    {
        "preset_name": "Punto de Vista Subjetivo (POV)",
        "category": "Recreaciones Dramáticas",
        "description": "Coloca al espectador directamente en la perspectiva en primera persona del protagonista de la historia.",
        "parameters": {
            "camera_movement": "La cámara se mueve como si fuera la cabeza del personaje, con el temblor natural de los pasos y los movimientos de la mirada.",
            "lens_and_focus": "Lente gran angular (18-24mm) para imitar el campo de visión humano.",
            "visual_style": "Las manos o los pies del personaje pueden aparecer en el borde del encuadre. La 'cámara' puede interactuar con objetos.",
            "lighting": "Iluminación naturalista, tal como la vería el personaje.",
            "color_grading": "Realista, para aumentar la inmersión.",
            "environment_dynamics": "El sonido es completamente diegético y desde la perspectiva del personaje: su propia respiración, sus pasos, las voces de otros dirigiéndose a 'él'."
        },
        "prompt_block": "Dramatic Reenactment Style: First-person point of view (POV). The camera simulates the character's head movements, including natural shake from walking. A wide-angle lens mimics the human field of vision. The character's hands are often visible in the frame as they interact with the environment. The sound is entirely diegetic from the character's perspective (breathing, footsteps)."
    }
];

export const ALL_DOCUMENTARY_PRESETS: VideoPreset[] = [
  ...interviews,
  ...archivalFootage,
  ...bRoll,
  ...dramaticReenactments,
];

export const CLASSIFIED_DOCUMENTARY_PRESETS = [
    { category: "Entrevistas", presets: interviews },
    { category: "Material de Archivo (Archival Footage)", presets: archivalFootage },
    { category: "Tomas de Recurso (B-Roll)", presets: bRoll },
    { category: "Recreaciones Dramáticas", presets: dramaticReenactments },
];
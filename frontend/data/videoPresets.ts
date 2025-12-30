import type { VideoPreset } from '../types';

const cameraMovements: VideoPreset[] = [
    {
        preset_name: "Plano Estático (Static Shot)",
        category: "Lenguaje de la Cámara (Movimientos y Ángulos)",
        description: "Un plano completamente inmóil, ideal para composiciones formales, entrevistas o para crear una sensación de calma u observación.",
        parameters: {
            cameraMovement: "Sin movimiento, cámara en trípode.",
            visualStyle: "Estable, formal, observacional.",
        },
        prompt_block: "a completely static shot on a tripod, stable and unmoving"
    },
    {
        preset_name: "Plano Orbital (Orbital Shot)",
        category: "Lenguaje de la Cámara (Movimientos y Ángulos)",
        description: "La cámara gira 360° alrededor del sujeto o de una acción, aislando el momento y creando una sensación de importancia o tensión.",
        parameters: {
            cameraMovement: "Movimiento circular suave alrededor del sujeto.",
            visualStyle: "Cinematográfico, envolvente.",
        },
        prompt_block: "a smooth 360-degree orbital shot, circling the subject to isolate them in the moment"
    },
];

const visualStyles: VideoPreset[] = [
    {
        preset_name: "Film Noir Look",
        category: "Estilos Visuales y Fílmicos",
        description: "Evoca el cine negro clásico con alto contraste, sombras profundas y una atmósfera de misterio.",
        parameters: {
            visualStyle: "Monocromático o con colores muy desaturados.",
            colorGrading: "Blanco y negro de alto contraste.",
        },
        prompt_block: "classic film noir aesthetic, high-contrast black and white, dramatic chiaroscuro lighting, deep shadows, urban night setting"
    },
    {
        preset_name: "Orange-Teal Color Grading",
        category: "Estilos Visuales y Fílmicos",
        description: "Una paleta de color moderna y popular en el cine de acción y ciencia ficción, que contrasta tonos de piel cálidos (naranja) con fondos fríos (azul verdoso).",
        parameters: {
            visualStyle: "Moderno, cinematográfico, de alto impacto.",
            colorGrading: "Tonos de piel empujados hacia el naranja/amarillo; sombras y fondos empujados hacia el cian/azul.",
        },
        prompt_block: "modern cinematic look with an orange and teal color grade, warm skin tones against cool, cyan-blue shadows and backgrounds"
    },
];

const soundDesigns: VideoPreset[] = [
    {
        preset_name: "Ambiente Cósmico Inmersivo",
        category: "Diseño de Sonido",
        description: "Crea un paisaje sonoro vasto y etéreo, ideal para ciencia ficción o escenas contemplativas.",
        parameters: {
            soundDesign: "Zumbidos de baja frecuencia, pulsos sintetizados, reverberaciones largas.",
            musicGenre: "Música ambiental (Ambient), drones.",
            enableAdvancedSpatialAudio: "true",
            acousticEnvironmentScale: "cosmico",
            surfaceMaterials: "Vacío, Metal, Cristal",
            attenuationCurve: "inversa",
            listenerPosition: "Flotando en el centro",
        },
        prompt_block: "immersive cosmic soundscape, deep low-frequency hums, synthesized pulses, long reverbs, ambient space drones"
    },
    {
        preset_name: "Batalla Épica (Epic Battle)",
        category: "Diseño de Sonido",
        description: "Un diseño de sonido caótico y de alto impacto para escenas de acción o guerra.",
        parameters: {
            soundDesign: "Explosiones, impactos metálicos, gritos, disparos.",
            musicGenre: "Score orquestal épico y percusivo.",
            enableAdvancedSpatialAudio: "true",
            soundPositioning: "Explosiones en todas direcciones, proyectiles cruzando el campo estéreo.",
            acousticEnvironmentScale: "exterior",
            environmentWidth: "200",
            environmentHeight: "50",
            environmentDepth: "200",
            surfaceMaterials: "Tierra, Metal, Hormigón",
            enableDoppler: "true",
            attenuationCurve: "logaritmica",
        },
        prompt_block: "epic battle sound design, loud explosions, metallic impacts, chaotic shouting, intense percussive orchestral score"
    },
    {
        preset_name: "Lluvia en el Bosque (Inmersivo)",
        category: "Diseño de Sonido",
        description: "Sonido de lluvia inmersivo con detalles espaciales para una sensación de estar dentro de un bosque denso.",
        parameters: {
            soundDesign: "Lluvia constante con variaciones de intensidad, truenos lejanos.",
            enableAdvancedSpatialAudio: "true",
            soundPositioning: "Gotas de lluvia cayendo por todas partes, algunas cercanas sobre hojas, otras lejanas. Un trueno distante se mueve de izquierda a derecha.",
            acousticEnvironmentScale: "estandar",
            environmentWidth: "50",
            environmentHeight: "30",
            environmentDepth: "50",
            surfaceMaterials: "Tierra húmeda, Hojas mojadas, Corteza de árbol",
            enableSoundOcclusion: "true",
            attenuationCurve: "logaritmica",
            listenerPosition: "Centro de la escena, bajo un árbol grande",
            hrtfProfile: "Por Defecto",
        },
        prompt_block: "immersive forest rain sound design, spatialized raindrops, distant thunder moving left to right, wet leaves, damp earth acoustics"
    },
    {
        preset_name: "Interior de Nave Espacial (Silencioso)",
        category: "Diseño de Sonido",
        description: "Ambiente de una nave espacial silenciosa, con el zumbido de la maquinaria y sonidos de la interfaz.",
        parameters: {
            soundDesign: "Zumbido de baja frecuencia constante, beeps de consolas, sonido de puerta presurizada.",
            enableAdvancedSpatialAudio: "true",
            soundPositioning: "Zumbido de baja frecuencia generalizado. Beeps de una consola a la derecha del oyente. El sonido de una puerta presurizada se abre detrás del oyente.",
            acousticEnvironmentScale: "estandar",
            environmentWidth: "10",
            environmentHeight: "4",
            environmentDepth: "15",
            surfaceMaterials: "Metal, Plástico, Vidrio",
            enableSoundOcclusion: "true",
            attenuationCurve: "lineal",
            listenerPosition: "Sentado en la silla del piloto, centro-frontal",
            hrtfProfile: "KEMAR",
        },
        prompt_block: "quiet spaceship interior ambiance, low-frequency hum, console beeps to the right, pressurized door sound from behind, metallic reverberation"
    },
    {
        preset_name: "Ambiente Industrial Eficiente",
        category: "Diseño de Sonido",
        description: "Crea una atmósfera industrial limpia, moderna y potente. Se centra en el zumbido controlado de la maquinaria, clics mecánicos precisos y el sutil siseo de los sistemas presurizados, evitando ruidos caóticos o sucios.",
        parameters: {
            soundDesign: "Sonido de fondo de zumbido de maquinaria pesada pero controlada, clics neumáticos precisos y rítmicos, siseo suave de vapor o gas.",
            musicGenre: "Pulsos electrónicos rítmicos y minimalistas.",
        },
        prompt_block: "sound design of an efficient industrial environment: a controlled low-frequency hum of machinery, rhythmic pneumatic clicks, and the soft hiss of pressurized systems, accompanied by a minimalist, rhythmic electronic pulse."
    }
];

const musicScores: VideoPreset[] = [
    {
        preset_name: "Score Orquestal Minimalista",
        category: "Música para Score Emocional",
        description: "Música orquestal sutil y repetitiva que crea una atmósfera emotiva sin ser intrusiva, al estilo de Hans Zimmer o Jóhann Jóhannsson.",
        parameters: {
            musicGenre: "Cuerdas (violines, cellos), piano, sintetizadores de fondo con patrones melódicos simples y repetitivos.",
        },
        prompt_block: "a minimalist orchestral score in the style of Hans Zimmer and Jóhann Jóhannsson, featuring simple, repetitive string patterns, a lonely piano, and sustained synthesizer pads"
    },
    {
        preset_name: "Drama Cinematográfico Intenso",
        category: "Música para Score Emocional",
        description: "Una pieza orquestal dramática y creciente, perfecta para momentos de revelación o conflicto.",
        parameters: {
            musicGenre: "Orquesta completa con cuerdas ascendentes, metales potentes y percusión épica.",
        },
        prompt_block: "an intense and building cinematic orchestral drama score, featuring soaring strings, powerful brass sections, and epic percussion for a climactic moment."
    },
    {
        preset_name: "Aventura Épica y Grandiosa",
        category: "Música para Score Emocional",
        description: "Música de aventura inspiradora y heroica, ideal para paisajes grandiosos o actos de valentía.",
        parameters: {
            musicGenre: "Tema orquestal heroico con fanfarrias de metales, cuerdas arrolladoras y coros.",
        },
        prompt_block: "an epic and grandiose adventure score, featuring a heroic orchestral theme with brass fanfares, sweeping strings, and a powerful choir."
    },
    {
        preset_name: "Synthwave Nostálgico de los 80",
        category: "Música para Score Emocional",
        description: "Un track de sintetizador retro con baterías electrónicas, evocando una atmósfera de neón y nostalgia.",
        parameters: {
            musicGenre: "Sintetizadores analógicos, arpegios, batería electrónica con reverb, línea de bajo pulsante.",
        },
        prompt_block: "a nostalgic 80s synthwave track with analog synths, driving arpeggios, gated reverb drums, and a pulsating bassline, neon-drenched retro atmosphere."
    },
    {
        preset_name: "Ambient Electrónico Contemplativo",
        category: "Música para Score Emocional",
        description: "Un paisaje sonoro electrónico minimalista y atmosférico para escenas introspectivas o de ciencia ficción.",
        parameters: {
            musicGenre: "Pads de sintetizador etéreos, texturas de drones, pulsos sutiles y reverberaciones largas.",
        },
        prompt_block: "a contemplative and atmospheric ambient electronic soundscape, with ethereal synth pads, drone textures, subtle pulses, and long, spacious reverbs."
    },
    {
        preset_name: "Tensión y Suspenso Minimalista",
        category: "Música para Score Emocional",
        description: "Música de suspenso que crea tensión a través de elementos minimalistas y disonantes.",
        parameters: {
            musicGenre: "Cuerdas disonantes (drones, pizzicato), pulsos de sintetizador de baja frecuencia, silencios tensos.",
        },
        prompt_block: "a minimalist tension and suspense score, using dissonant string drones, low-frequency synth pulses, and tense silences to build an unsettling atmosphere."
    }
];

const environments: VideoPreset[] = [
    {
        preset_name: "Desierto Apocalíptico (Wasteland)",
        category: "Entornos y Atmósferas",
        description: "Crea un paisaje desolado y post-apocalíptico, con colores áridos y una sensación de abandono.",
        parameters: {
            environment: "Tierra agrietada, ruinas de edificios, vehículos oxidados, cielo brumoso.",
            colorGrading: "Paleta de colores desaturada con tonos amarillos, naranjas y marrones.",
        },
        prompt_block: "a desolate post-apocalyptic wasteland, cracked earth, decaying ruins under a harsh, hazy sun. Desaturated orange and brown color palette"
    },
];

const vfx: VideoPreset[] = [
    {
        preset_name: "Partículas Mágicas (Energy Wisps)",
        category: "Efectos Visuales (VFX)",
        description: "Añade partículas de energía etéreas que flotan y se arremolinan en la escena, ideal para fantasía o ciencia ficción.",
        parameters: {
            vfx: "Partículas de luz flotantes y brillantes que dejan estelas suaves. El color de las partículas es un azul etéreo.",
        },
        prompt_block: "ethereal, glowing blue energy wisps and magical particles floating and swirling through the scene"
    }
];

export const ALL_VIDEO_PRESETS: VideoPreset[] = [
    ...cameraMovements,
    ...visualStyles,
    ...soundDesigns,
    ...musicScores,
    ...environments,
    ...vfx
];

export const CLASSIFIED_VIDEO_PRESETS = [
    { category: "Lenguaje de la Cámara (Movimientos y Ángulos)", presets: cameraMovements },
    { category: "Estilos Visuales y Fílmicos", presets: visualStyles },
    { category: "Diseño de Sonido", presets: soundDesigns },
    { category: "Música para Score Emocional", presets: musicScores },
    { category: "Entornos y Atmósferas", presets: environments },
    { category: "Efectos Visuales (VFX)", presets: vfx },
];

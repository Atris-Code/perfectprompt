export interface CinematicPromptData {
  title: string;
  concept: string;
  ia_prompt: string;
  phases: {
    title: string;
    description: string;
  }[];
}

export interface CinematicFormula {
  id: string;
  title: string;
  description: string;
  explanation: {
    introduction: string;
    phases: {
      title: string;
      points: string[];
    }[];
  };
  prompts: CinematicPromptData[];
}

export const formulaData: CinematicFormula[] = [
  {
    id: 'formula-1',
    title: 'La Fórmula Cinematográfica: "Del Detalle al Contexto"',
    description: 'Una técnica de "revelación progresiva" muy potente que es fundamental en el cine para construir atmósfera y emoción. Se empieza con un detalle íntimo para generar tensión y luego se amplía el plano para revelar un contexto que evoca vulnerabilidad o un drama mayor.',
    explanation: {
      introduction: 'Esta técnica se basa en una progresión de tres fases para guiar a la IA.',
      phases: [
        {
          title: 'Fase 1: El Gancho (Tensión y Drama)',
          points: [
            "Plano: Empieza con un Extreme Close-Up o un plano detalle/macro.",
            "Enfoque: Se centra en un objeto, una reflexión, una textura o una pequeña acción (una mano que tiembla, una gota que cae, un parpadeo).",
            "Atmósfera: Usa adjetivos que generen intriga o tensión. La iluminación es clave: contrastes fuertes, luz baja (low-key), reflejos."
          ]
        },
        {
          title: 'Fase 2: El Movimiento (La Transición)',
          points: [
            "Cámara: Define un movimiento de cámara suave y deliberado. Los más efectivos son: slow pull-back (retroceso lento), dolly out (la cámara se aleja sobre raíles), o un crane shot (la cámara se eleva).",
            "Ritmo: El movimiento debe ser lento para que la revelación sea gradual e impactante."
          ]
        },
        {
          title: 'Fase 3: La Revelación (Vulnerabilidad y Escala)',
          points: [
            "Plano: Termina en un Wide Shot (plano general) o un Establishing Shot (plano de establecimiento).",
            "Contraste: El contexto revelado debe contrastar con el detalle inicial. Si el detalle era claustrofóbico, el contexto es vasto. Si el detalle era un acto de control, el contexto muestra una pérdida total de él.",
            "Emoción: El personaje, ahora visto en su totalidad, parece pequeño, aislado, abrumado o frágil frente a la inmensidad de su entorno."
          ]
        }
      ]
    },
    prompts: [
      {
        title: 'Prompt 1: El Detective Solitario',
        concept: 'Un detective al límite de un caso que lo consume.',
        ia_prompt: 'Video cinematográfico, estilo neo-noir, anamórfico.',
        phases: [
          {
            title: 'Fase 1 (Tensión/Drama)',
            description: 'Comienza con un plano macro de una fotografía de evidencia sobre una mesa de madera desgastada. Una gota de café cae lentamente desde el borde de una taza y está a punto de golpear la foto. Iluminación de alto contraste, solo la luz de una lámpara de escritorio ilumina la escena, el resto está en sombras profundas (chiaroscuro).',
          },
          {
            title: 'Fase 2 (Transición)',
            description: 'La cámara retrocede muy lentamente (slow pull-back), manteniendo el foco en la gota de café hasta que cae.',
          },
          {
            title: 'Fase 3 (Vulnerabilidad/Revelación)',
            description: 'Al retroceder, la cámara revela que la mesa está en medio de un archivo policial enorme y desordenado. Un detective, con aspecto agotado, está sentado desplomado en su silla, completamente solo en la inmensa sala llena de estanterías que se pierden en la oscuridad. Su figura es pequeña y está abrumada por la escala del caso que lo rodea.',
          },
        ],
      },
      {
        title: 'Prompt 2: La Bailarina Silenciosa',
        concept: 'La soledad y la presión de una artista antes de salir a escena.',
        ia_prompt: 'Video cinematográfico, colores desaturados y fríos, grano de película fino.',
        phases: [
          {
            title: 'Fase 1 (Tensión/Drama)',
            description: 'Plano detalle extremo de los dedos de una bailarina atando con un nudo tembloroso las cintas de sus zapatillas de punta. Vemos el desgaste de la tela y la tensión en sus manos. La única luz es un rayo de luz polvorienta que entra desde fuera del plano.',
          },
          {
            title: 'Fase 2 (Transición)',
            description: 'Una vez atado el nudo, la cámara se eleva muy lentamente (slow crane shot), ascendiendo en un movimiento fluido.',
          },
          {
            title: 'Fase 3 (Vulnerabilidad/Revelación)',
            description: 'La cámara revela a la bailarina, una figura diminuta y solitaria, de pie en la oscuridad de las bambalinas. Frente a ella se intuye el escenario inmenso y vacío de un teatro de ópera monumental. La escala del lugar la hace parecer increíblemente frágil y sola ante la magnitud de su actuación.',
          },
        ],
      },
      {
        title: 'Prompt 3: El Último Superviviente',
        concept: 'Un atisbo de esperanza en un mundo devastado.',
        ia_prompt: 'Video cinematográfico, estilo post-apocalíptico, paleta de colores terrosa y grisácea.',
        phases: [
          {
            title: 'Fase 1 (Tensión/Drama)',
            description: 'Empieza con un plano macro de una pequeña planta verde con una flor diminuta, abriéndose paso a través de una grieta en el asfalto. El enfoque es muy selectivo (shallow depth of field), desenfocando todo lo demás. La tensión está en la fragilidad de esta única forma de vida.',
          },
          {
            title: 'Fase 2 (Transición)',
            description: 'La cámara realiza un dolly out muy lento, retrocediendo en línea recta sobre el suelo agrietado.',
          },
          {
            title: 'Fase 3 (Vulnerabilidad/Revelación)',
            description: 'La cámara revela a una única figura humana, vestida con harapos, de pie en medio de las ruinas de una autopista colapsada que se extiende por una ciudad en ruinas. La persona mira la pequeña flor, pareciendo insignificante y vulnerable en medio de la devastación masiva, donde ese pequeño brote es su única fuente de esperanza.',
          },
        ],
      },
      {
        title: 'Prompt 4: El Programador Acorralado',
        concept: 'La presión y el aislamiento en la era digital.',
        ia_prompt: 'Video cinematográfico, look de thriller moderno, tonos azules y verdes de monitor, reflejos en la lente.',
        phases: [
          {
            title: 'Fase 1 (Tensión/Drama)',
            description: 'Plano extremo del reflejo en la pupila de un ojo muy abierto. En el reflejo vemos líneas de código cayendo rápidamente por una pantalla, como en "The Matrix". El ojo parpadea con nerviosismo.',
          },
          {
            title: 'Fase 2 (Transición)',
            description: 'La cámara se aleja rápidamente (whip pan / pull-back) desde el ojo, cruzando el reflejo del monitor.',
          },
          {
            title: 'Fase 3 (Vulnerabilidad/Revelación)',
            description: 'Se revela a un joven programador, iluminado únicamente por la luz de su monitor, sentado en el suelo de un centro de datos enorme y frío. Está rodeado por filas y filas de servidores imponentes con luces parpadeantes. Parece un prisionero, una figura pequeña y orgánica atrapada en una jaula de metal y datos.',
          },
        ],
      },
      {
        title: 'Prompt 5: La Reina en la Sombra',
        concept: 'El peso de la corona y la soledad del poder.',
        ia_prompt: 'Video cinematográfico, estética de drama de época, iluminación inspirada en pinturas de Rembrandt.',
        phases: [
          {
            title: 'Fase 1 (Tensión/Drama)',
            description: 'Plano detalle de un anillo real muy ornamentado en un dedo. La mano aprieta con fuerza el terciopelo del brazo de un trono, hasta que los nudillos se ponen blancos. La tensión es palpable en este simple gesto de poder y angustia.',
          },
          {
            title: 'Fase 2 (Transición)',
            description: 'La cámara se aleja lentamente en un arco (slow arc shot), moviéndose hacia atrás y hacia un lado.',
          },
          {
            title: 'Fase 3 (Vulnerabilidad/Revelación)',
            description: 'La cámara revela a una joven reina, vestida con pesadas ropas de ceremonia, sentada completamente sola en un trono gigantesco que se encuentra en el centro de un salón del trono inmenso, oscuro y vacío. Los altos techos y las columnas de mármol la hacen parecer una niña, aplastada por el peso y la soledad de su poder.',
          },
        ],
      },
      {
        title: 'Prompt 6: El Archivero y el Secreto',
        concept: 'El momento en que un historiador descubre una verdad que podría cambiarlo todo, y la soledad de ese conocimiento.',
        ia_prompt: 'Video cinematográfico, iluminación de bajo contraste con un solo haz de luz, atmósfera polvorienta.',
        phases: [
          {
            title: 'Fase 1 (Tensión/Drama)',
            description: 'Comienza con un plano macro de la punta de un dedo enguantado que tiembla ligeramente mientras traza una firma casi borrada en un manuscrito antiguo y frágil. Motas de polvo bailan en el único rayo de luz que ilumina el documento. La tensión reside en la fragilidad del papel y la importancia del hallazgo.',
          },
          {
            title: 'Fase 2 (Transición)',
            description: 'La cámara retrocede muy lentamente (slow pull-back), elevándose ligeramente para ampliar la perspectiva.',
          },
          {
            title: 'Fase 3 (Vulnerabilidad/Revelación)',
            description: 'La cámara revela a un único archivero o historiador, de pie frente a un pequeño escritorio de lectura. La persona está completamente empequeñecida por las estanterías monumentales de un archivo subterráneo que se pierden en la penumbra. El silencio es absoluto, y la figura solitaria carga con el peso de un secreto histórico en la inmensidad del conocimiento olvidado.',
          },
        ],
      },
      {
        title: 'Prompt 7: La Presión del Examen Final',
        concept: 'El aislamiento y la ansiedad aplastante de un momento académico decisivo.',
        ia_prompt: 'Video cinematográfico, estética minimalista y fría, arquitectura imponente, sonido de un reloj resonando.',
        phases: [
          {
            title: 'Fase 1 (Tensión/Drama)',
            description: 'Plano detalle de la punta de un lápiz de grafito flotando con indecisión sobre una compleja ecuación matemática en una hoja de examen. Una gota de sudor cae de la frente del estudiante y golpea el papel, creando una pequeña mancha traslúcida. El enfoque es extremadamente selectivo.',
          },
          {
            title: 'Fase 2 (Transición)',
            description: 'La cámara se eleva verticalmente en un movimiento de grúa (crane shot) lento y perfectamente estable, directamente hacia arriba.',
          },
          {
            title: 'Fase 3 (Vulnerabilidad/Revelación)',
            description: 'Se revela que el estudiante está sentado en un único pupitre en el centro exacto de un aula magna o salón de exámenes gigantesco y completamente vacío. La arquitectura es brutalista y opresiva, y las hileras de sillas vacías magnifican su soledad y la inmensa presión del momento.',
          },
        ],
      },
      {
        title: 'Prompt 8: El Astrónomo y el Cosmos',
        concept: 'El sobrecogimiento y la soledad de un descubrimiento cósmico.',
        ia_prompt: 'Video cinematográfico, tonos azules profundos y negros, lens flare anamórfico sutil, sensación de noche profunda.',
        phases: [
          {
            title: 'Fase 1 (Tensión/Drama)',
            description: 'Plano extremo de un ojo humano mirando a través del ocular de un telescopio. Vemos en el reflejo de su córnea el brillo de una galaxia o nebulosa lejana y desconocida. El ojo está muy abierto, lleno de asombro y una contención dramática.',
          },
          {
            title: 'Fase 2 (Transición)',
            description: 'La cámara se aleja lentamente del telescopio (dolly out), moviéndose hacia atrás en la oscuridad del observatorio.',
          },
          {
            title: 'Fase 3 (Vulnerabilidad/Revelación)',
            description: 'La cámara revela al astrónomo como una silueta solitaria operando un telescopio masivo dentro de la cúpula de un observatorio. La cúpula está abierta, mostrando un cielo nocturno sobrecogedoramente vasto y lleno de estrellas en una montaña remota. La figura humana parece insignificante ante la inmensidad del universo que está presenciando.',
          },
        ],
      },
      {
        title: 'Prompt 9: El Arqueólogo en la Zanja',
        concept: 'La delicadeza y el aislamiento del trabajo de campo, conectando con un pasado frágil.',
        ia_prompt: 'Video cinematográfico, luz del amanecer, paleta de colores áridos (ocres y naranjas), viento soplando suavemente.',
        phases: [
          {
            title: 'Fase 1 (Tensión/Drama)',
            description: 'Un plano macro de un pincel suave barriendo con extrema delicadeza los últimos granos de arena de un artefacto de cerámica antiguo y frágil, parcialmente enterrado. La tensión está en la posibilidad de que se rompa con un solo movimiento en falso.',
          },
          {
            title: 'Fase 2 (Transición)',
            description: 'La cámara retrocede a muy baja altura (low angle pull-back), casi rozando el suelo del yacimiento.',
          },
          {
            title: 'Fase 3 (Vulnerabilidad/Revelación)',
            description: 'Se revela a un arqueólogo arrodillado y completamente solo en el fondo de una enorme zanja de excavación en medio de un desierto o un paisaje desolado. La vasta extensión del terreno baldío que lo rodea al amanecer resalta su trabajo minucioso y solitario, haciéndolo parecer vulnerable contra los elementos y el tiempo.',
          },
        ],
      },
      {
        title: 'Prompt 10: El Compositor Bloqueado',
        concept: 'La lucha interna y la exposición del artista frente a la página en blanco.',
        ia_prompt: 'Video cinematográfico, iluminación de escenario (un solo foco), alto contraste, estilo de drama psicológico.',
        phases: [
          {
            title: 'Fase 1 (Tensión/Drama)',
            description: 'Plano detalle de las teclas de marfil de un piano. Una mano se cierne sobre ellas, los dedos tensos, incapaz de decidirse a tocar. Vemos el reflejo distorsionado del rostro del músico en la superficie pulida y negra del piano, su expresión es de pura frustración.',
          },
          {
            title: 'Fase 2 (Transición)',
            description: 'La cámara inicia un movimiento en arco lento (slow arc shot) que se aleja y rodea al músico y al piano.',
          },
          {
            title: 'Fase 3 (Vulnerabilidad/Revelación)',
            description: 'El movimiento revela que el compositor y su gran piano se encuentran en el centro de un escenario inmenso de una sala de conciertos vacía y oscura. Un único foco cenital lo ilumina, creando un círculo de luz opresivo. El silencio y el vacío del auditorio magnifican su bloqueo creativo, exponiendo su vulnerabilidad como artista.',
          },
        ],
      },
    ],
  },
];
import type { ProLayout } from '../types';

export const PRO_LAYOUTS: ProLayout[] = [
  // Visual Layouts
  {
    id: 'layout-01',
    title: 'Layout 01: Jerarquía Descendente',
    rationale: 'El layout más fundamental y ortodoxo. La imagen grande ancla la página, y la información fluye lógicamente de lo visual a lo analítico (datos), luego a lo descriptivo (texto) y finalmente a la aplicación (código).',
    category: 'visual',
    structure: {
      type: 'flex', direction: 'col', gap: 6,
      items: [{ id: 'image' }, { id: 'title' }, { id: 'fcn' }, { id: 'data' }, { id: 'prompt' }]
    }
  },
  {
    id: 'layout-02',
    title: 'Layout 02: Estructura Orientada a Datos',
    rationale: 'Ideal para un "Pasaporte Visual" donde los datos clave son primordiales. Los datos tabulares se presentan primero para una evaluación inmediata. La imagen sirve como verificación visual.',
    category: 'visual',
    structure: {
        type: 'flex', direction: 'col', gap: 6,
        items: [
            { id: 'fcn' }, { id: 'data' },
            { 
              type: 'flex', 
              direction: 'col', 
              className: 'border-t-2 border-[#00BFFF] mt-4 pt-6', 
              gap: 6, 
              items: [{id: 'image'}, {id: 'prompt'}] 
            }
        ]
    }
  },
  {
    id: 'layout-03',
    title: 'Layout 03: Ruptura con Imagen en Eje Medio',
    rationale: 'Utiliza la imagen grande como un poderoso eje horizontal, separando visualmente la descripción principal de los datos técnicos y el código. Efectivo para páginas donde el texto debe leerse primero.',
    category: 'visual',
    structure: {
        type: 'flex', direction: 'col', gap: 6,
        items: [{ id: 'data' }, { id: 'image' }, { id: 'fcn' }, { id: 'prompt' }]
    }
  },
  {
    id: 'layout-04',
    title: 'Layout 04: Título Asimétrico y Bloque de Contenido',
    rationale: 'Un enfoque clásico del Swiss Design. El título se desplaza a la izquierda, creando una fuerte línea vertical y tensión dinámica. Los bloques de contenido están indentados, creando una ruta de lectura limpia.',
    category: 'visual',
    structure: {
        type: 'grid', columns: 12, gap: 6,
        items: [
            { id: 'title', span: 4 },
            {
                type: 'flex', direction: 'col', span: 8, gap: 6,
                items: [{ id: 'image' }, { id: 'fcn' }, { id: 'data' }, { id: 'prompt' }]
            }
        ]
    }
  },
  {
    id: 'layout-05',
    title: 'Layout 05: Enfoque Principal en el Código',
    rationale: 'Diseñado para documentación donde el código es el elemento más crítico. El fragmento de código se presenta primero en un bloque claramente definido. La imagen, el texto y los datos proporcionan contexto.',
    category: 'visual',
    structure: {
        type: 'flex', direction: 'col', gap: 6,
        items: [{ id: 'prompt' }, { id: 'image' }, { id: 'data' }, { id: 'fcn' }]
    }
  },
  {
    id: 'layout-06',
    title: 'Layout 06: Imagen a Sangre Completa con Contenido Superpuesto',
    rationale: 'Un layout más dinámico visualmente. La imagen se extiende hasta los bordes, creando una experiencia inmersiva. El contenido se inserta con un margen generoso, pareciendo flotar sobre un fondo limpio.',
    category: 'visual',
    structure: {
        type: 'flex', className: 'relative h-full',
        items: [
            { id: 'image', className: 'absolute inset-0 -m-12' },
            {
                type: 'flex', direction: 'col', className: 'relative p-16 w-full h-full',
                items: [
                    {
                        type: 'flex', direction: 'col', gap: 6,
                        className: 'bg-white/90 p-8 rounded-lg shadow-lg backdrop-blur-sm',
                        items: [{ id: 'fcn' }, { id: 'data' }, { id: 'prompt' }]
                    }
                ]
            }
        ]
    }
  },
  {
    id: 'layout-07',
    title: 'Layout 07: Flujo Invertido (Visual Ascendente)',
    rationale: 'Invierte la jerarquía estándar. Al colocar la imagen grande en la parte inferior, la página obliga al lector a procesar toda la información textual y de datos primero.',
    category: 'visual',
    structure: {
        type: 'flex', direction: 'col', className: 'h-full',
        items: [
            {
                type: 'flex', direction: 'col', className: 'flex-grow', gap: 6,
                items: [{ id: 'data' }, { id: 'fcn' }, { id: 'prompt' }]
            },
            { id: 'image' }
        ]
    }
  },
  {
    id: 'layout-08',
    title: 'Layout 08: Bloque Dual de Pasaporte',
    rationale: 'Crea un fuerte bloque superior que combina la imagen principal con datos tabulares clave. Están alineados en la parte superior, creando un emparejamiento equilibrado pero asimétrico.',
    category: 'visual',
    structure: {
        type: 'flex', direction: 'col', gap: 6,
        items: [
            {
                type: 'grid', columns: 2, gap: 6,
                items: [
                    { id: 'image', span: 1 },
                    { id: 'fcn', span: 1, className: 'flex flex-col justify-center' }
                ]
            },
            { id: 'data' },
            { id: 'prompt' }
        ]
    }
  },
  {
    id: 'layout-09',
    title: 'Layout 09: Campo de Texto Dominante',
    rationale: 'Para páginas con mucho texto. El bloque de texto tiene el espacio principal. La imagen, la tabla y el código son subordinados, dispuestos de forma compacta en la mitad inferior de la página.',
    category: 'visual',
    structure: {
        type: 'flex', direction: 'col', className: 'h-full',
        items: [
            {
                type: 'flex', direction: 'col', className: 'flex-grow', gap: 6,
                items: [{ id: 'data' }, { id: 'prompt' }]
            },
            {
                type: 'grid', columns: 2, gap: 6,
                items: [{ id: 'image', span: 1 }, { id: 'fcn', span: 1 }]
            }
        ]
    }
  },
  {
    id: 'layout-10',
    title: 'Layout 10: Minimalista con Regla Vertical',
    rationale: 'Utiliza una única y delgada regla vertical de color cian para definir la columna de contenido principal. Es un elemento de rejilla sutil pero potente que guía la vista hacia abajo.',
    category: 'visual',
    structure: {
        type: 'flex', direction: 'row', gap: 6,
        items: [
            { type: 'flex', items: [], className: 'w-1 bg-[#00BFFF] flex-shrink-0' }, // The rule
            {
                type: 'flex', direction: 'col', gap: 6, className: 'flex-grow',
                items: [{ id: 'image' }, { id: 'fcn' }, { id: 'data' }, { id: 'prompt' }]
            }
        ]
    }
  },
  {
    id: 'layout-11',
    title: 'Layout 11: Enfoque Audiovisual',
    rationale: 'Un layout diseñado para pasaportes de video. El bloque de video es el protagonista, seguido por el análisis (FCN) y los datos de producción. Ideal para mostrar el resultado de un prompt de video.',
    category: 'visual',
    structure: {
      type: 'flex', direction: 'col', gap: 6,
      items: [{ id: 'title' }, { id: 'video' }, { id: 'fcn' }, { id: 'data' }, { id: 'prompt' }]
    }
  },
  // Text/Code Layouts
  {
    id: 'layout-12',
    title: 'Layout 12: Artículo Clásico de Una Columna',
    rationale: 'Un encabezado claro con título, autor y resumen establece el contexto. El contenido fluye en una única columna ancha, ideal para una lectura secuencial e ininterrumpida.',
    category: 'text_code',
    structure: {
      type: 'flex', direction: 'col', gap: 6,
      items: [{ id: 'title' }, { id: 'data' }, { id: 'prompt', className: 'bg-[#F0F0F0] p-4 rounded' }]
    }
  },
  {
    id: 'layout-13',
    title: 'Layout 13: Estructura Estándar a Dos Columnas',
    rationale: 'El título y el resumen abarcan el ancho de la página, mientras que el cuerpo del texto se divide en dos columnas para facilitar la lectura rápida y evitar la fatiga visual.',
    category: 'text_code',
    structure: {
      type: 'flex', direction: 'col', gap: 6,
      items: [
        { id: 'title' },
        {
          type: 'grid', columns: 2, gap: 6,
          items: [{ id: 'data', span: 1 }, { id: 'data', span: 1 }]
        },
        { id: 'prompt', className: 'bg-[#F0F0F0] p-4 rounded' }
      ]
    }
  },
  {
    id: 'layout-14',
    title: 'Layout 14: Asimetría con Columna de Anotación',
    rationale: 'Una columna estrecha a la izquierda para metadatos o anotaciones mantiene el flujo de la columna principal de texto extremadamente limpio y ordenado.',
    category: 'text_code',
    structure: {
      type: 'grid', columns: 12, gap: 6,
      items: [
        { id: 'fcn', span: 3, className: 'text-sm' }, // using fcn for metadata
        {
          type: 'flex', direction: 'col', span: 9, gap: 4, items: [
            { id: 'data' },
            { id: 'prompt', className: 'bg-[#F0F0F0] p-4 rounded' }
          ]
        }
      ]
    }
  },
  {
    id: 'layout-15',
    title: 'Layout 15: Bloque de Encabezado Definido',
    rationale: 'Separa visualmente la información de identificación (título, autores) del cuerpo del artículo mediante un bloque con un fondo gris claro, creando una jerarquía inmediata.',
    category: 'text_code',
    structure: {
      type: 'flex', direction: 'col', gap: 0,
      items: [
        { id: 'title', className: 'bg-[#F0F0F0] p-6 rounded-t-lg' },
        { id: 'data', className: 'p-6' },
        { id: 'prompt', className: 'bg-[#F0F0F0] p-4 rounded-b-lg mx-6 mb-6' }
      ]
    }
  },
  {
    id: 'layout-16',
    title: 'Layout 16: Código como Eje Central',
    rationale: 'Para documentos donde un algoritmo o bloque de código es el protagonista. El código se sitúa en el centro de la página, actuando como un punto focal.',
    category: 'text_code',
    structure: {
      type: 'flex', direction: 'col', gap: 6,
      items: [
        { id: 'data' },
        { id: 'prompt', className: 'bg-[#F0F0F0] p-6 rounded shadow-lg' },
        { id: 'data' }
      ]
    }
  },
  {
    id: 'layout-17',
    title: 'Layout 17: Flujo de Texto con Código Integrado',
    rationale: 'Un bloque de código pequeño se inserta limpiamente en una columna, mientras que un bloque más importante interrumpe el flujo y se extiende a ambas columnas.',
    category: 'text_code',
    structure: {
      type: 'flex', direction: 'col', gap: 6,
      items: [
        {
          type: 'grid', columns: 2, gap: 6,
          items: [
            { id: 'data' },
            { type: 'flex', direction: 'col', gap: 4, items: [{ id: 'data' }, { id: 'prompt', className: 'bg-[#F0F0F0] p-4 rounded' }] }
          ]
        },
        { id: 'prompt', className: 'bg-[#F0F0F0] p-6 rounded' }
      ]
    }
  },
  {
    id: 'layout-18',
    title: 'Layout 18: Margen Ancho Funcional',
    rationale: 'Utiliza un margen exterior excepcionalmente amplio como un área funcional para encabezados de sección, comentarios o números de línea.',
    category: 'text_code',
    structure: {
      type: 'grid', columns: 12, gap: 6,
      items: [
        { id: 'fcn', span: 4, className: 'text-right pr-4' },
        { type: 'flex', direction: 'col', span: 8, gap: 4, items: [{ id: 'data' }, { id: 'prompt', className: 'bg-[#F0F0F0] p-4 rounded' }] }
      ]
    }
  },
  {
    id: 'layout-19',
    title: 'Layout 19: Resumen como Barra Lateral',
    rationale: 'Trata al resumen y las palabras clave como un elemento de referencia constante en una barra lateral, separada por una fina línea vertical cian.',
    category: 'text_code',
    structure: {
      type: 'grid', columns: 12, gap: 6,
      items: [
        {
          type: 'flex', direction: 'col', span: 9, gap: 4, items: [
            { id: 'data' }, { id: 'prompt', className: 'bg-[#F0F0F0] p-4 rounded' }
          ]
        },
        {
          type: 'flex', direction: 'col', span: 3, gap: 6,
          className: 'border-l-2 border-[#00BFFF] pl-6', items: [{ id: 'fcn' }]
        }
      ]
    }
  },
  {
    id: 'layout-20',
    title: 'Layout 20: Prioridad en la Densidad del Código',
    rationale: 'Los bloques de código están claramente separados pero integrados en el flujo de una sola columna, diferenciados por sangría y un fondo gris.',
    category: 'text_code',
    structure: {
      type: 'flex', direction: 'col', gap: 4,
      items: [
        { id: 'data' },
        { id: 'prompt', className: 'bg-[#F0F0F0] p-4 rounded ml-4' },
        { id: 'data' },
        { id: 'prompt', className: 'bg-[#F0F0F0] p-4 rounded ml-4' },
        { id: 'data' },
      ]
    }
  },
  {
    id: 'layout-21',
    title: 'Layout 21: Minimalismo Tipográfico',
    rationale: 'La forma más pura del Estilo Suizo. La jerarquía se logra exclusivamente a través de la tipografía: tamaño, peso y alineación. Un único acento cian es el único elemento de color.',
    category: 'text_code',
    structure: {
      type: 'flex', direction: 'col', gap: 6,
      items: [
        { id: 'title', className: 'border-b-2 border-[#00BFFF] pb-2' },
        { id: 'data' },
        { id: 'prompt' },
      ]
    }
  }
];
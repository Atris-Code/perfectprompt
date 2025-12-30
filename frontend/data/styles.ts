import type { SensationCategory, StyleDefinition, ClassifiedStyleGroup } from '../types';
import { SENSATION_CATEGORIES } from './sensations';

export const ALL_STYLES: StyleDefinition[] = [
  {
    "id_style": "ST_001",
    "style": "Hiperrealismo Fotográfico",
    "description": "Estilo pictórico y digital que busca una representación fotográfica de la realidad con un detalle microscópico, a menudo magnificando imperfecciones y texturas. Es ideal para retratos de alto impacto y estudios de objetos.",
    "category": "vanguardia",
    "categoryName": "Vanguardia y Arte Moderno",
    "sensacion_atmosfera": ["S1", "Rigor y Precisión"],
    "color_palette": {
      "dominant": ["#A9A9A9", "#4A4A4A", "#8B4513", "#F5F5DC"],
      "accent": ["#4682B4", "#B22222"]
    },
    "artist_inspiration": ["Chuck Close", "Richard Estes", "Audrey Flack"]
  },
  {
    "id_style": "ST_002",
    "style": "Neo-Memphis",
    "description": "Una reinterpretación moderna del estilo Memphis de los años 80, caracterizada por la mezcla de colores brillantes, formas geométricas audaces, patrones abstractos y líneas negras gruesas. El enfoque es lúdico y deliberadamente asimétrico.",
    "category": "digital",
    "categoryName": "Arte Digital y Nuevos Medios",
    "sensacion_atmosfera": ["S3", "Lúdico y Caprichoso"],
    "color_palette": {
      "dominant": ["#FF00FF", "#FFFF00", "#00FFFF", "#000000"],
      "accent": ["#FF69B4", "#007AFF"]
    },
    "artist_inspiration": ["Camille Walala", "Ettore Sottsass", "Modern UI/UX Design"]
  },
  {
    "id_style": "ST_003",
    "style": "Arte Povera",
    "description": "Movimiento de vanguardia italiano (c. 1960) que utiliza materiales 'pobres' o cotidianos (tierra, trapos, ramas) para desafiar la comercialización del arte. Se caracteriza por una estética cruda, minimalista y conceptual, enfocada en la textura y el material.",
    "category": "vanguardia",
    "categoryName": "Vanguardia y Arte Moderno",
    "sensacion_atmosfera": ["S6", "Disruptivo y Caótico"],
    "color_palette": {
      "dominant": ["#8B4513", "#556B2F", "#A9A9A9", "#FFFFFF"],
      "accent": ["#000000", "#B22222"]
    },
    "artist_inspiration": ["Mario Merz", "Giovanni Anselmo", "Jannis Kounellis"]
  },
  {
    "id_style": "ST_004",
    "style": "Ilustración Botánica (Acuarela)",
    "description": "Estilo de ilustración científica detallada utilizada para catalogar flora. Se caracteriza por líneas finas, precisión anatómica y el uso de acuarelas suaves para dar un sombreado delicado y natural. Ideal para un look sereno o académico.",
    "category": "ilustracion",
    "categoryName": "Ilustración",
    "sensacion_atmosfera": ["S4", "Sereno y Contemplativo"],
    "color_palette": {
      "dominant": ["#90EE90", "#4CAF50", "#D3D3D3", "#F5F5DC"],
      "accent": ["#8B4513", "#4682B4"]
    },
    "artist_inspiration": ["Pierre-Joseph Redouté", "Maria Sibylla Merian"]
  },
  {
    "id_style": "ST_005",
    "style": "Blueprint (Cianotipia)",
    "description": "Técnica fotográfica histórica o de dibujo técnico que resulta en un negativo de color azul de Prusia. Ideal para generar diagramas, planos arquitectónicos o esquemas con una estética industrial y nostálgica.",
    "category": "tecnico",
    "categoryName": "Dibujo Técnico y Científico",
    "sensacion_atmosfera": ["S1", "Rigor y Precisión"],
    "color_palette": {
      "dominant": ["#003153", "#000000", "#008080"],
      "accent": ["#FFFFFF", "#FFD700"]
    },
    "artist_inspiration": ["Anna Atkins", "Planos de ingeniería naval y arquitectónica"]
  },
  {
    "id_style": "ST_006",
    "style": "Arte Moche",
    "description": "Arte cerámico y muralista de la cultura Moche (Perú, s. I-VIII). Se caracteriza por un realismo figurativo intenso, a menudo con representaciones de deidades, guerreros y escenas rituales. Paleta de colores terracota y ocre.",
    "category": "etnico",
    "categoryName": "Arte Étnico y Tradicionalista",
    "sensacion_atmosfera": ["S5", "Épico y Monumental"],
    "color_palette": {
      "dominant": ["#A0522D", "#8B4513", "#000000", "#D2691E"],
      "accent": ["#FFD700", "#FFFFFF"]
    },
    "artist_inspiration": ["Maestros alfareros de Huaca de la Luna", "Cerámica retrato Moche"]
  },
  {
    "id_style": "ST_007",
    "style": "Estilo Alex Ross (Cómic Realista)",
    "description": "Un estilo de cómic que fusiona el arte secuencial con el fotorrealismo pictórico. Se caracteriza por la iluminación dramática, las capas de pintura ricas y un enfoque en las figuras humanas y sus expresiones. Ideal para escenas heroicas y épicas.",
    "category": "ilustracion",
    "categoryName": "Ilustración",
    "sensacion_atmosfera": ["S5", "Épico y Monumental"],
    "color_palette": {
      "dominant": ["#2E4053", "#B22222", "#FFD700", "#4682B4"],
      "accent": ["#FFFFFF", "#000000"]
    },
    "artist_inspiration": ["Alex Ross", "Pintores de la Edad de Oro del Cómic"]
  },
  {
    "id_style": "ST_008",
    "style": "Biopunk",
    "description": "Subgénero de la ciencia ficción y el arte digital que se enfoca en la modificación biológica, la ingeniería genética y la nanotecnología. Estética 'húmeda', orgánica y de alto contraste, con colores primarios saturados y tonos de piel pálidos.",
    "category": "experimental",
    "categoryName": "Estilos Experimentales y Alternativos",
    "sensacion_atmosfera": ["S8", "Digital y Retro-Futurista"],
    "color_palette": {
      "dominant": ["#32CD32", "#008000", "#FF00FF", "#4B0082"],
      "accent": ["#FFFFFF", "#FFD700"]
    },
    "artist_inspiration": ["Películas como eXistenZ y Videodrome", "Diseño orgánico y tecno-futurista"]
  },
  {
    "id_style": "ST_009",
    "style": "Manierismo",
    "description": "Movimiento que siguió al Alto Renacimiento. Se caracteriza por la elegancia forzada, figuras alargadas, poses complejas e inestables, y paletas de colores inusuales y a menudo fríos. Ideal para escenas con tensión y gracia antinatural.",
    "category": "clasico",
    "categoryName": "Arte Clásico y Movimientos Históricos",
    "sensacion_atmosfera": ["S2", "Drama y Tensión"],
    "color_palette": {
      "dominant": ["#4B0082", "#CD5C5C", "#A9A9A9", "#F0E68C"],
      "accent": ["#FFFFFF", "#000000"]
    },
    "artist_inspiration": ["El Greco", "Parmigianino", "Pontormo"]
  },
  {
    "id_style": "CI_002_Image1",
    "style": "Realismo Científico / Infografía 3D",
    "description": "Una detallada sección transversal de un reactor de pirólisis en pleno funcionamiento. La biomasa incandescente se transforma en biocarbón y gas de síntesis dentro de una pulcra y moderna instalación industrial.",
    "category": "ciencia_industria",
    "categoryName": "Ciencia, Industria y Datos",
    "sensacion_atmosfera": ["S1", "Rigor y Precisión"],
    "color_palette": {
        "dominant": ["#A9A9A9", "#4682B4", "#FFFFFF"],
        "accent": ["#FFA500", "#FF4500"]
    },
    "artist_inspiration": ["Infografías de Kurzgesagt", "Visualizaciones de ingeniería de procesos", "Renderizados de productos de alta gama"],
    "keywords": ["pirólisis", "infografía 3D", "innovación", "energía", "tecnología", "científico"]
  },
  {
      "id_style": "CI_002_Image2",
      "style": "Futurismo Ecológico / Solarpunk",
      "description": "Una visión optimista de la economía circular en una ciudad futurista. Flujos de materiales reciclados circulan por tubos transparentes entre edificios con jardines verticales, culminando en un centro de manufactura limpia.",
      "category": "ciencia_industria",
      "categoryName": "Ciencia, Industria y Datos",
      "sensacion_atmosfera": ["S4", "Sereno y Contemplativo"],
      "color_palette": {
          "dominant": ["#FFFFFF", "#87CEEB", "#90EE90"],
          "accent": ["#FFD700", "#FF69B4"]
      },
      "artist_inspiration": ["Vincent Callebaut", "Luc Schuiten", "Estudio Ghibli"],
      "keywords": ["economía circular", "solarpunk", "futurismo", "sostenibilidad", "ecológico", "ciudad"]
  },
  {
      "id_style": "CI_002_Image3",
      "style": "Realismo Industrial / Macrofotografía",
      "description": "Un primer plano extremo que captura la transformación de serrín y virutas de madera en pellets de biomasa compactos dentro de una peletizadora. El acero de la máquina muestra el poder y la textura del proceso industrial.",
      "category": "ciencia_industria",
      "categoryName": "Ciencia, Industria y Datos",
      "sensacion_atmosfera": ["S1", "Rigor y Precisión"],
      "color_palette": {
          "dominant": ["#A9A9A9", "#8B4513", "#696969"],
          "accent": ["#FFD700"]
      },
      "artist_inspiration": ["Fotografía industrial de Edward Burtynsky", "Imágenes macro de procesos mecánicos"],
      "keywords": ["pellets", "biomasa", "industria", "macrofotografía", "energía renovable", "maquinaria"]
  },
  {
      "id_style": "CI_002_Image4",
      "style": "Arte Conceptual / Diseño de Producto",
      "description": "Una representación artística del concepto 'Eco Hornet'. Un reactor de pirólisis, con un diseño elegante y detalles en negro y amarillo, convierte pellets de biomasa en energía limpia, visualizada como un aura brillante que alimenta una pequeña ciudad verde.",
      "category": "ciencia_industria",
      "categoryName": "Ciencia, Industria y Datos",
      "sensacion_atmosfera": ["S8", "Digital y Retro-Futurista"],
      "color_palette": {
          "dominant": ["#000000", "#F0F0F0", "#FFD700"],
          "accent": ["#00FFFF", "#4CAF50"]
      },
      "artist_inspiration": ["Diseños de Syd Mead", "Concept art de Daniel Simon", "Estética de productos de alta tecnología"],
      "keywords": ["eco hornet", "arte conceptual", "diseño de producto", "energía limpia", "innovación", "branding"]
  },
  {
      "id_style": "CI_002_Image5",
      "style": "Abstracto / Visualización de Datos",
      "description": "Una obra de arte digital que visualiza la descomposición molecular durante la pirólisis. Cadenas de polímeros, representadas por líneas de neón, se desintegran en partículas energéticas sobre un fondo oscuro y cálido.",
      "category": "ciencia_industria",
      "categoryName": "Ciencia, Industria y Datos",
      "sensacion_atmosfera": ["S7", "Místico y Esotérico"],
      "color_palette": {
          "dominant": ["#000000", "#FFFFFF", "#32CD32"],
          "accent": ["#4169E1", "#FF4500"]
      },
      "artist_inspiration": ["Refik Anadol", "Arte generativo", "Visualizaciones científicas del CERN"],
      "keywords": ["abstracto", "molecular", "pirólisis", "ciencia", "visualización de datos", "energía"]
  },
  {
    "id_style": "AP_003_1",
    "style": "Hiperrealismo / Fotografía Submarina Dramática",
    "description": "Una tortuga marina nada a través de una densa 'sopa' de microplásticos y desechos más grandes. La iluminación cenital submarina crea un ambiente a la vez bello y desolador, resaltando la cruda realidad de la contaminación oceánica.",
    "category": "amenazas",
    "categoryName": "Amenazas Planetarias",
    "sensacion_atmosfera": ["S2", "Drama y Tensión"],
    "color_palette": {
      "dominant": ["#003153", "#ADD8E6", "#4A4A4A"],
      "accent": ["#FFFFFF", "#F0E68C"]
    },
    "artist_inspiration": ["Paul Nicklen", "Cristina Mittermeier", "National Geographic"],
    "keywords": ["contaminación marina", "plásticos", "océano", "hiperrealismo", "vida salvaje", "crisis ambiental"]
  },
  {
    "id_style": "AP_003_2",
    "style": "Surrealismo / Arte Conceptual",
    "description": "Un paisaje surrealista partido en dos: a un lado, una selva amazónica exuberante; al otro, un desierto árido lleno de tocones de árboles. En la línea divisoria, un reloj gigante se derrite, simbolizando el tiempo que se agota para revertir la deforestación y el cambio climático.",
    "category": "amenazas",
    "categoryName": "Amenazas Planetarias",
    "sensacion_atmosfera": ["S7", "Místico y Esotérico"],
    "color_palette": {
      "dominant": ["#228B22", "#8B4513", "#DEB887"],
      "accent": ["#FFA500", "#FFFFFF"]
    },
    "artist_inspiration": ["Salvador Dalí", "René Magritte", "Zdzisław Beksiński"],
    "keywords": ["deforestación", "cambio climático", "surrealismo", "sequía", "conceptual", "pérdida de biodiversidad"]
  },
  {
    "id_style": "AP_003_3",
    "style": "Estilo Distópico / Mate Painting Cinematográfico",
    "description": "Una panorámica distópica de una zona industrial al anochecer. Chimeneas masivas expulsan un humo denso que se fusiona con las nubes, mientras tuberías vierten un líquido iridiscente y tóxico en un río oscuro y sin vida.",
    "category": "amenazas",
    "categoryName": "Amenazas Planetarias",
    "sensacion_atmosfera": ["S2", "Drama y Tensión"],
    "color_palette": {
      "dominant": ["#4A4A4A", "#808080", "#FF8C00"],
      "accent": ["#00FFFF", "#FF00FF"]
    },
    "artist_inspiration": ["Syd Mead", "Blade Runner", "Albert Robida"],
    "keywords": ["contaminación del aire", "contaminación de ríos", "distopía", "industrial", "smog", "tóxico"]
  },
  {
    "id_style": "AP_003_4",
    "style": "Realismo Documental / Fotografía de Alto Contraste",
    "description": "El lecho de un embalse completamente seco y agrietado se extiende hasta el horizonte. En el centro, un único árbol muerto se alza contra un sol abrasador, una imagen desoladora de la sequía extrema y la devastación de los recursos hídricos.",
    "category": "amenazas",
    "categoryName": "Amenazas Planetarias",
    "sensacion_atmosfera": ["S1", "Rigor y Precisión"],
    "color_palette": {
      "dominant": ["#000000", "#FFFFFF"],
      "accent": ["#808080"]
    },
    "artist_inspiration": ["Sebastião Salgado", "Ansel Adams"],
    "keywords": ["sequía", "escasez de agua", "recursos naturales", "desertificación", "cambio climático", "documental"]
  },
  {
    "id_style": "AP_003_5",
    "style": "Simbólico / Arte Digital Pictórico",
    "description": "Una representación simbólica del planeta Tierra como un invernadero de cristal que se resquebraja por el calor. Dentro, los bosques arden y los glaciares se derriten, mientras el humo empaña el cristal, visualizando el efecto invernadero.",
    "category": "amenazas",
    "categoryName": "Amenazas Planetarias",
    "sensacion_atmosfera": ["S7", "Místico y Esotérico"],
    "color_palette": {
      "dominant": ["#ADD8E6", "#A9A9A9", "#FFFFFF"],
      "accent": ["#FF4500", "#DC143C"]
    },
    "artist_inspiration": ["Robert Rauschenberg", "Banksy"],
    "keywords": ["crisis climática", "efecto invernadero", "planeta tierra", "simbólico", "arte digital", "fragilidad"]
  },
  {
    "id_style": "ST_010",
    "style": "Diagrama de Flujo Isométrico",
    "description": "Un estilo de dibujo técnico que utiliza la proyección isométrica para ilustrar sistemas y procesos (flujos, tuberías, maquinaria) con precisión tridimensional, sin la complejidad del fotorrealismo. Es fundamental para la documentación de ingeniería.",
    "category": "tecnico",
    "categoryName": "Dibujo Técnico y Científico",
    "sensacion_atmosfera": ["S1", "Rigor y Precisión"],
    "color_palette": {
      "dominant": ["#3498DB", "#E74C3C", "#808080", "#FFFFFF"],
      "accent": ["#F1C40F", "#2ECC71"]
    },
    "artist_inspiration": ["Ilustraciones de manuales de ingeniería y CAD", "Diagramas P&ID (Tuberías e Instrumentación)"]
  },
  {
    "id_style": "ST_011",
    "style": "Romanticismo",
    "description": "Movimiento que enfatiza la emoción intensa, el asombro ante la naturaleza, el individualismo y la glorificación del pasado y lo sublime. Visualmente se caracteriza por el dramatismo, las composiciones dinámicas y los cielos turbulentos.",
    "category": "clasico",
    "categoryName": "Arte Clásico y Movimientos Históricos",
    "sensacion_atmosfera": ["S5", "Épico y Monumental"],
    "color_palette": {
      "dominant": ["#1B2631", "#7B3F00", "#9E2A2B", "#FAD7A0"],
      "accent": ["#E74C3C", "#F1C40F"]
    },
    "artist_inspiration": ["Caspar David Friedrich", "Eugène Delacroix", "J. M. W. Turner"]
  },
  {
    "id_style": "ST_012",
    "style": "Neoplasticismo (De Stijl)",
    "description": "Estilo de vanguardia caracterizado por la abstracción geométrica estricta. Utiliza únicamente líneas rectas (horizontales y verticales) y colores primarios (rojo, azul, amarillo) junto a los no-colores (blanco, negro, gris). El foco es la armonía universal y el orden.",
    "category": "vanguardia",
    "categoryName": "Vanguardia y Arte Moderno",
    "sensacion_atmosfera": ["S6", "Disruptivo y Caótico"],
    "color_palette": {
      "dominant": ["#FFFFFF", "#000000", "#FF0000", "#0000FF"],
      "accent": ["#FFFF00", "#808080"]
    },
    "artist_inspiration": ["Piet Mondrian", "Theo van Doesburg"]
  },
  {
    "id_style": "ST_013",
    "style": "Synthwave / Outrun",
    "description": "Estética digital retro-futurista que evoca la nostalgia por los años 80. Se caracteriza por paisajes urbanos nocturnos, el uso de neón saturado, rejillas geométricas tridimensionales y cielos púrpura/atardecer, con alto contraste y Glitch Art sutil.",
    "category": "digital",
    "categoryName": "Arte Digital y Nuevos Medios",
    "sensacion_atmosfera": ["S8", "Digital y Retro-Futurista"],
    "color_palette": {
      "dominant": ["#FF00FF", "#00FFFF", "#FF8C00", "#4B0082"],
      "accent": ["#FFFF00", "#000000"]
    },
    "artist_inspiration": ["Películas como Tron y Drive", "Gráficos de videojuegos de los 80"]
  },
  {
    "id_style": "ST_014",
    "style": "Arte Aborigen Australiano",
    "description": "Arte indígena australiano basado en 'Dreaming' (Tiempo del Sueño). Visualmente definido por patrones de puntos (dot painting), líneas concéntricas y símbolos abstractos que representan narrativas de la tierra, genealogía y mitología.",
    "category": "etnico",
    "categoryName": "Arte Étnico y Tradicionalista",
    "sensacion_atmosfera": ["S7", "Místico y Esotérico"],
    "color_palette": {
      "dominant": ["#D2691E", "#FFD700", "#A0522D", "#000000"],
      "accent": ["#FFFFFF", "#DC143C"]
    },
    "artist_inspiration": ["Clifford Possum Tjapaltjarri", "Pintores del Movimiento Papunya Tula"]
  },
  {
    "id_style": "ST_015",
    "style": "Ilustración Chibi / Kawaii",
    "description": "Estilo de ilustración japonesa caracterizado por figuras humanas o personajes con cabezas grandes y cuerpos pequeños, con rasgos exageradamente adorables, ojos brillantes y emociones simplificadas. Ideal para marketing y branding juvenil.",
    "category": "ilustracion",
    "categoryName": "Ilustración",
    "sensacion_atmosfera": ["S3", "Lúdico y Caprichoso"],
    "color_palette": {
      "dominant": ["#FFC0CB", "#B0E0E6", "#FFFFE0", "#90EE90"],
      "accent": ["#FF69B4", "#87CEEB"]
    },
    "artist_inspiration": ["Sanrio (Hello Kitty)", "Diseñadores de personajes de videojuegos japoneses"]
  },
  {
    "id_style": "ST_016",
    "style": "Afrofuturismo",
    "description": "Estética que combina elementos de ciencia ficción, tecnología y fantasía con la cultura africana y la diáspora. Se enfoca en la liberación, la tecnología ancestral y la reimaginación de un futuro sin opresión. Alto contraste entre lo tribal y lo cibernético.",
    "category": "experimental",
    "categoryName": "Estilos Experimentales y Alternativos",
    "sensacion_atmosfera": ["S8", "Digital y Retro-Futurista"],
    "color_palette": {
      "dominant": ["#FFD700", "#4B0082", "#000000", "#A0522D"],
      "accent": ["#00FFFF", "#32CD32"]
    },
    "artist_inspiration": ["Jean-Michel Basquiat (elementos)", "Película Black Panther", "Osunyemi Efundebe"]
  },
  {
    "id_style": "ST_017",
    "style": "Realismo Mágico",
    "description": "Estilo literario y pictórico que inserta elementos fantásticos o míticos en un entorno realista de forma natural y cotidiana. La atmósfera es onírica pero anclada en la realidad.",
    "category": "vanguardia",
    "categoryName": "Vanguardia y Arte Moderno",
    "sensacion_atmosfera": ["S7", "Místico y Esotérico"],
    "color_palette": {
      "dominant": ["#8B4513", "#2E8B57", "#F5DEB3", "#A9A9A9"],
      "accent": ["#FFD700", "#4682B4"]
    },
    "artist_inspiration": ["Frida Kahlo", "Gabriel García Márquez (literatura)", "Remedios Varo"]
  },
  {
    "id_style": "ST_018",
    "style": "Steampunk",
    "description": "Subgénero de ciencia ficción que incorpora tecnología y estética retrofuturista inspirada en la maquinaria industrial de vapor del siglo XIX. Predominan el latón, el cobre, la madera y los engranajes.",
    "category": "experimental",
    "categoryName": "Estilos Experimentales y Alternativos",
    "sensacion_atmosfera": ["S1", "Rigor y Precisión"],
    "color_palette": {
      "dominant": ["#8B4513", "#CD7F32", "#A9A9A9", "#000000"],
      "accent": ["#4682B4", "#B8860B"]
    },
    "artist_inspiration": ["Julio Verne", "H.G. Wells", "Diseños de la época victoriana"]
  },
  {
    "id_style": "ST_019",
    "style": "Pop Art",
    "description": "Movimiento artístico que utiliza imágenes de la cultura popular y de los medios de comunicación de masas. Se caracteriza por colores brillantes, contornos nítidos y técnicas de reproducción mecánica como la serigrafía.",
    "category": "vanguardia",
    "categoryName": "Vanguardia y Arte Moderno",
    "sensacion_atmosfera": ["S3", "Lúdico y Caprichoso"],
    "color_palette": {
      "dominant": ["#FF0000", "#FFFF00", "#0000FF", "#FFFFFF"],
      "accent": ["#000000", "#FF69B4"]
    },
    "artist_inspiration": ["Andy Warhol", "Roy Lichtenstein"]
  },
  {
    "id_style": "ST_020",
    "style": "Ukiyo-e (Grabado Japonés)",
    "description": "Género de grabados en madera producidos en Japón entre los siglos XVII y XX. Se caracteriza por sus líneas fluidas, composiciones asimétricas, colores planos y temas de la vida urbana, paisajes y teatro.",
    "category": "etnico",
    "categoryName": "Arte Étnico y Tradicionalista",
    "sensacion_atmosfera": ["S4", "Sereno y Contemplativo"],
    "color_palette": {
      "dominant": ["#87CEEB", "#F5DEB3", "#000000", "#DC143C"],
      "accent": ["#FFFFFF", "#4682B4"]
    },
    "artist_inspiration": ["Katsushika Hokusai", "Utagawa Hiroshige"]
  },
  {
    "id_style": "ST_021",
    "style": "Barroco",
    "description": "Estilo artístico caracterizado por el drama, la emoción intensa y la grandiosidad. Utiliza un fuerte contraste de luz y sombra (claroscuro), composiciones dinámicas y una ornamentación exuberante.",
    "category": "clasico",
    "categoryName": "Arte Clásico y Movimientos Históricos",
    "sensacion_atmosfera": ["S2", "Drama y Tensión"],
    "color_palette": {
      "dominant": ["#000000", "#8B4513", "#FFD700", "#B22222"],
      "accent": ["#FFFFFF", "#4682B4"]
    },
    "artist_inspiration": ["Caravaggio", "Rembrandt", "Peter Paul Rubens"]
  },
  {
    "id_style": "ST_022",
    "style": "Fauvismo",
    "description": "Movimiento de vanguardia que enfatiza el color intenso y no naturalista sobre la representación realista. Se caracteriza por pinceladas audaces, colores puros y una sensación de espontaneidad y alegría.",
    "category": "vanguardia",
    "categoryName": "Vanguardia y Arte Moderno",
    "sensacion_atmosfera": ["S3", "Lúdico y Caprichoso"],
    "color_palette": {
      "dominant": ["#FF0000", "#00FF00", "#0000FF", "#FFFF00"],
      "accent": ["#FF69B4", "#FFA500"]
    },
    "artist_inspiration": ["Henri Matisse", "André Derain"]
  },
  {
    "id_style": "ST_023",
    "style": "Constructivismo",
    "description": "Movimiento artístico y arquitectónico que se originó en Rusia. Se caracteriza por la abstracción geométrica, el uso de formas puras y una estética socialmente utilitaria, a menudo con una paleta de colores limitada a rojo, negro y blanco.",
    "category": "vanguardia",
    "categoryName": "Vanguardia y Arte Moderno",
    "sensacion_atmosfera": ["S6", "Disruptivo y Caótico"],
    "color_palette": {
      "dominant": ["#FF0000", "#000000", "#FFFFFF", "#A9A9A9"],
      "accent": ["#FFFF00"]
    },
    "artist_inspiration": ["El Lissitzky", "Alexander Rodchenko"]
  },
  {
    "id_style": "ST_024",
    "style": "Art Nouveau",
    "description": "Estilo internacional de arte y arquitectura caracterizado por líneas orgánicas, sinuosas y asimétricas, a menudo inspiradas en formas naturales como plantas y flores. Busca la integración de las artes y la artesanía.",
    "category": "clasico",
    "categoryName": "Arte Clásico y Movimientos Históricos",
    "sensacion_atmosfera": ["S4", "Sereno y Contemplativo"],
    "color_palette": {
      "dominant": ["#8B4513", "#556B2F", "#F0E68C", "#E6E6FA"],
      "accent": ["#DAA520", "#483D8B"]
    },
    "artist_inspiration": ["Alphonse Mucha", "Gustav Klimt", "Hector Guimard"]
  },
  {
    "id_style": "ST_025",
    "style": "Grunge",
    "description": "Estética visual de los años 90 asociada con la música grunge. Se caracteriza por una apariencia desgastada, texturas superpuestas, tipografía distorsionada y una paleta de colores desaturada y terrosa. Rechaza la pulcritud del diseño corporativo.",
    "category": "experimental",
    "categoryName": "Estilos Experimentales y Alternativos",
    "sensacion_atmosfera": ["S6", "Disruptivo y Caótico"],
    "color_palette": {
      "dominant": ["#8B4513", "#696969", "#A9A9A9", "#BDB76B"],
      "accent": ["#B22222", "#000000"]
    },
    "artist_inspiration": ["David Carson", "Revista Ray Gun"]
  },
  {
    "id_style": "ST_026",
    "style": "Línea Clara (Ligne Claire)",
    "description": "Estilo de dibujo de cómic franco-belga. Se caracteriza por líneas claras y nítidas de grosor uniforme, colores planos sin sombreado y un alto nivel de detalle en los fondos, creando una apariencia limpia y legible.",
    "category": "ilustracion",
    "categoryName": "Ilustración",
    "sensacion_atmosfera": ["S1", "Rigor y Precisión"],
    "color_palette": {
      "dominant": ["#ADD8E6", "#F0E68C", "#90EE90", "#FFFFFF"],
      "accent": ["#000000", "#FF0000"]
    },
    "artist_inspiration": ["Hergé (Tintín)", "Joost Swarte"]
  },
  {
    "id_style": "ST_027",
    "style": "Estilo Mike Mignola (Hellboy)",
    "description": "Un estilo de cómic caracterizado por el uso masivo de sombras negras profundas (chiaroscuro), formas angulares y simplificadas, y una atmósfera gótica y de terror. La composición es clave para el impacto dramático.",
    "category": "ilustracion",
    "categoryName": "Ilustración",
    "sensacion_atmosfera": ["S2", "Drama y Tensión"],
    "color_palette": {
      "dominant": ["#000000", "#B22222", "#A9A9A9", "#696969"],
      "accent": ["#FFD700", "#FFFFFF"]
    },
    "artist_inspiration": ["Mike Mignola"]
  },
  {
    "id_style": "ST_028",
    "style": "Cómic (Silver Age)",
    "description": "Estilo de cómic americano (c. 1956-1970) que se caracteriza por un dibujo más dinámico y anatómico que la Golden Age, con colores primarios brillantes y tramas de ciencia ficción y superhéroes.",
    "category": "ilustracion",
    "categoryName": "Ilustración",
    "sensacion_atmosfera": ["S5", "Épico y Monumental"],
    "color_palette": {
      "dominant": ["#0000FF", "#FF0000", "#FFFF00", "#00FF00"],
      "accent": ["#000000", "#FFFFFF"]
    },
    "artist_inspiration": ["Jack Kirby", "Steve Ditko"]
  },
  {
    "id_style": "ST_029",
    "style": "Arte Azteca (Estilo Códice)",
    "description": "Estilo pictográfico de los códices aztecas precolombinos. Se caracteriza por figuras planas y simbólicas con contornos negros gruesos, colores vivos y la ausencia de perspectiva realista. Ideal para un look étnico y narrativo.",
    "category": "etnico",
    "categoryName": "Arte Étnico y Tradicionalista",
    "sensacion_atmosfera": ["S7", "Místico y Esotérico"],
    "color_palette": {
      "dominant": ["#CD5C5C", "#4682B4", "#FFD700", "#2E8B57"],
      "accent": ["#000000", "#FFFFFF"]
    },
    "artist_inspiration": ["Códice Borbónico", "Códice Mendoza"]
  },
  {
    "id_style": "ST_030",
    "style": "Art Deco",
    "description": "Estilo de diseño popular en los años 20 y 30, caracterizado por la simetría, las formas geométricas audaces, los colores ricos y la ornamentación lujosa. Evoca elegancia, glamour y modernidad.",
    "category": "clasico",
    "categoryName": "Arte Clásico y Movimientos Históricos",
    "sensacion_atmosfera": ["S5", "Épico y Monumental"],
    "color_palette": {
      "dominant": ["#000000", "#FFD700", "#A9A9A9", "#36454F"],
      "accent": ["#E6E6FA", "#008080"]
    },
    "artist_inspiration": ["Tamara de Lempicka", "Cassandre", "Arquitectura del Edificio Chrysler"]
  },
  {
    "id_style": "ST_031",
    "style": "Impresionismo",
    "description": "Movimiento artístico del siglo XIX centrado en capturar la impresión visual momentánea de una escena. Se caracteriza por pinceladas cortas y visibles, énfasis en la luz y sus cualidades cambiantes, y colores vibrantes.",
    "category": "clasico",
    "categoryName": "Arte Clásico y Movimientos Históricos",
    "sensacion_atmosfera": ["S4", "Sereno y Contemplativo"],
    "color_palette": {
      "dominant": ["#ADD8E6", "#FFFFE0", "#90EE90", "#DDA0DD"],
      "accent": ["#FFA500", "#4682B4"]
    },
    "artist_inspiration": ["Claude Monet", "Pierre-Auguste Renoir", "Edgar Degas"]
  },
  {
    "id_style": "ST_032",
    "style": "Vaporwave",
    "description": "Microgénero musical y estética visual que surgió a principios de 2010. Se caracteriza por una nostalgia por la cultura de los 80 y 90, con imágenes de estatuas romanas, diseños de UI antiguos, y una paleta de colores de rosas, azules y púrpuras neón.",
    "category": "digital",
    "categoryName": "Arte Digital y Nuevos Medios",
    "sensacion_atmosfera": ["S8", "Digital y Retro-Futurista"],
    "color_palette": {
      "dominant": ["#FF69B4", "#00FFFF", "#4B0082", "#FFFFFF"],
      "accent": ["#FFFF00", "#000000"]
    },
    "artist_inspiration": ["Macintosh Plus - Floral Shoppe", "Primeros gráficos de internet y Windows 95"]
  },
  {
    "id_style": "ST_033",
    "style": "Expresionismo Abstracto",
    "description": "Movimiento pictórico de posguerra que enfatiza la creación subconsciente y espontánea. Se divide en 'action painting' (goteos y pinceladas gestuales) y 'color field' (grandes áreas de color plano y sólido).",
    "category": "vanguardia",
    "categoryName": "Vanguardia y Arte Moderno",
    "sensacion_atmosfera": ["S6", "Disruptivo y Caótico"],
    "color_palette": {
      "dominant": ["#000000", "#FFFFFF", "#FF0000", "#0000FF"],
      "accent": ["#FFFF00", "#A9A9A9"]
    },
    "artist_inspiration": ["Jackson Pollock", "Mark Rothko", "Willem de Kooning"]
  },
  {
    "id_style": "ST_034",
    "style": "Pintura de Tinta China (Sumi-e)",
    "description": "Técnica de pintura de Asia oriental que utiliza tinta negra en diversas concentraciones. Se valora la pincelada, la simplicidad y la expresión del espíritu del sujeto en lugar de una representación fotorrealista.",
    "category": "etnico",
    "categoryName": "Arte Étnico y Tradicionalista",
    "sensacion_atmosfera": ["S4", "Sereno y Contemplativo"],
    "color_palette": {
      "dominant": ["#FFFFFF", "#000000", "#A9A9A9"],
      "accent": ["#B22222"]
    },
    "artist_inspiration": ["Sesshū Tōyō", "Liang Kai"]
  },
  {
    "id_style": "ST_035",
    "style": "Pixel Art",
    "description": "Forma de arte digital en la que las imágenes se crean y editan a nivel de píxel. Se asocia con los gráficos de los primeros videojuegos y ordenadores, con una estética de baja resolución y paletas de colores limitadas.",
    "category": "digital",
    "categoryName": "Arte Digital y Nuevos Medios",
    "sensacion_atmosfera": ["S8", "Digital y Retro-Futurista"],
    "color_palette": {
      "dominant": ["#000000", "#FFFFFF", "#FF0000", "#0000FF"],
      "accent": ["#00FF00", "#FFFF00"]
    },
    "artist_inspiration": ["Videojuegos de 8-bit y 16-bit (NES, SNES)"]
  },
  {
    "id_style": "ST_036",
    "style": "Paisaje Urbano Lluvioso (Noir)",
    "description": "Una estética clásica de cine negro centrada en entornos urbanos durante un aguacero. Enfatiza sombras dramáticas, superficies mojadas que reflejan luces de neón y una sensación de misterio o melancolía. Las sugerencias visuales incluyen: lluvia intensa creando vetas de luz; charcos profundos y reflectantes sobre el asfalto que reflejan los bajos fondos de la ciudad; letreros de neón que se desangran sobre el pavimento mojado.",
    "category": "experimental",
    "categoryName": "Estilos Experimentales y Alternativos",
    "sensacion_atmosfera": ["S2", "Drama y Tensión"],
    "color_palette": {
      "dominant": ["#000000", "#4A4A4A", "#1E3A8A"],
      "accent": ["#DC2626", "#F59E0B"]
    },
    "artist_inspiration": ["John Alton (director de fotografía)", "Películas como 'Blade Runner' y 'The Third Man'", "Estética de 'Sin City'"],
    "keywords": ["noir", "lluvia", "ciudad", "noche", "reflejos", "charcos", "misterio", "cinemático", "superficies mojadas", "distópico"]
  }
];

// Logic to classify styles
export const CLASSIFIED_STYLES: ClassifiedStyleGroup[] = ALL_STYLES.reduce((acc: ClassifiedStyleGroup[], style) => {
  if (style.category === 'personalizado' || style.category === 'video_personalizado' || style.category === 'ciencia_industria' || style.category === 'amenazas') {
    return acc;
  }
  
  let group = acc.find(g => g.category === style.categoryName);
  
  if (!group) {
    group = {
      id: style.category,
      category: style.categoryName,
      styles: [],
    };
    acc.push(group);
  }
  
  group.styles.push(style.style);
  
  return acc;
}, []);

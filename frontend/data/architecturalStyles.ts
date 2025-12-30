import type { ArchitecturalStyle } from '../types';

export const ARCHITECTURAL_STYLES: ArchitecturalStyle[] = [
  {
    "id": "arquitectura_antigua",
    "nombre": "Arquitectura Antigua",
    "descripcion": "Estilos de las primeras civilizaciones (Mesopotamia, Egipto, Grecia, Roma), caracterizados por la monumentalidad, el uso de columnas, arcos y bóvedas, y la búsqueda de la proporción y la armonía.",
    "materiales_clave": ["Piedra (mármol, granito)", "Ladrillo de adobe", "Madera (estructural)", "Mortero"],
    "conexion_pyrolysis_hub": "Biochar como pigmento negro para frescos o morteros (similar a pigmentos de carbón usados históricamente); cenizas vitrificadas como posible aditivo en morteros primitivos.",
    "utilidad_transversal": "La monumentalidad lograda con materiales básicos demuestra la transformación de recursos simples (piedra, arcilla) en estructuras duraderas a través de la organización del trabajo (ingeniería antigua)."
  },
  {
    "id": "arquitectura_romanica",
    "nombre": "Arquitectura Románica",
    "descripcion": "Desarrollada en Europa entre los siglos XI y XII, se caracteriza por muros gruesos, arcos de medio punto, bóvedas de cañón y una sensación general de solidez y austeridad, principalmente en edificios religiosos.",
    "materiales_clave": ["Piedra tallada (sillería)", "Mampostería", "Madera (cubiertas)", "Mortero de cal"],
    "conexion_pyrolysis_hub": "Biochar como aditivo para mejorar morteros de cal, aumentando durabilidad o modificando propiedades térmicas de muros masivos; uso potencial en restauración.",
    "utilidad_transversal": "La robustez y durabilidad (Firmitas) se logran mediante el uso masivo y estructural de materiales locales (piedra), priorizando la función sobre la ornamentación excesiva."
  },
  {
    "id": "arquitectura_gotica",
    "nombre": "Arquitectura Gótica",
    "descripcion": "Evolucionó del Románico (siglos XII-XV), buscando la altura y la luz. Se distingue por el arco apuntado, la bóveda de crucería, los contrafuertes y arbotantes, y los grandes vitrales.",
    "materiales_clave": ["Piedra tallada (sillería fina)", "Vidrio (vitrales)", "Plomo (unión de vidrios)", "Madera (estructuras de cubierta)"],
    "conexion_pyrolysis_hub": "Biochar como pigmento oscuro para juntas o morteros, contrastando con la piedra clara; aceites de pirólisis (muy refinados) como base experimental para aglutinantes de pigmentos en vitrales.",
    "utilidad_transversal": "La innovación estructural (arco apuntado, bóveda de crucería) permite desmaterializar el muro, logrando ligereza y altura con menos material, demostrando eficiencia estructural como arte."
  },
  {
    "id": "arquitectura_renacentista",
    "nombre": "Arquitectura Renacentista",
    "descripcion": "Surgida en Italia en el siglo XV, retoma los principios clásicos de Grecia y Roma (simetría, proporción, órdenes). Destacan las cúpulas, las fachadas armoniosas y el uso de la perspectiva.",
    "materiales_clave": ["Mármol", "Piedra", "Ladrillo", "Estuco", "Madera (artesonados)"],
    "conexion_pyrolysis_hub": "Biochar finamente molido como carga inerte y pigmento en estucos o revoques para lograr texturas específicas o colores oscuros controlados.",
    "utilidad_transversal": "La aplicación rigurosa de principios matemáticos y geométricos (proporción áurea, órdenes) a los materiales constructivos busca la armonía (Venustas) a través de la lógica (Utilitas)."
  },
  {
    "id": "arquitectura_barroca",
    "nombre": "Arquitectura Barroca",
    "descripcion": "Desarrollada entre los siglos XVII y XVIII, busca el dramatismo, la emoción y la grandiosidad. Se caracteriza por formas curvas, decoración exuberante, juegos de luces y sombras, y la integración con otras artes.",
    "materiales_clave": ["Estuco", "Mármoles de colores", "Bronce dorado", "Madera tallada", "Piedra"],
    "conexion_pyrolysis_hub": "Biochar como componente en pátinas oscuras o acabados texturizados para elementos decorativos; aceites de pirólisis como base experimental para barnices o selladores con efectos específicos.",
    "utilidad_transversal": "La manipulación artística de materiales (estuco modelado, mármoles combinados) crea efectos escenográficos y emocionales, subordinando a veces la eficiencia material a la expresión dramática."
  },
  {
    "id": "arquitectura_moderna",
    "nombre": "Arquitectura Moderna",
    "descripcion": "Movimiento del siglo XX que rompe con la tradición. Prioriza la función sobre la forma ('la forma sigue a la función'), el uso de nuevos materiales (acero, hormigón, vidrio), plantas libres y la ausencia de ornamentación.",
    "materiales_clave": ["Hormigón armado", "Acero estructural", "Vidrio (muro cortina)", "Ladrillo (a veces)"],
    "conexion_pyrolysis_hub": "Biochar como aditivo ligero y aislante en bloques de hormigón o paneles prefabricados; potencial uso en 'hormigón negro' arquitectónico.",
    "utilidad_transversal": "La industrialización y los nuevos materiales (resultado de procesos industriales) permiten optimizar la función y la construcción (Utilitas, Firmitas), generando una nueva estética basada en la honestidad estructural."
  },
  {
    "id": "arquitectura_contemporanea",
    "nombre": "Arquitectura Contemporánea",
    "descripcion": "Engloba las tendencias desde finales del siglo XX hasta la actualidad. Es diversa y experimental, a menudo incorporando tecnología avanzada, sostenibilidad, deconstructivismo y formas escultóricas.",
    "materiales_clave": ["Materiales compuestos", "Plásticos reciclados", "Acero", "Vidrio de altas prestaciones", "Hormigón avanzado", "Madera laminada", "Materiales naturales (bambú, tierra)"],
    "conexion_pyrolysis_hub": "Biochar como aditivo multifuncional: en bioplásticos para refuerzo y color, en paneles aislantes, en 'green concrete', o como material base para impresión 3D en construcción. Aceites de pirólisis como precursores de resinas o adhesivos sostenibles.",
    "utilidad_transversal": "La experimentación con materiales (muchos derivados de procesos industriales o reciclaje) y tecnologías digitales busca soluciones innovadoras que equilibren estética (Venustas), función (Utilitas), estructura (Firmitas) y, cada vez más, sostenibilidad, conectando directamente la transformación de la materia (Pyrolysis Hub) con el diseño."
  }
];

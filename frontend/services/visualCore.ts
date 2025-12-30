/**
 * Visual Core System Prompt
 * 
 * Este archivo define el "DNA visual" de Pyrolysis Hub.
 * El VISUAL_CORE_SYSTEM_PROMPT se antepone automáticamente a todos los prompts
 * de generación de imágenes para mantener consistencia estética.
 */

export const VISUAL_CORE_SYSTEM_PROMPT = `
### ROL DEL SISTEMA ###
Eres el "Visual Core", el motor de visualización avanzado de "Pyrolysis Hub". Tu función principal es traducir datos científicos complejos, procesos de ingeniería química y conceptos de sostenibilidad en activos visuales de alta fidelidad, estéticamente coherentes y profesionales. No eres un artista abstracto; eres un ilustrador científico y un diseñador industrial de vanguardia.

### PILARES ESTÉTICOS (BRAND DNA) ###
Todas las generaciones deben adherirse estrictamente a estos principios para mantener la identidad de marca:

1. **ESTILO VISUAL:** "Hard-Science Futurism" & "Clean Tech Industrial Design".
   * Las imágenes deben parecer renders 3D fotorrealistas de alta gama (estilo Octane Render / Unreal Engine 5).
   * La estética debe ser limpia, clínica y tecnológicamente avanzada. Piensa en laboratorios de I+D de última generación, no en fábricas antiguas.
   * Prioriza la claridad y la precisión sobre la decoración artística excesiva.

2. **PALETA DE COLORES (ESTRICTA):**
   * **Dominante (Base Tecnológica):** Azules profundos y saturados (#1E3A8A), blancos clínicos (#FFFFFF), grays metálicos cepillados (#71717A) y negros mate para el hardware.
   * **Acento 1 (Sostenibilidad/Datos Positivos):** Cian bioluminiscente (#06B6D4), verde azulado (Teal) brillante. Usar para indicar "Carbono Neutro", flujos limpios o resultados exitosos.
   * **Acento 2 (Energía/Proceso Térmico):** Ámbar cálido, naranja controlado (#F59E0B). Usar *solo* para representar la energía generada, el calor de la pirólisis o el producto valorizado. Evitar rojos agresivos tipo "peligro".

3. **ILUMINACIÓN Y ATMÓSFERA:**
   * Iluminación de estudio controlada, dramática pero limpia. Uso extensivo de luces de borde (rim lighting) para definir siluetas tecnológicas.
   * Presencia de luz volumétrica sutil (rayos de luz) en ambientes limpios.
   * Las superficies deben tener reflejos realistas. Los elementos de energía (ámbar/cian) deben emitir su propia luz (glow/bloom).

4. **MATERIALIDAD Y TEXTURAS:**
   * Los equipos deben parecer hechos de aleaciones de metal pulido, vidrio templado de laboratorio, fibra de carbono y polímeros avanzados.
   * Los datos y gráficos se integran como interfaces holográficas flotantes o proyecciones sobre superficies de vidrio, nunca como papel o pizarras físicas.
   * La materia prima (residuos) debe verse compleja y texturizada, mientras que el producto resultante (energía) debe verse puro, brillante y etéreo.

### INTEGRACIÓN DE DATOS ###
Cuando el prompt del usuario incluya datos específicos (ej. "75% Eficiencia", "TRL 7"), estos deben integrarse en la imagen de forma diegética:
* Como lecturas digitales brillantes en pantallas integradas en la maquinaria.
* Como hologramas proyectados sobre el objeto de estudio.
* No como texto plano superpuesto "estilo meme".

### RESTRICCIONES NEGATIVAS (LO QUE NUNCA DEBES GENERAR) ###
* [ESTILO]: Estilos de dibujos animados, bocetos a mano, pintura al óleo, arte abstracto confuso, baja resolución, pixel art.
* [ATMÓSFERA]: Entornos sucios, oxidados, distópicos, desordenados, humeantes (humo negro) o caóticos. La pirólisis aquí es limpia.
* [ELEMENTOS]: Fuego descontrolado (usar brillo ámbar controlado en su lugar), elementos de fantasía o magia, tipografía ilegible o desordenada.
`;

/**
 * Paleta de colores oficial del brand
 */
export const BRAND_COLORS = {
    // Base Tecnológica
    deepTechBlue: '#1E3A8A',
    clinicalWhite: '#FFFFFF',
    metallicGray: '#71717A',
    matteBlack: '#0F172A',

    // Sostenibilidad / Datos Positivos
    bioluminescentCyan: '#06B6D4',
    brightTeal: '#14B8A6',

    // Energía / Proceso Térmico
    controlledAmber: '#F59E0B',
    warmOrange: '#FB923C',

    // Alerts (usar con moderación)
    cautionYellow: '#FBBF24',
    criticalRed: '#EF4444'
} as const;

/**
 * Templates de estilo predefinidos para diferentes contextos
 */
export const VISUAL_TEMPLATES = {
    ecoInnovation: {
        id: 'eco_innovation',
        name: 'Eco-Innovación',
        primaryColors: [BRAND_COLORS.bioluminescentCyan, BRAND_COLORS.brightTeal, BRAND_COLORS.deepTechBlue],
        emphasis: 'Enfatizar sostenibilidad, naturaleza integrada con tecnología, carbono neutro',
        mood: 'Inspirador, limpio, esperanzador'
    },
    highTechEfficiency: {
        id: 'high_tech',
        name: 'Alta Eficiencia Técnica',
        primaryColors: [BRAND_COLORS.deepTechBlue, BRAND_COLORS.metallicGray, BRAND_COLORS.controlledAmber],
        emphasis: 'Precisión, datos técnicos, eficiencia, confiabilidad',
        mood: 'Profesional, preciso, avanzado'
    },
    energyTransformation: {
        id: 'energy_transform',
        name: 'Transformación Energética',
        primaryColors: [BRAND_COLORS.controlledAmber, BRAND_COLORS.warmOrange, BRAND_COLORS.deepTechBlue],
        emphasis: 'Proceso térmico, energía, transformación de materia',
        mood: 'Poderoso, controlado, dinámico'
    }
} as const;

/**
 * Combina el Visual Core System Prompt con un prompt específico del usuario
 * @param userPrompt - El prompt específico del usuario
 * @param template - Template visual opcional para contexto adicional
 * @returns Prompt completo listo para enviar a la IA generativa
 */
export function buildImagePrompt(
    userPrompt: string,
    template?: keyof typeof VISUAL_TEMPLATES
): string {
    let fullPrompt = VISUAL_CORE_SYSTEM_PROMPT;

    // Agregar contexto del template si se especifica
    if (template) {
        const templateData = VISUAL_TEMPLATES[template];
        fullPrompt += `\n\n### TEMPLATE ACTIVO: ${templateData.name} ###`;
        fullPrompt += `\nColores principales: ${templateData.primaryColors.join(', ')}`;
        fullPrompt += `\nÉnfasis: ${templateData.emphasis}`;
        fullPrompt += `\nMood: ${templateData.mood}`;
    }

    // Agregar prompt del usuario
    fullPrompt += `\n\n### PROMPT ESPECÍFICO ###\n${userPrompt}`;

    return fullPrompt;
}

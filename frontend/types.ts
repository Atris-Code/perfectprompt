import React from 'react';

// FIX: Removed unused 'Chat' type import.
// import type { Chat } from "@google/genai";

// FIX: Moved AIStudio interface into the global scope to resolve subsequent property declaration errors.
// This ensures there is only one, globally-scoped definition for AIStudio.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
    jspdf: any;
    html2canvas: any;
    exifr: any;
    // FIX: Moved pdfjsLib here to be a true global on the window object, resolving 'Cannot find name' errors.
    pdfjsLib: any;
    $3Dmol: any;
  }
}

export interface CoherenceCriterion {
  criterion: string;
  evaluation: number;
  detail: string;
}

export interface PromptCoherenceAnalysis {
  promptText: string;
  contentCoherence: {
    score: number;
    issues: CoherenceCriterion[];
  };
  visualCoherence: {
    score: number;
    strengths: CoherenceCriterion[];
  };
  finalScore: {
    content: number;
    visual: number;
    total: number;
    level: string;
    summary: string;
  };
  recommendations: {
    title: string;
    detail: string;
  }[];
}

// --- ADMIN TYPES ---

export interface AuditLog {
  id: number;
  actor_id: string | null;
  target_id: string | null;
  action_type: string;
  details: string | null;
  ip_address: string | null;
  timestamp: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  token_version: number;
  roles: Role[];
}

export interface Role {
  id: number;
  name: string;
  description: string | null;
}



export interface PeriodicElement {
  numero_atomico: number;
  simbolo: string;
  nombre: string;
  masa_atomica: number;
  categoria: string;
  serie_quimica: string;
  block: string;
  periodo: number;
  grupo: number;
  fase_stp: string;
  densidad_g_l?: number;
  densidad_g_cm3?: number;
  punto_fusion_k: number | null;
  punto_ebullicion_k: number | null;
  configuracion_electronica: string;
  electronegatividad_pauling: number | null;
  estados_oxidacion: number[] | string;
  descubierto_por: string;
  descripcion_metaforica: string;
  xpos: number;
  ypos: number;
}

export interface Assistant {
  id: string;
  name: string;
  rolePrompt: string;
  knowledgeSource: {
    type: 'upload' | 'kb';
    files?: { name: string; content: string }[];
    kb_files?: string[]; // names of files from knowledge base
  };
  status: 'ACTIVE' | 'INACTIVE';
}

// FIX: Added missing SkillModule interface to fix type error in TitanWorkspace.tsx.
export interface SkillModule {
  id: string;
  name: string;
  instruction: string;
  status: 'ACTIVE' | 'INACTIVE';
}


export interface ParallelSimulationResult {
  total_capacity_kg_h: number;
  total_biochar_kg_h: number;
  total_pyro_oil_kg_h: number;
  total_pyro_gas_kg_h: number;
  modules: number;
}

export enum ContentType {
  Texto = 'Texto',
  Imagen = 'Imagen',
  Video = 'Video',
  Audio = 'Audio',
  Codigo = 'Código',
}

export type InteractionMode = 'direct' | 'assistant' | 'risk';

export interface FinancialRiskPackage {
  source: string;
  alert: 'CRITICAL' | 'WARNING' | 'INFO';
  details: string;
  financialImpact: {
    irr_change: number;
    npv_change_usd: number;
  };
}

// --- Handoff Data Structure ---
export interface StrategicBrief {
  moderator: {
    userId: string;
    name: string;
  };
  synthesis: string;
  targetAudiences: string[];
  keyAngle: string;
  suggestedPresets: string[];
}

export interface OriginalTrigger {
  type: string;
  reportId: string;
  data: any;
}

export interface DebateParticipant {
  name: string;
  role: string;
}

export interface ArgumentSummary {
  role: string;
  summary: string;
}

export interface DebateContext {
  debateId: string;
  debateTitle: string;
  participants: DebateParticipant[];
  argumentSummary: ArgumentSummary[];
  newSimulationData?: any;
}

export interface HandoffData {
  handoffId: string;
  timestamp: string;
  sourceModule: string;
  destinationModule: string;
  title: string;
  status: string;
  strategicBrief: StrategicBrief;
  originalTrigger: OriginalTrigger;
  debateContext: DebateContext;
}
// --- End Handoff Data ---

// FIX: Added missing NarrativeFields interface required by geminiService.ts.
export interface NarrativeFields {
  objective: string;
  audience: string;
  conflictPoint: string;
  uvp: string;
}

// FIX: Added missing AgentDefinition interface required by geminiService.ts.
export interface AgentDefinition {
  id: string;
  name: string;
  description: string;
}

// FIX: Added Participant interface, moved from TitansForum.tsx, for use in ForumConfig.
export interface Participant {
  id: string;
  role: string;
  intensity: number;
  type: 'internal' | 'external';
}

// FIX: Added missing ForumConfig interface required by geminiService.ts and TitansForum.tsx.
export interface ForumConfig {
  instructions: string;
  interactionStyle: string;
  participants: {
    id: string;
    role: string;
    intensity: number;
    type: 'internal' | 'external';
  }[];
  files: { name: string; type: string; data: string }[];
  knowledgeBaseFiles: { name: string; content: string }[];
  isContingencyMode: boolean;
}

// --- Decision Package for M5 -> M6 Handoff ---
export interface DecisionPackage {
  sourceModule: 'M5_Strategic_Risk_Simulator';
  simulationResult: {
    profitabilityProbability: number;
    avgIRR: number;
  };
  keyInputs: {
    investment: number;
    opex: number;
    biocharPrice: number;
    biocharPriceUncertainty: number;
    bioOilPrice: number;
    bioOilPriceUncertainty: number;
    synergyOrigin: string;
  };
  debateSetup: {
    title: string;
    participants: {
      role: string;
      titanId: string;
    }[];
    missionPrompt: string;
  };
}
// --- End Decision Package ---

export interface FormData {
  objective: string;
  tone: string;
  restrictions: string;
  outputLanguage?: string;
  location?: string;
  contextualLanguage?: string;
  keyVisualReference?: string;
  activeAgents: string[];
  specifics: {
    [ContentType.Texto]: {
      type?: string;
      audience?: string;
      narrativeCatalyst?: string;
      conflictPoint?: string;
      uvp?: string;
      cta?: string;
      rawData?: string;
      translationAudience?: string;
      uploadedDocument?: { name: string; content: string };
      visualToneSyncStyle?: string;
      simulationData?: ParallelSimulationResult; // Modified for fleet simulation results
      calculatedKpis?: any;
      dueDiligenceAnswers?: { [key: string]: string };
      // Enriched preset fields
      originalData?: FinancialRiskPackage | HandoffData | DecisionPackage | any;
      debateTranscript?: string;
      strategicSynthesis?: string;
      promptTemplate?: string;
    };
    [ContentType.Imagen]: {
      style?: string[];
      elements?: string;
      background?: string;
      location?: string;
      shotType?: string;
      lighting?: string;
      variety?: number;
      stylization?: number;
      rarity?: number;
      // FIX: Added '4:3' and '3:4' to the aspectRatio type to support more image formats as per Gemini API guidelines and fix the error in data/galleryItems.ts.
      aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
      lensType?: string;
      lensAperture?: string;
      cameraType?: string;
      exposureValue?: string;
      referenceImageUrl?: string;
      uploadedImage?: { data: string; name: string; type: string; };
      author?: string;
      creationDate?: string;
      keywords?: string;
      levelOfDetail?: string;
      numberOfImages?: number;
      visualGradient?: string;
    };
    [ContentType.Video]: {
      audiovisualSequence?: AudiovisualScene[];
      videoCreationMode?: 'text-to-video' | 'image-to-video' | 'video-to-video';
      scriptSummary?: string;
      cameraMovement?: string;
      visualStyle?: string;
      vfx?: string;
      environment?: string;
      soundDesign?: string;
      musicGenre?: string;
      videoUrl?: string;
      inspirationImages?: { data: string; name: string; type: string; }[];
      duration?: string | number;
      artisticStyle?: string[];
      marketingPreset?: string;
      enableAdvancedSpatialAudio?: boolean;
      musicSelectionMode?: string;
      musicPreset?: string;
      customMusicFile?: any;
      attenuationCurve?: string;
      sourceImageForVideo?: { data: string; name: string; type: string; };
      sourceVideo?: { data: string; name: string; type: string; };
      mediaToVideoPrompt?: string;
      // FIX: Added '4:3' and '3:4' to aspectRatio to match the Image type, resolving a type conflict in Creator components.
      aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
      // Sinergia Estratégica
      videoWorkflow?: 'manual' | 'synergy';
      synergySourceDocument?: { name: string; content: string };
      strategicMilestones?: { id: string; title: string; description: string }[];
      emotionalTone?: string;
      targetAudience?: string;
      generatedCinematicScript?: string;
    };
    [ContentType.Audio]: {
      scriptContent?: string;
      voiceAgent?: string;
      voiceIntonation?: string;
      ambiencePreset?: string;
      uploadedAudioFile?: { name: string; data: string; type: string };
      outputFormat?: 'MP3' | 'WAV';
      generatedAudioUrl?: string;
      voiceTone?: string;
      readingSpeed?: number;
      continuousAmbiance?: string;
      isolatedEffects?: string;
      musicGenre?: string;
      scriptFormat?: 'monologue' | 'dialogue';
      hostVoice?: string;
      titanVoice?: string;
    };
    [ContentType.Codigo]: {
      scriptType?: 'vrc' | 'generador' | 'validador_prompt' | 'documentador';
      emotionalDirection?: string;
      basePrompt?: string;
      parametersToVary?: string;
      promptToValidate?: string;
      validationCriteria?: string;
      codeToDocument?: string;
    };
  };
  scenarioA?: SimulationFormData;
  scenarioB?: SimulationFormData;
  // FIX: Added optional 'contentType' to FormData to align with its use in story missions and resolve a type error in App.tsx.
  contentType?: ContentType;
}

export interface ProFormData {
  pro_concept: string;
  pro_emotion: string;
  pro_symbolism: string;
  pro_composition_rule: string;
  pro_color_theory: string;
  pro_specific_palette: string;
  pro_focal_length: string;
  pro_shutter_speed: string;
  pro_iso: string;
  pro_lens_effects: string;
  pro_post_production: string;
}

export interface NarrativeConsistencyFeedback {
  stylisticCohesion: { score: number; analysis: string };
  emotionalIntensity: { score: number; analysis: string };
}

export interface TextualNarrativeCoherence {
  stylisticCohesion: { score: number; analysis: string };
  narrativeArchitecture: { score: number; analysis: string };
  audienceTranslation: { score: number; analysis: string };
}

export interface AgentSolution {
  agent: string;
  correctionType: string;
  description: string;
  changes: Partial<FormData>;
}

export interface GeoContextualData {
  validationMode: 'FACTUAL' | 'CONTEXTUAL';
  latitude?: string;
  longitude?: string;
  climate?: string;
  ambientAudio?: string;
  context?: string;
  symbolicConditions?: string;
  symbolicAudio?: string;
}

export interface DirectorAnalysis {
  analyzedScene: {
    baseDescription: string;
    appliedTechnique: string;
    techniqueDescription: string;
  };
  impactAnalysis: {
    components: {
      component: string;
      criterion: string;
      result: string;
      professionalismIndex: number;
    }[];
    finalCompositeIndex: {
      result: string;
      professionalismIndex: number;
    };
  };
  directorsJudgment: {
    addedValue: string;
    risk: string;
    finalIndex: number;
  };
  academyConclusion: {
    techniqueLevel: string;
    analysisSummary: string;

    recommendation: string;
  };
  cinematicPrompt: string;
}

export interface PyrolysisMaterial {
  id: number;
  fase: 'Sólido' | 'Líquido' | 'Gaseoso';
  nombre: string;
  categoria: string;
  propiedades: any; // Can be Solid, Liquid, or Gaseous properties
  origen_feedstock?: string;
}

export interface SolidMaterial extends PyrolysisMaterial {
  fase: 'Sólido';
  propiedades: {
    composicion: { celulosa?: number; hemicellulosa?: number; lignina?: number };
    analisisElemental: { carbono: number; hidrogeno: number; oxigeno: number; nitrogeno: number; azufre: number };
    analisisInmediato: { humedad: number; cenizas: number; materiaVolatil: number; carbonoFijo: number };
    poderCalorificoSuperior: number;
    rendimientoProductos?: { temperatura: number; bio_aceite: number; carbon: number; gas: number }[];
    propiedadesFisicas?: {
      densidad_kg_m3?: number;
      conductividad_W_mK?: number;
      poderCalificoInferior_MJ_kg?: number;
    };
  };
}

export interface LiquidMaterial extends PyrolysisMaterial {
  fase: 'Líquido';
  propiedades: {
    propiedadesFisicas: { densidad_kg_m3: number; viscosidad_cSt_a_50C: number; ph: number };
    analisisElemental: { carbono: number; hidrogeno: number; oxigeno: number; nitrogeno: number; azufre: number; cloro_porcentaje?: number };
    contenidoAgua_porcentaje: number;
    poderCalorificoSuperior_MJ_kg: number;
    composicionQuimica_porcentaje?: Record<string, number | undefined>;
    composicionHidrocarburos_porcentaje?: Record<string, number | undefined>;
  };
}

export interface GaseousMaterial extends PyrolysisMaterial {
  fase: 'Gaseoso';
  propiedades: {
    composicion_vol_porcentaje: { H2: number; CO: number; CO2: number; CH4: number; C2_C4: number; N2: number };
    poderCalorificoInferior_MJ_Nm3: number;
    relacion_H2_CO: number;
    contaminantes: { alquitran_g_Nm3: number; azufre_ppm: number; HCI_ppm?: number };
  };
}

export interface OracleRecommendation {
  catalystName: string;
  justification: string;
  citations: string[];
}

export interface OptimizationResult {
  temperatura: number;
  tiempoResidencia: number;
  oxigeno: number;
  justificacion: string;
}

export interface ExperimentResultPoint {
  params: Record<string, number>;
  result: SimulationResult;
  objectiveValue: number;
}

export interface ExperimentConfig {
  variables: ExperimentVariable[];
  objective: string;
  materialId: number;
}
export interface ExperimentResult {
  config: ExperimentConfig;
  resultsMatrix: ExperimentResultPoint[];
  optimalPoint: ExperimentResultPoint;
  concilioAnalysis: string;
}

export interface ExperimentVariable {
  id: string;
  name: 'temperatura' | 'tiempoResidencia' | 'oxigeno';
  min: number;
  max: number;
  steps: number;
}


export interface AudiovisualScene {
  id: string;
  sceneTitle: string;
  narration: string;
  duration: number;
  visualPromptPreset: string;
  visualPromptFreeText: string;
  soundDesign: string;
}

export interface NarrativeBrief {
  overallTone: string;
  emotionalArc: string;
  visualProgression: string;
  soundProgression: string;
  directorsNote: string;
}

export interface VideoPreset {
  preset_name: string;
  category: string;
  description: string;
  parameters: Record<string, any>;
  prompt_block: string;
}

export interface GenrePack {
  genre: string;
  description: string;
  presets: VideoPreset[];
}

export interface AssaySuggestion {
  titulos: string[];
  objetivos: string[];
  metodologias: string[];
  consejoDelDia: {
    agente: string;
    mensaje: string;
  };
}

export interface GasProposal {
  id: number;
  titulo: string;
  objetivo: string;
  metodologiaSugerida: string;
  isDreamInspired: boolean;
}

export interface Verdict {
  estado: 'OK' | 'ADVERTENCIA' | 'ERROR';
  mensaje: string;
}

export interface StyleDefinition {
  id_style: string;
  style: string;
  description: string;
  category: string;
  categoryName: string;
  sensacion_atmosfera: [string, string];
  color_palette?: {
    dominant: string[];
    accent: string[];
  };
  artist_inspiration?: string[];
  keywords?: string[];
  video_presets?: Record<string, any>;
  pep_config?: any;
}

export interface ClassifiedStyleGroup {
  id: string;
  category: string;
  styles: string[];
}

export interface SensationCategory {
  id: string;
  name: string;
  narrativePurpose: string;
}

export type View = 'creator' | 'library' | 'pro' | 'academia' | 'editor' | 'gallery' | 'pro-layouts' | 'tasks' | 'pyrolysis-hub' | 'comparative-lab' | 'knowledge-base' | 'process-optimizer' | 'property-visualizer' | 'energy-balance' | 'user-guide' | 'game' | 'experiment-designer' | 'titans-atrium' | 'hmi-control-room' | 'hyperion-9' | 'assay-manager' | 'aegis-9' | 'phoenix' | 'vulcano' | 'bioeconomy-lab' | 'chronos' | 'agriDeFi' | 'gaia-lab' | 'innovation-forge' | 'kairos-panel' | 'strategic-risk-simulator' | 'cogeneration-simulator' | 'fleet-simulator' | 'catalyst-lab' | 'utilities-simulator' | 'generative-simulator' | 'circular-fleet' | 'energy-explorer' | 'viability-assessor' | 'eco-casa-simulator' | 'detailed-project-input' | 'sustainable-certs' | 'certification-comparator' | 'podcast-studio' | 'titans-debate' | 'due-diligence-analyzer' | 'call-simulator' | 'collaboration-agreement' | 'interactive-fundamentals-lab' | 'architectural-synthesis-dashboard' | 'system-status-report' | 'user-profile' | 'manifesto' | 'story-mode' | 'eco-hornet-twin' | 'expert-command-center' | 'titan-workstation' | 'cinematic-audit' | 'nexo-bridge' | 'admin-console';
// FIX: The SystemCategory type has been updated to reflect the new categorization used throughout the application.
export type SystemCategory = 'Núcleo Creativo' | 'Estudios y Talleres' | 'Simulación Industrial' | 'Análisis y Datos' | 'Finanzas y Estrategia' | 'Colaboración y Sistema';
export interface SystemElement {
  id: View;
  nameKey: string;
  icon: React.ReactNode;
  type: SystemCategory;
}

export interface InspirationItem {
  id: string;
  title: string;
  description: string;
  prompt: string;
  formData: Partial<FormData>;
}

export interface PepPreset {
  type: string;
  category: string;
  action: string;
  technical_output: string;
  style_reference_suggestion?: string;
}

export interface Preset {
  name: string;
  data: Partial<FormData>;
  skipCoherenceEvaluation?: boolean; // If true, skips automatic coherence evaluation when preset is applied
}

export type TaskStatus = 'Por Hacer' | 'En Progreso' | 'Completado';
export type EventType = 'ViabilityAnalysis' | 'VisualCampaign' | 'ExecutiveReport' | 'MarketOpportunityAnalysis' | 'ComparativeAnalysis' | 'Assay' | 'Resultado de Simulación' | 'LogisticsReport' | 'PodcastAnnouncement' | 'DueDiligenceReport' | 'CallForProposalDraft' | 'FundamentalCalculation' | 'MaterialSearchReport' | 'TitansDebate';

export interface SubTask {
  name: string;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface AssayDetails {
  linkedMaterialId: number | null;
  objective: string;
  methodology: string;
  labResults: { name: string; content: string }[];
}

export interface Task {
  id: string;
  title: string;
  createdAt: number;
  dueDate?: number;
  status: TaskStatus;
  contentType: ContentType;
  formData: Partial<FormData>;
  isIntelligent?: boolean;
  agentId?: string;
  eventType?: EventType;
  subTasks?: SubTask[];
  latitude?: number;
  longitude?: number;
  videoUrl?: string;
  result?: { text: string };
  zone?: 'Sólida' | 'Líquida' | 'Gaseosa';
  stateLabel?: string;
  originSource?: 'Concilio' | 'Prometeo' | 'user';
  activeAgent?: string;
  assayDetails?: AssayDetails;
}

export interface MapClickPayload {
  lat: number;
  lng: number;
}

export interface CorporateEntity {
  EntityID: string;
  EntityName: string;
  EntityType: string;
  HeadquartersCountry: string;
  WikiURL: string;
  OwnershipPercentage?: number; // As per data structure in corporateDataService
  Subsidiaries: CorporateEntity[];
  Assets: Asset[];
}

export interface Asset {
  AssetID?: string;
  PlantID?: string;
  AssetName?: string;
  PlantName?: string;
  Country: string;
  Status: string;
  Capacity: number;
  CapacityUnit: string;
  OwnershipPercentage: number;
  AssetType: string;
}

export type Board = (number | null)[][];
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface CoPreset {
  name: string;
  initialTemp?: number;
  targetTemp: number;
  residenceTime: number;
  flowN2: number;
  agentMode: string;
  cinematicDescription: string;
}

export interface CharacterProfile {
  claveName: string;
  archetype: string;
  physicalAppearance: string;
  emotionalPersonality: string;
  relationalState: string;
  linkedIn: {
    name: string;
    title: string;
    about: string;
    skills: string[];
  };
  mantra: string;
  imagePrompt: string;
  system_prompt: string;
  audio: {
    description: string;
    voice: string;
    soundDesign: string;
  };
  video: {
    description: string;
  };
  code: {
    description: string;
    language: string;
    snippet: string;
  };
  subjectiveProfile: {
    carta_astral: string[];
    codigo_etico: string;
    diario_de_sueños?: { type: string, content: string, timestamp: number }[];
  };
  assistants?: Assistant[];
  // FIX: Added 'skillModules' to CharacterProfile to resolve type error.
  skillModules?: SkillModule[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  file?: {
    name: string;
    type: string;
    data: string;
  };
  isSystem?: boolean;
  isAction?: boolean;
  actions?: { id: string; label: string }[];
  actionsDisabled?: boolean;
}

export type LayoutBlockId = 'image' | 'data' | 'fcn' | 'prompt' | 'title' | 'video' | 'history';

export interface LayoutItem {
  id: LayoutBlockId;
  className?: string;
  span?: number;
}

export interface LayoutStructure {
  type: 'flex' | 'grid';
  direction?: 'row' | 'col';
  columns?: number;
  gap?: number;
  className?: string;
  items: (LayoutStructure | LayoutItem)[];
}

export interface ProLayout {
  id: string;
  title: string;
  rationale: string;
  category: 'visual' | 'text_code';
  structure: LayoutStructure;
}

export interface GenerationHistory {
  appliedSolution: AgentSolution;
}

export interface Marker {
  lat: number;
  lng: number;
  popupText: string;
}

export interface Feedstock {
  name: string;
  type: string;
  composition: {
    carbon: number;
    hydrogen: number;
    oxygen: number;
    cellulose?: number;
    hemicellulose?: number;
    lignin?: number;
  };
}

export interface BiomassPyrolysisMode {
  id: string;
  nombre: string;
  condiciones_tipicas: { temperatura_C: string; tasa_calentamiento: string; tiempo_residencia: string };
  rendimiento_base_porcentaje: { liquido: number; solido: number; gas: number };
  analisis_ia: string;
}

export interface Catalyst {
  id: string;
  nombre: string;
  descripcion: string;
  aplicable_a: string[];
  efecto_simulado: {
    modificador_condiciones: string;
    modificador_rendimiento: { liquido: string; solido: string; gas: string };
    mejora_calidad_liquido: string;
    mejora_calidad_gas: string;
  };
}

export interface HeatSource {
  id: string;
  nombre: string;
  descripcion: string;
  efecto_simulado: HeatSourceEffect;
}
export interface SimulationKPIs {
  coste_bio_aceite: number;
  eficiencia_carbono: number;
  eficiencia_energetica: number;
  emisiones_netas: number;
}
export interface HeatSourceEffect {
  kpis: SimulationKPIs;
  analisis_ia: string;
  carbon_balance?: Record<string, number>;
  sensitivity_analysis?: { parameter: string, impact_factor: number }[];
}

export interface GasPhaseComposition {
  H2: number;
  CO: number;
  CO2: number;
  CH4: number;
  C2_C4: number;
  N2: number;
}
export interface PlasticPyrolysisMode {
  id: string;
  nombre: string;
  condiciones_tipicas: { temperatura_C: string };
  rendimiento_base_porcentaje: { liquido: number; solido: number; gas: number, ceras?: number };
  analisis_ia: string;
}

export interface SimulationInsights {
  key_findings: string[];
  recommendations: string[];
  sensitivity_analysis: string;
}

export interface SimulationEngine {
  biomass_pyrolysis_modes: BiomassPyrolysisMode[];
  plastic_pyrolysis_modes: PlasticPyrolysisMode[];
  catalysts: Catalyst[];
  heat_sources: HeatSource[];
  biomass_materials: number[];
  plastic_materials: number[];
}

export interface SimulationFormData {
  simulationMode: 'simple' | 'avanzado' | 'extremo';
  // FIX: Corrected typo from hemicelulosa to hemicellulosa to match other types.
  composition: { celulosa: number; hemicellulosa: number; lignina: number };
  simpleCatalystId: string | null;
  mixture: { materialId: number; percentage: number }[];
  advancedCatalystId: string | null;
  selectedBiomassModeId: string;
  selectedHeatSourceId: string;
  sensitivityChange: number;
  temperatura: number;
  tiempoResidencia: number;
  oxigeno: number;
  temperaturaRange?: number;
  tiempoResidenciaRange?: number;
  compositionUncertainty?: number;
  // FIX: Added missing properties for financial simulation to resolve type error in App.tsx.
  investment?: number;
  years?: number;
  costOfCapital?: number;
  opex?: number;
  opexUncertainty?: number;
  bioOilPrice?: number;
  bioOilPriceUncertainty?: number;
  biocharPrice?: number;
  biocharPriceUncertainty?: number;
}

export interface PlantModel {
  capacityGallonsPerYear: number;
  ethanolFlowGallonsPerHour: number;
  electricalDemandKW: number;
  thermalDemandKJPerHour: number;
  fuelConsumptionTonsPerDay: number;
}

export interface SimulationResult {
  simulatedYield: { liquido: number; solido: number; gas: number; ceras?: number } | null;
  kpis: SimulationKPIs | null;
  qualityInsights: string[];
  aiAnalysis: string;
  carbonBalance: Record<string, number> | null;
  gasComposition: GasPhaseComposition | null;
  simulationInsights: SimulationInsights | null;
  effectiveMaterial?: PyrolysisMaterial;
  plantModel: PlantModel | null;
  yieldDistribution?: {
    liquido: { mean: number; min: number; max: number; stdDev?: number };
    solido: { mean: number; min: number; max: number; stdDev?: number };
    gas: { mean: number; min: number; max: number; stdDev?: number };
  };
  yieldRawDistribution?: {
    liquido: number[];
    solido: number[];
    gas: number[];
  };
  sensitivityAnalysis?: { variable: string; impact: number; description: string; }[];
}

// Added for the M3 Simulator in TitanWorkstation
export interface SimpleSimulationResult {
  yields: {
    'Bio-aceite': number;
    'Biochar': number;
    'Gas': number;
  };
  distribution: number[];
}


export type ReactorStatus = 'Inactivo' | 'Arrancando' | 'Estable' | 'Enfriando' | 'Alerta';
export type OrionViewType = 'thermal' | 'production' | 'security' | 'maintenance' | 'agents' | 'camera';
export type AgentMode = 'Manual' | 'Automático (PID)' | 'Auto-Optimización (IA)' | 'Solo Monitoreo';

export interface ReactorState {
  id: string;
  status: ReactorStatus;
  feedstock: string;
  feedstockType: string;
  agentMode: AgentMode;
  temperature: number;
  targetTemp: number;
  pressure: number;
  feedRate: number;
  bioOilOutput: number;
  emergencyStop: 'ARMADO' | 'DESARMADO';
  o2Level: number;
  pelletPurity: number;
  pelletMoisture: number;
  efficiencyFactor: number;
}

export type HMIStatus = 'APAGADO' | 'CALENTANDO' | 'ESTABLE' | 'ENFRIANDO';

export interface HMIState {
  systemMode: HMIStatus;
  targetTemp: number;
  residenceTime: number;
  oxygenConcentration: number;
  agentMode: AgentMode;
  reactorTemp: number;
  reactorWallTemp: number;
  reactorPressure: number;
  pyrometerCoreTemp: number;
  thermocoupleCoreTemp: number;
  energyConsumption: number;
  feedRate: number;
  vaporFlow: number;
  n2Flow: number;
  n2Pressure: number;
  biomassFeederRpm: number;
  biomassFeederState: boolean;
  biomassHopperLevel: number;
  bioOilTankLevel: number;
  aqueousPhaseTankLevel: number;
  condenserState: string;
  condensateFlow: number;
  condenserTemp: number;
  coolingPower: number;
  dischargeSystemState: string;
  dischargeValve: string;
  dischargeRate: number;
  coolerState: string;
  biocharTemp: number;
  coolingWaterFlow: number;
  biocharContainerLevel: number;
  biocharTempCooler: number;
  catalystSystemState: string;
  selectedCatalyst: string;
  catalystDoseTarget: number;
  catalystDoseActual: number;
  catalystFeederRpm: number;
  catalystDoseValve: string;
  catalystHopperLevel: number;
  co: number;
  co2: number;
  h2: number;
  ch4: number;
  safetySystem: string;
  ambientO2: number;
  inertGasPurge: string;
  refrigerationSystemState: string;
  coolantTempIn: number;
  coolantTempOut: number;
  coolantPressure: number;
  chillerPower: number;
  refrigerationPumpState: string;
  groundingStatus: 'OK' | 'FALLO';
  insulationIntegrity: number;
}

export interface Alarm {
  id: string;
  timestamp: number;
  type: string;
  message: string;
  level: 'med' | 'high' | 'crit';
  acknowledged: boolean;
}

export interface AlarmConfig {
  enabled: boolean;
  med: number;
  high: number;
  crit: number;
  medSound: string;
  highSound: string;
  critSound: string;
}

export interface KnowledgeBaseData {
  id: string;
  studyTitle: string;
  summary: string;
  sensitivity: string;
  regulations?: string[];
  massBalance?: {
    title: string;
    unit: string;
    inputs: { name: string; value: number }[];
    outputs: { name: string; value: number }[];
    notes: string;
  };
  customContent?: React.ReactNode;
}

export type WasteComposition = {
  biomasaOrganica: number;
  plasticosDeseados: number;
  plasticosContaminantes: number;
  metales: number;
  inertes: number;
};

// FIX: Added missing 'ArgusModel' type definition to resolve import errors in App.tsx and components/tools/Phoenix.tsx.
export interface ArgusModel {
  datasetSize: number;
  precision: number;
  falsePositiveRate: number;
}

export type ArgusKpis = {
  tasaClasificacion: number;
  purezaOrganico: number;
  eficienciaDeteccion: number;
};

export type MachineStatus = 'OK' | 'ATASCO' | 'SOBRECALENTAMIENTO';

export interface PhoenixState {
  isRunning: boolean;
  wasteComposition: WasteComposition;
  argusKpis: ArgusKpis;
  continuousLearning: boolean;
  trituradorasStatus: MachineStatus;
  secadorStatus: MachineStatus;
  pelletProduction: number; // kg/h
  pelletQuality: {
    purity: number; // %
    moisture: number; // %
  };
  pelletSiloLevel: number; // kg
}

export interface AegisEvent {
  id: string;
  timestamp: number;
  sector: string;
  type: 'Seguridad' | 'Mecánica' | 'Incendio' | 'Vigilancia';
  level: 'Info' | 'Advertencia' | 'Alerta' | 'Vigilancia';
  message: string;
}

export interface AegisState {
  ncsLevel: 1 | 2 | 3 | 4 | 5;
  activeSector: string;
  events: AegisEvent[];
  directorDirective: string | null;
}

export type VulcanoMachineStatus = 'OK' | 'ATASCO' | 'APAGADO';

export interface VulcanoState {
  isRunning: boolean;
  inputTonsPerDay: number;
  storageLevelTons: number; // Current inventory of used tires
  fireRisk: number; // 0-100
  sanitaryRisk: number; // 0-100
  machines: {
    debeader: VulcanoMachineStatus;
    primaryShredder: VulcanoMachineStatus;
    rasperMill: VulcanoMachineStatus;
    granulators: VulcanoMachineStatus;
    magneticSeparators: VulcanoMachineStatus;
    textileClassifiers: VulcanoMachineStatus;
  };
  processingRateTiresPerHour: number;
  outputPurity: {
    gcr: number;
    steel: number;
    fiber: number;
  };
  productionRateKgPerHour: {
    gcr: number;
    steel: number;
    fiber: number;
  };
  siloLevelsKg: {
    gcr: number;
    steel: number;
    fiber: number;
  };
  hefestosLog?: string[];
}

// --- Gaia Module Types ---
export interface GaiaLabState {
  isNewBatchReady: boolean;
  sampleId: string | null;
  analysisResults: {
    carbon: number;
    ph: number;
    porosity: number;
    ash: number;
  } | null;
  quality: 'PREMIUM' | 'ESTÁNDAR' | null;
}

// --- Chronos Module Types ---
export interface AssetOriginState {
  assetType: string;
  estimatedVolume: number;
  marketValue: number;
  liquidationDate: string;
  status: 'PENDING' | 'VERIFYING' | 'VERIFIED';
}

export interface TokenizableAsset extends AssetOriginState {
  id: string;
  category: 'Commodity' | 'CarbonCredit';
  tokenName: string;
  nominalValue: number;
}

export interface TokenStructureState {
  rights: string;
  tokenName: string;
  nominalValue: number;
  totalSupply: number;
}

export interface IssuanceState {
  contractStatus: 'UNDEPLOYED' | 'DEPLOYED';
  tokenStatus: 'UNMINTED' | 'MINTED';
  contractAddress: string | null;
  events: string[];
}

export interface STOState {
  assetId: string | null;
  investors: { id: number; amount: number }[];
  fundsRaised: number;

  target: number;
  status: 'PREPARING' | 'ACTIVE' | 'COMPLETED';
}

export interface ChronosState {
  phase: 1 | 2 | 3 | 4 | 5;
  assetOrigin: AssetOriginState;
  tokenStructure: TokenStructureState;
  liquidation: {
    status: 'PENDING' | 'EXECUTED';
    salePrice: number | null;
    profitPercentage: number | null;
  };
  secondaryAssets: TokenizableAsset[];
}

export type GroupKey = 'A' | 'B' | 'C';
export type GroupData = { preset: CoPreset | null; reactors: string[] };

export interface PerformanceProfile {
  temperature_range_c: string;
  yield_biochar_percent: number;
  yield_pyro_oil_percent: number;
  yield_pyro_gas_percent: number;
}

export interface PyrolysisPlantData {
  id: string;
  model_name: string;
  capacity_kg_h: number;
  technology: string;
  input_feedstock: string[];
  performance: {
    low_temp_pyrolysis: PerformanceProfile;
    medium_temp_pyrolysis: PerformanceProfile;
    high_temp_pyrolysis: PerformanceProfile;
  };
}

export type FleetModuleStatus = 'Inactivo' | 'Operando' | 'En Espera' | 'Falla';

export interface FleetModule {
  id: string;
  presetId: string;
  status: FleetModuleStatus;
  results: {
    bioOil: number;
    biochar: number;
    gas: number;
    energyConsumption: number; // in kW
    temperature: number;
    pressure: number;
  } | null;
}

export interface FleetSimulationResult {
  totalBioOil_kg_h: number;
  totalBiochar_kg_h: number;
  totalGas_kg_h: number;
  totalEnergy_kW: number;
  generalStatus: string;
}

// FIX: Added FleetCommand type to resolve 'Cannot find name' error in App.tsx.
export type FleetCommand = { type: 'APPLY_PRESET'; payload: string } | { type: 'START_ALL' } | { type: 'STOP_ALL' };

export interface SynthesizedCatalyst {
  name: string;
  // Synthesis params
  siAlRatio: number;
  templateType: 'Orgánico (TPAOH)' | 'Inorgánico (Na+)' | 'Sin Plantilla';
  crystallizationTime: number; // Renamed from synthesisTime
  calcinationTemp: number;
  // Simulated properties
  properties: {
    acidity: number; // 0-100 scale
    thermalStability: number; // 0-100 scale
    cokeResistance: number; // 0-100 scale
    shapeSelectivity: 'Alta' | 'Media' | 'Baja';
    microporeVolume: number; // cm³/g
    mesoporeVolume: number; // cm³/g
    crystalSize: number; // nm
  };
  frameworkType: 'AEL' | 'AST' | 'MFI' | null;
}

export interface UtilityCostState {
  steamHpPrice: number;
  steamMpPrice: number;
  steamLpPrice: number;
  refrigerationPriceKwhCooling: number;
  coolingWaterPriceM3: number;
  compressedAirPriceKwh: number;
  firedHeatPriceMMBtu: number;
  gridElectricityPrice: number;
  biogasPrice_m3: number; // €/m³
}

export type UtilityDutyType = 'fired-heat' | 'refrigeration' | 'cooling-water' | 'compressed-air' | 'process-power' | 'fleet-fuel';

export interface UtilityWidgetState {
  isOpen: boolean;
  duty: number | null;
  dutyType: UtilityDutyType | null;
  unit: string | null;
}

// --- Circular Fleet Module Types ---
export type VehicleTechnology = 'Eléctrico' | 'Gas Natural/Biogás' | 'Híbrido';
export type VehicleStatus = 'En Ruta' | 'Recargando' | 'En Pausa';

export interface Vehicle {
  id: string;
  tech: VehicleTechnology;
  model: string;
  status: VehicleStatus;
  fuelLevel: number; // 0-100
  kpis: {
    distance: number; // km
    wasteCollected: number; // ton
    operatingHours: number;
  };
}

export interface FleetVehicleOption {
  tech: VehicleTechnology;
  manufacturer: string;
  model: string;
  country?: string;
  consumptionRate_m3_h?: number; // for gas trucks
  consumptionRate_percent_h?: number; // unified consumption in % per hour
  chargeRate_percent_h?: number; // for electric
  refuelRate_percent_h?: number; // for gas, to simulate fast refueling
  fuelCapacity_m3_or_kwh?: number;
}

export interface DetailedProjectData {
  // Section A
  projectName?: string;
  location?: string;
  housingType?: string;
  area?: string;
  occupants?: string;
  projectStage?: string;
  // Section B
  orientation?: string;
  walls?: string;
  roof?: string;
  windows?: string;
  solarProtection?: string;
  // Section C
  hvac?: string;
  hotWater?: string;
  lighting?: string;
  appliances?: string;
  waterSaving?: string;
  renewableEnergy?: string;
  wasteManagement?: string;
  // Section D
  simSoftware?: string;
  climateData?: string;
  simScenarios?: string;
  simAssumptions?: string;
  // Section E
  ecoScore?: string;
  ecoLevel?: string;
  energyConsumption?: string;
  energyReduction?: string;
  waterConsumption?: string;
  waterReduction?: string;
  co2Avoided?: string;
  economicSavings?: string;
}

export interface ArchitecturalStyle {
  id: string;
  nombre: string;
  descripcion: string;
  materiales_clave: string[];
  conexion_pyrolysis_hub: string;
  utilidad_transversal: string;
}

// FIX: Added missing DEXListing interface for Hyperion-9.tsx
export interface DEXListing {
  tokenName: string;
  price: number;
  change24h: number;
}

export interface TechnicalRiskPackage {
  reportId: string;
  timestamp: string;
  sourceModule: 'M3_Technical_Risk_Simulator';
  projectContext: {
    projectName: string;
    material: string;
  };
  inputs: {
    parameters: {
      name: string;
      baseValue: number;
      unit: string;
      uncertainty: number;
    }[];
    simulationRuns: number;
  };
  outputDistributions: {
    product: 'Bio-aceite' | 'Gas' | 'Coque (Biochar)';
    unit: string;
    distributionType: 'normal';
    mean: number;
    stdDev: number;
    confidence95_low: number;
    confidence95_high: number;
  }[];
  aiAnalysis: {
    kineticAnalysis: string;
    sensitivityAnalysis: {
      primaryFactor: string;
      message: string;
    };
  };
  visualizationData: {
    bioOilHistogram: {
      buckets: number[];
      counts: number[];
    };
  };
}


export interface ProductYieldDistribution {
  mean: number;
  stdDev: number;
  unit: string;
}

export interface TechnicalRiskProfile {
  source: 'M3_TECHNICAL_RISK_SIMULATOR';
  timestamp: number;
  productProfiles: {
    productName: 'bio-oil' | 'biochar' | 'gas';
    yieldDistribution: ProductYieldDistribution;
  }[];
}

export interface CompoundRiskAnalysis {
  directorSummary: string;
  risks: {
    id: 'technical' | 'market';
    title: string;
    module: string;
    primaryFactor: string;
    aiAnalysis: string;
    suggestedAction: string;
  }[];
}

export interface NftMetadata {
  name: string;
  description: string;
  image: string;
  attributes: { trait_type: string; value: string }[];
  proof_of_validation: {
    capstone_submission_id: string;
    governance_proposal_id: string;
    governance_contract: string;
    validation_tx_hash: string;
  };
}

export interface Certification {
  id: string;
  name: string;
  level: number;
  reactor: string;
  nftMetadata: NftMetadata;
  mintDate: string;
}

export interface GovernanceEvent {
  date: string;
  title: string;
  points: string;
  details: {
    label: string;
    value: string;
    link?: boolean;
  }[];
}

// --- M5 -> M3 Handoff ---
export interface OptimizationChallengePackage {
  handoffId: string;
  timestamp: string;
  sourceModule: 'M5_Finance_Kairos_Auditor';
  destinationModule: 'M3_Industrial_Simulation';
  challengeTitle: string;
  financialContext: {
    status: 'Audit_Failed';
    diagnostic: string;
    keyProblem: string;
  };
  financialConstraints: {
    targetCostOfCapital: { value: number; unit: string; notes: string };
    productionCosts: { baseValue: number; uncertainty: number; unit: string; notes: string };
    projectDuration: { value: number; unit: string };
    capitalToRaise: { value: number; unit: string };
  };
  optimizationChallenge: {
    objective: string;
    targetMetric: string;
    targetThreshold: number;
    suggestedTools: string[];
  };
}

export interface AutoSolution {
  introduccion: string;
  analisisCostos: {
    titulo: string;
    descripcion: string;
    opcionA: string;
    opcionB: string;
    ahorro: string;
  };
  protocoloLimpieza: {
    titulo: string;
    descripcion: string;
    pasos: string[];
  };
  recomendacionFinal: string;
}
export interface FinalOptimizationPackage {
  handoffId: string;
  timestamp: string;
  sourceModule: "M3_Hefesto_Workstation";
  destinationModule: "M5_Kairos_Risk_Simulator" | "M6_Governance_Debate";
  optimizationDetails: {
    temperature: number;
    residenceTime: number;
    uncertainty: number;
    yieldBioOil: number;
  };
  contextualChatHistory: string;
}

export interface GovernanceHandoffPackage {
  handoffId: string;
  timestamp: string;
  sourceModule: 'M3_Hefesto_Workstation';
  destinationModule: 'M6_Governance_Debate';
  triggeringEvent: {
    title: string;
    summary: string;
  };
  simulationInputs: {
    projectParams: { label: string; value: number }[];
  };
  simulationResults: {
    kpis: { label: string; value: number; unit: string }[];
  };
  debateProposal: {
    suggestedTitle: string;
    suggestedInstructions: string;
    suggestedRoles: {
      mainProponent: { name: string; rationale: string };
      criticalOpponent: { name: string; rationale: string };
      moderator: { name: string; rationale: string };
    };
  };
  technicalProof: FinalOptimizationPackage;
}

// ===================================
// POST-EXPERIMENT INTELLIGENCE TYPES
// ===================================

export interface ReactorResult {
  id: string;
  energy: number;
  group?: string;
  preset?: string;
}

export interface EconomicAnalysis {
  comparison_id: string;
  winner: {
    id: string;
    cost: number;
  };
  loser: {
    id: string;
    cost: number;
  };
  savings_per_run: number;
  efficiency_gain_percent: number;
  annual_projected_savings: number;
  financial_verdict: string;
}

export interface AcademicAnalysis {
  hypothesis: string;
  control_stats: {
    mean: number;
    std: number;
    label: string;
  };
  test_stats: {
    mean: number;
    std: number;
    label: string;
  };
  delta: number;
  t_statistic: number;
  p_value: number;
  is_significant: boolean;
  academic_abstract: string;
}

export interface PostExperimentReport {
  economic?: EconomicAnalysis;
  academic?: AcademicAnalysis;
  triggered_tasks: string[];
  timestamp: string;
}

export interface NexoConfig {
  system_info: {
    app_name: string;
    version: string;
  };
  modules: {
    economic_auditor: {
      enabled: boolean;
      parameters: {
        electricity_rate_kwh: number;
        currency_symbol: string;
        industrial_hours_per_year: number;
      };
      thresholds: {
        min_savings_for_alert: number;
        high_impact_savings: number;
      };
    };
    academic_researcher: {
      enabled: boolean;
      parameters: {
        confidence_level: number;
        alpha_significance: number;
      };
    };
  };
  orchestration_rules: Array<{
    id: string;
    trigger_condition: string;
    action: {
      target: string;
      copreset_template: string;
      priority: string;
      tone_override?: string;
      extra_context?: string;
    };
  }>;
  copreset_templates: Record<string, {
    role: string;
    objective: string;
    presentation: string;
  }>;
}

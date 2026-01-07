
import React, { useState, useCallback, useEffect, useRef, Suspense } from 'react';
import { ViewSelector } from './components/ViewSelector';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Login } from './components/Login';
import { MarcoAvatar } from './components/MarcoAvatar';
const AboutModal = React.lazy(() => import('./components/AboutModal'));
const AgentChatModal = React.lazy(() => import('./components/AgentChatModal'));

// Lazy loaded components
const Creator = React.lazy(() => import('./components/Creator').then(module => ({ default: module.Creator })));
const StyleLibrary = React.lazy(() => import('./components/StyleLibrary').then(module => ({ default: module.StyleLibrary })));
const ProStudio = React.lazy(() => import('./components/ProStudio').then(module => ({ default: module.ProStudio })));
const Academia = React.lazy(() => import('./components/Academia').then(module => ({ default: module.Academia })));
const ProfessionalEditor = React.lazy(() => import('./components/ProfessionalEditor').then(module => ({ default: module.ProfessionalEditor })));
const InspirationGallery = React.lazy(() => import('./components/InspirationGallery').then(module => ({ default: module.InspirationGallery })));
const ProLayoutGallery = React.lazy(() => import('./components/ProLayoutGallery').then(module => ({ default: module.ProLayoutGallery })));
const TaskManager = React.lazy(() => import('./components/TaskManager').then(module => ({ default: module.TaskManager })));
const PyrolysisHub = React.lazy(() => import('./components/tools/PyrolysisHub').then(module => ({ default: module.PyrolysisHub })));
const ComparativeScenariosLab = React.lazy(() => import('./components/tools/ComparativeScenariosLab').then(module => ({ default: module.ComparativeScenariosLab })));
const KnowledgeBase = React.lazy(() => import('./components/KnowledgeBase').then(module => ({ default: module.KnowledgeBase })));
const ProcessOptimizer = React.lazy(() => import('./components/tools/ProcessOptimizer').then(module => ({ default: module.ProcessOptimizer })));
const PropertyVisualizer = React.lazy(() => import('./components/tools/PropertyVisualizer').then(module => ({ default: module.PropertyVisualizer })));
const PyrolysisSimulator = React.lazy(() => import('./components/PyrolysisSimulator'));
const UserGuide = React.lazy(() => import('./components/UserGuide').then(module => ({ default: module.UserGuide })));
const Game = React.lazy(() => import('./components/Game').then(module => ({ default: module.Game })));
const ExperimentDesigner = React.lazy(() => import('./components/tools/ExperimentDesigner').then(module => ({ default: module.ExperimentDesigner })));
const TitansAtrium = React.lazy(() => import('./components/tools/TitansAtrium').then(module => ({ default: module.TitansAtrium })));
const TitanWorkstation = React.lazy(() => import('./components/TitanWorkstation').then(module => ({ default: module.TitanWorkstation })));
const KairosWorkstation = React.lazy(() => import('./components/KairosWorkstation').then(module => ({ default: module.KairosWorkstation })));
const TitanWorkspace = React.lazy(() => import('./components/TitanWorkspace').then(module => ({ default: module.TitanWorkspace })));
const HMIControlRoom = React.lazy(() => import('./components/tools/HMIControlRoom').then(module => ({ default: module.HMIControlRoom })));
const Hyperion9 = React.lazy(() => import('./components/tools/Hyperion-9').then(module => ({ default: module.Hyperion9 })));
const AssayManager = React.lazy(() => import('./components/tools/AssayManager').then(module => ({ default: module.AssayManager })));
const Aegis9 = React.lazy(() => import('./components/tools/Aegis9').then(module => ({ default: module.Aegis9 })));
const Phoenix = React.lazy(() => import('./components/tools/Phoenix').then(module => ({ default: module.Phoenix })));
const Vulcano = React.lazy(() => import('./components/tools/Vulcano').then(module => ({ default: module.Vulcano })));
const IAProStudio = React.lazy(() => import('./components/tools/IAProStudio').then(module => ({ default: module.IAProStudio })));
const NexoControlPanel = React.lazy(() => import('./components/tools/NexoControlPanel').then(module => ({ default: module.NexoControlPanel })));
const Chronos = React.lazy(() => import('./components/tools/Chronos').then(module => ({ default: module.Chronos })));
const AgriDeFi = React.lazy(() => import('./components/tools/AgriDeFi').then(module => ({ default: module.AgriDeFi })));
const InnovationForge = React.lazy(() => import('./components/tools/InnovationForge').then(module => ({ default: module.InnovationForge })));
const KairosFinancialPanel = React.lazy(() => import('./components/tools/KairosFinancialPanel').then(module => ({ default: module.KairosFinancialPanel })));
const StrategicRiskSimulator = React.lazy(() => import('./components/tools/StrategicRiskSimulator').then(module => ({ default: module.StrategicRiskSimulator })));
const CogenerationSimulator = React.lazy(() => import('./components/tools/CogenerationSimulator'));
const FleetSimulator = React.lazy(() => import('./components/tools/FleetSimulator'));
const CatalystLab = React.lazy(() => import('./components/tools/CatalystLab').then(module => ({ default: module.CatalystLab })));
const UtilitiesSimulator = React.lazy(() => import('./components/tools/UtilitiesSimulator').then(module => ({ default: module.UtilitiesSimulator })));
const GenerativeSimulator = React.lazy(() => import('./components/tools/GenerativeSimulator').then(module => ({ default: module.GenerativeSimulator })));
const CircularFleet = React.lazy(() => import('./components/tools/CircularFleet').then(module => ({ default: module.CircularFleet })));
const GlobalViabilityAssessor = React.lazy(() => import('./components/tools/GlobalViabilityAssessor').then(module => ({ default: module.GlobalViabilityAssessor })));
const EcoCasaSimulator = React.lazy(() => import('./components/tools/EcoCasaSimulator').then(module => ({ default: module.EcoCasaSimulator })));
const DetailedProjectInput = React.lazy(() => import('./components/tools/DetailedProjectInput').then(module => ({ default: module.DetailedProjectInput })));
const SustainableCerts = React.lazy(() => import('./components/tools/SustainableCerts').then(module => ({ default: module.SustainableCerts })));
const CertificationComparator = React.lazy(() => import('./components/tools/CertificationComparator').then(module => ({ default: module.CertificationComparator })));
const PodcastStudio = React.lazy(() => import('./components/tools/PodcastStudio').then(module => ({ default: module.PodcastStudio })));
const NexoBridgeView = React.lazy(() => import('./components/nexo/NexoBridgeView').then(module => ({ default: module.NexoBridgeView })));
const TitansDebate = React.lazy(() => import('./components/tools/TitansForum').then(module => ({ default: module.TitansDebate })));
const DueDiligenceAnalyzer = React.lazy(() => import('./components/tools/DueDiligenceAnalyzer').then(module => ({ default: module.DueDiligenceAnalyzer })));
const CallSimulator = React.lazy(() => import('./components/tools/CallSimulator').then(module => ({ default: module.CallSimulator })));
const CollaborationAgreement = React.lazy(() => import('./components/tools/CollaborationAgreement').then(module => ({ default: module.CollaborationAgreement })));
const InteractiveFundamentalsLab = React.lazy(() => import('./components/tools/InteractiveFundamentalsLab').then(module => ({ default: module.InteractiveFundamentalsLab })));
const ArchitecturalSynthesisDashboard = React.lazy(() => import('./components/tools/ArchitecturalSynthesisDashboard').then(module => ({ default: module.ArchitecturalSynthesisDashboard })));
const SystemStatusReport = React.lazy(() => import('./components/SystemStatusReport').then(module => ({ default: module.SystemStatusReport })));
const UserProfile = React.lazy(() => import('./components/UserProfile').then(module => ({ default: module.UserProfile })));
const Manifesto = React.lazy(() => import('./components/Manifesto').then(module => ({ default: module.Manifesto })));
const EcoHornetTwin = React.lazy(() => import('./components/tools/EcoHornetTwin').then(module => ({ default: module.EcoHornetTwin })));
const ExpertCommandCenter = React.lazy(() => import('./components/tools/ExpertCommandCenter').then(module => ({ default: module.ExpertCommandCenter })));
const CinematicAuditPanel = React.lazy(() => import('./components/tools/CinematicAuditPanel').then(module => ({ default: module.CinematicAuditPanel })));
const AdminConsole = React.lazy(() => import('./components/AdminConsole').then(module => ({ default: module.AdminConsole })));
const GaiaLab = React.lazy(() => import('./components/tools/GaiaLab').then(module => ({ default: module.GaiaLab })));

import { TaskManager as COPRESETManager, type COPRESETPayload } from './services/taskManager';
import { OFF_STATE } from './data/hmiConstants';
import { ALL_STYLES } from './data/styles';
import { initializeAgentChat, continueAgentChat } from './services/geminiService';
import type { Chat } from './services/geminiService';

import { ContentType } from './types';
import type {
  View,
  FormData,
  Task,
  StyleDefinition,
  CharacterProfile,
  ChatMessage,
  ProFormData,
  HMIState,
  AegisState,
  TechnicalRiskPackage,
  VulcanoState,
  PhoenixState,
  ReactorState,
  FleetCommand,
  AgentMode,
  DecisionPackage,
  ReactorStatus,
  Certification,
  GovernanceEvent,
  OptimizationChallengePackage,
  ChronosState,
  STOState,
  AlarmConfig,
  GaiaLabState,
  VulcanoMachineStatus,
  SimulationFormData,
  FinalOptimizationPackage,
  GovernanceHandoffPackage,
  AutoSolution,
  PeriodicElement,
  CoPreset,
  User
} from './types';
import { KNOWLEDGE_BASE } from './data/knowledgeBase';
import { AGENTS_CODEX } from './data/agentsCodex';
import { PYROLYSIS_MATERIALS, SIMULATION_ENGINE } from './data/pyrolysisMaterials';
import { CO_PRESETS } from './data/coPresets';
import { PRESETS } from './data/presets';
const StoryMode = React.lazy(() => import('./components/StoryMode').then(module => ({ default: module.StoryMode })));
import { storyMissions } from './data/storyMissions';
import { MOCK_CO_PRESETS, MOCK_REACTORS } from './data/mockForgeData';

// 🔍 DEBUG: Verify imports loaded
console.log('Module level - CO_PRESETS loaded:', CO_PRESETS, 'Length:', CO_PRESETS?.length);
console.log('Module level - MOCK_CO_PRESETS loaded:', MOCK_CO_PRESETS, 'Length:', MOCK_CO_PRESETS?.length);

const initialGovernanceHistory: GovernanceEvent[] = [
  { date: '06 Nov 2025', title: 'Bucle Positivo (Recompensa)', points: '+50 pts', details: [{ label: 'Acción', value: 'Recompensa por Contribución (Validada por Pares).' }, { label: 'Detalle', value: '"Simulación de optimización de biochar (sim_456)" fue aprobada por el concilio.' }, { label: 'Prueba (On-Chain)', value: 'Ver Votación de Recompensa (ID: 0x...)', link: true }] },
  {
    date: '04 Nov 2025', title: 'Acción de Gobernanza', points: 'VOTO EMITIDO', details: [
      { label: 'Acción', value: 'Voto emitido en "Propuesta de Adjudicación: Conflicto Inversor (XYZ)".' },
      { label: 'Detalle', value: 'Voto emitido después de la conclusión del debate.' },
      { label: 'Peso de Voto Aplicado', value: '21.0% (Ponderación Financiera + Reputación 1.0x).' },
      { label: 'Prueba (On-Chain)', value: 'Ver Voto (ID: 0x...)', link: true }
    ]
  },
  {
    date: '01 Nov 2025', title: 'Debate de Gobernanza (En Progreso)', points: 'DEBATE ACTIVO', details: [
      { label: 'Acción', value: '"Debate de Titanes" iniciado para la Propuesta de Adjudicación.' },
      { label: 'Detalle', value: '"Conflicto de Interés (Inversor_User) en Propuesta XYZ" está siendo debatido por el concilio.' },
      { label: 'Estado', value: 'Debate en Progreso (Quedan 2 días)' },
      { label: 'Acción Requerida', value: 'Unirse al Debate de Titanes', link: true }
    ]
  },
  {
    date: '01 Nov 2025', title: 'Bucle Negativo (Iniciado)', points: '-100 pts (Pendiente)', details: [
      { label: 'Acción', value: 'Reporte de Conflicto de Interés validado.' },
      { label: 'Detalle', value: 'Conflicto de interés reportado en "Propuesta_XYZ". La penalización está pendiente del resultado del debate y la votación.' },
      { label: 'Prueba (On-Chain)', value: 'Ver Reporte de Conflicto (ID: 0x...)', link: true }
    ]
  },
  { date: '28 Oct 2025', title: 'Acción de Gobernanza', points: 'PROPUESTA CREADA', details: [{ label: 'Acción', value: 'Solicitud de Veto de Publicación (Transformada en Propuesta).' }, { label: 'Detalle', value: '"Propuesta de Veto: pub_123".' }, { label: 'Prueba (On-Chain)', value: 'Ver Propuesta (ID: 0x...)', link: true }] },
  { date: '25 Oct 2025', title: 'Bucle Positivo (Contribución Inicial)', points: '+0 pts (Pendiente)', details: [{ label: 'Acción', value: 'Contribución Enviada a Validación.' }, { label: 'Detalle', value: '"Simulación de optimización de biochar (sim_456)".' }, { label: 'Estado', value: 'Votación de Recompensa en Progreso...', link: true }] },
];

export const App: React.FC = () => {
  // Access Vite environment variable safely
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string || '';

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('nexo_token');
  });



  const handleLogout = () => {
    localStorage.removeItem('nexo_token');
    setIsAuthenticated(false);
  };

  // --- NAVIGATION & HISTORY MANAGEMENT ---
  const [view, setView] = useState<View>(() => {
    const hash = window.location.hash.replace('#', '');
    return (hash as View) || 'creator';
  });

  // Sync URL with View State
  useEffect(() => {
    if (window.location.hash.replace('#', '') !== view) {
      window.location.hash = view;
    }
  }, [view]);

  // Handle Browser Back/Forward
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && hash !== view) {
        setView(hash as View);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [view]);

  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  const [styles, setStyles] = useState<StyleDefinition[]>(ALL_STYLES);
  const [knowledgeSources, setKnowledgeSources] = useState<{ name: string; content: string }[]>(Object.values(KNOWLEDGE_BASE).map((content, i) => ({ name: Object.keys(KNOWLEDGE_BASE)[i], content })));
  const [tasks, setTasks] = useState<Task[]>([]);
  const [titans, setTitans] = useState<CharacterProfile[]>(AGENTS_CODEX);
  const [activeTitan, setActiveTitan] = useState<CharacterProfile | null>(null);

  // Chat Modal State
  const [chatAgent, setChatAgent] = useState<CharacterProfile | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isAgentReplying, setIsAgentReplying] = useState(false);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);


  // States for inter-component data passing
  const [creatorInitialData, setCreatorInitialData] = useState<Partial<FormData> | null>(null);
  const [debateInitialData, setDebateInitialData] = useState<Task | null>(null);
  const [srsInitialData, setSrsInitialData] = useState<Partial<SimulationFormData> | null>(null);
  const [initialContentType, setInitialContentType] = useState<ContentType | undefined>(undefined);
  const [pepInitialData, setPepInitialData] = useState<any | null>(null);
  const [proFormData, setProFormData] = useState<ProFormData>({
    pro_concept: '',
    pro_emotion: '',
    pro_symbolism: '',
    pro_composition_rule: '',
    pro_color_theory: '',
    pro_specific_palette: '',
    pro_focal_length: '',
    pro_shutter_speed: '',
    pro_iso: '',
    pro_lens_effects: '',
    pro_post_production: ''
  });
  const [proGeneratedPrompt, setProGeneratedPrompt] = useState<string>('');
  const [proIsLoading, setProIsLoading] = useState<boolean>(false);
  const [proError, setProError] = useState<string>('');
  const [selectedLayout, setSelectedLayout] = useState('layout-01');
  const [technicalRiskPackage, setTechnicalRiskPackage] = useState<TechnicalRiskPackage | null>(null);
  const [challengePackage, setChallengePackage] = useState<OptimizationChallengePackage | null>(null);
  const [expertCommandContext, setExpertCommandContext] = useState<any | null>(null);
  const [cinematicAuditData, setCinematicAuditData] = useState<AutoSolution | null>(null);
  const [architecturalPreset, setArchitecturalPreset] = useState<any | null>(null);
  const [initialLabMaterialIds, setInitialLabMaterialIds] = useState<number[] | null>(null);

  // Auth State
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // --- AUTH RESTORATION ---
  useEffect(() => {
    const token = localStorage.getItem('nexo_token');
    if (token && !authToken) {
      setAuthToken(token);
      setIsAuthenticated(true);
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUser({
          id: payload.sub,
          email: payload.email,
          full_name: payload.user_name || 'Usuario',
          is_active: true,
          roles: (payload.roles || []).map((r: string) => ({ id: 0, name: r }))
        });
      } catch (e) {
        console.error("Invalid token stored");
        localStorage.removeItem('nexo_token');
        setAuthToken(null);
        setIsAuthenticated(false);
      }
    }
  }, []);

  // State for governance and certifications
  const [userCertifications, setUserCertifications] = useState<Certification[]>([]);
  const [governanceHistory, setGovernanceHistory] = useState<GovernanceEvent[]>(initialGovernanceHistory);

  // State to simulate the governance crisis
  const [isGovernanceCrisisActive, setIsGovernanceCrisisActive] = useState(false);

  // Story Mode State
  const [currentMissionIndex, setCurrentMissionIndex] = useState(0);

  // State needed for Creator component's financial preset
  const [chronosStateForCreator] = useState<ChronosState>({
    phase: 1,
    assetOrigin: { assetType: 'Soja', estimatedVolume: 10000, marketValue: 300000, liquidationDate: '2026-12-01', status: 'VERIFIED' },
    tokenStructure: { rights: 'Participación en beneficios', tokenName: 'AGS26', nominalValue: 1, totalSupply: 100000 },
    liquidation: { status: 'PENDING', salePrice: null, profitPercentage: null },
    secondaryAssets: []
  });
  const [stoStateForCreator, setStoStateForCreator] = useState<STOState>({
    assetId: 'AGS26-001',
    investors: [],
    fundsRaised: 0,
    target: 100000,
    status: 'PREPARING'
  });

  // STO Simulation Effect
  useEffect(() => {
    if (stoStateForCreator.status !== 'ACTIVE') return;

    const interval = setInterval(() => {
      setStoStateForCreator(prev => {
        if (prev.fundsRaised >= prev.target) {
          return { ...prev, status: 'COMPLETED' };
        }

        // Simulate a new investment
        if (Math.random() > 0.3) { // 70% chance of investment per tick
           const amount = Math.floor(Math.random() * 2000) + 100; // Random amount between 100 and 2100
           const newInvestor = { id: prev.investors.length + 1, amount };
           return {
             ...prev,
             investors: [newInvestor, ...prev.investors],
             fundsRaised: prev.fundsRaised + amount
           };
        }
        return prev;
      });
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [stoStateForCreator.status]);


  // HMI state
  const [hmiState, setHmiState] = useState<HMIState>(OFF_STATE);
  const [hmiEvents, setHmiEvents] = useState<string[]>([]);
  const [historyData, setHistoryData] = useState<(HMIState & { time: number })[]>([]);
  const [minuteLog, setMinuteLog] = useState<(HMIState & { time: string })[]>([]);
  const [heatingSeconds, setHeatingSeconds] = useState(0);
  const [stableSeconds, setStableSeconds] = useState(0);
  const [coolingSeconds, setCoolingSeconds] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedFeedstockId, setSelectedFeedstockId] = useState(1);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [selectedCatalystId, setSelectedCatalystId] = useState<string>(SIMULATION_ENGINE.catalysts[0].id);

  const [alarmConfigs, setAlarmConfigs] = useState<Record<string, AlarmConfig>>({
    reactorTemp: {
      enabled: true,
      med: 600, high: 750, crit: 850,
      medSound: 'beepShort', highSound: 'beepContinuous', critSound: 'sirenIntermittent'
    },
    reactorPressure: {
      enabled: true,
      med: 1.5, high: 1.8, crit: 2.0,
      medSound: 'beepShort', highSound: 'beepContinuous', critSound: 'sirenIntermittent'
    },
    condenserTemp: {
      enabled: true,
      med: 40, high: 50, crit: 60,
      medSound: 'beepShort', highSound: 'beepContinuous', critSound: 'sirenIntermittent'
    },
    biomassHopper: {
      enabled: true,
      med: 20, high: 10, crit: 5,
      medSound: 'beepShort', highSound: 'beepContinuous', critSound: 'voiceAlert'
    },
    bioOilTank: {
      enabled: true,
      med: 80, high: 90, crit: 95,
      medSound: 'beepShort', highSound: 'beepContinuous', critSound: 'voiceAlert'
    }
  });

  const [aegisState, setAegisState] = useState<AegisState>({
    ncsLevel: 1,
    activeSector: 'Sala de Control Central',
    events: [],
    directorDirective: null
  });

  // Vulcano State
  const [vulcanoState, setVulcanoState] = useState<VulcanoState>({
    isRunning: false,
    inputTonsPerDay: 50,
    storageLevelTons: 100,
    fireRisk: 10,
    sanitaryRisk: 5,
    machines: {
      debeader: 'APAGADO', primaryShredder: 'APAGADO', rasperMill: 'APAGADO', granulators: 'APAGADO', magneticSeparators: 'APAGADO', textileClassifiers: 'APAGADO'
    },
    processingRateTiresPerHour: 0,
    outputPurity: { gcr: 0, steel: 0, fiber: 0 },
    productionRateKgPerHour: { gcr: 0, steel: 0, fiber: 0 },
    siloLevelsKg: { gcr: 0, steel: 0, fiber: 0 },
    hefestosLog: [],
  });

  const [gaiaLabState, setGaiaLabState] = useState<GaiaLabState>({
    isNewBatchReady: false,
    sampleId: null,
    analysisResults: null,
    quality: null,
  });

  const [chronosState, setChronosState] = useState<ChronosState>({
    phase: 1,
    assetOrigin: { assetType: '', estimatedVolume: 0, marketValue: 0, liquidationDate: '', status: 'PENDING' },
    tokenStructure: { rights: '', tokenName: '', nominalValue: 0, totalSupply: 0 },
    liquidation: { status: 'PENDING', salePrice: null, profitPercentage: null },
    secondaryAssets: []
  });

  const [issuanceState, setIssuanceState] = useState<IssuanceState>({
    contractStatus: 'UNDEPLOYED',
    tokenStatus: 'UNMINTED',
    contractAddress: null,
    events: []
  });

  // Auto-advance Chronos phase when STO completes
  useEffect(() => {
    if (stoStateForCreator.status === 'COMPLETED' && chronosState.phase < 5) {
      setChronosState(prev => ({ ...prev, phase: 5 }));
    }
  }, [stoStateForCreator.status, chronosState.phase]);

  const handleTokenizeBatch = () => {
    if (!gaiaLabState.analysisResults) return;
    
    // Calculate value based on quality
    const isPremium = gaiaLabState.quality === 'PREMIUM';
    const volume = 1000; // 1 ton batch
    const pricePerTon = isPremium ? 600 : 400; // Premium biochar commands higher price
    const marketValue = volume * pricePerTon;
    
    setChronosState({
      phase: 1,
      assetOrigin: {
        assetType: `Biochar ${gaiaLabState.quality} (Lote ${gaiaLabState.sampleId})`,
        estimatedVolume: volume,
        marketValue: marketValue,
        liquidationDate: '2026-06-30', // 6 months from now
        status: 'PENDING'
      },
      tokenStructure: {
        rights: 'Derechos de Futuros de Carbono',
        tokenName: `BIO-${gaiaLabState.sampleId?.split('-')[1] || '001'}`,
        nominalValue: 10,
        totalSupply: marketValue / 10
      },
      liquidation: { status: 'PENDING', salePrice: null, profitPercentage: null },
      secondaryAssets: []
    });
    
    setView('chronos');
  };

  const handleVerifyAsset = () => {
    setChronosState(prev => ({
      ...prev,
      assetOrigin: { ...prev.assetOrigin, status: 'VERIFYING' }
    }));
    
    setTimeout(() => {
      setChronosState(prev => ({
        ...prev,
        phase: 2,
        assetOrigin: { ...prev.assetOrigin, status: 'VERIFIED' }
      }));
    }, 2000);
  };

  const handleConfirmStructure = () => {
    setChronosState(prev => ({ ...prev, phase: 3 }));
  };

  const handleDeployContract = () => {
    setIssuanceState(prev => ({ ...prev, contractStatus: 'DEPLOYED', contractAddress: '0x71C...9A21' }));
  };

  const handleMintTokens = () => {
    setIssuanceState(prev => ({ ...prev, tokenStatus: 'MINTED' }));
    setTimeout(() => {
        setChronosState(prev => ({ ...prev, phase: 4 }));
    }, 1500);
  };

  const handleLiquidation = () => {
      setChronosState(prev => ({
          ...prev,
          liquidation: {
              status: 'EXECUTED',
              salePrice: prev.assetOrigin.marketValue * 1.2, // 20% profit simulation
              profitPercentage: 20
          }
      }));
  };

  const [phoenixState, setPhoenixState] = useState<PhoenixState>({
    isRunning: false,
    wasteComposition: { biomasaOrganica: 65, plasticosDeseados: 15, plasticosContaminantes: 8, metales: 7, inertes: 5 },
    argusKpis: { tasaClasificacion: 0, purezaOrganico: 0, eficienciaDeteccion: 0 },
    continuousLearning: true,
    trituradorasStatus: 'OK',
    secadorStatus: 'OK',
    pelletProduction: 0,
    pelletQuality: { purity: 0, moisture: 0 },
    pelletSiloLevel: 4580,
  });

  const [fleetReactors, setFleetReactors] = useState<ReactorState[]>([]);

  // --- CHAT MODAL HANDLERS ---
  const handleStartChat = (titan: CharacterProfile) => {
    setChatAgent(titan);
    setIsChatOpen(true);
    const chatInstance = initializeAgentChat(titan.system_prompt);
    setActiveChat(chatInstance);
    setChatHistory([]);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
    setChatAgent(null);
    setActiveChat(null);
    setChatHistory([]);
  };

  const handleSendMessage = async (message: string, file?: { name: string; type: string; data: string; }) => {
    if (!activeChat || !chatAgent) return;

    const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: 'user', text: message, file };
    setChatHistory(prev => [...prev, userMessage]);
    setIsAgentReplying(true);

    try {
      const response = await continueAgentChat(activeChat, message);
      const agentMessage: ChatMessage = { id: `model-${Date.now()}`, role: 'model', text: response.text };
      setChatHistory(prev => [...prev, agentMessage]);
    } catch (e) {
      console.error(e);
      const errorMessage: ChatMessage = { id: `error-${Date.now()}`, role: 'model', text: 'Lo siento, he encontrado un error.' };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsAgentReplying(false);
    }
  };

  const handleNavigateToForum = (context: { instructions: string; files: { name: string; content: string }[] }) => {
    const dummyTask: Task = {
      id: `forum-handoff-${Date.now()}`,
      title: `Discusión desde Estación de Trabajo`,
      createdAt: Date.now(),
      status: 'Por Hacer',
      contentType: ContentType.Texto,
      formData: {
        objective: context.instructions,
        specifics: {
          [ContentType.Texto]: {
            uploadedDocument: context.files[0]
          },
          [ContentType.Imagen]: {},
          [ContentType.Video]: {},
          [ContentType.Audio]: {},
          [ContentType.Codigo]: {},
        }
      },
    };
    setDebateInitialData(dummyTask);
    setView('titans-debate');
  };

  const handleMintCertification = (certification: Certification) => {
    setUserCertifications(prev => [...prev, certification]);

    const newHistoryEvent: GovernanceEvent = {
      date: certification.mintDate,
      title: 'Certificación Obtenida',
      points: 'NFT MINTED',
      details: [
        { label: 'Acción', value: `Certificación "${certification.name}" obtenida.` },
        { label: 'Detalle', value: `La comunidad de pares validó tu "Proyecto Final" (${certification.nftMetadata.proof_of_validation.capstone_submission_id}).` },
        { label: 'Prueba (On-Chain)', value: `Ver NFT en Blockchain (Token ID: ${certification.nftMetadata.proof_of_validation.validation_tx_hash.slice(-3)})`, link: true }
      ]
    };
    setGovernanceHistory(prev => [newHistoryEvent, ...prev]);
  };


  const handleLogin = (token: string) => {
    localStorage.setItem('nexo_token', token);
    setIsAuthenticated(true);
    setAuthToken(token);
    // Decode token to get user info (simplified)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setCurrentUser({
        id: payload.sub,
        email: payload.email,
        full_name: payload.user_name || 'Usuario',
        is_active: true,
        token_version: payload.ver,
        roles: payload.roles.map((r: string) => ({ id: 0, name: r, description: '' }))
      });
    } catch (e) {
      console.error("Error decoding token", e);
    }
  };

  const handleSaveTask = (task: Task, navigate?: boolean) => {
    // FIX: Intercept the creation of the video task from the debate and strip the incorrect eventType.
    // This workaround ensures correct routing even though the source file (TitansForum.tsx) is not provided.
    // This check is specific enough to only target the problematic task.
    if (
      task.contentType === ContentType.Video &&
      task.title.startsWith('Video: Prueba de Cumplimiento') &&
      task.eventType === 'TitansDebate'
    ) {
      const sanitizedTask: Task = { ...task };
      delete sanitizedTask.eventType;
      setTasks(prev => [...prev, sanitizedTask]);
    } else {
      setTasks(prev => [...prev, task]);
    }

    if (navigate) {
      setView('tasks');
    }
  };

  const handleNavigateToArchitecturalSynth = (preset: any) => {
      setArchitecturalPreset(preset);
      setView('architectural-synthesis-dashboard');
  };



  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleLoadTask = (taskId: string, presetName?: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (task.eventType === 'TitansDebate') {
      setDebateInitialData(task);
      setView('titans-debate');
    } else {
      let formDataToLoad: Partial<FormData> = { ...task.formData };
      if (presetName) {
        const preset = PRESETS.find(p => p.name === presetName);
        if (preset) {
          formDataToLoad = {
            ...formDataToLoad,
            ...preset.data,
            specifics: {
              [ContentType.Texto]: {
                ...formDataToLoad.specifics?.[ContentType.Texto],
                ...preset.data.specifics?.[ContentType.Texto],
                narrativeCatalyst: presetName // Explicitly set the preset name here for UI sync
              },
              [ContentType.Imagen]: { ...formDataToLoad.specifics?.[ContentType.Imagen], ...preset.data.specifics?.[ContentType.Imagen] },
              [ContentType.Video]: { ...formDataToLoad.specifics?.[ContentType.Video], ...preset.data.specifics?.[ContentType.Video] },
              [ContentType.Audio]: { ...formDataToLoad.specifics?.[ContentType.Audio], ...preset.data.specifics?.[ContentType.Audio] },
              [ContentType.Codigo]: { ...formDataToLoad.specifics?.[ContentType.Codigo], ...preset.data.specifics?.[ContentType.Codigo] },
            }
          };
        }
      }
      setCreatorInitialData(formDataToLoad);
      setInitialContentType(task.contentType);
      setView('creator');
    }
  };

  const handleLoadNarrative = async (task: Task) => {
    if (task.eventType !== 'Assay' || !task.assayDetails) return;

    // 1. Construct the "analysis" text from the task data.
    const material = PYROLYSIS_MATERIALS.find(m => m.id === task.assayDetails?.linkedMaterialId);
    let analysisText = `## Informe de Ensayo de Laboratorio: ${task.title}\n\n`;
    analysisText += `**Material:** ${material?.nombre || 'No especificado'}\n`;
    analysisText += `**Objetivo:** ${task.assayDetails.objective}\n`;
    analysisText += `**Metodología:** ${task.assayDetails.methodology}\n\n`;

    if (task.assayDetails.labResults && task.assayDetails.labResults.length > 0) {
      analysisText += `### Resultados de Laboratorio:\n`;
      task.assayDetails.labResults.forEach(result => {
        analysisText += `**Archivo:** ${result.name}\n`;
        analysisText += '```\n';
        analysisText += `${result.content}\n`;
        analysisText += '```\n\n';
      });
    }

    if (task.result?.text) {
      analysisText += `### Conclusiones / Documento Vivo:\n`;
      analysisText += task.result.text;
    }

    // 2. Prepare the initial data for the Creator.
    const formDataToLoad: Partial<FormData> = {
      objective: `Generar un resumen ejecutivo y una campaña visual a partir de los resultados del ensayo de laboratorio para "${material?.nombre || 'el material'}".`,
      contentType: ContentType.Texto,
      specifics: {
        [ContentType.Texto]: {
          type: 'Informe de Sostenibilidad (ESG)',
          audience: 'Equipo de Dirección / Inversores',
          rawData: analysisText,
        },
        [ContentType.Imagen]: {},
        [ContentType.Video]: {},
        [ContentType.Audio]: {},
        [ContentType.Codigo]: {},
      }
    };

    // 3. Set the state to navigate and pre-fill.
    setCreatorInitialData(formDataToLoad);
    setInitialContentType(ContentType.Texto);
    setView('creator');
  };

  const handleUseAnalysisForPrompt = (objective: string, analysisText: string) => {
    const formData: Partial<FormData> = {
      objective: objective,
      tone: 'Técnico / Analítico',
      specifics: {
        [ContentType.Texto]: {
          type: 'Informe Técnico',
          audience: 'Ingenieros de Proceso',
          rawData: analysisText
        },
        [ContentType.Imagen]: {},
        [ContentType.Video]: {},
        [ContentType.Audio]: {},
        [ContentType.Codigo]: {},
      }
    };
    setCreatorInitialData(formData);
    setInitialContentType(ContentType.Texto);
    setView('creator');
  };

  const handleCreateReportFromSimulation = (data: any) => {
    const rawData = JSON.stringify(data, null, 2);
    
    const newTask: Task = {
      id: `report-fleet-${Date.now()}`,
      title: "Reporte de Viabilidad de Flota",
      createdAt: Date.now(),
      status: 'Por Hacer',
      contentType: ContentType.Texto,
      formData: {
        objective: "Generar un reporte editorial basado en los resultados de la simulación generativa.",
        tone: "Profesional",
        specifics: {
          [ContentType.Texto]: {
            type: "Informe Técnico",
            audience: "Ingenieros",
            rawData: rawData
          },
          [ContentType.Imagen]: {},
          [ContentType.Video]: {},
          [ContentType.Audio]: {},
          [ContentType.Codigo]: {},
        }
      },
      isIntelligent: true
    };

    setTasks(prev => [...prev, newTask]);

    setCreatorInitialData(newTask.formData);
    setInitialContentType(ContentType.Texto);
    setView('creator');
  };


  const handleCatalystSendToCreator = (payload: COPRESETPayload) => {
    const formData = COPRESETManager.toCreatorFormData(payload);
    setCreatorInitialData(formData);
    setInitialContentType(formData.contentType);
    setView('creator');
  };

  const handleCatalyticAnalysis = (element: PeriodicElement) => {
    const rawData = `
Elemento: ${element.nombre} (${element.simbolo})
Número Atómico: ${element.numero_atomico}
Masa Atómica: ${element.masa_atomica}
Configuración Electrónica: ${element.configuracion_electronica}
Electronegatividad: ${element.electronegatividad_pauling || 'N/A'}
Estados de Oxidación: ${Array.isArray(element.estados_oxidacion) ? element.estados_oxidacion.join(', ') : element.estados_oxidacion}
Descripción Metafórica: ${element.descripcion_metaforica || 'N/A'}
    `.trim();

    const newTask: Task = {
      id: `task-catalytic-analysis-${element.numero_atomico}-${Date.now()}`,
      title: `Análisis Catalítico: ${element.nombre}`,
      createdAt: Date.now(),
      status: 'Por Hacer',
      contentType: ContentType.Texto,
      formData: {
        objective: `Utilizando el asistente 'Analista de Potencial Catalítico', realizar un análisis profundo del potencial catalítico emergente de ${element.nombre}, basándose en el 'Informe Técnico: Los Gases Nobles' y las propiedades del elemento. El objetivo es determinar si puede actuar como un 'ligando electrónico' débil y sintonizable en catálisis de átomo único, similar al Xenón.`,
        specifics: {
          [ContentType.Texto]: {
            type: 'Informe Técnico',
            audience: 'Equipo de I+D',
            rawData: rawData
          },
          [ContentType.Imagen]: {},
          [ContentType.Video]: {},
          [ContentType.Audio]: {},
          [ContentType.Codigo]: {},
        }
      },
      isIntelligent: true,
      agentId: 'Dr. Pirolis',
      eventType: 'FundamentalCalculation',
      subTasks: [
        { name: `Analizar propiedades de ${element.nombre}`, status: 'pending' },
        { name: `Consultar base de conocimiento ('Gases Nobles')`, status: 'pending' },
        { name: `Formular hipótesis catalítica`, status: 'pending' },
        { name: 'Redacción de informe preliminar', status: 'pending' },
      ],
    };

    handleSaveTask(newTask, true);
  };

  const handleOpenWorkstation = (titan: CharacterProfile) => {
    setActiveTitan(titan);
    setView('titan-workstation');
  };

  const handleUpdateTitan = (updatedTitan: CharacterProfile) => {
    setTitans(prevTitans => prevTitans.map(t => t.claveName === updatedTitan.claveName ? updatedTitan : t));
    if (activeTitan?.claveName === updatedTitan.claveName) {
      setActiveTitan(updatedTitan);
    }
  };

  const addHmiEvent = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString('es-ES', { hour12: false });
    setHmiEvents(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 100));
  }, []);

  const handleStartSystem = useCallback(() => {
    if (hmiState.systemMode === 'APAGADO') {
      setHmiState(prev => ({ ...prev, systemMode: 'CALENTANDO' }));
      addHmiEvent('Protocolo de calentamiento iniciado.');
    }
  }, [hmiState.systemMode, addHmiEvent]);

  const handleStopSystem = useCallback(() => {
    if (hmiState.systemMode === 'ESTABLE' || hmiState.systemMode === 'CALENTANDO') {
      setHmiState(prev => ({ ...prev, systemMode: 'ENFRIANDO', targetTemp: 100 }));
      addHmiEvent('Protocolo de enfriamiento iniciado.');
    }
  }, [hmiState.systemMode, addHmiEvent]);

  const handleFleetCommand = useCallback((command: FleetCommand) => { }, []);

  const handleAcceptMission = () => {
    const mission = storyMissions[currentMissionIndex];
    if (!mission) return;

    // Clear previous initial data to avoid conflicts
    setCreatorInitialData(null);
    setDebateInitialData(null);
    setSrsInitialData(null);

    // Set new initial data based on target view
    if (mission.formData) {
      switch (mission.targetView) {
        case 'creator':
          setCreatorInitialData(mission.formData);
          if (mission.formData.contentType) {
            setInitialContentType(mission.formData.contentType);
          }
          break;
        case 'strategic-risk-simulator':
          setSrsInitialData(mission.formData as Partial<SimulationFormData>);
          break;
        case 'titans-debate':
          const dummyTask: Task = {
            id: `story-mission-${mission.id}`,
            title: mission.title,
            createdAt: Date.now(),
            status: 'Por Hacer',
            contentType: ContentType.Texto,
            formData: mission.formData,
          };
          setDebateInitialData(dummyTask);
          break;
        default:
          setCreatorInitialData(mission.formData);
          break;
      }
    }

    setView(mission.targetView);
  };

  const handleFinishStory = () => {
    setCurrentMissionIndex(0);
    setView('manifesto');
  };

  const handleTakeSample = () => {
    setGaiaLabState(prev => ({
      ...prev,
      isNewBatchReady: false,
      sampleId: `GCR-${Date.now().toString().slice(-6)}`,
      analysisResults: null,
      quality: null,
    }));

    // Simulate analysis time (e.g., 5 seconds)
    setTimeout(() => {
      // Simulate results based on Vulcano's GCR purity
      const basePurity = vulcanoState.outputPurity.gcr > 0 ? vulcanoState.outputPurity.gcr : 98.5;

      const results = {
        carbon: 85 + (basePurity - 95),      // Higher purity = higher carbon
        ph: 8.5 + Math.random(),           // 8.5-9.5
        porosity: 450 + (basePurity - 95) * 10, // 450-550 m2/g
        ash: 5 - (basePurity - 95) * 0.2,   // Higher purity = lower ash
      };
      const quality = results.carbon > 88 && results.ash < 4.5 ? 'PREMIUM' : 'ESTÁNDAR';

      setGaiaLabState(prev => ({
        ...prev,
        analysisResults: results,
        quality: quality,
      }));

      setVulcanoState(p => ({
        ...p,
        hefestosLog: [`${new Date().toLocaleTimeString()}: Análisis de lote ${gaiaLabState.sampleId} completo. Calidad: ${quality}.`, ...(p.hefestosLog || [])]
      }));
    }, 5000);
  };

  const handleStartCinematicAudit = (solution: AutoSolution) => {
    setCinematicAuditData(solution);
    setView('cinematic-audit');
  };

  const handleSimulateBatch = () => {
    setGaiaLabState(prev => ({
      ...prev,
      isNewBatchReady: true
    }));
  };


  // Auto-connect GaiaLab with Vulcano production
  useEffect(() => {
    // When Vulcano has GCR in the silo, automatically make it available for GaiaLab analysis
    const hasGCRBatch = vulcanoState.siloLevelsKg.gcr >= 1; // At least 1kg of GCR produced

    if (hasGCRBatch && !gaiaLabState.isNewBatchReady && !gaiaLabState.analysisResults) {
      setGaiaLabState(prev => ({
        ...prev,
        isNewBatchReady: true
      }));
    }
  }, [vulcanoState.siloLevelsKg.gcr, gaiaLabState.isNewBatchReady, gaiaLabState.analysisResults]);

  // HMI & Fleet Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());

      // HMI P-01 Simulation
      setHmiState(prev => {
        let newState = { ...prev };
        let newHeatingSeconds = heatingSeconds;
        let newStableSeconds = stableSeconds;
        let newCoolingSeconds = coolingSeconds;

        // More realistic fluctuation functions
        const smallFluctuation = (value: number, factor = 0.01) => value * (1 + (Math.random() - 0.5) * factor);
        const mediumFluctuation = (value: number, factor = 0.05) => value * (1 + (Math.random() - 0.5) * factor);

        switch (newState.systemMode) {
          case 'CALENTANDO':
            newHeatingSeconds++;
            const tempIncrease = (newState.targetTemp - newState.reactorTemp) * 0.05 + Math.random() * 2;
            newState.reactorTemp = Math.min(newState.targetTemp, newState.reactorTemp + tempIncrease);

            newState.reactorWallTemp = smallFluctuation(newState.reactorTemp * 0.95);
            newState.reactorPressure = 1.01 + (newState.reactorTemp / newState.targetTemp) * 0.09;
            newState.pyrometerCoreTemp = smallFluctuation(newState.reactorTemp * 1.02);
            newState.thermocoupleCoreTemp = smallFluctuation(newState.reactorTemp * 0.98);
            newState.insulationIntegrity = 99.9 - (Math.random() * 0.2);

            newState.energyConsumption = smallFluctuation(8.5);
            newState.n2Flow = smallFluctuation(newState.n2Flow);

            // Systems are on standby or starting up
            newState.safetySystem = 'ARMADO';
            newState.inertGasPurge = 'ACTIVO';
            newState.condenserState = 'EN ESPERA';
            newState.dischargeSystemState = 'EN ESPERA';
            newState.catalystSystemState = 'EN ESPERA';
            newState.refrigerationSystemState = 'ACTIVO';
            newState.refrigerationPumpState = 'ACTIVO';
            newState.chillerPower = smallFluctuation(5);

            // Production is zero during heat-up
            newState.feedRate = 0;
            newState.condensateFlow = 0;
            newState.coolingPower = 0;
            newState.dischargeRate = 0;
            newState.co = 0;
            newState.co2 = 0;
            newState.h2 = 0;
            newState.ch4 = 0;

            if (newState.reactorTemp >= newState.targetTemp) {
              newState.systemMode = 'ESTABLE';
              addHmiEvent('Reactor ha alcanzado la temperatura objetivo. Sistema estable.');
            }
            break;

          case 'ESTABLE':
            newStableSeconds++;
            // Main parameters fluctuate around target
            newState.reactorTemp = smallFluctuation(newState.targetTemp, 0.005);
            newState.reactorWallTemp = smallFluctuation(newState.targetTemp - 15);
            newState.reactorPressure = smallFluctuation(1.1, 0.02);
            newState.pyrometerCoreTemp = smallFluctuation(newState.targetTemp + 25);
            newState.thermocoupleCoreTemp = smallFluctuation(newState.targetTemp, 0.005);
            newState.insulationIntegrity = 99.8 - (Math.random() * 0.1);

            // Energy and N2
            newState.energyConsumption = smallFluctuation(7.49);
            newState.n2Flow = smallFluctuation(prev.n2Flow > 0 ? prev.n2Flow : 5.5);
            newState.n2Pressure = smallFluctuation(prev.n2Pressure > 0 ? prev.n2Pressure : 5.5);

            // Feed system
            newState.biomassFeederState = true;
            newState.feedRate = mediumFluctuation(37.5);
            newState.biomassFeederRpm = smallFluctuation(newState.feedRate * 6.66);
            newState.biomassHopperLevel = Math.max(0, newState.biomassHopperLevel - (newState.feedRate / 3600) * 0.1);

            // Condensation system
            newState.condenserState = 'ACTIVO';
            newState.condensateFlow = smallFluctuation(newState.feedRate * 0.65); // 65% yield to liquid
            newState.condenserTemp = smallFluctuation(15.00);
            newState.coolingPower = smallFluctuation(newState.condensateFlow * 0.22); // Correlate with flow
            newState.bioOilTankLevel = Math.min(100, newState.bioOilTankLevel + (newState.condensateFlow / 3600) * 0.15);
            newState.aqueousPhaseTankLevel = Math.min(100, newState.aqueousPhaseTankLevel + (newState.condensateFlow / 3600) * 0.05);

            // Biochar discharge system
            newState.dischargeSystemState = 'DESCARGANDO';
            newState.dischargeValve = 'ABIERTA';
            newState.dischargeRate = smallFluctuation(newState.feedRate * 0.20); // 20% yield to solid
            newState.biocharContainerLevel = Math.min(100, newState.biocharContainerLevel + (newState.dischargeRate / 3600) * 0.1);
            newState.biocharTemp = smallFluctuation(newState.reactorTemp - 50);
            newState.biocharTempCooler = smallFluctuation(45);
            newState.coolerState = 'ENFRIANDO';
            newState.coolingWaterFlow = smallFluctuation(8.5);

            // Catalyst system
            newState.catalystSystemState = 'ACTIVO';
            newState.catalystDoseValve = 'ABIERTA';
            newState.catalystDoseActual = smallFluctuation(newState.catalystDoseTarget);
            newState.catalystFeederRpm = smallFluctuation(newState.catalystDoseActual * 15);
            newState.catalystHopperLevel = Math.max(0, newState.catalystHopperLevel - (newState.catalystDoseActual / 60) * 0.01);

            // Gas analysis
            newState.co = smallFluctuation(2.3, 0.1);
            newState.co2 = smallFluctuation(1.1, 0.1);
            newState.h2 = smallFluctuation(1.4, 0.1);
            newState.ch4 = smallFluctuation(0.9, 0.1);

            // Safety and auxiliary systems
            newState.safetySystem = 'ARMADO';
            newState.inertGasPurge = 'ACTIVO';
            newState.ambientO2 = smallFluctuation(20.9, 0.001);
            newState.refrigerationSystemState = 'ACTIVO';
            newState.refrigerationPumpState = 'ACTIVO';
            newState.chillerPower = smallFluctuation(12);
            newState.coolantTempIn = smallFluctuation(5);
            newState.coolantTempOut = smallFluctuation(15);
            newState.coolantPressure = smallFluctuation(4.5);
            break;

          case 'ENFRIANDO':
            newCoolingSeconds++;
            const tempDecrease = Math.random() * 5 + 3;
            newState.reactorTemp = Math.max(25, newState.reactorTemp - tempDecrease);

            newState.reactorWallTemp = smallFluctuation(newState.reactorTemp * 1.05);
            newState.reactorPressure = Math.max(1.01, newState.reactorPressure - 0.005);
            newState.pyrometerCoreTemp = smallFluctuation(newState.reactorTemp * 1.1);
            newState.thermocoupleCoreTemp = smallFluctuation(newState.reactorTemp * 1.02);
            newState.biocharTemp = Math.max(25, newState.biocharTemp - 10);

            newState.energyConsumption = smallFluctuation(0.5);

            // Shutting down systems
            newState.feedRate = 0;
            newState.biomassFeederState = false;
            newState.biomassFeederRpm = 0;
            newState.condensateFlow = 0;
            newState.coolingPower = 0;
            newState.dischargeRate = 0;
            newState.catalystDoseActual = 0;
            newState.catalystFeederRpm = 0;

            // Gradually decrease gas concentrations
            const decayFactor = 0.9;
            newState.co = Math.max(0, prev.co * decayFactor);
            newState.co2 = Math.max(0, prev.co2 * decayFactor);
            newState.h2 = Math.max(0, prev.h2 * decayFactor);
            newState.ch4 = Math.max(0, prev.ch4 * decayFactor);

            if (newState.reactorTemp < 100) {
              newState.condenserState = 'EN ESPERA';
              newState.dischargeSystemState = 'EN ESPERA';
              newState.dischargeValve = 'CERRADA';
              newState.catalystSystemState = 'EN ESPERA';
              newState.catalystDoseValve = 'CERRADA';
              newState.coolerState = 'INACTIVO';
              newState.coolingWaterFlow = 0;
              newState.inertGasPurge = 'EN ESPERA';
              newState.safetySystem = 'DESARMADO';
            }

            if (newState.reactorTemp <= 25.5) {
              newState.systemMode = 'APAGADO';
              addHmiEvent('Reactor completamente enfriado y apagado.');
            }
            break;

          case 'APAGADO':
            // Reset to initial state but preserve some values like tank levels
            newState = { ...prev, ...OFF_STATE, biomassHopperLevel: prev.biomassHopperLevel, bioOilTankLevel: prev.bioOilTankLevel, aqueousPhaseTankLevel: prev.aqueousPhaseTankLevel, biocharContainerLevel: prev.biocharContainerLevel, catalystHopperLevel: prev.catalystHopperLevel };
            if (heatingSeconds > 0 || stableSeconds > 0 || coolingSeconds > 0) {
              newHeatingSeconds = 0;
              newStableSeconds = 0;
              newCoolingSeconds = 0;
            }
            break;
        }
        setHeatingSeconds(newHeatingSeconds);
        setStableSeconds(newStableSeconds);
        setCoolingSeconds(newCoolingSeconds);

        setHistoryData(hprev => [...hprev.slice(-599), { ...newState, time: Date.now() }]);

        const totalSeconds = newHeatingSeconds + newStableSeconds + newCoolingSeconds;
        if (totalSeconds > 0 && totalSeconds % 60 === 0) {
          setMinuteLog(mprev => [...mprev.slice(-99), { ...newState, time: new Date().toLocaleTimeString('es-ES') }]);
        }

        return newState;
      });

      // Fleet Simulation
      setFleetReactors(prevReactors => {
        if (prevReactors.length === 0) { // Initial Population
          const initialFleet: ReactorState[] = [{
            id: 'P-01',
            status: hmiState.systemMode === 'APAGADO' ? 'Inactivo' : hmiState.systemMode === 'ESTABLE' ? 'Estable' : 'Arrancando',
            feedstock: 'Pellets de Biomasa',
            feedstockType: 'Biomasa Forestal',
            agentMode: hmiState.agentMode,
            temperature: hmiState.reactorTemp,
            targetTemp: hmiState.targetTemp,
            pressure: hmiState.reactorPressure,
            feedRate: hmiState.feedRate,
            bioOilOutput: hmiState.condensateFlow,
            emergencyStop: 'ARMADO',
            o2Level: 0.1,
            pelletPurity: 99.5,
            pelletMoisture: 8.5,
            efficiencyFactor: 0.95
          }];
          for (let i = 2; i <= 9; i++) {
            const id = `P-${i.toString().padStart(2, '0')}`;
            const randomStatus: ReactorStatus[] = ['Estable', 'Inactivo', 'Arrancando', 'Alerta'];
            const status = randomStatus[Math.floor(Math.random() * randomStatus.length)];
            const isGCR = i > 5;
            initialFleet.push({
              id,
              status,
              feedstock: isGCR ? 'Grano de Caucho (GCR)' : 'Pellets de Biomasa',
              feedstockType: isGCR ? 'Grano de Caucho' : 'Biomasa Forestal',
              agentMode: 'Automático (PID)',
              temperature: status === 'Estable' ? 480 + Math.random() * 40 : 25 + Math.random() * 10,
              targetTemp: 500,
              pressure: status === 'Estable' ? 1.05 + Math.random() * 0.1 : 1.01,
              feedRate: status === 'Estable' ? 35 + Math.random() * 5 : 0,
              bioOilOutput: status === 'Estable' ? 22 + Math.random() * 4 : 0,
              emergencyStop: 'ARMADO',
              o2Level: 0.15,
              pelletPurity: isGCR ? 98.2 : 99.6,
              pelletMoisture: isGCR ? 1.5 : 8.2,
              efficiencyFactor: 0.93 + Math.random() * 0.04
            });
          }
          return initialFleet;
        } else { // Update existing fleet
          return prevReactors.map(r => {
            if (r.id === 'P-01') {
              return {
                ...r,
                status: hmiState.systemMode === 'APAGADO' ? 'Inactivo' : hmiState.systemMode === 'ESTABLE' ? 'Estable' : hmiState.systemMode === 'CALENTANDO' ? 'Arrancando' : 'Enfriando',
                temperature: hmiState.reactorTemp,
                targetTemp: hmiState.targetTemp,
                pressure: hmiState.reactorPressure,
                feedRate: hmiState.feedRate,
                bioOilOutput: hmiState.condensateFlow,
              };
            }
            // Simulate minor fluctuations for other reactors
            if (r.status === 'Estable') {
              return {
                ...r,
                temperature: r.temperature + (Math.random() - 0.5) * 2,
                pressure: r.pressure + (Math.random() - 0.5) * 0.01,
                feedRate: r.feedRate + (Math.random() - 0.5) * 0.5,
                bioOilOutput: r.bioOilOutput + (Math.random() - 0.5) * 0.3,
              }
            }
            return r;
          });
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [hmiState, heatingSeconds, stableSeconds, coolingSeconds, addHmiEvent, vulcanoState.isRunning, vulcanoState.inputTonsPerDay, gaiaLabState.sampleId]);

  // Vulcano simulation
  useEffect(() => {
    if (!vulcanoState.isRunning) {
      if (Object.values(vulcanoState.machines).some(s => s !== 'APAGADO')) {
        setVulcanoState(p => ({ ...p, machines: { debeader: 'APAGADO', primaryShredder: 'APAGADO', rasperMill: 'APAGADO', granulators: 'APAGADO', magneticSeparators: 'APAGADO', textileClassifiers: 'APAGADO' }, processingRateTiresPerHour: 0, productionRateKgPerHour: { gcr: 0, steel: 0, fiber: 0 } }));
      }
      return;
    }

    const interval = setInterval(() => {
      setVulcanoState(p => {
        if (!p.isRunning) return p;

        let newState = { ...p };
        let newLog = [...(p.hefestosLog || [])];

        const addHefestosLog = (message: string) => {
          const timestamp = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          newLog.unshift(`${timestamp}: ${message}`);
        };

        let jamOcurred = false;
        const machineOrder: (keyof VulcanoState['machines'])[] = ['debeader', 'primaryShredder', 'rasperMill', 'granulators', 'magneticSeparators', 'textileClassifiers'];
        for (const machineKey of machineOrder) {
          if (newState.machines[machineKey] === 'APAGADO') {
            newState.machines[machineKey] = 'OK';
            addHefestosLog(`Sistema ${machineKey} iniciado.`);
          }
          if (Math.random() < 0.02 && newState.machines[machineKey] === 'OK') {
            newState.machines[machineKey] = 'ATASCO';
            addHefestosLog(`ALERTA - Atasco detectado en ${machineKey}.`);
            jamOcurred = true;
          } else if (newState.machines[machineKey] === 'ATASCO' && Math.random() < 0.3) {
            newState.machines[machineKey] = 'OK';
            addHefestosLog(`Sistema ${machineKey} recuperado de atasco.`);
          }
        }

        if (jamOcurred) {
          newState.processingRateTiresPerHour = p.processingRateTiresPerHour * 0.2;
        } else {
          newState.processingRateTiresPerHour = p.inputTonsPerDay / 24 * 1000 / 10;
        }

        const baseGCRRate = newState.processingRateTiresPerHour * 10 * 0.6;
        const baseSteelRate = newState.processingRateTiresPerHour * 10 * 0.25;
        const baseFiberRate = newState.processingRateTiresPerHour * 10 * 0.1;
        newState.productionRateKgPerHour = {
          gcr: baseGCRRate * (1 - Math.random() * 0.1),
          steel: baseSteelRate * (1 - Math.random() * 0.1),
          fiber: baseFiberRate * (1 - Math.random() * 0.1),
        };

        const gcrSiloCapacity = 20000;
        const steelSiloCapacity = 10000;
        const fiberSiloCapacity = 5000;
        newState.siloLevelsKg = {
          gcr: Math.min(gcrSiloCapacity, p.siloLevelsKg.gcr + newState.productionRateKgPerHour.gcr / (3600 / 2)),
          steel: Math.min(steelSiloCapacity, p.siloLevelsKg.steel + newState.productionRateKgPerHour.steel / (3600 / 2)),
          fiber: Math.min(fiberSiloCapacity, p.siloLevelsKg.fiber + newState.productionRateKgPerHour.fiber / (3600 / 2)),
        };

        setGaiaLabState(g => {
          if (!g.isNewBatchReady && !g.sampleId && newState.siloLevelsKg.gcr < gcrSiloCapacity && Math.random() < 0.2) {
            addHefestosLog("Nuevo lote de biochar producido. Esperando muestreo en Laboratorio Gaia.");
            return { ...g, isNewBatchReady: true };
          }
          return g;
        });

        newState.hefestosLog = newLog.slice(0, 50);
        return newState;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [vulcanoState.isRunning, vulcanoState.inputTonsPerDay, setGaiaLabState]);


  const runElectricalDiagnostics = useCallback(() => {
    setIsDiagnosing(true);
    addHmiEvent('Iniciando diagnóstico de seguridad eléctrica...');
    setTimeout(() => {
      setIsDiagnosing(false);
      const success = Math.random() > 0.1; // 90% success rate
      setHmiState(prev => ({
        ...prev,
        groundingStatus: success ? 'OK' : 'FALLO',
        insulationIntegrity: success ? 99.9 - Math.random() * 0.1 : 85.0 - Math.random() * 5
      }));
      addHmiEvent(success ? 'Diagnóstico eléctrico completado: OK.' : 'ALERTA: Fallo detectado en diagnóstico eléctrico.');
    }, 3000);
  }, [addHmiEvent]);

  const handleNavigateToRiskSimulator = useCallback((data: FinalOptimizationPackage) => {
    const { temperature, residenceTime, uncertainty, yieldBioOil } = data.optimizationDetails;

    // Convert FinalOptimizationPackage to a compatible TechnicalRiskPackage
    const remainingYield = 100 - yieldBioOil;
    const yieldGas = remainingYield * 0.6; // Assume 60% of remainder is gas
    const yieldBiochar = remainingYield * 0.4; // and 40% is biochar

    const handoffPackage: TechnicalRiskPackage = {
      reportId: `handoff-m3-m5-${data.handoffId}`,
      timestamp: data.timestamp,
      sourceModule: 'M3_Technical_Risk_Simulator', // Masquerade as the other M3 module for compatibility
      projectContext: {
        projectName: 'Proyecto desde Estación de Trabajo Hefesto',
        material: 'NFU Optimizado',
      },
      inputs: {
        parameters: [
          { name: 'Temperatura', baseValue: temperature, unit: '°C', uncertainty: uncertainty },
          { name: 'Tiempo de Residencia', baseValue: residenceTime, unit: 's', uncertainty: 0 },
        ],
        simulationRuns: 5000 // A default value
      },
      outputDistributions: [
        {
          product: 'Bio-aceite',
          unit: '% Rendimiento',
          distributionType: 'normal',
          mean: yieldBioOil,
          stdDev: uncertainty * 0.5, // Heuristic based on M3 simulator's logic
          confidence95_low: 0,
          confidence95_high: 0,
        },
        {
          product: 'Gas',
          unit: '% Rendimiento',
          distributionType: 'normal',
          mean: yieldGas,
          stdDev: uncertainty * 0.3, // Assume less uncertainty for byproducts
          confidence95_low: 0,
          confidence95_high: 0,
        },
        {
          product: 'Coque (Biochar)',
          unit: '% Rendimiento',
          distributionType: 'normal',
          mean: yieldBiochar,
          stdDev: uncertainty * 0.2, // Assume less uncertainty for byproducts
          confidence95_low: 0,
          confidence95_high: 0,
        }
      ],
      aiAnalysis: {
        kineticAnalysis: data.contextualChatHistory || 'Optimización lograda en Estación de Trabajo.',
        sensitivityAnalysis: {
          primaryFactor: 'Temperatura',
          message: 'La temperatura sigue siendo un factor de alta sensibilidad.'
        }
      },
      visualizationData: {
        bioOilHistogram: {
          buckets: [],
          counts: []
        }
      }
    };

    setTechnicalRiskPackage(handoffPackage);
    setView('strategic-risk-simulator');
  }, [setView]);

  const handleNavigateToGovernance = useCallback((data: GovernanceHandoffPackage) => {
    const newTask: Task = {
      id: `governance-proposal-${data.handoffId}`,
      title: data.triggeringEvent.title,
      createdAt: Date.now(),
      status: 'Por Hacer',
      contentType: ContentType.Texto,
      eventType: 'TitansDebate',
      formData: {
        objective: data.debateProposal.suggestedInstructions,
        specifics: {
          [ContentType.Texto]: {
            originalData: data,
          },
          [ContentType.Imagen]: {},
          [ContentType.Video]: {},
          [ContentType.Audio]: {},
          [ContentType.Codigo]: {},
        }
      },
      isIntelligent: false
    };
    setTasks(prev => [...prev, newTask]);
    setDebateInitialData(newTask);
    setView('titans-debate');
  }, []);

  const handleNavigateToOptimization = useCallback((data: OptimizationChallengePackage) => {
    setChallengePackage(data);
    setView('process-optimizer');
  }, []);


  const renderView = () => {
    console.log('DEBUG - Current view:', view);
    switch (view) {
      case 'creator': return <Creator
        onSaveTask={handleSaveTask}
        allStyles={styles}
        onAddStyle={(s) => setStyles(p => [...p, s])}
        knowledgeSources={knowledgeSources}
        setView={setView}
        initialData={creatorInitialData}
        onDataConsumed={() => { setCreatorInitialData(null); setInitialContentType(undefined); }}
        creativeContext={null}
        onPromptGenerated={() => { }}
        chronosState={chronosStateForCreator}
        stoState={stoStateForCreator}
        initialContentType={initialContentType}
      />;
      case 'library': return <StyleLibrary allStyles={styles} onApplyPepStyle={(s) => { setPepInitialData(s.pep_config); setView('editor'); }} onApplyVideoStyle={() => { }} />;
      case 'pro': return <ProStudio
        formData={proFormData}
        handleChange={(e) => {
          const { name, value } = 'target' in e ? e.target : e;
          setProFormData(prev => ({ ...prev, [name]: value }));
        }}
        handleSubmit={async (e) => {
          e.preventDefault();
          setProIsLoading(true);
          setProError('');
          try {
            // Build the professional prompt from form data
            let prompt = `Professional image prompt:\n\n`;
            if (proFormData.pro_concept) prompt += `Concept: ${proFormData.pro_concept}\n`;
            if (proFormData.pro_emotion) prompt += `Emotion: ${proFormData.pro_emotion}\n`;
            if (proFormData.pro_symbolism) prompt += `Symbolism: ${proFormData.pro_symbolism}\n`;
            if (proFormData.pro_composition_rule) prompt += `Composition: ${proFormData.pro_composition_rule}\n`;
            if (proFormData.pro_color_theory) prompt += `Color Theory: ${proFormData.pro_color_theory}\n`;
            if (proFormData.pro_specific_palette) prompt += `Palette: ${proFormData.pro_specific_palette}\n`;
            if (proFormData.pro_focal_length) prompt += `Focal Length: ${proFormData.pro_focal_length}\n`;
            if (proFormData.pro_shutter_speed) prompt += `Shutter Speed: ${proFormData.pro_shutter_speed}\n`;
            if (proFormData.pro_iso) prompt += `ISO: ${proFormData.pro_iso}\n`;
            if (proFormData.pro_lens_effects) prompt += `Lens Effects: ${proFormData.pro_lens_effects}\n`;
            if (proFormData.pro_post_production) prompt += `Post-Production: ${proFormData.pro_post_production}`;

            setProGeneratedPrompt(prompt);
          } catch (err) {
            setProError(err instanceof Error ? err.message : 'Unknown error');
          } finally {
            setProIsLoading(false);
          }
        }}
        isLoading={proIsLoading}
        error={proError}
        generatedPrompt={proGeneratedPrompt}
        onReset={() => {
          setProFormData({
            pro_concept: '',
            pro_emotion: '',
            pro_symbolism: '',
            pro_composition_rule: '',
            pro_color_theory: '',
            pro_specific_palette: '',
            pro_focal_length: '',
            pro_shutter_speed: '',
            pro_iso: '',
            pro_lens_effects: '',
            pro_post_production: ''
          });
          setProGeneratedPrompt('');
          setProError('');
        }}
        onMetadataExtract={(metadata) => {
          // Optional: handle metadata if needed
          console.log('Metadata extracted:', metadata);
        }}
        onUseInCreator={(prompt, contentType) => {
          setCreatorInitialData({ objective: prompt });
          setInitialContentType(contentType);
          setView('creator');
        }}
      />;
      case 'academia': return <Academia />;
      case 'editor': return <ProfessionalEditor onAddStyle={(s) => setStyles(p => [...p, s])} initialData={pepInitialData} setInitialData={setPepInitialData} />;
      case 'gallery': return <InspirationGallery onUseInspiration={(data) => { setCreatorInitialData(data); setInitialContentType(ContentType.Imagen); setView('creator'); }} />;
      case 'pro-layouts': return <ProLayoutGallery selectedLayout={selectedLayout} onSelectLayout={setSelectedLayout} allStyles={styles} />;
      case 'tasks': return <TaskManager tasks={tasks} onUpdateStatus={(id, status) => setTasks(p => p.map(t => t.id === id ? { ...t, status } : t))} onUpdateTask={handleUpdateTask} onDelete={handleDeleteTask} onLoad={handleLoadTask} onSaveTask={handleSaveTask} setView={setView} knowledgeSources={knowledgeSources} onLoadNarrative={handleLoadNarrative} setInitialHubSearch={() => { }} />;
      case 'pyrolysis-hub': return <PyrolysisHub setView={setView} onSimulateMixture={() => { }} onEditImage={() => { }} onCreateContentFromMaterial={() => { }} virtualMaterial={null} onVirtualMaterialConsumed={() => { }} onSaveTask={handleSaveTask} />;
      case 'comparative-lab': return <ComparativeScenariosLab onSaveTask={handleSaveTask} onDataConsumed={() => setInitialLabMaterialIds(null)} initialMaterialIds={initialLabMaterialIds} />;
      case 'knowledge-base': return <KnowledgeBase sources={knowledgeSources} onAddSource={(s) => setKnowledgeSources(p => [...p, s])} onClearSources={() => setKnowledgeSources([])} onAddVirtualMaterial={() => { }} />;
      case 'process-optimizer': return <ProcessOptimizer onSaveTask={handleSaveTask} challengePackage={challengePackage} apiKey={API_KEY} initialMaterialId={initialLabMaterialIds ? initialLabMaterialIds[0] : null} />;
      case 'property-visualizer': return <PropertyVisualizer setView={setView} setTasks={setTasks} setInitialLabMaterialIds={setInitialLabMaterialIds} />;
      case 'energy-balance': return <PyrolysisSimulator onNavigateWithContext={(payload: any) => {
          const prompt = `Generar una narrativa para un proceso de pirólisis con los siguientes datos:
Fuente: ${payload.source}
Materia Prima: ${payload.data.feedstock}
Temperatura: ${payload.data.temperature}°C
Rendimiento: Bio-oil ${payload.data.yields.oil}%, Biochar ${payload.data.yields.char}%, Gas ${payload.data.yields.gas}%
Eficiencia: ${payload.data.efficiency}%
Insight: ${payload.insight}`;
          setCreatorInitialData({ objective: prompt });
          setInitialContentType(ContentType.Texto);
          setView('creator');
      }} />;
      case 'user-guide': return <UserGuide setView={setView} setContentType={setInitialContentType} setVideoModeToAgent={() => { }} />;
      case 'game': return <Game />;
      case 'experiment-designer': return <ExperimentDesigner onUseAnalysisForPrompt={handleUseAnalysisForPrompt} />;
      case 'titans-atrium': return <TitansAtrium
        titans={titans}
        onUpdateTitan={handleUpdateTitan}
        setView={setView}
        onOpenWorkstation={handleOpenWorkstation}
        knowledgeSources={knowledgeSources}
        onSaveTask={handleSaveTask}
        onNavigateToForum={handleNavigateToForum}
        crisisContext={null}
        onCrisisHandled={() => { }}
        onNavigateToExpertCommand={(ctx) => {
          setExpertCommandContext(ctx);
          setView('expert-command-center');
        }}
        onStartCinematicAudit={handleStartCinematicAudit}
      />;
      case 'titan-workstation':
        if (!activeTitan) return null;
        if (activeTitan.claveName.includes('Hefesto')) {
          return <TitanWorkstation
            titan={activeTitan}
            onBack={() => { setView('titans-atrium'); setActiveTitan(null); }}
            onSaveTask={handleSaveTask}
            allStyles={styles}
            onAddStyle={(s) => setStyles(p => [...p, s])}
            knowledgeSources={knowledgeSources}
            setView={setView}
            chronosState={chronosStateForCreator}
            stoState={stoStateForCreator}
            vulcanoState={vulcanoState}
            setVulcanoState={setVulcanoState}
            onNavigateToUtilities={() => { }}
            initialData={srsInitialData}
            onDataConsumed={() => setSrsInitialData(null)}
            technicalRiskPackage={technicalRiskPackage}
            creativeContext={null}
            onPromptGenerated={() => { }}
            onNavigateToRiskSimulator={handleNavigateToRiskSimulator}
            onNavigateToGovernance={handleNavigateToGovernance}
          />;
        } else if (activeTitan.claveName.includes('Kairos')) {
          return <KairosWorkstation
            titan={activeTitan}
            onBack={() => { setView('titans-atrium'); setActiveTitan(null); }}
            onSaveTask={handleSaveTask}
            knowledgeSources={knowledgeSources}
            onNavigateToGovernance={handleNavigateToGovernance}
            onNavigateToOptimization={handleNavigateToOptimization}
            initialData={srsInitialData} // Assuming Kairos can receive data from Hefesto via this prop
          />;
        } else {
          return <TitanWorkspace
            titan={activeTitan}
            onUpdateTitan={handleUpdateTitan}
            onClose={() => { setView('titans-atrium'); setActiveTitan(null); }}
            onStartChat={handleStartChat}
            knowledgeSources={knowledgeSources}
            onSaveTask={handleSaveTask}
            onNavigateToForum={handleNavigateToForum}
          />;
        }
      case 'hmi-control-room': return <HMIControlRoom hmiState={hmiState} setHmiState={setHmiState} handleStartSystem={handleStartSystem} handleStopSystem={handleStopSystem} heatingSeconds={heatingSeconds} coolingSeconds={coolingSeconds} stableSeconds={stableSeconds} activeAlarms={[]} setActiveAlarms={() => { }} events={hmiEvents} addEvent={addHmiEvent} historyData={historyData} minuteLog={minuteLog} currentTime={currentTime} setView={setView} alarmConfigs={alarmConfigs} onAlarmConfigChange={setAlarmConfigs} pidGains={{ kp: 0, ki: 0, kd: 0 }} onPidChange={() => { }} selectedFeedstockId={selectedFeedstockId} onFeedstockChange={setSelectedFeedstockId} selectedCatalystId={selectedCatalystId} onCatalystChange={setSelectedCatalystId} initialTab={null} onTabVisited={() => { }} isDiagnosing={isDiagnosing} runElectricalDiagnostics={runElectricalDiagnostics} isCondenserObstructed={false} setIsCondenserObstructed={() => { }} isGasLineObstructed={false} setIsGasLineObstructed={() => { }} isTempSensorFailed={false} setIsTempSensorFailed={() => { }} isBiomassContaminated={false} setIsBiomassContaminated={() => { }} onOpenUtilityWidget={() => { }} onNavigateToArchitecturalSynth={() => { }} />;
      case 'hyperion-9': return <Hyperion9 reactors={fleetReactors} navigateToHmi={() => setView('hmi-control-room')} setView={setView} heatingSeconds={heatingSeconds} coolingSeconds={coolingSeconds} phoenixSiloLevel={phoenixState.pelletSiloLevel} dexListing={null} onFleetCommand={handleFleetCommand} />;
      case 'assay-manager': return <AssayManager tasks={tasks} onSaveTask={handleSaveTask} onUpdateTask={handleUpdateTask} setView={setView} />;
      case 'aegis-9': return <Aegis9 aegisState={aegisState} setAegisState={setAegisState} titans={titans} />;
      case 'eco-hornet-twin': return <EcoHornetTwin setView={setView} setExpertCommandContext={setExpertCommandContext} />;
      case 'phoenix': return <Phoenix phoenixState={phoenixState} setPhoenixState={setPhoenixState} argusModel={{ datasetSize: 15000, precision: 98.5, falsePositiveRate: 1.2 }} onNavigateToUtilities={(context) => { setView('utilities-simulator'); }} onSaveTask={handleSaveTask} />;
      case 'vulcano': return <Vulcano vulcanoState={vulcanoState} setVulcanoState={setVulcanoState} setView={setView} onNavigateToUtilities={(context) => { setView('utilities-simulator'); }} onSaveTask={handleSaveTask} />;
      case 'bioeconomy-lab': return isGovernanceCrisisActive ? <NexoControlPanel /> : <IAProStudio issuanceState={issuanceState} handleDeployContract={handleDeployContract} handleMintTokens={handleMintTokens} gaiaLabState={gaiaLabState} onTakeSample={handleTakeSample} setView={setView} onSaveTask={handleSaveTask} onTokenizeBatch={handleTokenizeBatch} />;
      case 'chronos': return <Chronos chronosState={chronosState} issuanceState={issuanceState} stoState={stoStateForCreator} setView={setView} handleVerifyAsset={handleVerifyAsset} handleLiquidation={handleLiquidation} handleConfirmStructure={handleConfirmStructure} handleDeployContract={handleDeployContract} handleMintTokens={handleMintTokens} />;
      case 'agriDeFi': return <AgriDeFi stoState={stoStateForCreator} onStartSTO={() => setStoStateForCreator(prev => ({ ...prev, status: 'ACTIVE' }))} onSaveTask={handleSaveTask} setView={setView} />;
      case 'gaia-lab': return <GaiaLab gaiaLabState={gaiaLabState} onTakeSample={handleTakeSample} onSimulateBatch={handleSimulateBatch} vulcanoGCRLevel={vulcanoState.siloLevelsKg.gcr} vulcanoPurity={vulcanoState.outputPurity.gcr} vulcanoIsRunning={vulcanoState.isRunning} />;
      case 'kairos-panel': return <KairosFinancialPanel setView={setView} onSaveTask={handleSaveTask} challengePackage={challengePackage} setChallengePackage={setChallengePackage} />;
      case 'strategic-risk-simulator': return <StrategicRiskSimulator initialData={srsInitialData} onDataConsumed={() => { setSrsInitialData(null); }} onSaveTask={handleSaveTask} setView={setView} technicalRiskPackage={technicalRiskPackage} />;
      case 'cogeneration-simulator': return <CogenerationSimulator onSaveTask={handleSaveTask} />;
      case 'fleet-simulator': return <FleetSimulator onSaveTask={handleSaveTask} setView={setView} onCreateReport={handleCreateReportFromSimulation} onOpenUtilityWidget={() => { }} onSimulationComplete={() => { }} onNavigateToArchitecturalSynth={handleNavigateToArchitecturalSynth} />;
      case 'catalyst-lab': return <CatalystLab onSendToCreator={handleCatalystSendToCreator} />;
      case 'utilities-simulator': return <UtilitiesSimulator onSaveTask={handleSaveTask} setView={setView} />;
      case 'generative-simulator': return <GenerativeSimulator onSaveTask={handleSaveTask} onCreateReportFromSimulation={handleCreateReportFromSimulation} />;
      case 'circular-fleet': return <CircularFleet fleetSimulationResult={null} onSaveTask={handleSaveTask} onNavigateToUtilities={() => { }} />;
      case 'viability-assessor': return <GlobalViabilityAssessor />;
      case 'eco-casa-simulator': return <EcoCasaSimulator onCreateReport={() => { }} onNavigateToArchitecturalSynth={() => { }} />;
      case 'detailed-project-input': return <DetailedProjectInput onSave={() => { }} />;
      case 'sustainable-certs': return <CertificationComparator onSaveTask={handleSaveTask} setView={setView} />;
      case 'certification-comparator': return <SustainableCerts onMint={handleMintCertification} setView={setView} />;
      case 'podcast-studio': return <PodcastStudio onSaveTask={handleSaveTask} setView={setView} onUseVideoPreset={() => { }} />;
      case 'titans-debate': return <TitansDebate knowledgeSources={knowledgeSources} initialTask={debateInitialData} onTaskConsumed={() => setDebateInitialData(null)} onSaveTask={handleSaveTask} onUpdateTask={handleUpdateTask} setView={setView} />;
      case 'due-diligence-analyzer': return <DueDiligenceAnalyzer onSaveTask={handleSaveTask} />;
      case 'call-simulator': return <CallSimulator onSaveTask={handleSaveTask} setView={setView} onNavigateToForum={() => { }} />;
      case 'collaboration-agreement': return <CollaborationAgreement />;
      case 'interactive-fundamentals-lab': return <InteractiveFundamentalsLab onSaveTask={handleSaveTask} setView={setView} onAnalyze={handleCatalyticAnalysis} />;
      case 'architectural-synthesis-dashboard': return <ArchitecturalSynthesisDashboard architecturalPreset={architecturalPreset} onPresetConsumed={() => setArchitecturalPreset(null)} />;
      case 'system-status-report': return <SystemStatusReport />;
      case 'user-profile': return <UserProfile certifications={userCertifications} history={governanceHistory} />;
      case 'manifesto': return <Manifesto />;
      case 'story-mode': return <StoryMode currentMissionIndex={currentMissionIndex} setCurrentMissionIndex={setCurrentMissionIndex} onAcceptMission={handleAcceptMission} onFinish={handleFinishStory} />;
      case 'expert-command-center': return <ExpertCommandCenter context={expertCommandContext} onBack={() => { setExpertCommandContext(null); setView('titans-atrium'); }} onStartCinematicAudit={handleStartCinematicAudit} />;
      case 'cinematic-audit': return cinematicAuditData ? <CinematicAuditPanel auditData={cinematicAuditData} onSaveTask={handleSaveTask} setView={setView} onDone={() => setCinematicAuditData(null)} /> : <p>No audit data available. Please start from the crisis intervention.</p>;
      case 'innovation-forge': return <InnovationForge coPresets={MOCK_CO_PRESETS} reactors={MOCK_REACTORS} addEvent={(m) => console.log('[IF]', m)} apiKey={API_KEY} onSaveTask={handleSaveTask} />;
      case 'nexo-bridge': return <NexoBridgeView />;
      case 'admin-console': return authToken ? <AdminConsole token={authToken} onClose={() => setView('home')} /> : <Login onLogin={handleLogin} />;
      default: return <Manifesto />;
    }
  };

  if (!authToken) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <aside className="w-64 bg-white flex-shrink-0 p-4 border-r border-gray-200 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800">Prompt Perfect</h1>
          <button onClick={() => setAuthToken(null)} className="text-gray-500 hover:text-red-600 mr-2" aria-label="Logout" title="Cerrar Sesión">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
          <button onClick={() => setIsAboutModalOpen(true)} className="text-gray-500 hover:text-blue-600" aria-label="About">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </button>
        </div>
        {currentUser?.roles.some(r => r.name === 'Admin') && (
          <button 
            onClick={() => setView('admin-console')}
            className="w-full mb-4 px-4 py-2 bg-red-900/10 text-red-600 rounded-lg border border-red-200 hover:bg-red-900/20 flex items-center justify-center gap-2 font-medium text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Admin Console
          </button>
        )}
        <ViewSelector currentView={view} setView={setView} />
      </aside>
      <main className="flex-grow p-4 bg-gray-50 overflow-y-auto h-full">
        <Suspense fallback={<LoadingSpinner />}>
          {renderView()}
        </Suspense>
      </main>
      <Suspense fallback={null}>
        {isAboutModalOpen && <AboutModal onClose={() => setIsAboutModalOpen(false)} />}
        {chatAgent && isChatOpen && (
          <AgentChatModal
            agent={chatAgent}
            isOpen={isChatOpen}
            onClose={handleCloseChat}
            chatHistory={chatHistory}
            onSendMessage={handleSendMessage}
            isAgentReplying={isAgentReplying}
            onSaveTask={handleSaveTask}
            onAssistantResponse={(response) => setChatHistory(prev => [...prev, response])}
            knowledgeSources={knowledgeSources}
          />
        )}
      </Suspense>
      <MarcoAvatar />
    </div>
  );
};

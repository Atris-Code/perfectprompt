import React, { useState, useEffect, useRef } from 'react';
// FIX: Corrected import path for types.
import type { Task, TaskStatus, SubTask, MapClickPayload, Asset } from '../types';
import AddTaskModal from './AddTaskModal';
import { MapComponent } from './MapComponent';
import * as corporateDataService from '../services/corporateDataService';

const STATUS_COLUMNS: TaskStatus[] = ['Por Hacer', 'En Progreso', 'Completado'];

const SubTaskDisplay: React.FC<{ subTasks: SubTask[] }> = ({ subTasks }) => {
  const getStatusIcon = (status: SubTask['status']) => {
    switch (status) {
      case 'pending':
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      case 'in-progress':
        return <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
      case 'completed':
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
    }
  };
  return (
    <div className="mt-3 space-y-2">
      {subTasks.map((sub, index) => (
        <div key={index} className="flex items-center text-sm text-gray-600">
          {getStatusIcon(sub.status)}
          <span className="ml-2">{sub.name}</span>
        </div>
      ))}
    </div>
  );
};

interface TaskManagerProps {
  tasks: Task[];
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onUpdateTask: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onLoad: (taskId: string) => void;
  onSaveTask: (task: Task) => void;
  setView: (view: any) => void;
  setInitialHubSearch: (term: string | null) => void;
  knowledgeSources: { name: string; content: string }[];
  onLoadNarrative: (task: Task) => Promise<void>;
}

const TaskCard: React.FC<{
  task: Task;
  onDelete: () => void;
  onLoad: () => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  onSetPin: () => void;
  onGeoSearch: () => void;
  isGeoSearching: boolean;
  onVideoUpload: (file: File) => void;
  isProcessingVideo: boolean;
  onLoadNarrative: () => void;
  isLoadingNarrative: boolean;
}> = ({ task, onDelete, onLoad, onDragStart, onSetPin, onGeoSearch, isGeoSearching, onVideoUpload, isProcessingVideo, onLoadNarrative, isLoadingNarrative }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isReportVisible, setIsReportVisible] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleDeleteClick = () => {
    if (showConfirm) {
      onDelete();
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 3000); // Reset after 3s
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onVideoUpload(file);
    }
  };

  const isLoadNarrativeAction = task.status === 'Completado' && task.eventType === 'Assay';

  const isOverdue = task.dueDate && task.dueDate < Date.now();

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="bg-white p-4 mb-4 rounded-lg border border-gray-200 shadow-sm cursor-grab active:cursor-grabbing transform transition-all hover:shadow-md hover:border-blue-300"
    >
      <h4 className="font-bold text-gray-800">{task.title}</h4>
      {task.isIntelligent && task.subTasks && <SubTaskDisplay subTasks={task.subTasks} />}
      <p className="text-xs text-gray-500 mt-2">Creado: {new Date(task.createdAt).toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })}</p>
      {task.dueDate && (
        <p className={`text-xs mt-1 font-semibold ${isOverdue ? 'text-red-500' : 'text-gray-500'}`}>
          Vence: {new Date(task.dueDate).toLocaleDateString()}
        </p>
      )}
      <p className="text-xs text-gray-500 mt-1">Tipo: <span className="font-semibold">{task.contentType}</span></p>
      {task.latitude && task.longitude && (
        <p className="text-xs text-gray-500 mt-1">Ubicación: <span className="font-mono">{task.latitude.toFixed(4)}, {task.longitude.toFixed(4)}</span></p>
      )}

      {task.videoUrl && (
        <div className="mt-3">
          <video src={task.videoUrl} controls className="w-full rounded-md bg-black" />
        </div>
      )}

      {task.result && (
        <div className="mt-3 pt-3 border-t">
          <button
            onClick={() => setIsReportVisible(!isReportVisible)}
            className="text-xs font-semibold text-gray-700 hover:text-blue-600 w-full text-left flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-1 transition-transform transform ${isReportVisible ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            {isReportVisible ? 'Ocultar' : 'Ver'} Documento Vivo
          </button>
          {isReportVisible && (
            <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm text-gray-800 max-h-60 overflow-y-auto whitespace-pre-wrap border">
              {task.result.text}
            </div>
          )}
        </div>
      )}

      <div className="mt-4 pt-3 border-t grid grid-cols-2 gap-2">
        <input
          type="file"
          ref={videoInputRef}
          className="hidden"
          accept="video/*"
          onChange={handleFileChange}
          disabled={isProcessingVideo}
        />
        <button
          onClick={() => videoInputRef.current?.click()}
          disabled={isProcessingVideo}
          className="col-span-2 text-xs font-semibold text-gray-600 hover:text-gray-800 transition-colors p-2 rounded-md hover:bg-gray-100 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-wait"
        >
          {isProcessingVideo ? (
            <>
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Procesando...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              Asociar Video
            </>
          )}
        </button>

        {(task.agentId === 'synthia-pro' || task.agentId === 'Orquestador') && task.latitude && (
          <button onClick={onGeoSearch} disabled={isGeoSearching} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors p-2 rounded-md hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-wait">
            {isGeoSearching ? 'Buscando...' : 'Buscar Entidades (IA)'}
          </button>
        )}
        <button onClick={onSetPin} className="text-xs font-semibold text-gray-600 hover:text-gray-800 transition-colors p-2 rounded-md hover:bg-gray-100">Fijar Ubicación</button>
        <button
          onClick={isLoadNarrativeAction ? onLoadNarrative : onLoad}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors p-2 rounded-md hover:bg-blue-50"
          disabled={isLoadingNarrative}
        >
          {isLoadingNarrative ? 'Cargando...' : isLoadNarrativeAction ? 'Cargar Narrativa' : 'Cargar'}
        </button>
        <button onClick={handleDeleteClick} className={`text-xs font-semibold transition-colors p-2 rounded-md ${showConfirm ? 'text-white bg-red-600 hover:bg-red-700' : 'text-red-600 hover:text-red-800 hover:bg-red-50'}`}>
          {showConfirm ? '¿Confirmar?' : 'Eliminar'}
        </button>
      </div>
    </div>
  );
};

const TaskColumn: React.FC<{
  status: TaskStatus;
  tasks: Task[];
  onDelete: (taskId: string) => void;
  onLoad: (taskId: string) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onSetPin: (task: Task) => void;
  onGeoSearch: (task: Task) => void;
  searchingTaskId: string | null;
  onVideoUpload: (taskId: string, file: File) => void;
  processingVideoTaskId: string | null;
  onLoadNarrative: (task: Task) => void;
  isLoadingNarrative: string | null;
}> = ({ status, tasks, onDelete, onLoad, onDragStart, onDrop, onDragOver, onSetPin, onGeoSearch, searchingTaskId, onVideoUpload, processingVideoTaskId, onLoadNarrative, isLoadingNarrative }) => {
  const columnColors: Record<TaskStatus, string> = {
    'Por Hacer': 'border-gray-400',
    'En Progreso': 'border-blue-500',
    'Completado': 'border-green-500',
  };

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      className={`flex-1 bg-gray-100 p-4 rounded-lg border-t-4 ${columnColors[status]}`}
    >
      <h3 className="font-bold text-lg text-gray-700 mb-4 tracking-wider uppercase">{status} ({tasks.length})</h3>
      <div>
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onDelete={() => onDelete(task.id)}
            onLoad={() => onLoad(task.id)}
            onDragStart={(e) => onDragStart(e, task.id)}
            onSetPin={() => onSetPin(task)}
            onGeoSearch={() => onGeoSearch(task)}
            isGeoSearching={searchingTaskId === task.id}
            onVideoUpload={(file) => onVideoUpload(task.id, file)}
            isProcessingVideo={processingVideoTaskId === task.id}
            onLoadNarrative={() => onLoadNarrative(task)}
            isLoadingNarrative={isLoadingNarrative === task.id}
          />
        ))}
        {tasks.length === 0 && (
          <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-md">
            <p className="text-sm text-gray-500">Arrastra una tarea aquí</p>
          </div>
        )}
      </div>
    </div>
  );
};


export const TaskManager: React.FC<TaskManagerProps> = ({ tasks, onUpdateStatus, onUpdateTask, onDelete, onLoad, onSaveTask, knowledgeSources, onLoadNarrative }) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const processedTasksRef = useRef<Set<string>>(new Set());
  const [showMap, setShowMap] = useState(false);
  const [taskToPin, setTaskToPin] = useState<Task | null>(null);
  const [searchingTaskId, setSearchingTaskId] = useState<string | null>(null);
  const [mapSearchResults, setMapSearchResults] = useState<(Asset & { OwnerEntityName: string, OwnerEntityID: string })[]>([]);
  const [isMapSearching, setIsMapSearching] = useState<boolean>(false);
  const [processingVideoTaskId, setProcessingVideoTaskId] = useState<string | null>(null);
  const [isLoadingNarrative, setIsLoadingNarrative] = useState<string | null>(null);


  useEffect(() => {
    const orchestrateTasks = async () => {
      const newIntelligentTasks = tasks.filter(
        t => t.isIntelligent && t.status === 'Por Hacer' && !processedTasksRef.current.has(t.id) && t.agentId !== 'Orquestador'
      );

      if (newIntelligentTasks.length === 0) return;

      for (const task of newIntelligentTasks) {
        processedTasksRef.current.add(task.id);

        // 1. Move to In Progress
        onUpdateStatus(task.id, 'En Progreso');

        let currentSubTasks = [...(task.subTasks || [])];

        for (let i = 0; i < currentSubTasks.length; i++) {
          // 2. Update subtask to 'in-progress'
          currentSubTasks = currentSubTasks.map((st, index) => index === i ? { ...st, status: 'in-progress' } : st);
          onUpdateTask({ ...task, status: 'En Progreso', subTasks: [...currentSubTasks] });

          // 3. Simulate agent work
          await new Promise(resolve => setTimeout(resolve, Math.random() * 4000 + 2000));

          // 4. Update subtask to 'completed'
          currentSubTasks = currentSubTasks.map((st, index) => index === i ? { ...st, status: 'completed' } : st);
          onUpdateTask({ ...task, status: 'En Progreso', subTasks: [...currentSubTasks] });
        }

        // 5. Move main task to Completed
        onUpdateStatus(task.id, 'Completado');
      }
    };

    orchestrateTasks();
  }, [tasks, onUpdateStatus, onUpdateTask]);


  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: TaskStatus) => {
    e.preventDefault();
    if (draggedTaskId) {
      onUpdateStatus(draggedTaskId, newStatus);
      setDraggedTaskId(null);
    }
  };

  const handleMapClick = (payload: MapClickPayload) => {
    if (taskToPin) {
      const updatedTask: Task = {
        ...taskToPin,
        latitude: payload.lat,
        longitude: payload.lng,
      };
      onUpdateTask(updatedTask);
      setTaskToPin(null);
    }

    // Automatic search on any map click
    setIsMapSearching(true);
    setMapSearchResults([]);

    // Simulate async search
    setTimeout(() => {
      const region = payload.lat > 45 ? 'Sweden' : 'Colombia';
      const assetType = region === 'Sweden' ? 'Bioenergy Power' : 'Cement and Concrete';

      const assets = corporateDataService.getAssets(assetType, region);
      setMapSearchResults(assets);
      setIsMapSearching(false);
    }, 1500);
  };

  const handleGeoSearch = async (taskToSearch: Task) => {
    if (!taskToSearch.latitude || !taskToSearch.longitude) return;

    setSearchingTaskId(taskToSearch.id);
    await new Promise(resolve => setTimeout(resolve, 2500)); // Simulate AI thinking

    // Simplified logic to determine region for demo purposes
    const region = taskToSearch.latitude > 45 ? 'Sweden' : 'Colombia';
    const assetType = region === 'Sweden' ? 'Bioenergy Power' : 'Cement and Concrete';

    const assets = corporateDataService.getAssets(assetType, region);
    const resultString = assets.length > 0
      ? `Encontrado ${assets.length} activo(s) de tipo '${assetType}' en ${region}. Propietario principal: ${assets[0].OwnerEntityName}`
      : `No se encontraron activos de tipo '${assetType}' en la región simulada (${region}).`;

    const newSubTask: SubTask = {
      name: `Geo-Intel: ${resultString}`,
      status: 'completed',
    };

    const updatedTask: Task = {
      ...taskToSearch,
      subTasks: [...(taskToSearch.subTasks || []), newSubTask],
    };

    onUpdateTask(updatedTask);
    setSearchingTaskId(null);
  };

  const handleVideoUpload = async (taskId: string, file: File) => {
    setProcessingVideoTaskId(taskId);
    const videoUrl = URL.createObjectURL(file);

    const videoElement = document.createElement('video');
    videoElement.src = videoUrl;

    videoElement.onloadedmetadata = () => {
      const duration = videoElement.duration;
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        const subTasks: SubTask[] = [
          { name: 'Transcodificación a MP4', status: 'pending' },
          { name: `Análisis de Escenas (~${Math.ceil(duration / 60)} min. aprox)`, status: 'pending' },
          { name: 'Generación de Transcripción', status: 'pending' },
          { name: 'Síntesis y Reporte Final', status: 'pending' },
        ];
        const updatedTask: Task = {
          ...task,
          videoUrl,
          subTasks: [...(task.subTasks || []), ...subTasks],
          isIntelligent: true,
        };
        onUpdateTask(updatedTask);
        setProcessingVideoTaskId(null);
      }
    };
    videoElement.onerror = () => {
      console.error("Error al cargar los metadatos del video.");
      setProcessingVideoTaskId(null);
    };
  };

  const handleSave = (task: Task) => {
    onSaveTask(task);
    setIsModalOpen(false);
  };

  const handleLoadNarrative = async (task: Task) => {
    setIsLoadingNarrative(task.id);
    try {
      await onLoadNarrative(task);
    } catch (e) {
      console.error("Error loading narrative", e);
      alert("Error al cargar la narrativa.");
    } finally {
      setIsLoadingNarrative(null);
    }
  };

  const tasksByStatus = (status: TaskStatus) => tasks.filter(t => t.status === status);

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg h-full flex flex-col relative">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
      {isLoadingNarrative && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 animate-fade-in">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <p className="mt-4 font-semibold text-gray-700">Janus está traduciendo tus datos a una narrativa...</p>
        </div>
      )}
      {isModalOpen && <AddTaskModal onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
      <header className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900">Gestor de Tareas</h2>
        <p className="mt-2 text-md text-gray-600">Organiza tus prompts y proyectos en un tablero Kanban.</p>
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
          >
            + Añadir Tarea Inteligente
          </button>
          <button
            onClick={() => setShowMap(!showMap)}
            className="bg-gray-700 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-transform transform hover:scale-105"
          >
            {showMap ? 'Ocultar Mapa' : 'Ver Mapa'}
          </button>
        </div>
      </header>

      <div className="mb-10">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Fuentes de Conocimiento Documental Activas</h3>
        {knowledgeSources && knowledgeSources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {knowledgeSources.map((source, index) => {
              const pageCount = Math.ceil(source.content.length / 2500);
              return (
                <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col h-full hover:border-blue-300 hover:shadow-md transition-all">
                  <h4 className="font-bold text-blue-800 truncate" title={source.name}>{source.name}</h4>
                  <p className="text-sm text-gray-500 mt-2 flex-grow" style={{ display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {source.content}
                  </p>
                  <div className="mt-auto pt-3 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
                    <span>{pageCount} Página{pageCount !== 1 ? 's' : ''} (aprox.)</span>
                    <span className="font-semibold text-green-600">ABSORBIDO</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No hay fuentes de conocimiento activas.</p>
        )}
      </div>

      {showMap && (
        <div className="mb-8 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-bold mb-2 text-gray-700">Mapa de Tareas y Activos</h3>
          {taskToPin && (
            <p className="text-sm text-blue-600 mb-2 animate-pulse">
              Haz clic en el mapa para fijar la ubicación de: <strong>{taskToPin.title}</strong>
            </p>
          )}
          <MapComponent onMapClick={handleMapClick} tasks={tasks} />
          <div className="mt-4">
            <h4 className="font-semibold text-gray-700">Resultados de Búsqueda Geoespacial:</h4>
            {isMapSearching ? (
              <p className="text-sm text-gray-500 italic mt-2">Buscando activos cercanos...</p>
            ) : mapSearchResults.length > 0 ? (
              <ul className="mt-2 space-y-2 text-sm max-h-40 overflow-y-auto">
                {mapSearchResults.map((asset, index) => (
                  <li key={asset.AssetID || asset.PlantID || index} className="p-3 bg-white border rounded-md shadow-sm">
                    <p className="font-bold text-gray-800">{asset.AssetName || asset.PlantName}</p>
                    <p className="text-gray-600">Propietario: {asset.OwnerEntityName}</p>
                    <p className="text-gray-600">Capacidad: <span className="font-mono">{asset.Capacity} {asset.CapacityUnit}</span></p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic mt-2">No se encontraron activos en la última área seleccionada. Haz clic en el mapa para buscar.</p>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6 flex-grow">
        {STATUS_COLUMNS.map(status => (
          <TaskColumn
            key={status}
            status={status}
            tasks={tasksByStatus(status)}
            onDelete={onDelete}
            onLoad={onLoad}
            onDragStart={handleDragStart}
            onDrop={(e) => handleDrop(e, status)}
            onDragOver={handleDragOver}
            onSetPin={setTaskToPin}
            onGeoSearch={handleGeoSearch}
            searchingTaskId={searchingTaskId}
            onVideoUpload={handleVideoUpload}
            processingVideoTaskId={processingVideoTaskId}
            onLoadNarrative={handleLoadNarrative}
            isLoadingNarrative={isLoadingNarrative}
          />
        ))}
      </div>
    </div>
  );
};
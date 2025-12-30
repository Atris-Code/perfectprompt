import React, { useState } from 'react';
import type { AudiovisualScene } from '../../types';
import { Accordion } from './Accordion';
import { FormInput, FormTextarea } from './FormControls';

interface SceneEditorProps {
    scenes: AudiovisualScene[];
    onSceneChange: (scene: AudiovisualScene) => void;
    onSequenceChange: (scenes: AudiovisualScene[]) => void;
}

export const SceneEditor: React.FC<SceneEditorProps> = ({ scenes, onSceneChange, onSequenceChange }) => {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;
        
        const newScenes = [...scenes];
        const [draggedItem] = newScenes.splice(draggedIndex, 1);
        newScenes.splice(index, 0, draggedItem);
        
        onSequenceChange(newScenes);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const handleFieldChange = (sceneId: string, field: keyof AudiovisualScene, value: string | number) => {
        const scene = scenes.find(s => s.id === sceneId);
        if (scene) {
            onSceneChange({ ...scene, [field]: value });
        }
    };

    const addScene = () => {
        const newScene: AudiovisualScene = {
            id: `scene-${Date.now()}`,
            sceneTitle: `Nueva Escena ${scenes.length + 1}`,
            narration: '',
            duration: 5,
            visualPromptPreset: '',
            visualPromptFreeText: '',
            soundDesign: ''
        };
        onSequenceChange([...scenes, newScene]);
    };
    
    const removeScene = (sceneId: string) => {
        onSequenceChange(scenes.filter(s => s.id !== sceneId));
    };

    return (
        <div className="space-y-4">
            <h4 className="text-lg font-bold text-gray-800">Editor de Secuencia Audiovisual</h4>
            {scenes.map((scene, index) => (
                <div 
                    key={scene.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className="cursor-move border border-transparent hover:border-blue-400 rounded-lg"
                >
                    <Accordion title={`Escena ${index + 1}: ${scene.sceneTitle}`} defaultOpen={false}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput
                                label="Título de la Escena"
                                id={`title-${scene.id}`}
                                name="sceneTitle"
                                value={scene.sceneTitle}
                                onChange={(e) => handleFieldChange(scene.id, 'sceneTitle', e.target.value)}
                            />
                            <div>
                                <FormInput
                                    label="Duración (segundos)"
                                    id={`duration-${scene.id}`}
                                    name="duration"
                                    type="number"
                                    value={scene.duration}
                                    onChange={(e) => handleFieldChange(scene.id, 'duration', Number(e.target.value))}
                                />
                                <p className="text-xs text-gray-500 mt-1">Guía: 5-10s. Escenas más largas deben dividirse.</p>
                            </div>
                            <div className="md:col-span-2">
                                <FormTextarea
                                    label="Narración"
                                    id={`narration-${scene.id}`}
                                    name="narration"
                                    rows={3}
                                    value={scene.narration}
                                    onChange={(e) => handleFieldChange(scene.id, 'narration', e.target.value)}
                                />
                            </div>
                            <FormInput
                                label="Preset Visual"
                                id={`preset-${scene.id}`}
                                name="visualPromptPreset"
                                value={scene.visualPromptPreset}
                                onChange={(e) => handleFieldChange(scene.id, 'visualPromptPreset', e.target.value)}
                            />
                             <FormInput
                                label="Diseño de Sonido"
                                id={`sound-${scene.id}`}
                                name="soundDesign"
                                value={scene.soundDesign}
                                onChange={(e) => handleFieldChange(scene.id, 'soundDesign', e.target.value)}
                            />
                             <div className="md:col-span-2">
                                <FormTextarea
                                    label="Prompt Visual Libre"
                                    id={`free-text-${scene.id}`}
                                    name="visualPromptFreeText"
                                    rows={3}
                                    value={scene.visualPromptFreeText}
                                    onChange={(e) => handleFieldChange(scene.id, 'visualPromptFreeText', e.target.value)}
                                />
                            </div>
                        </div>
                         <div className="mt-4 flex justify-end">
                            <button
                                type="button"
                                onClick={() => removeScene(scene.id)}
                                className="text-red-600 hover:text-red-800 text-sm font-semibold"
                            >
                                Eliminar Escena
                            </button>
                        </div>
                    </Accordion>
                </div>
            ))}
             <button
                type="button"
                onClick={addScene}
                className="w-full bg-gray-200 text-gray-800 font-bold py-2 rounded-lg hover:bg-gray-300"
            >
                + Añadir Escena
            </button>
        </div>
    );
};
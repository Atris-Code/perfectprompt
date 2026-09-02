import { ContentType } from '../types';
// FIX: Changed import of 'VideoPreset' from '../data/videoPresets' to '../types' to resolve export errors.
import type { FormData, ProFormData, Marker, AgentSolution, TextualNarrativeCoherence, ProLayout, GeoContextualData, VideoPreset, NarrativeConsistencyFeedback } from '../types';
import { ALL_VIDEO_PRESETS } from "../data/videoPresets";
import { CLASSIFIED_GENRE_PRESETS } from "../data/genrePresets";
import { ALL_DOCUMENTARY_PRESETS } from "../data/documentaryPresets";
import { ALL_STYLES } from "../data/styles";
import { SENSATION_CATEGORIES } from "../data/sensations";

export const generateLayoutPreview = (layout: ProLayout): { pml: string; previewContent: Record<string, string> } => {
  const pml = `
MASTER PROMPT FOR LAYOUT: ${layout.title}
RATIONALE: ${layout.rationale}
STRUCTURE:
${JSON.stringify(layout.structure, null, 2)}
---
Based on the layout structure above, generate placeholder content for the following blocks: image, data, fcn, prompt, title, video, history.
The content should be brief and descriptive of the block's purpose.
    `;

  const previewContent: Record<string, string> = {
    image: 'Placeholder for main image',
    data: 'Placeholder for data and specifications.',
    fcn: 'Placeholder for FCN feedback analysis.',
    prompt: 'Placeholder for the generated prompt code/text.',
    title: layout.title,
    video: 'Placeholder for video content.',
    history: 'Placeholder for generation history.',
  };

  return { pml, previewContent };
};

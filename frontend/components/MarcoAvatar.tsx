import React from 'react';
import { useMarco } from '../contexts/MarcoContext';

export const MarcoAvatar: React.FC = () => {
  const { isMarcoSpeaking } = useMarco();

  return (
    <div className={`marco-avatar ${isMarcoSpeaking ? 'speaking' : ''}`} title="Marco, el Narrador">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Head shape */}
        <path d="M12 2a10 10 0 0 0-10 10c0 5 3.5 9.25 8.1 9.9" />
        <path d="M12 2a10 10 0 0 1 10 10c0 1.6-0.38 3.1-1.04 4.5" />
        {/* Eyes */}
        <circle cx="9" cy="10" r="1" fill="currentColor" />
        <circle cx="15" cy="10" r="1" fill="currentColor" />
        {/* Mouth/Waveform */}
        <path d="M8 16s1.5-2 4-2 4 2 4 2" className="mouth" />
      </svg>
    </div>
  );
};
import React, { createContext, useState, useContext, PropsWithChildren } from 'react';

interface MarcoContextType {
  isMarcoSpeaking: boolean;
  setIsMarcoSpeaking: (isSpeaking: boolean) => void;
}

const MarcoContext = createContext<MarcoContextType | undefined>(undefined);

export const MarcoProvider = ({ children }: PropsWithChildren<{}>) => {
  const [isMarcoSpeaking, setIsMarcoSpeaking] = useState(false);

  return (
    <MarcoContext.Provider value={{ isMarcoSpeaking, setIsMarcoSpeaking }}>
      {children}
    </MarcoContext.Provider>
  );
};

export const useMarco = () => {
  const context = useContext(MarcoContext);
  if (context === undefined) {
    throw new Error('useMarco must be used within a MarcoProvider');
  }
  return context;
};
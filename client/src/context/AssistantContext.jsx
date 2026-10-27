import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const AssistantContext = createContext(null);

export function AssistantProvider({ children }) {
  const [activePrediction, setActivePrediction] = useState(null);
  const [activeDisease, setActiveDisease] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState('');

  const setDiagnosticContext = useCallback((prediction, disease) => {
    setActivePrediction(prediction || null);
    setActiveDisease(disease || null);
  }, []);

  const openAssistantWithPrompt = useCallback((promptText = '') => {
    setIsOpen(true);
    if (promptText) {
      setPendingPrompt(promptText);
    }
  }, []);

  const clearPendingPrompt = useCallback(() => {
    setPendingPrompt('');
  }, []);

  const value = useMemo(
    () => ({
      activePrediction,
      activeDisease,
      isOpen,
      setIsOpen,
      pendingPrompt,
      clearPendingPrompt,
      setDiagnosticContext,
      openAssistantWithPrompt,
    }),
    [
      activePrediction,
      activeDisease,
      isOpen,
      pendingPrompt,
      clearPendingPrompt,
      setDiagnosticContext,
      openAssistantWithPrompt,
    ]
  );

  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>;
}

export function useAssistantContext() {
  const ctx = useContext(AssistantContext);
  if (!ctx) {
    throw new Error('useAssistantContext must be used inside AssistantProvider');
  }
  return ctx;
}

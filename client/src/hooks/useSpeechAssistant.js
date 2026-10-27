import { useCallback, useEffect, useRef, useState } from 'react';

export const SUPPORTED_VOICE_LANGUAGES = [
  { code: 'en-IN', label: 'EN-IN' },
  { code: 'en-US', label: 'EN-US' },
  { code: 'ta-IN', label: 'TA-IN (Exp)' },
];

export function useSpeechAssistant({ onTranscript } = {}) {
  const [language, setLanguage] = useState('en-IN');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [recognitionError, setRecognitionError] = useState('');

  const recognitionRef = useRef(null);
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;

  const SpeechRecognitionImpl =
    typeof window !== 'undefined'
      ? window.SpeechRecognition || window.webkitSpeechRecognition || null
      : null;

  const isRecognitionSupported = Boolean(SpeechRecognitionImpl);
  const isSynthesisSupported =
    typeof window !== 'undefined' &&
    typeof window.speechSynthesis !== 'undefined' &&
    typeof window.SpeechSynthesisUtterance !== 'undefined';

  const stopSpeaking = useCallback(() => {
    if (isSynthesisSupported) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore browser speech synthesis cancellation quirks
      }
    }
    setIsSpeaking(false);
  }, [isSynthesisSupported]);

  const speakText = useCallback(
    (text) => {
      if (!voiceEnabled || !isSynthesisSupported || !text) return;
      try {
        window.speechSynthesis.cancel();
        const utterance = new window.SpeechSynthesisUtterance(String(text));
        utterance.lang = language;
        utterance.rate = 0.98;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      } catch {
        setIsSpeaking(false);
      }
    },
    [voiceEnabled, isSynthesisSupported, language]
  );

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore stop errors if already idle
      }
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    setRecognitionError('');
    if (!SpeechRecognitionImpl) {
      setRecognitionError(
        'Browser speech recognition is unavailable here. Typed interaction works identically below.'
      );
      return;
    }

    stopSpeaking();

    try {
      const recognition = new SpeechRecognitionImpl();
      recognition.lang = language;
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event?.results?.[0]?.[0]?.transcript || '';
        setIsListening(false);
        if (transcript.trim() && onTranscriptRef.current) {
          onTranscriptRef.current(transcript.trim());
        }
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        const code = event?.error || 'unknown';
        if (code === 'not-allowed' || code === 'service-not-allowed') {
          setRecognitionError(
            'Microphone permission was denied. Grant browser mic access or use typed chat below.'
          );
        } else if (code === 'no-speech') {
          setRecognitionError('No speech detected. Try speaking again or type your command below.');
        } else {
          setRecognitionError(
            `Speech recognition encountered "${code}". Typed commands remain active.`
          );
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
      setRecognitionError('Unable to initialize microphone recognition in this browser.');
    }
  }, [SpeechRecognitionImpl, language, stopSpeaking]);

  useEffect(() => {
    return () => {
      stopListening();
      stopSpeaking();
    };
  }, [stopListening, stopSpeaking]);

  return {
    language,
    setLanguage,
    isListening,
    isSpeaking,
    voiceEnabled,
    setVoiceEnabled,
    recognitionError,
    isRecognitionSupported,
    isSynthesisSupported,
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
  };
}

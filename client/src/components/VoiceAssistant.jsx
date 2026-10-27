import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { useAssistantContext } from '../context/AssistantContext';
import { useAuth } from '../context/AuthContext';
import {
  SUPPORTED_VOICE_LANGUAGES,
  useSpeechAssistant,
} from '../hooks/useSpeechAssistant';
import { formatConfidencePercent } from '../utils/formatters';

const QUICK_COMMANDS = [
  'Open the upload page',
  'Read my result',
  'Explain the symptoms',
  'How can I prevent this disease?',
  'Show my prediction history',
  'Open disease library',
];

export default function VoiceAssistant() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const {
    activePrediction,
    activeDisease,
    isOpen,
    setIsOpen,
    pendingPrompt,
    clearPendingPrompt,
  } = useAssistantContext();

  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Hello! I am Crop Assistant. You can use your microphone or type commands like "Check my crop", "Read my result", "Explain the symptoms", or "How can I prevent this disease?".',
    },
  ]);

  const chatEndRef = useRef(null);
  const processCommandRef = useRef(null);

  const {
    language,
    setLanguage,
    isListening,
    isSpeaking,
    voiceEnabled,
    setVoiceEnabled,
    recognitionError,
    isRecognitionSupported,
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
  } = useSpeechAssistant({
    onTranscript: (spokenText) => {
      if (processCommandRef.current) {
        processCommandRef.current(spokenText);
      }
    },
  });

  const appendExchange = useCallback(
    (userUtterance, assistantReply) => {
      setMessages((prev) => [
        ...prev,
        ...(userUtterance
          ? [{ id: `u_${Date.now()}`, sender: 'user', text: userUtterance }]
          : []),
        { id: `a_${Date.now()}_${Math.random()}`, sender: 'assistant', text: assistantReply },
      ]);
      speakText(assistantReply);
    },
    [speakText]
  );

  const buildResultSummary = useCallback(() => {
    if (!activePrediction && !activeDisease) {
      return 'No prediction result or disease entry is currently open on screen. Navigate to "Diagnose Leaf" to upload a leaf photograph, or open a record from your Prediction History.';
    }

    if (activePrediction) {
      const confLabel = activePrediction.isDemo
        ? 'generated in simulated UI walkthrough mode without a CNN confidence score'
        : `with a CNN model confidence of ${formatConfidencePercent(activePrediction.confidence)}`;

      const statusNote =
        activePrediction.status === 'uncertain'
          ? ' Because confidence is below the certainty threshold, treat this result as uncertain and verify with an extension officer.'
          : '';

      return `Your selected leaf record is ${activePrediction.cropName} — ${activePrediction.diseaseName}, ${confLabel}.${statusNote} Remember that statistical confidence is not guaranteed field accuracy.`;
    }

    return `You are viewing the Disease Library guide for ${activeDisease.cropName} — ${activeDisease.diseaseName}. Ask me to explain the symptoms or prevention steps.`;
  }, [activePrediction, activeDisease]);

  const processCommand = useCallback(
    (rawCommand) => {
      const cleaned = String(rawCommand || '').trim();
      if (!cleaned) return;
      const lower = cleaned.toLowerCase();

      // Tamil & English keyword routing using strictly verified local application data
      if (
        lower.includes('upload') ||
        lower.includes('check my crop') ||
        lower.includes('diagnose') ||
        lower.includes('predict') ||
        cleaned.includes('பயிர்') ||
        cleaned.includes('பதிவேற்று')
      ) {
        navigate('/upload');
        appendExchange(
          cleaned,
          isAuthenticated
            ? 'Opening the Crop Leaf Upload page. Select or capture a clear single-leaf photograph to run diagnosis.'
            : 'Redirecting to Sign In first—authentication is required before uploading a crop leaf image.'
        );
        return;
      }

      if (
        lower.includes('history') ||
        lower.includes('previous') ||
        lower.includes('past prediction') ||
        cleaned.includes('வரலாறு')
      ) {
        navigate('/history');
        appendExchange(cleaned, 'Opening your Prediction History page.');
        return;
      }

      if (lower.includes('library') || lower.includes('diseases') || lower.includes('catalog')) {
        navigate('/diseases');
        appendExchange(
          cleaned,
          'Opening the PlantVillage Disease Library where you can filter crop species and inspect verified symptoms.'
        );
        return;
      }

      if (lower.includes('home') || lower.includes('landing') || cleaned.includes('முகப்பு')) {
        navigate('/');
        appendExchange(cleaned, 'Returning to the PhytoGuard Home page.');
        return;
      }

      if (lower.includes('dashboard') || lower.includes('overview')) {
        navigate('/dashboard');
        appendExchange(cleaned, 'Opening your Grower Dashboard.');
        return;
      }

      if (lower.includes('profile') || lower.includes('account')) {
        navigate('/profile');
        appendExchange(cleaned, 'Opening your Account Profile and Security page.');
        return;
      }

      if (lower.includes('admin')) {
        if (isAdmin) {
          navigate('/admin');
          appendExchange(cleaned, 'Opening the Administrator Console.');
        } else {
          appendExchange(
            cleaned,
            'Administrator permissions are required to access the Admin Console.'
          );
        }
        return;
      }

      if (lower.includes('about')) {
        navigate('/about');
        appendExchange(cleaned, 'Opening the System Architecture and About page.');
        return;
      }

      if (
        lower.includes('read my result') ||
        lower.includes('my result') ||
        lower.includes('what disease') ||
        cleaned.includes('முடிவு')
      ) {
        appendExchange(cleaned, buildResultSummary());
        return;
      }

      if (lower.includes('symptom') || cleaned.includes('அறிகுறி')) {
        if (!activeDisease || !Array.isArray(activeDisease.symptoms)) {
          appendExchange(
            cleaned,
            'Open a prediction result or a Disease Library entry first so I can read its verified leaf symptoms.'
          );
          return;
        }
        appendExchange(
          cleaned,
          `Verified symptoms for ${activeDisease.cropName} ${activeDisease.diseaseName}: ${activeDisease.symptoms.join('. ')}.`
        );
        return;
      }

      if (
        lower.includes('prevent') ||
        lower.includes('avoid') ||
        cleaned.includes('தடுப்பு')
      ) {
        if (!activeDisease || !Array.isArray(activeDisease.prevention)) {
          appendExchange(
            cleaned,
            'Open a prediction result or a Disease Library entry first so I can read its preventive cultural practices.'
          );
          return;
        }
        appendExchange(
          cleaned,
          `Preventive practices for ${activeDisease.cropName} ${activeDisease.diseaseName}: ${activeDisease.prevention.join('. ')}.`
        );
        return;
      }

      if (
        lower.includes('manage') ||
        lower.includes('treat') ||
        lower.includes('control') ||
        lower.includes('pesticide')
      ) {
        if (!activeDisease || !Array.isArray(activeDisease.management)) {
          appendExchange(
            cleaned,
            'Open a prediction result or a Disease Library entry first to review integrated management guidance. Note that I never prescribe chemical pesticide dosages—always consult a local agricultural extension specialist.'
          );
          return;
        }
        appendExchange(
          cleaned,
          `Integrated management guidance for ${activeDisease.cropName} ${activeDisease.diseaseName}: ${activeDisease.management.join('. ')}. For any chemical product selection or dosage, consult a certified local agronomy extension officer.`
        );
        return;
      }

      appendExchange(
        cleaned,
        'I can navigate the app or read verified disease data. Try saying: "Open the upload page", "Show my prediction history", "Read my result", "Explain the symptoms", or "How can I prevent this disease?".'
      );
    },
    [
      activeDisease,
      appendExchange,
      buildResultSummary,
      isAdmin,
      isAuthenticated,
      navigate,
    ]
  );

  processCommandRef.current = processCommand;

  useEffect(() => {
    if (pendingPrompt) {
      const promptToRun = pendingPrompt;
      clearPendingPrompt();
      processCommand(promptToRun);
    }
  }, [pendingPrompt, clearPendingPrompt, processCommand]);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const text = inputText;
    setInputText('');
    processCommand(text);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#1E5631] text-white font-semibold text-sm shadow-md hover:bg-[#164225] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E5631]"
          aria-label="Open Crop Assistant voice and chat helper"
        >
          <Mic className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span className="whitespace-nowrap">Crop Assistant</span>
        </button>
      ) : (
        <section
          aria-label="Crop Assistant panel"
          className="w-[calc(100vw-2.5rem)] sm:w-[390px] max-h-[540px] rounded-2xl border border-[#DCE3DA] bg-white shadow-xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-[#17231A] text-white flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h2 className="text-sm font-bold truncate">Crop Assistant</h2>
              <p className="text-[11px] text-white/75 truncate">
                {isListening
                  ? 'Microphone listening — speak now...'
                  : isSpeaking
                  ? 'Speaking response aloud...'
                  : 'Local browser voice & typed navigation'}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                aria-label="Select voice assistant language"
                className="text-[11px] bg-white/10 text-white rounded px-1.5 py-1 border border-white/20 focus:outline-none"
              >
                {SUPPORTED_VOICE_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="text-[#17231A]">
                    {lang.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => {
                  if (voiceEnabled) stopSpeaking();
                  setVoiceEnabled((v) => !v);
                }}
                className="p-1.5 rounded hover:bg-white/10 transition-colors cursor-pointer"
                aria-label={voiceEnabled ? 'Mute spoken voice output' : 'Enable spoken voice output'}
                title={voiceEnabled ? 'Spoken output enabled' : 'Spoken output muted'}
              >
                {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  stopListening();
                  stopSpeaking();
                  setIsOpen(false);
                }}
                className="p-1.5 rounded hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Minimize Crop Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Browser Speech Support / Permission Notice */}
          {(!isRecognitionSupported || recognitionError) && (
            <div className="px-4 py-2 bg-[#FFFBEB] border-b border-[#F59E0B]/30 text-[11px] text-[#78350F]">
              {recognitionError ||
                'Browser speech recognition is unavailable here. Typed interaction works identically below.'}
            </div>
          )}

          {/* Conversation Transcript */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[260px] bg-[#F9FAF7]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#1E5631] text-white'
                      : 'bg-white border border-[#E2E7DF] text-[#17231A]'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Command Buttons */}
          <div className="px-3 py-2 border-t border-[#E2E7DF] bg-white flex items-center gap-1.5 overflow-x-auto">
            {QUICK_COMMANDS.map((cmd) => (
              <button
                key={cmd}
                type="button"
                onClick={() => processCommand(cmd)}
                className="px-2.5 py-1 text-[11px] font-medium text-[#17231A] bg-[#F3F6F2] hover:bg-[#E6ECE4] rounded-md whitespace-nowrap shrink-0 transition-colors cursor-pointer"
              >
                {cmd}
              </button>
            ))}
          </div>

          {/* Voice + Typed Fallback Input Bar */}
          <form
            onSubmit={handleFormSubmit}
            className="p-3 border-t border-[#E2E7DF] bg-white flex items-center gap-2"
          >
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`p-2.5 rounded-lg transition-colors shrink-0 cursor-pointer ${
                isListening
                  ? 'bg-[#DC2626] text-white'
                  : 'bg-[#EEF4EF] text-[#1E5631] hover:bg-[#DFECE1]'
              }`}
              aria-label={isListening ? 'Stop listening' : 'Speak voice command'}
              title={isListening ? 'Stop listening' : 'Start microphone'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <div className="relative flex-1">
              <MessageSquare
                className="w-3.5 h-3.5 text-[#68766C] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a command or question..."
                aria-label="Type command for Crop Assistant"
                className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-[#DCE3DA] bg-[#F9FAF7] text-[#17231A] focus:outline-none focus:border-[#1E5631]"
              />
            </div>

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-lg bg-[#1E5631] text-white hover:bg-[#164225] disabled:opacity-40 transition-colors shrink-0 cursor-pointer"
              aria-label="Send command"
            >
              <Send className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </form>
        </section>
      )}
    </div>
  );
}

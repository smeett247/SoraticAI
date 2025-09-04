import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Headphones, Activity } from 'lucide-react';

interface VoiceInteractionProps {
  isDarkMode: boolean;
  onVoiceInput: (text: string) => void;
  onSpeakResponse: (text: string) => void;
  isEnabled: boolean;
}

const VoiceInteraction: React.FC<VoiceInteractionProps> = ({ 
  isDarkMode, 
  onVoiceInput, 
  onSpeakResponse,
  isEnabled 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const themeClasses = {
    cardBg: isDarkMode ? 'bg-gray-900/80' : 'bg-white/90',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
  };

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const result = event.results[event.results.length - 1];
        const transcript = result.transcript;
        const confidence = result.confidence;
        
        setTranscript(transcript);
        setConfidence(confidence);
        
        if (result.isFinal) {
          onVoiceInput(transcript);
          setTranscript('');
        }
      };

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [onVoiceInput]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const speakText = (text: string) => {
    if (synthRef.current && voiceEnabled) {
      // Cancel any ongoing speech
      synthRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      synthRef.current.speak(utterance);
      onSpeakResponse(text);
    }
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (isSpeaking) {
      stopSpeaking();
    }
  };

  if (!isEnabled) return null;

  return (
    <div className={`${themeClasses.cardBg} backdrop-blur-sm border ${themeClasses.border} rounded-xl p-4`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Headphones className="w-5 h-5 text-indigo-500" />
          <span className={`font-medium ${themeClasses.text}`}>Voice Assistant</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : isSpeaking ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'}`}></div>
          <span className={`text-xs ${themeClasses.textSecondary}`}>
            {isListening ? 'Listening' : isSpeaking ? 'Speaking' : 'Ready'}
          </span>
        </div>
      </div>

      {/* Voice Controls */}
      <div className="flex items-center justify-center space-x-4 mb-4">
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={isSpeaking}
          className={`p-4 rounded-full transition-all duration-200 ${
            isListening 
              ? 'bg-red-500 text-white shadow-lg animate-pulse' 
              : 'bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 hover:scale-105'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          title={isListening ? 'Stop listening' : 'Start voice input'}
        >
          {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        <button
          onClick={toggleVoice}
          className={`p-4 rounded-full transition-all duration-200 ${
            voiceEnabled 
              ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30' 
              : 'bg-gray-500/20 text-gray-500 hover:bg-gray-500/30'
          } hover:scale-105`}
          title={voiceEnabled ? 'Disable voice output' : 'Enable voice output'}
        >
          {voiceEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </button>

        {isSpeaking && (
          <button
            onClick={stopSpeaking}
            className="p-4 rounded-full bg-orange-500/20 text-orange-500 hover:bg-orange-500/30 hover:scale-105 transition-all duration-200"
            title="Stop speaking"
          >
            <VolumeX className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Live Transcript */}
      {(isListening || transcript) && (
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="w-4 h-4 text-blue-500" />
            <span className={`text-sm font-medium ${themeClasses.text}`}>Live Transcript</span>
            {confidence > 0 && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                confidence > 0.8 ? 'bg-green-500/20 text-green-500' :
                confidence > 0.6 ? 'bg-yellow-500/20 text-yellow-500' :
                'bg-red-500/20 text-red-500'
              }`}>
                {Math.round(confidence * 100)}% confident
              </span>
            )}
          </div>
          <div className={`p-3 ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100/50'} rounded-lg border-l-4 border-blue-500`}>
            <p className={`${themeClasses.text} ${transcript ? '' : 'italic opacity-50'}`}>
              {transcript || 'Speak now...'}
            </p>
          </div>
        </div>
      )}

      {/* Voice Visualization */}
      {isListening && (
        <div className="flex items-center justify-center space-x-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-blue-500 rounded-full animate-pulse"
              style={{
                height: `${Math.random() * 20 + 10}px`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: '0.5s'
              }}
            ></div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => speakText('Hello! I\'m your AI learning assistant. How can I help you today?')}
          disabled={isSpeaking}
          className={`p-2 text-xs ${themeClasses.border} border rounded-lg ${themeClasses.text} hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 disabled:opacity-50`}
        >
          Test Voice
        </button>
        <button
          onClick={() => speakText('You can ask me questions by speaking, and I\'ll respond with voice and text.')}
          disabled={isSpeaking}
          className={`p-2 text-xs ${themeClasses.border} border rounded-lg ${themeClasses.text} hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 disabled:opacity-50`}
        >
          How it works
        </button>
      </div>

      {/* Status Info */}
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs">
          <span className={themeClasses.textSecondary}>
            Voice Recognition: {recognitionRef.current ? 'Available' : 'Not supported'}
          </span>
          <span className={themeClasses.textSecondary}>
            Speech Synthesis: {synthRef.current ? 'Available' : 'Not supported'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VoiceInteraction;
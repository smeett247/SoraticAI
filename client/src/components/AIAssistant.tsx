import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Mic, MicOff, Volume2, Camera, Image, Brain, Zap } from 'lucide-react';

interface AIAssistantProps {
  isDarkMode: boolean;
  onVoiceInput: (text: string) => void;
  onImageAnalysis: (analysis: string) => void;
  selectedSubject: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ 
  isDarkMode, 
  onVoiceInput, 
  onImageAnalysis,
  selectedSubject 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState<'easy' | 'medium' | 'hard'>('medium');
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const themeClasses = {
    cardBg: isDarkMode ? 'bg-gray-900/95' : 'bg-white/95',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
  };

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const result = event.results[event.results.length - 1];
        const transcript = result.transcript;
        
        setTranscript(transcript);
        
        if (result.isFinal && transcript.trim()) {
          onVoiceInput(transcript);
          setTranscript('');
          setIsListening(false);
        }
      };

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = () => setIsListening(false);
    }
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        // Simulate AI analysis
        const analyses = [
          "I can see a diagram here. What do you think the main components represent?",
          "This looks like a mathematical problem. What's your first approach?",
          "I notice this is a physics concept. How do the forces interact here?",
          "This appears to be code. Can you trace through the logic?"
        ];
        const analysis = analyses[Math.floor(Math.random() * analyses.length)];
        onImageAnalysis(analysis);
      };
      reader.readAsDataURL(file);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <>
      {/* Floating AI Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg hover:scale-110 transition-all duration-300 flex items-center justify-center ${
          isOpen ? 'rotate-180' : ''
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
      </button>

      {/* AI Assistant Panel */}
      {isOpen && (
        <div className={`fixed bottom-24 right-6 z-40 w-80 ${themeClasses.cardBg} backdrop-blur-sm border ${themeClasses.border} rounded-2xl shadow-2xl p-4 space-y-4`}>
          {/* Header */}
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-500" />
            <span className={`font-semibold ${themeClasses.text}`}>AI Learning Assistant</span>
            <div className={`ml-auto px-2 py-1 rounded text-xs ${
              difficultyLevel === 'easy' ? 'bg-green-500/20 text-green-500' :
              difficultyLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
              'bg-red-500/20 text-red-500'
            }`}>
              {difficultyLevel}
            </div>
          </div>

          {/* Voice Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${themeClasses.text}`}>Voice Input</span>
              <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={isListening ? stopListening : startListening}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl transition-all duration-200 ${
                  isListening 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-blue-500/20 text-blue-500 hover:bg-blue-500/30'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span className="text-sm">{isListening ? 'Stop' : 'Speak'}</span>
              </button>
              
              <button
                onClick={() => speakText('Hello! I am your AI learning assistant. How can I help you today?')}
                className="p-3 bg-green-500/20 text-green-500 hover:bg-green-500/30 rounded-xl transition-all duration-200"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* Live Transcript */}
            {(isListening || transcript) && (
              <div className={`p-3 ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100/50'} rounded-lg border-l-4 border-blue-500`}>
                <p className={`text-sm ${themeClasses.text} ${transcript ? '' : 'italic opacity-50'}`}>
                  {transcript || 'Listening...'}
                </p>
              </div>
            )}
          </div>

          {/* Image Analysis */}
          <div className="space-y-3">
            <span className={`text-sm font-medium ${themeClasses.text}`}>Visual Learning</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center space-x-2 py-2 px-3 bg-purple-500/20 text-purple-500 hover:bg-purple-500/30 rounded-lg transition-all duration-200"
              >
                <Image className="w-4 h-4" />
                <span className="text-sm">Upload</span>
              </button>
              <button
                onClick={() => {
                  navigator.mediaDevices.getUserMedia({ video: true })
                    .then(() => {
                      // Camera functionality would go here
                      alert('Camera feature coming soon!');
                    })
                    .catch(() => alert('Camera access denied'));
                }}
                className="flex items-center justify-center space-x-2 py-2 px-3 bg-green-500/20 text-green-500 hover:bg-green-500/30 rounded-lg transition-all duration-200"
              >
                <Camera className="w-4 h-4" />
                <span className="text-sm">Camera</span>
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <span className={`text-sm font-medium ${themeClasses.text}`}>Quick Actions</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setDifficultyLevel(difficultyLevel === 'easy' ? 'medium' : difficultyLevel === 'medium' ? 'hard' : 'easy')}
                className="flex items-center justify-center space-x-1 py-2 px-2 bg-orange-500/20 text-orange-500 hover:bg-orange-500/30 rounded-lg transition-all duration-200"
              >
                <Zap className="w-3 h-3" />
                <span className="text-xs">Adjust Level</span>
              </button>
              <button
                onClick={() => speakText(`Current subject is ${selectedSubject}. Difficulty level is ${difficultyLevel}.`)}
                className="flex items-center justify-center space-x-1 py-2 px-2 bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 rounded-lg transition-all duration-200"
              >
                <Brain className="w-3 h-3" />
                <span className="text-xs">Status</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Mic, MicOff, Volume2 } from 'lucide-react';

interface AdaptiveLearningProps {
  isDarkMode: boolean;
  currentSubject: string;
  onDifficultyChange: (level: 'easy' | 'medium' | 'hard') => void;
  onStruggleDetected: (suggestions: string[]) => void;
}

const AdaptiveLearning: React.FC<AdaptiveLearningProps> = ({ 
  isDarkMode, 
  currentSubject, 
  onDifficultyChange, 
  onStruggleDetected 
}) => {
  const [difficultyLevel, setDifficultyLevel] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [strugglingIndicators, setStrugglingIndicators] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);

  const themeClasses = {
    cardBg: isDarkMode ? 'bg-gray-900/80' : 'bg-white/90',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
  };

  useEffect(() => {
    // Check for voice support
    setVoiceSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }, []);

  useEffect(() => {
    // Adaptive difficulty logic
    if (strugglingIndicators >= 3) {
      if (difficultyLevel === 'hard') {
        setDifficultyLevel('medium');
        onDifficultyChange('medium');
      } else if (difficultyLevel === 'medium') {
        setDifficultyLevel('easy');
        onDifficultyChange('easy');
      }
      
      // Trigger struggle detection
      const suggestions = [
        'Try breaking the problem into smaller steps',
        'Review the fundamental concepts first',
        'Look at similar examples',
        'Consider a different approach to the problem'
      ];
      onStruggleDetected(suggestions);
      setStrugglingIndicators(0);
    }
  }, [strugglingIndicators, difficultyLevel, onDifficultyChange, onStruggleDetected]);

  const handleVoiceToggle = () => {
    if (!voiceSupported) return;
    
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      // Voice recognition logic would go here
      setTimeout(() => setIsListening(false), 5000);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy': return 'text-green-500 bg-green-500/20';
      case 'medium': return 'text-yellow-500 bg-yellow-500/20';
      case 'hard': return 'text-red-500 bg-red-500/20';
      default: return 'text-gray-500 bg-gray-500/20';
    }
  };

  return (
    <div className={`${themeClasses.cardBg} backdrop-blur-sm border ${themeClasses.border} rounded-xl p-4 space-y-4`}>
      {/* AI Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-purple-500" />
          <span className={`font-medium ${themeClasses.text}`}>AI Learning Assistant</span>
        </div>
        <div className="flex items-center space-x-2">
          {voiceSupported && (
            <button
              onClick={handleVoiceToggle}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-blue-500/20 text-blue-500 hover:bg-blue-500/30'
              }`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}
          <button
            onClick={() => speakText('AI assistant is ready to help you learn')}
            className="p-2 rounded-lg bg-green-500/20 text-green-500 hover:bg-green-500/30 transition-all duration-200"
            title="Test voice output"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Adaptive Difficulty */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-blue-500" />
          <span className={`text-sm ${themeClasses.textSecondary}`}>Difficulty Level</span>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(difficultyLevel)}`}>
          {difficultyLevel.toUpperCase()}
        </div>
      </div>

      {/* Struggle Detection */}
      {strugglingIndicators > 0 && (
        <div className="flex items-start space-x-2 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5" />
          <div>
            <p className={`text-sm font-medium ${themeClasses.text}`}>Need help?</p>
            <p className={`text-xs ${themeClasses.textSecondary}`}>
              I notice you might be struggling. Let me adjust the difficulty.
            </p>
          </div>
        </div>
      )}

      {/* Voice Status */}
      {isListening && (
        <div className="flex items-center space-x-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex space-x-1">
            <div className="w-1 h-4 bg-blue-500 rounded animate-pulse"></div>
            <div className="w-1 h-4 bg-blue-500 rounded animate-pulse" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-1 h-4 bg-blue-500 rounded animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span className={`text-sm ${themeClasses.text}`}>Listening...</span>
        </div>
      )}

      {/* Learning Insights */}
      <div className="text-xs space-y-1">
        <div className="flex items-center justify-between">
          <span className={themeClasses.textSecondary}>Learning Progress</span>
          <span className="text-green-500">Adapting</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-1 rounded-full transition-all duration-500" 
               style={{ width: `${Math.max(20, 100 - strugglingIndicators * 20)}%` }}></div>
        </div>
      </div>
    </div>
  );
};

export default AdaptiveLearning;
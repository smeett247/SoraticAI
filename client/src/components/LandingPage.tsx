import React from 'react';
import { BookOpen, MessageSquare, TrendingUp, ArrowRight, Bot, Sparkles } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  isDarkMode: boolean;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, isDarkMode }) => {
  const themeClasses = {
    bg: isDarkMode ? 'bg-black' : 'bg-gray-50',
    cardBg: isDarkMode ? 'bg-gray-900/80' : 'bg-white/90',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeClasses.bg}`}>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10"></div>
        <div className="container mx-auto px-4 py-20 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mb-8 shadow-2xl">
              <BookOpen className="w-12 h-12 text-white" />
            </div>
            
            <h1 className={`text-6xl font-bold mb-6 transition-colors duration-300 ${themeClasses.text}`}>
              Socratic Learning
              <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent"> Companion</span>
            </h1>
            
            <p className={`text-xl mb-8 leading-relaxed transition-colors duration-300 ${themeClasses.textSecondary}`}>
              Master knowledge through guided inquiry. Discover answers through thoughtful questions 
              and exploration, not direct instruction.
            </p>
            
            <button
              onClick={onGetStarted}
              className="group flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl transition-all duration-200 hover:scale-105 shadow-lg text-lg font-semibold mx-auto"
            >
              <span>Start Learning</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className={`${themeClasses.cardBg} backdrop-blur-sm border ${themeClasses.border} rounded-2xl p-8 text-center transition-all duration-300 hover:scale-105`}>
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h3 className={`text-xl font-bold mb-4 transition-colors duration-300 ${themeClasses.text}`}>
              Socratic Method
            </h3>
            <p className={`transition-colors duration-300 ${themeClasses.textSecondary}`}>
              Learn through guided questions that lead to deeper understanding
            </p>
          </div>

          <div className={`${themeClasses.cardBg} backdrop-blur-sm border ${themeClasses.border} rounded-2xl p-8 text-center transition-all duration-300 hover:scale-105`}>
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h3 className={`text-xl font-bold mb-4 transition-colors duration-300 ${themeClasses.text}`}>
              AI-Powered Tutors
            </h3>
            <p className={`transition-colors duration-300 ${themeClasses.textSecondary}`}>
              Specialized AI agents adapt to your learning pace
            </p>
          </div>

          <div className={`${themeClasses.cardBg} backdrop-blur-sm border ${themeClasses.border} rounded-2xl p-8 text-center transition-all duration-300 hover:scale-105`}>
            <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className={`text-xl font-bold mb-4 transition-colors duration-300 ${themeClasses.text}`}>
              Deep Understanding
            </h3>
            <p className={`transition-colors duration-300 ${themeClasses.textSecondary}`}>
              Build lasting knowledge through self-discovery
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
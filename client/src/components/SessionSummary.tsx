import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, MessageSquare, Lightbulb, X } from 'lucide-react';

interface SessionSummaryData {
  id: number;
  topics_covered: string[];
  key_concepts: string[];
  questions_asked: number;
  time_spent: string;
  ai_summary: string;
  created_at: string;
}

interface SessionSummaryProps {
  conversationId: number;
  isDarkMode: boolean;
  onClose: () => void;
}

const SessionSummary: React.FC<SessionSummaryProps> = ({ conversationId, isDarkMode, onClose }) => {
  const [summary, setSummary] = useState<SessionSummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  const themeClasses = {
    cardBg: isDarkMode ? 'bg-gray-900/95' : 'bg-white/95',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    hoverBg: isDarkMode ? 'hover:bg-gray-800/60' : 'hover:bg-gray-100/80',
  };

  useEffect(() => {
    generateSummary();
  }, [conversationId]);

  const generateSummary = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/conversations/${conversationId}/summary/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`,
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (error) {
      console.error('Failed to generate summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className={`${themeClasses.cardBg} backdrop-blur-sm border ${themeClasses.border} rounded-2xl p-8 max-w-2xl w-full`}>
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
            <span className={themeClasses.text}>Generating session summary...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`${themeClasses.cardBg} backdrop-blur-sm border ${themeClasses.border} rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${themeClasses.border}`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${themeClasses.text}`}>Session Summary</h2>
              <p className={`text-sm ${themeClasses.textSecondary}`}>
                {new Date(summary.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-all duration-200 ${themeClasses.hoverBg}`}
          >
            <X className={`w-5 h-5 ${themeClasses.text}`} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100/50'} rounded-xl p-4`}>
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-8 h-8 text-blue-500" />
                <div>
                  <p className={`text-2xl font-bold ${themeClasses.text}`}>{summary.questions_asked}</p>
                  <p className={`text-sm ${themeClasses.textSecondary}`}>Questions Asked</p>
                </div>
              </div>
            </div>
            
            <div className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100/50'} rounded-xl p-4`}>
              <div className="flex items-center space-x-3">
                <BookOpen className="w-8 h-8 text-green-500" />
                <div>
                  <p className={`text-2xl font-bold ${themeClasses.text}`}>{summary.topics_covered.length}</p>
                  <p className={`text-sm ${themeClasses.textSecondary}`}>Topics Covered</p>
                </div>
              </div>
            </div>
            
            <div className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100/50'} rounded-xl p-4`}>
              <div className="flex items-center space-x-3">
                <Clock className="w-8 h-8 text-purple-500" />
                <div>
                  <p className={`text-2xl font-bold ${themeClasses.text}`}>
                    {summary.time_spent ? `${Math.round(parseInt(summary.time_spent) / 60)}m` : 'N/A'}
                  </p>
                  <p className={`text-sm ${themeClasses.textSecondary}`}>Time Spent</p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Summary */}
          <div>
            <h3 className={`text-lg font-semibold mb-3 flex items-center space-x-2 ${themeClasses.text}`}>
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              <span>Session Overview</span>
            </h3>
            <div className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100/50'} rounded-xl p-4`}>
              <p className={`${themeClasses.textSecondary} leading-relaxed`}>
                {summary.ai_summary || 'This session focused on exploring key concepts through guided inquiry and Socratic questioning.'}
              </p>
            </div>
          </div>

          {/* Topics Covered */}
          {summary.topics_covered.length > 0 && (
            <div>
              <h3 className={`text-lg font-semibold mb-3 ${themeClasses.text}`}>Topics Covered</h3>
              <div className="flex flex-wrap gap-2">
                {summary.topics_covered.map((topic, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gradient-to-r from-red-500/20 to-orange-500/20 text-orange-400 rounded-full text-sm border border-orange-500/30"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Key Concepts */}
          {summary.key_concepts.length > 0 && (
            <div>
              <h3 className={`text-lg font-semibold mb-3 ${themeClasses.text}`}>Key Concepts</h3>
              <div className="space-y-2">
                {summary.key_concepts.map((concept, index) => (
                  <div
                    key={index}
                    className={`flex items-start space-x-3 p-3 ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100/50'} rounded-lg`}
                  >
                    <div className="w-2 h-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className={`${themeClasses.textSecondary}`}>{concept}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Learning Recommendations */}
          <div>
            <h3 className={`text-lg font-semibold mb-3 ${themeClasses.text}`}>Next Steps</h3>
            <div className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100/50'} rounded-xl p-4`}>
              <ul className={`space-y-2 ${themeClasses.textSecondary}`}>
                <li className="flex items-start space-x-2">
                  <span className="text-orange-500">•</span>
                  <span>Review the concepts discussed in this session</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-orange-500">•</span>
                  <span>Try related practice exercises to reinforce learning</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-orange-500">•</span>
                  <span>Continue exploring deeper questions on these topics</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-6 border-t ${themeClasses.border} flex justify-end`}>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-lg transition-all duration-200"
          >
            Close Summary
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionSummary;
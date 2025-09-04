import React, { useState, useEffect } from 'react';
import { ChevronRight, CheckCircle, Clock, Star } from 'lucide-react';

interface Pathway {
  id: number;
  title: string;
  description: string;
  order: number;
}

interface Exercise {
  id: number;
  title: string;
  problem_statement: string;
  hints: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

interface LearningPathwaysProps {
  subjectId: number;
  isDarkMode: boolean;
}

const LearningPathways: React.FC<LearningPathwaysProps> = ({ subjectId, isDarkMode }) => {
  const [pathways, setPathways] = useState<Pathway[]>([]);
  const [selectedPathway, setSelectedPathway] = useState<number | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');

  const themeClasses = {
    cardBg: isDarkMode ? 'bg-gray-900/80' : 'bg-white/90',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    inputBg: isDarkMode ? 'bg-gray-800/50' : 'bg-white/80',
    hoverBg: isDarkMode ? 'hover:bg-gray-800/60' : 'hover:bg-gray-100/80',
  };

  useEffect(() => {
    fetchPathways();
  }, [subjectId]);

  useEffect(() => {
    if (selectedPathway) {
      fetchExercises(selectedPathway);
    }
  }, [selectedPathway]);

  const fetchPathways = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/subjects/${subjectId}/pathways/`, {
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`,
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPathways(data);
      }
    } catch (error) {
      console.error('Failed to fetch pathways:', error);
    }
  };

  const fetchExercises = async (pathwayId: number) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/pathways/${pathwayId}/exercises/`, {
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`,
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setExercises(data);
      }
    } catch (error) {
      console.error('Failed to fetch exercises:', error);
    }
  };

  const submitAnswer = async () => {
    if (!selectedExercise || !userAnswer.trim()) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/exercises/${selectedExercise.id}/attempt/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          answer: userAnswer
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setAttempts(data.attempts);
        setShowSolution(data.show_solution);
        
        if (data.completed) {
          alert('Correct! Well done!');
          setUserAnswer('');
        } else if (data.show_solution) {
          alert(`Solution available! The answer is: ${data.solution}`);
        } else {
          alert(`Incorrect. You have ${3 - data.attempts} attempts remaining.`);
        }
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
      alert('Failed to submit answer. Please try again.');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getDifficultyStars = (difficulty: string) => {
    const count = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;
    return Array.from({ length: 3 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < count ? getDifficultyColor(difficulty) : 'text-gray-300'}`}
        fill={i < count ? 'currentColor' : 'none'}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold ${themeClasses.text}`}>Learning Pathways</h2>
      
      {!selectedPathway ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pathways.map((pathway) => (
            <div
              key={pathway.id}
              onClick={() => setSelectedPathway(pathway.id)}
              className={`${themeClasses.cardBg} backdrop-blur-sm border ${themeClasses.border} rounded-xl p-6 cursor-pointer transition-all duration-200 ${themeClasses.hoverBg} hover:scale-105`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${themeClasses.text}`}>{pathway.title}</h3>
                <ChevronRight className={`w-5 h-5 ${themeClasses.textSecondary}`} />
              </div>
              <p className={`${themeClasses.textSecondary} mb-4`}>{pathway.description}</p>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className={`text-sm ${themeClasses.textSecondary}`}>
                  Step {pathway.order}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : !selectedExercise ? (
        <div>
          <button
            onClick={() => setSelectedPathway(null)}
            className={`mb-4 px-4 py-2 ${themeClasses.border} border rounded-lg ${themeClasses.hoverBg} ${themeClasses.text}`}
          >
            ← Back to Pathways
          </button>
          
          <div className="grid grid-cols-1 gap-4">
            {exercises.map((exercise) => (
              <div
                key={exercise.id}
                onClick={() => setSelectedExercise(exercise)}
                className={`${themeClasses.cardBg} backdrop-blur-sm border ${themeClasses.border} rounded-xl p-6 cursor-pointer transition-all duration-200 ${themeClasses.hoverBg}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-lg font-semibold ${themeClasses.text}`}>{exercise.title}</h3>
                  <div className="flex items-center space-x-1">
                    {getDifficultyStars(exercise.difficulty)}
                  </div>
                </div>
                <p className={`${themeClasses.textSecondary} mb-4`}>
                  {exercise.problem_statement.substring(0, 150)}...
                </p>
                <div className="flex items-center justify-between">
                  <span className={`text-sm px-2 py-1 rounded ${getDifficultyColor(exercise.difficulty)} bg-opacity-20`}>
                    {exercise.difficulty}
                  </span>
                  <ChevronRight className={`w-5 h-5 ${themeClasses.textSecondary}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <button
            onClick={() => setSelectedExercise(null)}
            className={`mb-4 px-4 py-2 ${themeClasses.border} border rounded-lg ${themeClasses.hoverBg} ${themeClasses.text}`}
          >
            ← Back to Exercises
          </button>
          
          <div className={`${themeClasses.cardBg} backdrop-blur-sm border ${themeClasses.border} rounded-xl p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold ${themeClasses.text}`}>{selectedExercise.title}</h3>
              <div className="flex items-center space-x-1">
                {getDifficultyStars(selectedExercise.difficulty)}
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className={`font-semibold mb-2 ${themeClasses.text}`}>Problem:</h4>
                <p className={`${themeClasses.textSecondary} whitespace-pre-wrap`}>
                  {selectedExercise.problem_statement}
                </p>
              </div>
              
              {selectedExercise.hints.length > 0 && (
                <div>
                  <h4 className={`font-semibold mb-2 ${themeClasses.text}`}>Hints:</h4>
                  <ul className="space-y-1">
                    {selectedExercise.hints.map((hint, index) => (
                      <li key={index} className={`${themeClasses.textSecondary} text-sm`}>
                        • {hint}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div>
                <h4 className={`font-semibold mb-2 ${themeClasses.text}`}>Your Answer:</h4>
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className={`w-full h-32 px-4 py-3 rounded-xl border ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.text} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200`}
                  placeholder="Enter your solution here..."
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className={`text-sm ${themeClasses.textSecondary}`}>
                    Attempts: {attempts}
                  </span>
                  {attempts >= 3 && (
                    <span className="text-sm text-orange-500">
                      Solution available after 3 attempts
                    </span>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  {attempts >= 3 && (
                    <button
                      className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg transition-all duration-200 opacity-75 cursor-not-allowed"
                      disabled
                    >
                      Solution Revealed
                    </button>
                  )}
                  <button
                    onClick={submitAnswer}
                    disabled={!userAnswer.trim()}
                    className="px-6 py-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200"
                  >
                    Submit Answer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningPathways;
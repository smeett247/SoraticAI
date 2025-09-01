import React, { useState, useRef, useEffect } from 'react';
import { Book, MessageSquare, User, BookOpen, Atom, Calculator, Code, Send, RotateCcw, TrendingUp, Moon, Sun, Users, UserPlus, Trash2, Upload, FileText, Image, File, X, Eye, Download, ArrowLeft, Bot } from 'lucide-react';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  subject?: string;
  attachments?: UploadedFile[];
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
  studentId?: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  subjects: string[];
  progress: Record<string, number>;
  documents: UploadedFile[];
}



interface LearningSession {
  subject: string;
  questionsAsked: number;
  hintsGiven: number;
  topicsExplored: string[];
  studentId?: string;
  agentId?: string;
}

const SUBJECTS = [
  { id: 'python', name: 'Python Programming', icon: Code, color: 'from-orange-500 to-red-500' },
  { id: 'physics', name: 'Physics', icon: Atom, color: 'from-red-500 to-orange-600' },
  { id: 'mathematics', name: 'Mathematics', icon: Calculator, color: 'from-orange-600 to-red-600' },
  { id: 'chemistry', name: 'Chemistry', icon: BookOpen, color: 'from-red-600 to-orange-500' },
];

const SOCRATIC_PROMPTS = {
  python: {
    system: "You are a specialized Python programming tutor using the Socratic method. Focus ONLY on Python code and programming theory. Never give direct code solutions. Guide students through questions about Python syntax, data structures, algorithms, and programming concepts. Help them discover solutions through inquiry about variables, functions, classes, loops, conditionals, and Python-specific features.",
    examples: [
      "What type of data structure would work best for this problem?",
      "How do you think Python handles this operation internally?",
      "What would happen if you changed this variable type?",
      "Can you think of a more Pythonic way to write this?"
    ]
  },
  physics: {
    system: "You are a Socratic physics tutor. Never provide direct answers or formulas. When students ask physics questions, guide them through questioning to understand underlying principles. Help them discover relationships between concepts through inquiry.",
    examples: [
      "What forces do you think are acting in this situation?",
      "How might energy be conserved in this scenario?",
      "What happens to the motion when you change this variable?",
      "Can you think of a similar situation you've encountered before?"
    ]
  },
  mathematics: {
    system: "You are a Socratic mathematics tutor. Never solve problems directly. Guide students to discover mathematical relationships and solutions through strategic questioning. Help them build understanding step by step.",
    examples: [
      "What patterns do you notice in this equation?",
      "How might you simplify this expression?",
      "What would happen if we substituted this value?",
      "Can you relate this to a concept you already know?"
    ]
  },
  chemistry: {
    system: "You are a Socratic chemistry tutor. Never provide direct answers about chemical processes or equations. Use questions to guide students toward understanding molecular behavior, reactions, and chemical principles.",
    examples: [
      "What do you think is happening at the molecular level?",
      "How might the electrons be behaving in this reaction?",
      "What patterns do you see in the periodic table here?",
      "What would you predict happens when these substances interact?"
    ]
  }
};

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<LearningSession>({
    subject: '',
    questionsAsked: 0,
    hintsGiven: 0,
    topicsExplored: []
  });
  const [showWelcome, setShowWelcome] = useState(false);
  const [showLanding, setShowLanding] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'agents' | 'profile'>('chat');



  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Check authentication status on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setIsAuthenticated(true);
      setShowLanding(false);
      setShowAuth(false);
      setShowWelcome(true);
      loadUserProfile();
    } else {
      setShowLanding(true);
    }
    
    setIsInitializing(false);
  }, []);

  const themeClasses = {
    bg: isDarkMode ? 'bg-black' : 'bg-gray-50',
    cardBg: isDarkMode ? 'bg-gray-900/80' : 'bg-white/90',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    inputBg: isDarkMode ? 'bg-gray-800/50' : 'bg-white/80',
    hoverBg: isDarkMode ? 'hover:bg-gray-800/60' : 'hover:bg-gray-100/80'
  };

  // Helper functions for conversation persistence
  const saveConversationHistory = (subjectId: string, messages: Message[]) => {
    const userId = JSON.parse(localStorage.getItem('user') || '{}').id || 'anonymous';
    const key = `conversation_${userId}_${subjectId}`;
    localStorage.setItem(key, JSON.stringify(messages.map(msg => ({
      ...msg,
      timestamp: msg.timestamp.toISOString()
    }))));
  };

  const loadConversationHistory = (subjectId: string): Message[] => {
    const userId = JSON.parse(localStorage.getItem('user') || '{}').id || 'anonymous';
    const key = `conversation_${userId}_${subjectId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved).map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    }
    return [];
  };

  const saveSessionData = (subjectId: string, sessionData: LearningSession) => {
    const userId = JSON.parse(localStorage.getItem('user') || '{}').id || 'anonymous';
    const key = `session_${userId}_${subjectId}`;
    localStorage.setItem(key, JSON.stringify(sessionData));
  };

  const loadSessionData = (subjectId: string): LearningSession => {
    const userId = JSON.parse(localStorage.getItem('user') || '{}').id || 'anonymous';
    const key = `session_${userId}_${subjectId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      subject: subjectId,
      questionsAsked: 0,
      hintsGiven: 0,
      topicsExplored: []
    };
  };

  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubject(subjectId);
    setShowWelcome(false);
    setActiveTab('chat');
    
    // Load existing conversation history for this subject
    const savedMessages = loadConversationHistory(subjectId);
    const savedSession = loadSessionData(subjectId);
    
    if (savedMessages.length > 0) {
      setMessages(savedMessages);
      setSession(savedSession);
    } else {
      // Create new conversation
      setSession({
        subject: subjectId,
        questionsAsked: 0,
        hintsGiven: 0,
        topicsExplored: []
      });
      
      const subject = SUBJECTS.find(s => s.id === subjectId);
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Welcome to your ${subject?.name} learning journey! I'm here to guide you through discovery using the Socratic method. What would you like to explore today?`,
        timestamp: new Date(),
        subject: subjectId
      };
      setMessages([welcomeMessage]);
      saveConversationHistory(subjectId, [welcomeMessage]);
    }
  };

  const mockSocraticAPI = async (userMessage: string, conversationHistory: Message[], subject: string) => {
    const endpoint = `${import.meta.env.VITE_API_URL}/socratic-response/`;
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          message: userMessage,
          subject: subject,
          conversation_history: conversationHistory
        })
      });
      
      if (!response.ok) {
        throw new Error('API request failed');
      }
      
      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('API Error:', error);
      return {
        response: "I'm having trouble connecting right now. Let me ask you this instead: What's your intuition telling you about this problem?",
        confidence: 0.5,
        metadata: { error: 'connection_failed' }
      };
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !selectedSubject) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: currentMessage.trim(),
      timestamp: new Date(),
      subject: selectedSubject
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const apiResponse = await mockSocraticAPI(currentMessage.trim(), messages, selectedSubject);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: apiResponse.response,
        timestamp: new Date(),
        subject: selectedSubject
      };

      const updatedMessages = [...messages, userMessage, assistantMessage];
      setMessages(updatedMessages);
      
      const updatedSession = {
        ...session,
        questionsAsked: session.questionsAsked + 1,
        topicsExplored: [...new Set([...session.topicsExplored, selectedSubject])]
      };
      setSession(updatedSession);
      
      // Save to localStorage
      saveConversationHistory(selectedSubject, updatedMessages);
      saveSessionData(selectedSubject, updatedSession);

    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I'm experiencing some technical difficulties. Let's continue our exploration - what aspect of this topic interests you most?",
        timestamp: new Date(),
        subject: selectedSubject
      };
      const updatedMessages = [...messages, userMessage, errorMessage];
      setMessages(updatedMessages);
      saveConversationHistory(selectedSubject, updatedMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resetSession = () => {
    if (selectedSubject) {
      // Clear saved history for current subject
      const userId = JSON.parse(localStorage.getItem('user') || '{}').id || 'anonymous';
      localStorage.removeItem(`conversation_${userId}_${selectedSubject}`);
      localStorage.removeItem(`session_${userId}_${selectedSubject}`);
    }
    
    setMessages([]);
    setSelectedSubject('');
    setShowWelcome(true);
    setCurrentMessage('');
    setActiveTab('chat');
    setSession({
      subject: '',
      questionsAsked: 0,
      hintsGiven: 0,
      topicsExplored: []
    });
  };

  const [students, setStudents] = useState<Student[]>([]);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');

  const addStudent = () => {
    if (!newStudentName.trim() || !newStudentEmail.trim()) return;
    
    const newStudent: Student = {
      id: Date.now().toString(),
      name: newStudentName.trim(),
      email: newStudentEmail.trim(),
      subjects: [],
      progress: {},
      documents: []
    };
    
    setStudents(prev => [...prev, newStudent]);
    setNewStudentName('');
    setNewStudentEmail('');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const uploadedFile: UploadedFile = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          type: file.type,
          url: e.target?.result as string,
          uploadedAt: new Date()
        };
        
        setUploadedFiles(prev => [...prev, uploadedFile]);
      };
      
      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else if (file.type === 'text/plain' || file.type === 'application/pdf') {
        reader.readAsDataURL(file);
      } else {
        // For other file types, create a placeholder
        const uploadedFile: UploadedFile = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          type: file.type,
          url: '',
          uploadedAt: new Date()
        };
        setUploadedFiles(prev => [...prev, uploadedFile]);
      }
    });
    
    // Reset the input
    if (event.target) {
      event.target.value = '';
    }
  };

  const attachFileToMessage = (file: UploadedFile) => {
    const messageWithFile: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: `I've shared a document: ${file.name}`,
      timestamp: new Date(),
      subject: selectedSubject,
      attachments: [file]
    };
    
    setMessages(prev => [...prev, messageWithFile]);
    
    // Simulate AI response about the document
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I see you've shared "${file.name}". What specific aspect of this document would you like to explore? What questions do you have about the concepts presented here?`,
        timestamp: new Date(),
        subject: selectedSubject
      };
      setMessages(prev => [...prev, assistantMessage]);
    }, 1000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return Image;
    if (fileType === 'application/pdf' || fileType.startsWith('text/')) return FileText;
    return File;
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };
  const removeStudent = (studentId: string) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
  };



  const handleGetStarted = () => {
    setShowLanding(false);
    setShowAuth(true);
  };

  const handleBackToLanding = () => {
    setShowAuth(false);
    setShowLanding(true);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    setShowAuth(false);
    setShowWelcome(true);
    loadUserProfile();
  };

  const loadUserProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/profile/`, {
        headers: {
          'Authorization': `Token ${token}`,
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.profile_picture_url) {
          setProfilePicture(`${import.meta.env.VITE_API_URL.replace('/api', '')}${data.profile_picture_url}`);
        }
      } else if (response.status === 401) {
        // Token is invalid, clear auth state
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setShowLanding(true);
        setShowAuth(false);
        setShowWelcome(false);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profile_picture', file);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/profile/upload/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`,
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        if (data.profile_picture_url) {
          setProfilePicture(`${import.meta.env.VITE_API_URL.replace('/api', '')}${data.profile_picture_url}`);
        }
      }
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
    }
  };

  if (isInitializing) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${isDarkMode ? 'bg-black' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mb-4 shadow-2xl">
            <BookOpen className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className={`text-lg font-medium transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (showLanding) {
    return <LandingPage onGetStarted={handleGetStarted} isDarkMode={isDarkMode} />;
  }

  if (showAuth) {
    return <AuthPage onBack={handleBackToLanding} onLogin={handleLogin} isDarkMode={isDarkMode} />;
  }

  if (showWelcome) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-black' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4 py-8">
          {/* Top Navigation */}
          <div className="fixed top-6 right-6 z-50 flex items-center space-x-3">
            {/* User Profile */}
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-full backdrop-blur-sm border transition-all duration-300 ${
              isDarkMode 
                ? 'bg-gray-900/80 border-gray-700' 
                : 'bg-white/80 border-gray-200'
            }`}>
              <div className="w-7 h-7 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center overflow-hidden">
                {profilePicture ? (
                  <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-3 h-3 text-white" />
                )}
              </div>
              <span className={`text-sm font-medium transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {JSON.parse(localStorage.getItem('user') || '{}').username || 'User'}
              </span>
            </div>
            
            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-full backdrop-blur-sm border transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-gray-900/80 border-gray-700 hover:bg-gray-800/80' 
                  : 'bg-white/80 border-gray-200 hover:bg-gray-50/80'
              }`}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-orange-400" />
              ) : (
                <Moon className="w-4 h-4 text-gray-700" />
              )}
            </button>
          </div>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mb-6 shadow-2xl">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <h1 className={`text-5xl font-bold mb-4 transition-colors duration-300 ${themeClasses.text}`}>
              Socratic Learning Companion
            </h1>
            <p className={`text-xl max-w-3xl mx-auto leading-relaxed transition-colors duration-300 ${themeClasses.textSecondary}`}>
              Master knowledge through guided inquiry. Discover answers through thoughtful questions and exploration, not direct instruction.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="max-w-6xl mx-auto mb-8">
            <div className={`${themeClasses.cardBg} backdrop-blur-sm border ${themeClasses.border} rounded-2xl p-2`}>
              <div className="flex space-x-2">
                {[
                  { id: 'subjects', label: 'Learning Paths', icon: Book },
                  { id: 'documents', label: 'Documents', icon: Upload },
                  { id: 'profile', label: 'Profile', icon: User }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg'
                        : `${themeClasses.text} ${themeClasses.hoverBg}`
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="max-w-6xl mx-auto">
            {activeTab === ('subjects' as 'chat' | 'agents' | 'profile' | 'subjects') && (
              <div>
                <h2 className={`text-2xl font-bold text-center mb-8 transition-colors duration-300 ${themeClasses.text}`}>
                  Choose Your Learning Path
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {SUBJECTS.map((subject) => {
                    const hasHistory = loadConversationHistory(subject.id).length > 0;
                    return (
                      <button
                        key={subject.id}
                        onClick={() => handleSubjectSelect(subject.id)}
                        className={`group relative overflow-hidden ${themeClasses.cardBg} backdrop-blur-sm border ${themeClasses.border} rounded-2xl p-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${themeClasses.hoverBg}`}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-r ${subject.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                        {hasHistory && (
                          <div className="absolute top-3 right-3 w-3 h-3 bg-green-400 rounded-full animate-pulse" title="Has conversation history"></div>
                        )}
                        <div className="relative">
                          <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${subject.color} rounded-full mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                            <subject.icon className="w-8 h-8 text-white" />
                          </div>
                          <h3 className={`text-xl font-bold mb-2 transition-colors duration-300 ${themeClasses.text}`}>
                            {subject.name}
                          </h3>
                          <p className={`text-sm transition-colors duration-300 ${themeClasses.textSecondary}`}>
                            {hasHistory ? 'Continue your journey' : 'Explore through guided discovery'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === ('students' as 'chat' | 'agents' | 'profile' | 'students') && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h2 className={`text-2xl font-bold transition-colors duration-300 ${themeClasses.text}`}>
                    Student Management
                  </h2>
                </div>
                
                {/* Add Student Form */}
                <div className={`${themeClasses.cardBg} backdrop-blur-sm border ${themeClasses.border} rounded-2xl p-6 mb-6`}>
                  <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${themeClasses.text}`}>
                    Add New Student
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Student Name"
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      className={`px-4 py-3 rounded-xl border ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.text} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200`}
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={newStudentEmail}
                      onChange={(e) => setNewStudentEmail(e.target.value)}
                      className={`px-4 py-3 rounded-xl border ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.text} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200`}
                    />
                    <button
                      onClick={addStudent}
                      disabled={!newStudentName.trim() || !newStudentEmail.trim()}
                      className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
                    >
                      <UserPlus className="w-5 h-5" />
                      <span>Add Student</span>
                    </button>
                  </div>
                </div>

                {/* Students List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {students.map((student) => (
                    <div key={student.id} className={`${themeClasses.cardBg} backdrop-blur-sm border ${themeClasses.border} rounded-2xl p-6 transition-all duration-300 hover:shadow-lg`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className={`font-bold transition-colors duration-300 ${themeClasses.text}`}>
                              {student.name}
                            </h3>
                            <p className={`text-sm transition-colors duration-300 ${themeClasses.textSecondary}`}>
                              {student.email}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeStudent(student.id)}
                          className={`p-2 rounded-lg transition-colors duration-200 ${themeClasses.hoverBg}`}
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <p className={`text-sm font-medium mb-2 transition-colors duration-300 ${themeClasses.text}`}>
                            Active Subjects
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {student.subjects.map((subjectId) => {
                              const subject = SUBJECTS.find(s => s.id === subjectId);
                              return (
                                <span
                                  key={subjectId}
                                  className={`px-3 py-1 bg-gradient-to-r ${subject?.color} text-white text-xs rounded-full`}
                                >
                                  {subject?.name}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                        
                        {student.documents.length > 0 && (
                          <div>
                            <p className={`text-sm font-medium mb-2 transition-colors duration-300 ${themeClasses.text}`}>
                              Documents ({student.documents.length})
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {student.documents.slice(0, 3).map((doc) => (
                                <span
                                  key={doc.id}
                                  className={`px-2 py-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} text-xs rounded-md truncate max-w-20`}
                                  title={doc.name}
                                >
                                  {doc.name}
                                </span>
                              ))}
                              {student.documents.length > 3 && (
                                <span className={`px-2 py-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} text-xs rounded-md`}>
                                  +{student.documents.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {Object.keys(student.progress).length > 0 && (
                          <div>
                            <p className={`text-sm font-medium mb-2 transition-colors duration-300 ${themeClasses.text}`}>
                              Progress
                            </p>
                            {Object.entries(student.progress).map(([subjectId, progress]) => {
                              const subject = SUBJECTS.find(s => s.id === subjectId);
                              return (
                                <div key={subjectId} className="mb-2">
                                  <div className="flex justify-between text-xs mb-1">
                                    <span className={themeClasses.textSecondary}>{subject?.name}</span>
                                    <span className={themeClasses.textSecondary}>{progress}%</span>
                                  </div>
                                  <div className={`w-full bg-gray-200 rounded-full h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                    <div
                                      className={`h-2 bg-gradient-to-r ${subject?.color} rounded-full transition-all duration-300`}
                                      style={{ width: `${progress}%` }}
                                    ></div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}



            {activeTab === 'profile' && (
              <div>
                <h2 className={`text-2xl font-bold mb-8 transition-colors duration-300 ${themeClasses.text}`}>
                  User Profile
                </h2>
                
                <div className={`${themeClasses.cardBg} backdrop-blur-sm border ${themeClasses.border} rounded-2xl p-8 max-w-2xl mx-auto`}>
                  <div className="text-center mb-8">
                    <div className="relative inline-block">
                      <div className="w-32 h-32 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg overflow-hidden">
                        {profilePicture ? (
                          <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-16 h-16 text-white" />
                        )}
                      </div>
                      <button 
                        onClick={() => profileInputRef.current?.click()}
                        className="absolute bottom-2 right-2 w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                      >
                        <Upload className="w-4 h-4 text-white" />
                      </button>
                      <input
                        ref={profileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureUpload}
                        className="hidden"
                      />
                    </div>
                    <h3 className={`text-xl font-bold mb-2 transition-colors duration-300 ${themeClasses.text}`}>
                      {JSON.parse(localStorage.getItem('user') || '{}').username || 'User'}
                    </h3>
                    <p className={`transition-colors duration-300 ${themeClasses.textSecondary}`}>
                      {JSON.parse(localStorage.getItem('user') || '{}').email || 'user@example.com'}
                    </p>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${themeClasses.text}`}>
                        Username
                      </label>
                      <input
                        type="text"
                        value={JSON.parse(localStorage.getItem('user') || '{}').username || ''}
                        className={`w-full px-4 py-3 rounded-xl border ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.text} focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200`}
                        readOnly
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${themeClasses.text}`}>
                        Email
                      </label>
                      <input
                        type="email"
                        value={JSON.parse(localStorage.getItem('user') || '{}').email || ''}
                        className={`w-full px-4 py-3 rounded-xl border ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.text} focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200`}
                        readOnly
                      />
                    </div>
                    
                    <div className="flex space-x-4">
                      <button className="flex-1 py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl transition-all duration-200 hover:scale-105 shadow-lg font-semibold">
                        Edit Profile
                      </button>
                      <button 
                        onClick={() => {
                          localStorage.removeItem('token');
                          localStorage.removeItem('user');
                          setIsAuthenticated(false);
                          setShowLanding(true);
                          setShowAuth(false);
                          setShowWelcome(false);
                          setProfilePicture(null);
                          setSelectedSubject('');
                          setMessages([]);
                        }}
                        className={`flex-1 py-3 border ${themeClasses.border} rounded-xl transition-all duration-200 hover:scale-105 ${themeClasses.text} ${themeClasses.hoverBg} font-semibold`}
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h2 className={`text-2xl font-bold transition-colors duration-300 ${themeClasses.text}`}>
                    Document Library
                  </h2>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Upload Document</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.txt,.doc,.docx,.png,.jpg,.jpeg,.gif"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {uploadedFiles.length === 0 ? (
                  <div className={`${themeClasses.cardBg} backdrop-blur-sm border ${themeClasses.border} rounded-2xl p-12 text-center`}>
                    <Upload className={`w-16 h-16 mx-auto mb-4 transition-colors duration-300 ${themeClasses.textSecondary}`} />
                    <h3 className={`text-xl font-semibold mb-2 transition-colors duration-300 ${themeClasses.text}`}>
                      No Documents Yet
                    </h3>
                    <p className={`transition-colors duration-300 ${themeClasses.textSecondary} mb-6`}>
                      Upload learning materials, assignments, or reference documents to enhance your Socratic learning experience.
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
                    >
                      <Upload className="w-5 h-5" />
                      <span>Upload Your First Document</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {uploadedFiles.map((file) => {
                      const FileIcon = getFileIcon(file.type);
                      return (
                        <div key={file.id} className={`${themeClasses.cardBg} backdrop-blur-sm border ${themeClasses.border} rounded-2xl p-6 transition-all duration-300 hover:shadow-lg group`}>
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                                <FileIcon className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className={`font-semibold truncate transition-colors duration-300 ${themeClasses.text}`}>
                                  {file.name}
                                </h3>
                                <p className={`text-sm transition-colors duration-300 ${themeClasses.textSecondary}`}>
                                  {formatFileSize(file.size)}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => removeFile(file.id)}
                              className={`p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 ${themeClasses.hoverBg}`}
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                          
                          <div className="space-y-3">
                            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100/50'}`}>
                              <p className={`text-xs transition-colors duration-300 ${themeClasses.textSecondary}`}>
                                Uploaded: {file.uploadedAt.toLocaleDateString()}
                              </p>
                            </div>
                            
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedFile(file);
                                  setShowFilePreview(true);
                                }}
                                className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 bg-gradient-to-r from-red-500/20 to-orange-500/20 hover:from-red-500/30 hover:to-orange-500/30 text-orange-400 rounded-lg transition-all duration-200"
                              >
                                <Eye className="w-4 h-4" />
                                <span className="text-sm">Preview</span>
                              </button>
                              {selectedSubject && (
                                <button
                                  onClick={() => attachFileToMessage(file)}
                                  className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-lg transition-all duration-200"
                                >
                                  <MessageSquare className="w-4 h-4" />
                                  <span className="text-sm">Discuss</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Features */}
          <div className="mt-16 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${isDarkMode ? 'bg-red-500/20' : 'bg-red-100'}`}>
                <MessageSquare className={`w-6 h-6 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
              </div>
              <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${themeClasses.text}`}>
                Socratic Method
              </h3>
              <p className={`transition-colors duration-300 ${themeClasses.textSecondary}`}>
                Learn through guided questions that lead to deeper understanding
              </p>
            </div>
            <div className="text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${isDarkMode ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
                <TrendingUp className={`w-6 h-6 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
              </div>
              <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${themeClasses.text}`}>
                Adaptive Learning
              </h3>
              <p className={`transition-colors duration-300 ${themeClasses.textSecondary}`}>
                AI agents adapt to your understanding and learning pace
              </p>
            </div>
            <div className="text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${isDarkMode ? 'bg-red-500/20' : 'bg-red-100'}`}>
                <Book className={`w-6 h-6 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
              </div>
              <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${themeClasses.text}`}>
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
  }

  const selectedSubjectData = SUBJECTS.find(s => s.id === selectedSubject);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeClasses.bg}`}>
      <div className="container mx-auto px-4 py-4 h-screen flex flex-col">
        {/* Header */}
        <header className={`${themeClasses.cardBg} backdrop-blur-sm border ${themeClasses.border} rounded-2xl p-4 mb-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  setSelectedSubject('');
                  setShowWelcome(true);
                  setMessages([]);
                }}
                className={`p-2 rounded-lg transition-all duration-200 ${themeClasses.hoverBg}`}
                title="Back to Subjects"
              >
                <ArrowLeft className={`w-5 h-5 transition-colors duration-300 ${themeClasses.text}`} />
              </button>
              <div className={`w-12 h-12 bg-gradient-to-r ${selectedSubjectData?.color} rounded-full flex items-center justify-center shadow-lg`}>
                {selectedSubjectData?.icon && <selectedSubjectData.icon className="w-6 h-6 text-white" />}
              </div>
              <div>
                <h1 className={`text-xl font-bold transition-colors duration-300 ${themeClasses.text}`}>
                  {selectedSubjectData?.name} Tutor
                </h1>
                <p className={`text-sm transition-colors duration-300 ${themeClasses.textSecondary}`}>
                  Socratic Learning Session
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between flex-1 ml-4">
              <div className="text-right">
                <div className={`text-sm transition-colors duration-300 ${themeClasses.textSecondary}`}>
                  Session Progress
                </div>
                <div className={`font-medium transition-colors duration-300 ${themeClasses.text}`}>
                  {session.questionsAsked} questions explored
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* User Profile */}
                <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${themeClasses.cardBg} border ${themeClasses.border}`}>
                  <div className="w-7 h-7 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center overflow-hidden">
                    {profilePicture ? (
                      <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className={`text-sm font-medium transition-colors duration-300 ${themeClasses.text}`}>
                    {JSON.parse(localStorage.getItem('user') || '{}').username || 'User'}
                  </span>
                </div>
                
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`p-2 rounded-lg transition-all duration-200 ${themeClasses.hoverBg}`}
                  title="Toggle Theme"
                >
                  {isDarkMode ? (
                    <Sun className="w-5 h-5 text-orange-400" />
                  ) : (
                    <Moon className="w-5 h-5 text-gray-600" />
                  )}
                </button>
                
                <button
                  onClick={resetSession}
                  className={`p-2 rounded-lg transition-all duration-200 ${themeClasses.hoverBg}`}
                  title="New Session"
                >
                  <RotateCcw className={`w-5 h-5 transition-colors duration-300 ${themeClasses.text}`} />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className={`flex-1 ${themeClasses.cardBg} backdrop-blur-sm border ${themeClasses.border} rounded-2xl p-6 overflow-hidden flex flex-col`}>
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white ml-4 shadow-lg'
                      : `${isDarkMode ? 'bg-gray-800/60' : 'bg-gray-100/80'} ${themeClasses.text} mr-4`
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user' 
                        ? 'bg-white/20' 
                        : 'bg-gradient-to-r from-red-500 to-orange-500'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="leading-relaxed">{message.content}</p>
                      
                      {/* Display attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {message.attachments.map((file) => {
                            const FileIcon = getFileIcon(file.type);
                            return (
                              <div
                                key={file.id}
                                className={`flex items-center space-x-2 p-2 rounded-lg ${
                                  message.role === 'user' 
                                    ? 'bg-white/10' 
                                    : isDarkMode ? 'bg-gray-700/50' : 'bg-white/50'
                                }`}
                              >
                                <FileIcon className="w-4 h-4" />
                                <span className="text-sm truncate flex-1">{file.name}</span>
                                <span className="text-xs opacity-70">{formatFileSize(file.size)}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                      <p className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className={`${isDarkMode ? 'bg-gray-800/60' : 'bg-gray-100/80'} rounded-2xl p-4 mr-4`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className={`${isDarkMode ? 'bg-gray-800/30' : 'bg-gray-100/50'} rounded-xl p-4`}>
            {/* File Upload Area */}
            {uploadedFiles.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Upload className={`w-4 h-4 transition-colors duration-300 ${themeClasses.textSecondary}`} />
                  <span className={`text-sm font-medium transition-colors duration-300 ${themeClasses.text}`}>
                    Available Documents
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
                  {uploadedFiles.slice(-5).map((file) => {
                    const FileIcon = getFileIcon(file.type);
                    return (
                      <button
                        key={file.id}
                        onClick={() => attachFileToMessage(file)}
                        className={`flex items-center space-x-2 px-3 py-2 ${isDarkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-white/50 hover:bg-white'} border ${themeClasses.border} rounded-lg transition-all duration-200 hover:scale-105`}
                        title={`Attach ${file.name} to message`}
                      >
                        <FileIcon className="w-4 h-4 text-orange-400" />
                        <span className={`text-sm truncate max-w-24 transition-colors duration-300 ${themeClasses.text}`}>
                          {file.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
            <div className="flex items-end space-x-4">
              <div className="flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask a question or share your thoughts..."
                  className={`w-full ${themeClasses.inputBg} border ${themeClasses.border} rounded-xl px-4 py-3 ${themeClasses.text} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200`}
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`p-3 border ${themeClasses.border} rounded-xl transition-all duration-200 hover:scale-105 ${themeClasses.hoverBg}`}
                title="Upload Document"
              >
                <Upload className={`w-5 h-5 transition-colors duration-300 ${themeClasses.text}`} />
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!currentMessage.trim() || isLoading}
                className="p-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.txt,.doc,.docx,.png,.jpg,.jpeg,.gif,.py,.js,.html,.css"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="flex items-center justify-between mt-3">
              <p className={`text-xs transition-colors duration-300 ${themeClasses.textSecondary}`}>
                I guide through questions, not direct answers
              </p>
              <div className="flex items-center space-x-2 text-xs">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className={`transition-colors duration-300 ${themeClasses.textSecondary}`}>
                  API Connected
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* File Preview Modal */}
      {showFilePreview && selectedFile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`${themeClasses.cardBg} backdrop-blur-sm border ${themeClasses.border} rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden`}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                  {React.createElement(getFileIcon(selectedFile.type), { className: "w-5 h-5 text-white" })}
                </div>
                <div>
                  <h3 className={`font-bold transition-colors duration-300 ${themeClasses.text}`}>
                    {selectedFile.name}
                  </h3>
                  <p className={`text-sm transition-colors duration-300 ${themeClasses.textSecondary}`}>
                    {formatFileSize(selectedFile.size)} • {selectedFile.uploadedAt.toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowFilePreview(false);
                  setSelectedFile(null);
                }}
                className={`p-2 rounded-lg transition-all duration-200 ${themeClasses.hoverBg}`}
              >
                <X className={`w-5 h-5 transition-colors duration-300 ${themeClasses.text}`} />
              </button>
            </div>
            
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {selectedFile.type.startsWith('image/') ? (
                <div className="text-center">
                  <img
                    src={selectedFile.url}
                    alt={selectedFile.name}
                    className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg"
                  />
                </div>
              ) : selectedFile.type === 'text/plain' ? (
                <div className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100/50'} rounded-lg p-4`}>
                  <pre className={`text-sm whitespace-pre-wrap transition-colors duration-300 ${themeClasses.text}`}>
                    {/* Text content would be displayed here */}
                    Document content preview...
                  </pre>
                </div>
              ) : (
                <div className="text-center py-12">
                  <File className={`w-16 h-16 mx-auto mb-4 transition-colors duration-300 ${themeClasses.textSecondary}`} />
                  <h4 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${themeClasses.text}`}>
                    Preview Not Available
                  </h4>
                  <p className={`transition-colors duration-300 ${themeClasses.textSecondary} mb-6`}>
                    This file type cannot be previewed directly. You can still attach it to your learning conversations.
                  </p>
                  {selectedSubject && (
                    <button
                      onClick={() => {
                        attachFileToMessage(selectedFile);
                        setShowFilePreview(false);
                        setSelectedFile(null);
                        setActiveTab('chat');
                      }}
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
                    >
                      <MessageSquare className="w-5 h-5" />
                      <span>Discuss This Document</span>
                    </button>
                  )}
                </div>
              )}
            </div>
            
            <div className={`p-6 border-t ${themeClasses.border} flex items-center justify-between`}>
              <div className="flex items-center space-x-4">
                <span className={`text-sm transition-colors duration-300 ${themeClasses.textSecondary}`}>
                  File Type: {selectedFile.type || 'Unknown'}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                {selectedSubject && (
                  <button
                    onClick={() => {
                      attachFileToMessage(selectedFile);
                      setShowFilePreview(false);
                      setSelectedFile(null);
                      setActiveTab('chat');
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-lg transition-all duration-200"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Discuss</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowFilePreview(false);
                    setSelectedFile(null);
                  }}
                  className={`px-4 py-2 border ${themeClasses.border} rounded-lg transition-all duration-200 ${themeClasses.hoverBg} ${themeClasses.text}`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App
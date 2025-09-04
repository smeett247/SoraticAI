import React, { useState, useRef, useEffect } from 'react';
import { Book, MessageSquare, User, BookOpen, Atom, Calculator, Code, Send, RotateCcw, TrendingUp, Moon, Sun, Users, UserPlus, Trash2, Upload, FileText, Image, File, X, Eye, Download, ArrowLeft, Bot, Award, Settings } from 'lucide-react';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import AdminAuthPage from './components/AdminAuthPage';
import AdminDashboard from './components/AdminDashboard';
import SessionSummary from './components/SessionSummary';
import ProgressDashboard from './components/ProgressDashboard';
import LearningPathways from './components/LearningPathways';
import AIAssistant from './components/AIAssistant';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  subject?: string;
  attachments?: UploadedFile[];
}

interface UserMemory {
  id: string;
  userId: string;
  name?: string;
  interests: string[];
  learningGoals: string[];
  previousProblems: string[];
  personalInfo: Record<string, any>;
  conversationSummary: string;
  lastUpdated: Date;
}

interface StudyGroup {
  id: string;
  name: string;
  subject: string;
  members: string[];
  createdBy: string;
  createdAt: Date;
  isActive: boolean;
  messages: Message[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'consistency' | 'mastery' | 'helping' | 'milestone';
  requirement: number;
  earnedAt?: Date;
}

interface PeerHelpRequest {
  id: string;
  studentId: string;
  studentName: string;
  subject: string;
  question: string;
  status: 'open' | 'helping' | 'resolved';
  helperId?: string;
  helperName?: string;
  createdAt: Date;
  responses: PeerResponse[];
}

interface PeerResponse {
  id: string;
  helperId: string;
  helperName: string;
  response: string;
  isAIModerated: boolean;
  createdAt: Date;
}

interface AIModel {
  id: string;
  name: string;
  provider: string;
  costPerToken: number;
  speed: 'fast' | 'medium' | 'slow';
  quality: 'high' | 'medium' | 'low';
}

interface APIUsage {
  id: string;
  userId: string;
  modelId: string;
  tokensUsed: number;
  cost: number;
  conversationId: string;
  timestamp: Date;
}

interface OfflineConversation {
  id: string;
  subject: string;
  messages: Message[];
  lastSync: Date;
  isOffline: boolean;
}

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'super_admin';
  createdAt: Date;
}

interface StudentAnalytics {
  id: string;
  name: string;
  email: string;
  registeredAt: Date;
  lastActive: Date;
  totalSessions: number;
  totalQuestions: number;
  subjectsStudied: string[];
  averageSessionTime: number;
  progressBySubject: Record<string, number>;
  achievements: Achievement[];
  apiUsage: {
    totalTokens: number;
    totalCost: number;
    favoriteModel: string;
  };
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

const AI_MODELS: AIModel[] = [
  {
    id: 'deepseek-ai/deepseek-v3.1',
    name: 'DeepSeek V3.1',
    provider: 'DeepSeek',
    costPerToken: 0.00002,
    speed: 'fast',
    quality: 'high'
  },
  {
    id: 'ibm/granite-3.3-8b-instruct',
    name: 'Granite 3.3 8B',
    provider: 'IBM',
    costPerToken: 0.00001,
    speed: 'medium',
    quality: 'medium'
  },
  {
    id: 'meta/llama-3.3-70b-instruct',
    name: 'Llama 3.3 70B',
    provider: 'Meta',
    costPerToken: 0.00005,
    speed: 'slow',
    quality: 'high'
  }
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
  const [activeTab, setActiveTab] = useState<'chat' | 'agents' | 'profile' | 'subjects' | 'documents' | 'students' | 'progress' | 'pathways'>('chat');
  const [showSessionSummary, setShowSessionSummary] = useState(false);
  const [summaryConversationId, setSummaryConversationId] = useState<number | null>(null);
  const [userMemory, setUserMemory] = useState<UserMemory | null>(null);
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [userAchievements, setUserAchievements] = useState<Achievement[]>([]);
  const [peerHelpRequests, setPeerHelpRequests] = useState<PeerHelpRequest[]>([]);
  const [selectedStudyGroup, setSelectedStudyGroup] = useState<StudyGroup | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('deepseek-ai/deepseek-v3.1');
  const [apiUsage, setApiUsage] = useState<APIUsage[]>([]);
  const [isOffline, setIsOffline] = useState(false);
  const [offlineConversations, setOfflineConversations] = useState<OfflineConversation[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [studentAnalytics, setStudentAnalytics] = useState<StudentAnalytics[]>([]);



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
    const adminToken = localStorage.getItem('admin_token');
    
    if (adminToken) {
      setIsAdmin(true);
      setShowLanding(false);
      setShowAdminAuth(false);
      loadStudentAnalytics();
    } else if (token && user) {
      setIsAuthenticated(true);
      setShowLanding(false);
      setShowAuth(false);
      setShowWelcome(true);
      loadUserProfile();
      // Load user memory
      const memory = loadUserMemory();
      if (memory) {
        setUserMemory(memory);
      }
      // Load API usage and offline data
      loadAPIUsage();
      loadOfflineConversations();
    } else {
      setShowLanding(true);
    }
    
    // Check online status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOffline(!navigator.onLine);
    
    setIsInitializing(false);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const themeClasses = {
    bg: isDarkMode ? 'bg-slate-950' : 'bg-slate-50',
    cardBg: isDarkMode ? 'bg-slate-900/95' : 'bg-white/95',
    text: isDarkMode ? 'text-slate-100' : 'text-slate-900',
    textSecondary: isDarkMode ? 'text-slate-400' : 'text-slate-600',
    border: isDarkMode ? 'border-slate-800' : 'border-slate-200',
    inputBg: isDarkMode ? 'bg-slate-800/80' : 'bg-white',
    hoverBg: isDarkMode ? 'hover:bg-slate-800/80' : 'hover:bg-slate-100/80',
    accent: isDarkMode ? 'bg-emerald-500' : 'bg-emerald-600',
    accentHover: isDarkMode ? 'hover:bg-emerald-400' : 'hover:bg-emerald-700'
  };

  // Memory management functions
  const saveUserMemory = (memory: UserMemory) => {
    const userId = JSON.parse(localStorage.getItem('user') || '{}').id || 'anonymous';
    const key = `user_memory_${userId}`;
    localStorage.setItem(key, JSON.stringify({
      ...memory,
      lastUpdated: memory.lastUpdated.toISOString()
    }));
    setUserMemory(memory);
  };

  const loadUserMemory = (): UserMemory | null => {
    const userId = JSON.parse(localStorage.getItem('user') || '{}').id || 'anonymous';
    const key = `user_memory_${userId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      const memory = JSON.parse(saved);
      return {
        ...memory,
        lastUpdated: new Date(memory.lastUpdated)
      };
    }
    return null;
  };

  const updateUserMemory = (updates: Partial<UserMemory>) => {
    const currentMemory = userMemory || {
      id: Date.now().toString(),
      userId: JSON.parse(localStorage.getItem('user') || '{}').id || 'anonymous',
      interests: [],
      learningGoals: [],
      previousProblems: [],
      personalInfo: {},
      conversationSummary: '',
      lastUpdated: new Date()
    };
    
    const updatedMemory = {
      ...currentMemory,
      ...updates,
      lastUpdated: new Date()
    };
    
    saveUserMemory(updatedMemory);
  };

  const extractMemoryFromMessage = (message: string, response: string) => {
    const lowerMessage = message.toLowerCase();
    const updates: Partial<UserMemory> = {};
    
    // Extract name
    const nameMatch = message.match(/(?:i'm|i am|my name is|call me)\s+([a-zA-Z]+)/i);
    if (nameMatch) {
      updates.name = nameMatch[1];
      updates.personalInfo = { ...userMemory?.personalInfo, name: nameMatch[1] };
    }
    
    // Extract interests
    if (lowerMessage.includes('interested in') || lowerMessage.includes('like') || lowerMessage.includes('enjoy')) {
      const currentInterests = userMemory?.interests || [];
      const newInterest = message.replace(/.*(?:interested in|like|enjoy)\s+/i, '').split(/[,.]/)[0].trim();
      if (newInterest && !currentInterests.includes(newInterest)) {
        updates.interests = [...currentInterests, newInterest];
      }
    }
    
    // Extract learning goals
    if (lowerMessage.includes('want to learn') || lowerMessage.includes('goal') || lowerMessage.includes('trying to')) {
      const currentGoals = userMemory?.learningGoals || [];
      const newGoal = message.replace(/.*(?:want to learn|goal|trying to)\s+/i, '').split(/[,.]/)[0].trim();
      if (newGoal && !currentGoals.includes(newGoal)) {
        updates.learningGoals = [...currentGoals, newGoal];
      }
    }
    
    // Extract problems/challenges
    if (lowerMessage.includes('problem') || lowerMessage.includes('struggling') || lowerMessage.includes('difficulty')) {
      const currentProblems = userMemory?.previousProblems || [];
      const newProblem = message.split(/[,.]/)[0].trim();
      if (newProblem && !currentProblems.includes(newProblem)) {
        updates.previousProblems = [...currentProblems, newProblem];
      }
    }
    
    // Update conversation summary
    const currentSummary = userMemory?.conversationSummary || '';
    const newSummary = currentSummary ? 
      `${currentSummary}\n${new Date().toLocaleDateString()}: Discussed ${selectedSubject}` :
      `${new Date().toLocaleDateString()}: Started learning ${selectedSubject}`;
    updates.conversationSummary = newSummary;
    
    if (Object.keys(updates).length > 0) {
      updateUserMemory(updates);
    }
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

  // API Usage and Offline Management
  const loadAPIUsage = () => {
    const userId = JSON.parse(localStorage.getItem('user') || '{}').id || 'anonymous';
    const saved = localStorage.getItem(`api_usage_${userId}`);
    if (saved) {
      setApiUsage(JSON.parse(saved).map((usage: any) => ({
        ...usage,
        timestamp: new Date(usage.timestamp)
      })));
    }
  };

  const saveAPIUsage = (usage: APIUsage) => {
    const userId = JSON.parse(localStorage.getItem('user') || '{}').id || 'anonymous';
    const updatedUsage = [...apiUsage, usage];
    setApiUsage(updatedUsage);
    localStorage.setItem(`api_usage_${userId}`, JSON.stringify(updatedUsage.map(u => ({
      ...u,
      timestamp: u.timestamp.toISOString()
    }))));
  };

  const loadOfflineConversations = () => {
    const userId = JSON.parse(localStorage.getItem('user') || '{}').id || 'anonymous';
    const saved = localStorage.getItem(`offline_conversations_${userId}`);
    if (saved) {
      setOfflineConversations(JSON.parse(saved).map((conv: any) => ({
        ...conv,
        lastSync: new Date(conv.lastSync),
        messages: conv.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      })));
    }
  };

  const loadStudentAnalytics = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/students/`, {
        headers: {
          'Authorization': `Token ${localStorage.getItem('admin_token') || localStorage.getItem('token')}`,
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const formattedStudents = data.students.map((student: any) => ({
          ...student,
          registeredAt: new Date(student.registeredAt),
          lastActive: new Date(student.lastActive),
          achievements: [{ id: '1', title: 'First Steps', description: '', icon: '🎯', type: 'milestone', requirement: 1, earnedAt: new Date() }]
        }));
        setStudentAnalytics(formattedStudents);
      } else {
        console.error('Failed to load student analytics');
      }
    } catch (error) {
      console.error('Error loading student analytics:', error);
    }
  };

  const exportConversation = () => {
    const conversationText = messages.map(msg => 
      `${msg.role.toUpperCase()}: ${msg.content}\n${msg.timestamp.toLocaleString()}\n\n`
    ).join('');
    
    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedSubject}_conversation_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAdminLogin = async (username: string, password: string) => {
    // Mock admin authentication - in production, use proper admin API
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('admin_token', localStorage.getItem('token') || 'mock_admin_token');
      localStorage.setItem('admin_user', JSON.stringify({ username: 'admin', role: 'admin' }));
      setIsAdmin(true);
      setShowAdminAuth(false);
      loadStudentAnalytics();
      return true;
    }
    return false;
  };

  const mockSocraticAPI = async (userMessage: string, conversationHistory: Message[], subject: string) => {
    // Handle offline mode
    if (isOffline) {
      const offlineResponse = `[OFFLINE MODE] I understand you're asking about ${subject}. While I can't access the full AI model right now, let me ask you: What do you think might be the key concept to focus on here?`;
      return {
        response: offlineResponse,
        confidence: 0.3,
        metadata: { offline: true, tokens_used: 0 }
      };
    }

    const endpoint = `${import.meta.env.VITE_API_URL}/socratic-response/`;
    
    // Prepare memory context for AI
    const memoryContext = userMemory ? {
      user_name: userMemory.name,
      interests: userMemory.interests,
      learning_goals: userMemory.learningGoals,
      previous_problems: userMemory.previousProblems,
      conversation_summary: userMemory.conversationSummary
    } : null;
    
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
          conversation_history: conversationHistory,
          user_memory: memoryContext,
          model: selectedModel
        })
      });
      
      if (!response.ok) {
        throw new Error('API request failed');
      }
      
      const data = await response.json();
      
      // Track API usage
      if (data.tokens_used) {
        const model = AI_MODELS.find(m => m.id === selectedModel);
        const usage: APIUsage = {
          id: Date.now().toString(),
          userId: JSON.parse(localStorage.getItem('user') || '{}').id || 'anonymous',
          modelId: selectedModel,
          tokensUsed: data.tokens_used,
          cost: (data.tokens_used * (model?.costPerToken || 0.00002)),
          conversationId: `${subject}_${Date.now()}`,
          timestamp: new Date()
        };
        saveAPIUsage(usage);
      }
      
      return data;
      
    } catch (error) {
      console.error('API Error:', error);
      
      // Fallback with memory context
      let fallbackResponse = "I'm having trouble connecting right now. ";
      if (userMemory?.name) {
        fallbackResponse += `${userMemory.name}, `;
      }
      if (userMemory?.previousProblems.length > 0) {
        fallbackResponse += `based on what we discussed before about ${userMemory.previousProblems[userMemory.previousProblems.length - 1]}, `;
      }
      fallbackResponse += "what's your intuition telling you about this problem?";
      
      return {
        response: fallbackResponse,
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
      
      // Extract and save memory from conversation
      extractMemoryFromMessage(currentMessage.trim(), apiResponse.response);
      
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

  const handleVoiceInput = (text: string) => {
    setCurrentMessage(text);
    if (text.trim()) {
      setTimeout(() => handleSendMessage(), 500);
    }
  };

  const handleImageAnalysis = (analysis: string) => {
    const analysisMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: analysis,
      timestamp: new Date(),
      subject: selectedSubject
    };
    setMessages(prev => [...prev, analysisMessage]);
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

  if (showAdminAuth) {
    return <AdminAuthPage onBack={() => setShowAdminAuth(false)} onLogin={handleAdminLogin} isDarkMode={isDarkMode} />;
  }

  if (isAdmin) {
    return <AdminDashboard studentAnalytics={studentAnalytics} isDarkMode={isDarkMode} onLogout={() => {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      setIsAdmin(false);
      setShowLanding(true);
    }} />;
  }

  if (showWelcome) {
    return (
      <div className={`min-h-screen transition-all duration-500 ${themeClasses.bg}`}>
        <div className="container mx-auto px-6 py-8">
          {/* Top Navigation */}
          <div className="fixed top-6 right-6 z-50 flex items-center space-x-4">
            {/* Admin Access Button */}
            <button
              onClick={() => setShowAdminAuth(true)}
              className={`px-4 py-2 rounded-xl backdrop-blur-md border shadow-lg transition-all duration-300 hover:scale-105 ${themeClasses.cardBg} ${themeClasses.border} ${themeClasses.hoverBg}`}
            >
              <span className={`text-sm font-semibold ${themeClasses.text}`}>Admin</span>
            </button>
            
            {/* User Profile */}
            <div className={`flex items-center space-x-3 px-4 py-2 rounded-xl backdrop-blur-md border shadow-lg transition-all duration-300 hover:scale-105 ${themeClasses.cardBg} ${themeClasses.border}`}>
              <div className={`w-8 h-8 ${themeClasses.accent} rounded-lg flex items-center justify-center overflow-hidden shadow-md`}>
                {profilePicture ? (
                  <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
              <span className={`text-sm font-semibold ${themeClasses.text}`}>
                {JSON.parse(localStorage.getItem('user') || '{}').username || 'User'}
              </span>
            </div>
            
            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-3 rounded-xl backdrop-blur-md border shadow-lg transition-all duration-300 hover:scale-110 ${themeClasses.cardBg} ${themeClasses.border} ${themeClasses.hoverBg}`}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>
          </div>

          {/* Header */}
          <div className="text-center mb-16">
            <div className={`inline-flex items-center justify-center w-24 h-24 ${themeClasses.accent} rounded-2xl mb-8 shadow-xl transition-all duration-500 hover:scale-110 hover:rotate-3`}>
              <BookOpen className="w-12 h-12 text-white" />
            </div>
            <h1 className={`text-6xl font-bold mb-6 ${themeClasses.text} tracking-tight`}>
              Learning
              <span className={`block ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                Dashboard
              </span>
            </h1>
            <p className={`text-xl max-w-4xl mx-auto leading-relaxed ${themeClasses.textSecondary}`}>
              Advanced AI-powered learning platform with enterprise-grade analytics and personalized guidance.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="max-w-7xl mx-auto mb-12">
            <div className={`${themeClasses.cardBg} backdrop-blur-md border ${themeClasses.border} rounded-2xl p-3 shadow-xl`}>
              <div className="grid grid-cols-6 gap-2">
                {[
                  { id: 'subjects', label: 'Learning Modules', icon: Book },
                  { id: 'groups', label: 'Study Groups', icon: Users },
                  { id: 'help', label: 'Peer Help', icon: MessageSquare },
                  { id: 'achievements', label: 'Achievements', icon: Award },
                  { id: 'settings', label: 'Settings', icon: TrendingUp },
                  { id: 'profile', label: 'Account', icon: User }
                ].map((tab, index) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`group relative flex flex-col items-center justify-center space-y-2 py-4 px-3 rounded-xl transition-all duration-300 hover:scale-105 ${
                      activeTab === tab.id
                        ? `${themeClasses.accent} text-white shadow-lg transform scale-105`
                        : `${themeClasses.text} ${themeClasses.hoverBg}`
                    }`}
                    style={{ transitionDelay: `${index * 50}ms` }}
                  >
                    <tab.icon className={`w-6 h-6 transition-all duration-300 ${
                      activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'
                    }`} />
                    <span className="font-semibold text-sm">{tab.label}</span>
                    {activeTab === tab.id && (
                      <div className="absolute inset-0 bg-white/10 rounded-xl animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>



          {/* Content Area */}
          <div className="max-w-6xl mx-auto">
            {activeTab === ('progress' as any) && (
              <ProgressDashboard isDarkMode={isDarkMode} />
            )}

            {activeTab === ('pathways' as any) && (
              <div>
                <h2 className={`text-2xl font-bold text-center mb-8 transition-colors duration-300 ${themeClasses.text}`}>
                  Learning Pathways
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {SUBJECTS.map((subject, index) => (
                    <LearningPathways key={subject.id} subjectId={index + 1} isDarkMode={isDarkMode} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === ('subjects' as 'chat' | 'agents' | 'profile' | 'subjects') && (
              <div>
                <div className="text-center mb-12">
                  <h2 className={`text-4xl font-bold mb-4 ${themeClasses.text}`}>
                    Learning Modules
                  </h2>
                  <p className={`text-lg ${themeClasses.textSecondary} max-w-2xl mx-auto`}>
                    Select a subject to begin your personalized learning journey
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                  {SUBJECTS.map((subject, index) => {
                    const hasHistory = loadConversationHistory(subject.id).length > 0;
                    return (
                      <button
                        key={subject.id}
                        onClick={() => handleSubjectSelect(subject.id)}
                        className={`group relative overflow-hidden ${themeClasses.cardBg} backdrop-blur-md border ${themeClasses.border} rounded-3xl p-8 transition-all duration-500 hover:scale-105 hover:shadow-2xl ${themeClasses.hoverBg}`}
                        style={{ transitionDelay: `${index * 100}ms` }}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-all duration-500`}></div>
                        {hasHistory && (
                          <div className="absolute top-4 right-4 flex items-center space-x-1">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                            <span className="text-xs font-medium text-emerald-400">Active</span>
                          </div>
                        )}
                        <div className="relative">
                          <div className={`inline-flex items-center justify-center w-20 h-20 ${themeClasses.accent} rounded-2xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl`}>
                            <subject.icon className="w-10 h-10 text-white" />
                          </div>
                          <h3 className={`text-2xl font-bold mb-3 ${themeClasses.text} group-hover:text-emerald-500 transition-colors duration-300`}>
                            {subject.name}
                          </h3>
                          <p className={`text-sm leading-relaxed ${themeClasses.textSecondary}`}>
                            {hasHistory ? 'Continue your learning session' : 'Start interactive learning with AI guidance'}
                          </p>
                          <div className={`mt-4 w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden`}>
                            <div className={`h-full ${themeClasses.accent} rounded-full transition-all duration-1000 group-hover:w-full`} style={{ width: hasHistory ? '60%' : '0%' }}></div>
                          </div>
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
                      {userMemory?.name || JSON.parse(localStorage.getItem('user') || '{}').username || 'User'}
                    </h3>
                    <p className={`transition-colors duration-300 ${themeClasses.textSecondary}`}>
                      {JSON.parse(localStorage.getItem('user') || '{}').email || 'user@example.com'}
                    </p>
                    {userMemory && (
                      <div className="mt-4 space-y-2">
                        {userMemory.interests.length > 0 && (
                          <div>
                            <p className={`text-sm font-medium ${themeClasses.text}`}>Interests:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {userMemory.interests.map((interest, i) => (
                                <span key={i} className={`px-2 py-1 text-xs rounded-full ${themeClasses.accent} text-white`}>
                                  {interest}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {userMemory.learningGoals.length > 0 && (
                          <div>
                            <p className={`text-sm font-medium ${themeClasses.text}`}>Learning Goals:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {userMemory.learningGoals.map((goal, i) => (
                                <span key={i} className={`px-2 py-1 text-xs rounded-full bg-blue-500 text-white`}>
                                  {goal}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
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
                          // Clear all user data including memory
                          const userId = JSON.parse(localStorage.getItem('user') || '{}').id || 'anonymous';
                          localStorage.removeItem('token');
                          localStorage.removeItem('user');
                          localStorage.removeItem(`user_memory_${userId}`);
                          setIsAuthenticated(false);
                          setShowLanding(true);
                          setShowAuth(false);
                          setShowWelcome(false);
                          setProfilePicture(null);
                          setSelectedSubject('');
                          setMessages([]);
                          setUserMemory(null);
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

            {/* Study Groups Tab */}
            {activeTab === 'groups' && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className={`text-4xl font-bold mb-2 ${themeClasses.text}`}>Study Groups</h2>
                    <p className={`${themeClasses.textSecondary}`}>Collaborate and learn together</p>
                  </div>
                  <button
                    onClick={() => {
                      const groupName = prompt('Enter study group name:');
                      const subject = prompt('Enter subject:');
                      if (groupName && subject) {
                        const newGroup: StudyGroup = {
                          id: Date.now().toString(),
                          name: groupName,
                          subject,
                          members: [JSON.parse(localStorage.getItem('user') || '{}').id || 'user'],
                          createdBy: JSON.parse(localStorage.getItem('user') || '{}').id || 'user',
                          createdAt: new Date(),
                          isActive: true,
                          messages: []
                        };
                        setStudyGroups(prev => [...prev, newGroup]);
                      }
                    }}
                    className={`px-6 py-3 ${themeClasses.accent} text-white rounded-xl hover:scale-105 transition-all duration-300 shadow-lg`}
                  >
                    Create Group
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {studyGroups.map((group) => (
                    <div key={group.id} className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-lg`}>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className={`text-xl font-bold ${themeClasses.text}`}>{group.name}</h3>
                          <p className={`text-sm ${themeClasses.textSecondary}`}>{group.subject}</p>
                        </div>
                        <div className={`px-2 py-1 ${themeClasses.accent} text-white text-xs rounded-full`}>
                          {group.members.length} members
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Users className={`w-4 h-4 ${themeClasses.textSecondary}`} />
                          <span className={`text-sm ${themeClasses.textSecondary}`}>
                            Created {group.createdAt.toLocaleDateString()}
                          </span>
                        </div>
                        <button
                          onClick={() => setSelectedStudyGroup(group)}
                          className={`w-full py-2 ${themeClasses.accent} text-white rounded-lg hover:scale-105 transition-all duration-300`}
                        >
                          Join Discussion
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Peer Help Tab */}
            {activeTab === 'help' && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className={`text-4xl font-bold mb-2 ${themeClasses.text}`}>Peer Help</h2>
                    <p className={`${themeClasses.textSecondary}`}>Get help from fellow learners</p>
                  </div>
                  <button
                    onClick={() => {
                      const question = prompt('What do you need help with?');
                      const subject = prompt('Which subject?');
                      if (question && subject) {
                        const newRequest: PeerHelpRequest = {
                          id: Date.now().toString(),
                          studentId: JSON.parse(localStorage.getItem('user') || '{}').id || 'user',
                          studentName: userMemory?.name || JSON.parse(localStorage.getItem('user') || '{}').username || 'User',
                          subject,
                          question,
                          status: 'open',
                          createdAt: new Date(),
                          responses: []
                        };
                        setPeerHelpRequests(prev => [...prev, newRequest]);
                      }
                    }}
                    className={`px-6 py-3 ${themeClasses.accent} text-white rounded-xl hover:scale-105 transition-all duration-300 shadow-lg`}
                  >
                    Ask for Help
                  </button>
                </div>
                
                <div className="space-y-6">
                  {peerHelpRequests.map((request) => (
                    <div key={request.id} className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-2xl p-6 shadow-lg`}>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className={`text-lg font-bold ${themeClasses.text}`}>{request.studentName}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              request.status === 'open' ? 'bg-yellow-500' :
                              request.status === 'helping' ? 'bg-blue-500' : 'bg-green-500'
                            } text-white`}>
                              {request.status}
                            </span>
                          </div>
                          <p className={`text-sm ${themeClasses.textSecondary} mb-2`}>{request.subject}</p>
                          <p className={`${themeClasses.text}`}>{request.question}</p>
                        </div>
                      </div>
                      
                      {request.responses.length > 0 && (
                        <div className="mt-4 space-y-3">
                          {request.responses.map((response) => (
                            <div key={response.id} className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                              <div className="flex items-center justify-between mb-2">
                                <span className={`font-medium ${themeClasses.text}`}>{response.helperName}</span>
                                <span className={`text-xs ${themeClasses.textSecondary}`}>
                                  {response.createdAt.toLocaleTimeString()}
                                </span>
                              </div>
                              <p className={`text-sm ${themeClasses.text}`}>{response.response}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {request.status === 'open' && request.studentId !== JSON.parse(localStorage.getItem('user') || '{}').id && (
                        <button
                          onClick={() => {
                            const helpResponse = prompt('How can you help?');
                            if (helpResponse) {
                              const newResponse: PeerResponse = {
                                id: Date.now().toString(),
                                helperId: JSON.parse(localStorage.getItem('user') || '{}').id || 'user',
                                helperName: userMemory?.name || JSON.parse(localStorage.getItem('user') || '{}').username || 'Helper',
                                response: helpResponse,
                                isAIModerated: true,
                                createdAt: new Date()
                              };
                              setPeerHelpRequests(prev => prev.map(req => 
                                req.id === request.id 
                                  ? { ...req, responses: [...req.responses, newResponse], status: 'helping' as const }
                                  : req
                              ));
                            }
                          }}
                          className={`mt-4 px-4 py-2 ${themeClasses.accent} text-white rounded-lg hover:scale-105 transition-all duration-300`}
                        >
                          Help Out
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === 'achievements' && (
              <div>
                <div className="text-center mb-12">
                  <h2 className={`text-4xl font-bold mb-4 ${themeClasses.text}`}>Achievements</h2>
                  <p className={`${themeClasses.textSecondary}`}>Track your learning milestones</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { id: '1', title: 'First Steps', description: 'Complete your first learning session', icon: '🎯', type: 'milestone', requirement: 1, earnedAt: new Date() },
                    { id: '2', title: 'Consistent Learner', description: 'Learn for 7 days in a row', icon: '🔥', type: 'consistency', requirement: 7 },
                    { id: '3', title: 'Subject Master', description: 'Complete 50 questions in one subject', icon: '🏆', type: 'mastery', requirement: 50 },
                    { id: '4', title: 'Helpful Peer', description: 'Help 10 fellow students', icon: '🤝', type: 'helping', requirement: 10 },
                    { id: '5', title: 'Group Leader', description: 'Create and manage a study group', icon: '👑', type: 'milestone', requirement: 1 },
                    { id: '6', title: 'Knowledge Seeker', description: 'Ask 25 thoughtful questions', icon: '🧠', type: 'milestone', requirement: 25 }
                  ].map((achievement) => (
                    <div key={achievement.id} className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-lg ${
                      achievement.earnedAt ? 'ring-2 ring-emerald-500' : 'opacity-60'
                    }`}>
                      <div className="text-center">
                        <div className="text-4xl mb-4">{achievement.icon}</div>
                        <h3 className={`text-xl font-bold mb-2 ${themeClasses.text}`}>{achievement.title}</h3>
                        <p className={`text-sm ${themeClasses.textSecondary} mb-4`}>{achievement.description}</p>
                        {achievement.earnedAt ? (
                          <div className={`px-3 py-1 ${themeClasses.accent} text-white text-xs rounded-full`}>
                            Earned {achievement.earnedAt.toLocaleDateString()}
                          </div>
                        ) : (
                          <div className={`px-3 py-1 bg-gray-500 text-white text-xs rounded-full`}>
                            Progress: 0/{achievement.requirement}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div>
                <div className="text-center mb-12">
                  <h2 className={`text-4xl font-bold mb-4 ${themeClasses.text}`}>Technical Settings</h2>
                  <p className={`${themeClasses.textSecondary}`}>Manage AI models, usage, and data</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Model Selection */}
                  <div className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-2xl p-6`}>
                    <h3 className={`text-xl font-bold mb-4 ${themeClasses.text}`}>AI Model Selection</h3>
                    <div className="space-y-4">
                      {AI_MODELS.map((model) => (
                        <div key={model.id} className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
                          selectedModel === model.id 
                            ? `${themeClasses.accent} text-white border-transparent` 
                            : `${themeClasses.border} hover:border-emerald-300`
                        }`} onClick={() => setSelectedModel(model.id)}>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{model.name}</h4>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                model.speed === 'fast' ? 'bg-green-500' :
                                model.speed === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                              } text-white`}>{model.speed}</span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                model.quality === 'high' ? 'bg-blue-500' :
                                model.quality === 'medium' ? 'bg-purple-500' : 'bg-gray-500'
                              } text-white`}>{model.quality}</span>
                            </div>
                          </div>
                          <p className={`text-sm ${selectedModel === model.id ? 'text-white/80' : themeClasses.textSecondary}`}>
                            {model.provider} • ${(model.costPerToken * 1000).toFixed(4)}/1K tokens
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* API Usage Analytics */}
                  <div className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-2xl p-6`}>
                    <h3 className={`text-xl font-bold mb-4 ${themeClasses.text}`}>API Usage Analytics</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                          <div className={`text-2xl font-bold ${themeClasses.text}`}>
                            {apiUsage.reduce((sum, usage) => sum + usage.tokensUsed, 0).toLocaleString()}
                          </div>
                          <div className={`text-sm ${themeClasses.textSecondary}`}>Total Tokens</div>
                        </div>
                        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                          <div className={`text-2xl font-bold ${themeClasses.text}`}>
                            ${apiUsage.reduce((sum, usage) => sum + usage.cost, 0).toFixed(4)}
                          </div>
                          <div className={`text-sm ${themeClasses.textSecondary}`}>Total Cost</div>
                        </div>
                      </div>
                      
                      <div className="max-h-40 overflow-y-auto space-y-2">
                        {apiUsage.slice(-5).map((usage) => {
                          const model = AI_MODELS.find(m => m.id === usage.modelId);
                          return (
                            <div key={usage.id} className={`p-2 rounded ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                              <div className="flex justify-between items-center">
                                <span className={`text-sm font-medium ${themeClasses.text}`}>
                                  {model?.name || 'Unknown Model'}
                                </span>
                                <span className={`text-xs ${themeClasses.textSecondary}`}>
                                  {usage.tokensUsed} tokens • ${usage.cost.toFixed(4)}
                                </span>
                              </div>
                              <div className={`text-xs ${themeClasses.textSecondary}`}>
                                {usage.timestamp.toLocaleString()}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  
                  {/* Export & Offline */}
                  <div className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-2xl p-6`}>
                    <h3 className={`text-xl font-bold mb-4 ${themeClasses.text}`}>Data Management</h3>
                    <div className="space-y-4">
                      <button
                        onClick={exportConversation}
                        disabled={messages.length === 0}
                        className={`w-full py-3 px-4 ${themeClasses.accent} text-white rounded-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        Export Current Conversation
                      </button>
                      
                      <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-medium ${themeClasses.text}`}>Connection Status</span>
                          <div className={`flex items-center space-x-2`}>
                            <div className={`w-2 h-2 rounded-full ${isOffline ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></div>
                            <span className={`text-sm ${themeClasses.textSecondary}`}>
                              {isOffline ? 'Offline' : 'Online'}
                            </span>
                          </div>
                        </div>
                        <p className={`text-sm ${themeClasses.textSecondary}`}>
                          {isOffline ? 'Using cached responses and offline mode' : 'Connected to AI models'}
                        </p>
                      </div>
                      
                      <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                        <div className={`font-medium ${themeClasses.text} mb-2`}>Offline Conversations</div>
                        <div className={`text-sm ${themeClasses.textSecondary}`}>
                          {offlineConversations.length} conversations cached locally
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Model Comparison */}
                  <div className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-2xl p-6`}>
                    <h3 className={`text-xl font-bold mb-4 ${themeClasses.text}`}>Model Comparison</h3>
                    <div className="space-y-3">
                      {AI_MODELS.map((model) => {
                        const usage = apiUsage.filter(u => u.modelId === model.id);
                        const totalTokens = usage.reduce((sum, u) => sum + u.tokensUsed, 0);
                        const totalCost = usage.reduce((sum, u) => sum + u.cost, 0);
                        
                        return (
                          <div key={model.id} className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                            <div className="flex justify-between items-center mb-1">
                              <span className={`font-medium ${themeClasses.text}`}>{model.name}</span>
                              <span className={`text-sm ${themeClasses.textSecondary}`}>
                                {totalTokens.toLocaleString()} tokens
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className={`text-xs ${themeClasses.textSecondary}`}>
                                {model.provider} • {model.speed} • {model.quality} quality
                              </span>
                              <span className={`text-xs ${themeClasses.textSecondary}`}>
                                ${totalCost.toFixed(4)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
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
          <div className="mt-20 max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h3 className={`text-3xl font-bold mb-4 ${themeClasses.text}`}>
                Platform Features
              </h3>
              <p className={`text-lg ${themeClasses.textSecondary}`}>
                Enterprise-grade learning technology
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: MessageSquare,
                  title: 'Socratic Method',
                  description: 'Advanced questioning algorithms that guide discovery-based learning'
                },
                {
                  icon: TrendingUp,
                  title: 'Analytics Engine',
                  description: 'Real-time performance tracking with predictive learning insights'
                },
                {
                  icon: Book,
                  title: 'Knowledge Synthesis',
                  description: 'AI-powered content integration across multiple learning domains'
                }
              ].map((feature, index) => (
                <div key={index} className={`group ${themeClasses.cardBg} backdrop-blur-md border ${themeClasses.border} rounded-2xl p-8 transition-all duration-500 hover:scale-105 hover:shadow-xl`} style={{ transitionDelay: `${index * 150}ms` }}>
                  <div className={`w-16 h-16 ${themeClasses.accent} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className={`text-xl font-bold mb-4 text-center ${themeClasses.text} group-hover:text-emerald-500 transition-colors duration-300`}>
                    {feature.title}
                  </h4>
                  <p className={`text-center leading-relaxed ${themeClasses.textSecondary}`}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Study Group Chat Modal */}
        {selectedStudyGroup && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden`}>
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className={`text-xl font-bold ${themeClasses.text}`}>{selectedStudyGroup.name}</h3>
                  <p className={`text-sm ${themeClasses.textSecondary}`}>{selectedStudyGroup.subject} • {selectedStudyGroup.members.length} members</p>
                </div>
                <button
                  onClick={() => setSelectedStudyGroup(null)}
                  className={`p-2 rounded-lg ${themeClasses.hoverBg}`}
                >
                  <X className={`w-5 h-5 ${themeClasses.text}`} />
                </button>
              </div>
              
              <div className="p-6 max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  {selectedStudyGroup.messages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className={`w-12 h-12 mx-auto mb-4 ${themeClasses.textSecondary}`} />
                      <p className={`${themeClasses.textSecondary}`}>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    selectedStudyGroup.messages.map((message) => (
                      <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-lg p-3 ${
                          message.role === 'user' ? `${themeClasses.accent} text-white` : `${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'} ${themeClasses.text}`
                        }`}>
                          <p>{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className={`flex-1 px-4 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.text}`}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement;
                        if (input.value.trim()) {
                          const newMessage: Message = {
                            id: Date.now().toString(),
                            role: 'user',
                            content: input.value.trim(),
                            timestamp: new Date()
                          };
                          setStudyGroups(prev => prev.map(group => 
                            group.id === selectedStudyGroup.id 
                              ? { ...group, messages: [...group.messages, newMessage] }
                              : group
                          ));
                          setSelectedStudyGroup(prev => prev ? { ...prev, messages: [...prev.messages, newMessage] } : null);
                          input.value = '';
                        }
                      }
                    }}
                  />
                  <button className={`px-4 py-2 ${themeClasses.accent} text-white rounded-lg hover:scale-105 transition-all duration-300`}>
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Floating AI Assistant */}
        <AIAssistant
          isDarkMode={isDarkMode}
          onVoiceInput={handleVoiceInput}
          onImageAnalysis={handleImageAnalysis}
          selectedSubject={selectedSubject}
        />
      </div>
    );
  }

  const selectedSubjectData = SUBJECTS.find(s => s.id === selectedSubject);

  return (
    <div className={`min-h-screen transition-all duration-500 ${themeClasses.bg}`}>
      <div className="container mx-auto px-6 py-6 h-screen flex flex-col">
        {/* Header */}
        <header className={`${themeClasses.cardBg} backdrop-blur-md border ${themeClasses.border} rounded-3xl p-6 mb-6 shadow-xl`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => {
                  setSelectedSubject('');
                  setShowWelcome(true);
                  setMessages([]);
                }}
                className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${themeClasses.hoverBg}`}
                title="Back to Dashboard"
              >
                <ArrowLeft className={`w-6 h-6 ${themeClasses.text}`} />
              </button>
              <div className={`w-16 h-16 ${themeClasses.accent} rounded-2xl flex items-center justify-center shadow-xl`}>
                {selectedSubjectData?.icon && <selectedSubjectData.icon className="w-8 h-8 text-white" />}
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${themeClasses.text}`}>
                  {selectedSubjectData?.name}
                </h1>
                <div className="flex items-center space-x-3">
                  <p className={`text-sm ${themeClasses.textSecondary} font-medium`}>
                    {AI_MODELS.find(m => m.id === selectedModel)?.name || 'AI Model'}
                  </p>
                  {isOffline && (
                    <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                      Offline
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between flex-1 ml-8">
              <div className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-xl px-4 py-3`}>
                <div className={`text-xs font-medium ${themeClasses.textSecondary} uppercase tracking-wide`}>
                  Session Metrics
                </div>
                <div className={`text-lg font-bold ${themeClasses.text}`}>
                  {session.questionsAsked} interactions
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Model Selector */}
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className={`px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.text} text-sm`}
                >
                  {AI_MODELS.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} ({model.speed})
                    </option>
                  ))}
                </select>
                
                {/* Export Button */}
                <button
                  onClick={exportConversation}
                  disabled={messages.length === 0}
                  className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${themeClasses.hoverBg} border ${themeClasses.border} disabled:opacity-50`}
                  title="Export Conversation"
                >
                  <Download className={`w-5 h-5 ${themeClasses.text}`} />
                </button>
                
                {/* User Profile */}
                <div className={`flex items-center space-x-3 px-4 py-2 rounded-xl ${themeClasses.cardBg} border ${themeClasses.border} shadow-md`}>
                  <div className={`w-8 h-8 ${themeClasses.accent} rounded-lg flex items-center justify-center overflow-hidden`}>
                    {profilePicture ? (
                      <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className={`text-sm font-semibold ${themeClasses.text}`}>
                    {JSON.parse(localStorage.getItem('user') || '{}').username || 'User'}
                  </span>
                </div>
                
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${themeClasses.hoverBg} border ${themeClasses.border}`}
                  title="Toggle Theme"
                >
                  {isDarkMode ? (
                    <Sun className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Moon className="w-5 h-5 text-slate-600" />
                  )}
                </button>
                
                <button
                  onClick={() => {
                    setSummaryConversationId(1);
                    setShowSessionSummary(true);
                  }}
                  className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${themeClasses.hoverBg} border ${themeClasses.border}`}
                  title="Session Summary"
                >
                  <BookOpen className={`w-5 h-5 ${themeClasses.text}`} />
                </button>
                
                <button
                  onClick={resetSession}
                  className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${themeClasses.hoverBg} border ${themeClasses.border}`}
                  title="New Session"
                >
                  <RotateCcw className={`w-5 h-5 ${themeClasses.text}`} />
                </button>
              </div>
            </div>
          </div>
        </header>



        {/* Chat Area */}
        <div className={`flex-1 ${themeClasses.cardBg} backdrop-blur-md border ${themeClasses.border} rounded-3xl p-8 overflow-hidden flex flex-col shadow-xl`}>
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-6 transition-all duration-300 hover:scale-105 ${
                    message.role === 'user'
                      ? `${themeClasses.accent} text-white ml-4 shadow-xl`
                      : `${themeClasses.cardBg} ${themeClasses.text} mr-4 border ${themeClasses.border} shadow-lg`
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${
                      message.role === 'user' 
                        ? 'bg-white/20' 
                        : themeClasses.accent
                    }`}>
                      {message.role === 'user' ? (
                        <User className="w-5 h-5" />
                      ) : (
                        <Bot className="w-5 h-5 text-white" />
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
          <div className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-2xl p-6 shadow-lg`}>
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
                className={`p-4 ${themeClasses.accent} ${themeClasses.accentHover} disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-300 hover:scale-110 shadow-lg`}
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
              <div className="flex items-center space-x-4 text-xs">
                {userMemory && (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className={`transition-colors duration-300 ${themeClasses.textSecondary}`}>
                      Memory Active
                    </span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className={`transition-colors duration-300 ${themeClasses.textSecondary}`}>
                    API Connected
                  </span>
                </div>
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
      
      {/* Session Summary Modal */}
      {showSessionSummary && summaryConversationId && (
        <SessionSummary
          conversationId={summaryConversationId}
          isDarkMode={isDarkMode}
          onClose={() => {
            setShowSessionSummary(false);
            setSummaryConversationId(null);
          }}
        />
      )}
      
      {/* Floating AI Assistant */}
      <AIAssistant
        isDarkMode={isDarkMode}
        onVoiceInput={handleVoiceInput}
        onImageAnalysis={handleImageAnalysis}
        selectedSubject={selectedSubject}
      />
    </div>
  );
}

export default App
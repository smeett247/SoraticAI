import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, BookOpen, Award, Calendar, DollarSign, Activity, LogOut, Search, Filter, Download, Eye, Trash2, UserPlus } from 'lucide-react';

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
  achievements: any[];
  apiUsage: {
    totalTokens: number;
    totalCost: number;
    favoriteModel: string;
  };
}

interface AdminDashboardProps {
  studentAnalytics: StudentAnalytics[];
  isDarkMode: boolean;
  onLogout: () => void;
}

interface NewStudent {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ studentAnalytics, isDarkMode, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'analytics' | 'usage'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentAnalytics | null>(null);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudent, setNewStudent] = useState<NewStudent>({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: ''
  });
  const [localStudents, setLocalStudents] = useState(studentAnalytics);
  
  useEffect(() => {
    setLocalStudents(studentAnalytics);
  }, [studentAnalytics]);
  
  const handleAddStudent = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/students/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('admin_token') || localStorage.getItem('token')}`,
        },
        body: JSON.stringify(newStudent)
      });
      
      if (response.ok) {
        setShowAddStudent(false);
        setNewStudent({ username: '', email: '', password: '', first_name: '', last_name: '' });
        window.location.reload();
      }
    } catch (error) {
      console.error('Error adding student:', error);
    }
  };
  
  const handleDeleteStudent = async (studentId: string) => {
    if (confirm('Are you sure you want to delete this student?')) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/students/${studentId}/delete/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Token ${localStorage.getItem('admin_token') || localStorage.getItem('token')}`,
          }
        });
        
        if (response.ok) {
          setLocalStudents(prev => prev.filter(s => s.id !== studentId));
        }
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
  };

  const themeClasses = {
    bg: isDarkMode ? 'bg-slate-950' : 'bg-slate-50',
    cardBg: isDarkMode ? 'bg-slate-900/95' : 'bg-white/95',
    text: isDarkMode ? 'text-slate-100' : 'text-slate-900',
    textSecondary: isDarkMode ? 'text-slate-400' : 'text-slate-600',
    border: isDarkMode ? 'border-slate-800' : 'border-slate-200',
    accent: isDarkMode ? 'bg-red-500' : 'bg-red-600',
    hoverBg: isDarkMode ? 'hover:bg-slate-800/80' : 'hover:bg-slate-100/80'
  };

  const totalStudents = studentAnalytics.length;
  const activeStudents = studentAnalytics.filter(s => 
    new Date().getTime() - s.lastActive.getTime() < 24 * 60 * 60 * 1000
  ).length;
  const totalSessions = studentAnalytics.reduce((sum, s) => sum + s.totalSessions, 0);
  const totalQuestions = studentAnalytics.reduce((sum, s) => sum + s.totalQuestions, 0);
  const totalCost = studentAnalytics.reduce((sum, s) => sum + s.apiUsage.totalCost, 0);

  const filteredStudents = studentAnalytics.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportStudentData = () => {
    const csvContent = [
      ['Name', 'Email', 'Registered', 'Last Active', 'Sessions', 'Questions', 'Subjects', 'API Cost'].join(','),
      ...studentAnalytics.map(student => [
        student.name,
        student.email,
        student.registeredAt.toLocaleDateString(),
        student.lastActive.toLocaleDateString(),
        student.totalSessions,
        student.totalQuestions,
        student.subjectsStudied.join(';'),
        student.apiUsage.totalCost.toFixed(4)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student_analytics_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${themeClasses.bg}`}>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-4xl font-bold ${themeClasses.text}`}>Admin Dashboard</h1>
            <p className={`${themeClasses.textSecondary} mt-2`}>Monitor student progress and platform analytics</p>
          </div>
          <button
            onClick={onLogout}
            className={`flex items-center space-x-2 px-4 py-2 ${themeClasses.accent} text-white rounded-xl hover:scale-105 transition-all duration-300`}
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className={`${themeClasses.cardBg} backdrop-blur-md border ${themeClasses.border} rounded-2xl p-3 mb-8 shadow-xl`}>
          <div className="grid grid-cols-4 gap-3">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'students', label: 'Students', icon: Users },
              { id: 'analytics', label: 'Analytics', icon: BookOpen },
              { id: 'usage', label: 'API Usage', icon: DollarSign }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl transition-all duration-300 hover:scale-105 ${
                  activeTab === tab.id
                    ? `${themeClasses.accent} text-white shadow-lg`
                    : `${themeClasses.text} ${themeClasses.hoverBg}`
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-semibold">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <div className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-2xl p-6 text-center hover:scale-105 transition-all duration-300`}>
                <Users className={`w-8 h-8 ${themeClasses.accent} mx-auto mb-3`} />
                <div className={`text-3xl font-bold ${themeClasses.text} mb-1`}>{totalStudents}</div>
                <div className={`text-sm ${themeClasses.textSecondary}`}>Total Students</div>
              </div>
              <div className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-2xl p-6 text-center hover:scale-105 transition-all duration-300`}>
                <Activity className="w-8 h-8 text-green-500 mx-auto mb-3" />
                <div className={`text-3xl font-bold text-green-500 mb-1`}>{activeStudents}</div>
                <div className={`text-sm ${themeClasses.textSecondary}`}>Active Today</div>
              </div>
              <div className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-2xl p-6 text-center hover:scale-105 transition-all duration-300`}>
                <BookOpen className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                <div className={`text-3xl font-bold text-blue-500 mb-1`}>{totalSessions}</div>
                <div className={`text-sm ${themeClasses.textSecondary}`}>Total Sessions</div>
              </div>
              <div className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-2xl p-6 text-center hover:scale-105 transition-all duration-300`}>
                <Award className="w-8 h-8 text-purple-500 mx-auto mb-3" />
                <div className={`text-3xl font-bold text-purple-500 mb-1`}>{totalQuestions}</div>
                <div className={`text-sm ${themeClasses.textSecondary}`}>Questions Asked</div>
              </div>
              <div className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-2xl p-6 text-center hover:scale-105 transition-all duration-300`}>
                <DollarSign className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                <div className={`text-3xl font-bold text-orange-500 mb-1`}>${totalCost.toFixed(2)}</div>
                <div className={`text-sm ${themeClasses.textSecondary}`}>API Costs</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-2xl p-6`}>
              <h3 className={`text-xl font-bold mb-4 ${themeClasses.text}`}>Recent Student Activity</h3>
              <div className="space-y-3">
                {studentAnalytics.slice(0, 5).map((student) => (
                  <div key={student.id} className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`font-medium ${themeClasses.text}`}>{student.name}</div>
                        <div className={`text-sm ${themeClasses.textSecondary}`}>
                          {student.totalSessions} sessions • {student.subjectsStudied.length} subjects
                        </div>
                      </div>
                      <div className={`text-sm ${themeClasses.textSecondary}`}>
                        Last active: {student.lastActive.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.textSecondary}`} />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 pr-4 py-2 rounded-lg border ${themeClasses.border} ${isDarkMode ? 'bg-slate-800' : 'bg-white'} ${themeClasses.text}`}
                  />
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAddStudent(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg hover:scale-105 transition-all duration-300"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add Student</span>
                </button>
                <button
                  onClick={exportStudentData}
                  className={`flex items-center space-x-2 px-4 py-2 ${themeClasses.accent} text-white rounded-lg hover:scale-105 transition-all duration-300`}
                >
                  <Download className="w-4 h-4" />
                  <span>Export Data</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {localStudents.filter(student =>
                student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.email.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((student) => (
                <div key={student.id} className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-2xl p-6 hover:scale-105 transition-all duration-300`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className={`text-lg font-bold ${themeClasses.text}`}>{student.name}</h3>
                      <p className={`text-sm ${themeClasses.textSecondary}`}>{student.email}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className={`p-2 rounded-lg ${themeClasses.hoverBg}`}
                      >
                        <Eye className={`w-4 h-4 ${themeClasses.text}`} />
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(student.id)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className={`text-sm ${themeClasses.textSecondary}`}>Sessions</span>
                      <span className={`text-sm font-medium ${themeClasses.text}`}>{student.totalSessions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-sm ${themeClasses.textSecondary}`}>Questions</span>
                      <span className={`text-sm font-medium ${themeClasses.text}`}>{student.totalQuestions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-sm ${themeClasses.textSecondary}`}>API Cost</span>
                      <span className={`text-sm font-medium ${themeClasses.text}`}>${student.apiUsage.totalCost.toFixed(4)}</span>
                    </div>
                    <div>
                      <span className={`text-sm ${themeClasses.textSecondary}`}>Subjects</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {student.subjectsStudied.map((subject) => (
                          <span key={subject} className={`px-2 py-1 text-xs rounded-full ${themeClasses.accent} text-white`}>
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-2xl p-6`}>
              <h3 className={`text-xl font-bold mb-4 ${themeClasses.text}`}>Subject Popularity</h3>
              <div className="space-y-3">
                {['python', 'mathematics', 'physics', 'chemistry'].map((subject) => {
                  const count = studentAnalytics.filter(s => s.subjectsStudied.includes(subject)).length;
                  const percentage = (count / totalStudents) * 100;
                  return (
                    <div key={subject} className="flex items-center justify-between">
                      <span className={`capitalize ${themeClasses.text}`}>{subject}</span>
                      <div className="flex items-center space-x-3">
                        <div className={`w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full`}>
                          <div className={`h-2 ${themeClasses.accent} rounded-full`} style={{ width: `${percentage}%` }}></div>
                        </div>
                        <span className={`text-sm ${themeClasses.textSecondary} w-8`}>{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-2xl p-6`}>
              <h3 className={`text-xl font-bold mb-4 ${themeClasses.text}`}>Average Progress</h3>
              <div className="space-y-4">
                {studentAnalytics.slice(0, 5).map((student) => (
                  <div key={student.id}>
                    <div className="flex justify-between mb-1">
                      <span className={`text-sm ${themeClasses.text}`}>{student.name}</span>
                      <span className={`text-sm ${themeClasses.textSecondary}`}>
                        {Math.round(Object.values(student.progressBySubject).reduce((a, b) => a + b, 0) / Object.keys(student.progressBySubject).length)}%
                      </span>
                    </div>
                    <div className={`w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full`}>
                      <div 
                        className={`h-2 ${themeClasses.accent} rounded-full transition-all duration-500`}
                        style={{ width: `${Math.round(Object.values(student.progressBySubject).reduce((a, b) => a + b, 0) / Object.keys(student.progressBySubject).length)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* API Usage Tab */}
        {activeTab === 'usage' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-2xl p-6`}>
              <h3 className={`text-xl font-bold mb-4 ${themeClasses.text}`}>Cost by Student</h3>
              <div className="space-y-3">
                {studentAnalytics.sort((a, b) => b.apiUsage.totalCost - a.apiUsage.totalCost).slice(0, 5).map((student) => (
                  <div key={student.id} className="flex items-center justify-between">
                    <span className={`${themeClasses.text}`}>{student.name}</span>
                    <div className="flex items-center space-x-3">
                      <span className={`text-sm ${themeClasses.textSecondary}`}>
                        {student.apiUsage.totalTokens.toLocaleString()} tokens
                      </span>
                      <span className={`text-sm font-medium ${themeClasses.text}`}>
                        ${student.apiUsage.totalCost.toFixed(4)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-2xl p-6`}>
              <h3 className={`text-xl font-bold mb-4 ${themeClasses.text}`}>Model Usage</h3>
              <div className="space-y-3">
                {['deepseek-ai/deepseek-v3.1', 'meta/llama-3.3-70b-instruct', 'ibm/granite-3.3-8b-instruct'].map((model) => {
                  const users = studentAnalytics.filter(s => s.apiUsage.favoriteModel === model).length;
                  return (
                    <div key={model} className="flex items-center justify-between">
                      <span className={`${themeClasses.text} text-sm`}>{model.split('/')[1]}</span>
                      <span className={`text-sm ${themeClasses.textSecondary}`}>{users} users</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className={`text-xl font-bold ${themeClasses.text}`}>{selectedStudent.name}</h3>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className={`p-2 rounded-lg ${themeClasses.hoverBg}`}
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-sm font-medium ${themeClasses.textSecondary}`}>Email</label>
                  <p className={`${themeClasses.text}`}>{selectedStudent.email}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${themeClasses.textSecondary}`}>Registered</label>
                  <p className={`${themeClasses.text}`}>{selectedStudent.registeredAt.toLocaleDateString()}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${themeClasses.textSecondary}`}>Total Sessions</label>
                  <p className={`${themeClasses.text}`}>{selectedStudent.totalSessions}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${themeClasses.textSecondary}`}>Avg Session Time</label>
                  <p className={`${themeClasses.text}`}>{selectedStudent.averageSessionTime} min</p>
                </div>
              </div>

              <div>
                <label className={`text-sm font-medium ${themeClasses.textSecondary} mb-2 block`}>Progress by Subject</label>
                <div className="space-y-2">
                  {Object.entries(selectedStudent.progressBySubject).map(([subject, progress]) => (
                    <div key={subject}>
                      <div className="flex justify-between mb-1">
                        <span className={`text-sm capitalize ${themeClasses.text}`}>{subject}</span>
                        <span className={`text-sm ${themeClasses.textSecondary}`}>{progress}%</span>
                      </div>
                      <div className={`w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full`}>
                        <div className={`h-2 ${themeClasses.accent} rounded-full`} style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className={`text-sm font-medium ${themeClasses.textSecondary} mb-2 block`}>API Usage</label>
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className={`text-lg font-bold ${themeClasses.text}`}>{selectedStudent.apiUsage.totalTokens.toLocaleString()}</div>
                      <div className={`text-xs ${themeClasses.textSecondary}`}>Tokens</div>
                    </div>
                    <div>
                      <div className={`text-lg font-bold ${themeClasses.text}`}>${selectedStudent.apiUsage.totalCost.toFixed(4)}</div>
                      <div className={`text-xs ${themeClasses.textSecondary}`}>Cost</div>
                    </div>
                    <div>
                      <div className={`text-lg font-bold ${themeClasses.text}`}>{selectedStudent.apiUsage.favoriteModel.split('/')[1]}</div>
                      <div className={`text-xs ${themeClasses.textSecondary}`}>Favorite Model</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
      {/* Add Student Modal */}
      {showAddStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-2xl max-w-md w-full`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className={`text-xl font-bold ${themeClasses.text}`}>Add New Student</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <input
                type="text"
                placeholder="Username"
                value={newStudent.username}
                onChange={(e) => setNewStudent(prev => ({...prev, username: e.target.value}))}
                className={`w-full px-4 py-3 rounded-lg border ${themeClasses.border} ${isDarkMode ? 'bg-slate-800' : 'bg-white'} ${themeClasses.text}`}
              />
              <input
                type="email"
                placeholder="Email"
                value={newStudent.email}
                onChange={(e) => setNewStudent(prev => ({...prev, email: e.target.value}))}
                className={`w-full px-4 py-3 rounded-lg border ${themeClasses.border} ${isDarkMode ? 'bg-slate-800' : 'bg-white'} ${themeClasses.text}`}
              />
              <input
                type="text"
                placeholder="First Name"
                value={newStudent.first_name}
                onChange={(e) => setNewStudent(prev => ({...prev, first_name: e.target.value}))}
                className={`w-full px-4 py-3 rounded-lg border ${themeClasses.border} ${isDarkMode ? 'bg-slate-800' : 'bg-white'} ${themeClasses.text}`}
              />
              <input
                type="text"
                placeholder="Last Name"
                value={newStudent.last_name}
                onChange={(e) => setNewStudent(prev => ({...prev, last_name: e.target.value}))}
                className={`w-full px-4 py-3 rounded-lg border ${themeClasses.border} ${isDarkMode ? 'bg-slate-800' : 'bg-white'} ${themeClasses.text}`}
              />
              <input
                type="password"
                placeholder="Password"
                value={newStudent.password}
                onChange={(e) => setNewStudent(prev => ({...prev, password: e.target.value}))}
                className={`w-full px-4 py-3 rounded-lg border ${themeClasses.border} ${isDarkMode ? 'bg-slate-800' : 'bg-white'} ${themeClasses.text}`}
              />
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex space-x-3">
              <button
                onClick={() => setShowAddStudent(false)}
                className={`flex-1 py-2 border ${themeClasses.border} rounded-lg ${themeClasses.text} ${themeClasses.hoverBg}`}
              >
                Cancel
              </button>
              <button
                onClick={handleAddStudent}
                className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
              >
                Add Student
              </button>
            </div>
          </div>
        </div>
      )}
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Clock, MessageSquare, CheckCircle } from 'lucide-react';

interface ProgressData {
  [subject: string]: {
    subject_id: number;
    total_exercises: number;
    completed_exercises: number;
    completion_percentage: number;
    conversations_count: number;
    time_spent_minutes: number;
  };
}

interface ProgressDashboardProps {
  isDarkMode: boolean;
}

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ isDarkMode }) => {
  const [progressData, setProgressData] = useState<ProgressData>({});
  const [loading, setLoading] = useState(true);

  const themeClasses = {
    bg: isDarkMode ? 'bg-black' : 'bg-gray-50',
    cardBg: isDarkMode ? 'bg-gray-900/80' : 'bg-white/90',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
  };

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/progress/dashboard/`, {
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`,
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProgressData(data);
      }
    } catch (error) {
      console.error('Failed to fetch progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = Object.entries(progressData).map(([subject, data]) => ({
    subject,
    completed: data.completed_exercises,
    total: data.total_exercises,
    percentage: data.completion_percentage,
    conversations: data.conversations_count,
    timeSpent: data.time_spent_minutes,
  }));

  const pieData = chartData.map(item => ({
    name: item.subject,
    value: item.percentage,
  }));

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e'];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold ${themeClasses.text}`}>Progress Dashboard</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {chartData.map((item, index) => (
          <div key={item.subject} className={`${themeClasses.cardBg} backdrop-blur-sm border ${themeClasses.border} rounded-xl p-4`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className={`font-semibold ${themeClasses.text}`}>{item.subject}</h3>
              <CheckCircle className={`w-5 h-5 ${item.percentage > 50 ? 'text-green-500' : 'text-gray-400'}`} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                <span className={`text-sm ${themeClasses.textSecondary}`}>
                  {item.completed}/{item.total} exercises
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-blue-500" />
                <span className={`text-sm ${themeClasses.textSecondary}`}>
                  {item.conversations} conversations
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-purple-500" />
                <span className={`text-sm ${themeClasses.textSecondary}`}>
                  {item.timeSpent}min
                </span>
              </div>
              <div className={`w-full bg-gray-200 rounded-full h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div
                  className="h-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-300"
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
              <span className={`text-xs ${themeClasses.textSecondary}`}>
                {item.percentage.toFixed(1)}% complete
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className={`${themeClasses.cardBg} backdrop-blur-sm border ${themeClasses.border} rounded-xl p-6`}>
          <h3 className={`text-lg font-semibold mb-4 ${themeClasses.text}`}>Exercise Completion</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="subject" stroke={isDarkMode ? '#9ca3af' : '#6b7280'} />
              <YAxis stroke={isDarkMode ? '#9ca3af' : '#6b7280'} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                  border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  color: isDarkMode ? '#ffffff' : '#000000'
                }}
              />
              <Bar dataKey="completed" fill="#f97316" />
              <Bar dataKey="total" fill="#ef4444" opacity={0.3} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className={`${themeClasses.cardBg} backdrop-blur-sm border ${themeClasses.border} rounded-xl p-6`}>
          <h3 className={`text-lg font-semibold mb-4 ${themeClasses.text}`}>Completion Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ProgressDashboard;
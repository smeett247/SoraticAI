import React, { useState } from 'react';
import { Shield, User, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';

interface AdminAuthPageProps {
  onBack: () => void;
  onLogin: (username: string, password: string) => Promise<boolean>;
  isDarkMode: boolean;
}

const AdminAuthPage: React.FC<AdminAuthPageProps> = ({ onBack, onLogin, isDarkMode }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await onLogin(username, password);
      if (!success) {
        setError('Invalid admin credentials');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-500 flex items-center justify-center p-6 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-black'}`}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 rounded-full opacity-10 blur-3xl bg-red-500 -top-48 -right-48"></div>
        <div className="absolute w-96 h-96 rounded-full opacity-10 blur-3xl bg-blue-500 -bottom-48 -left-48"></div>
      </div>
      
      <div className="relative w-full max-w-md">
        <div className={`relative p-8 rounded-3xl backdrop-blur-md border transition-all duration-300 shadow-2xl ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
          <button
            onClick={onBack}
            className={`absolute top-6 left-6 p-2 rounded-xl transition-all duration-300 hover:scale-110 ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}
          >
            <ArrowLeft className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-black'}`} />
          </button>

          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-xl ${isDarkMode ? 'bg-red-500/20' : 'bg-red-500/10'}`}>
              <Shield className={`w-10 h-10 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
            </div>
            <h1 className={`text-3xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-black'}`}>
              <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                Admin Access
              </span>
            </h1>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Secure administrator portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <User className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-all duration-300 ${isDarkMode ? 'text-gray-400 group-focus-within:text-red-400' : 'text-gray-500 group-focus-within:text-red-500'}`} />
              <input
                type="text"
                placeholder="Admin Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full pl-12 pr-4 py-4 rounded-2xl border backdrop-blur-sm transition-all duration-300 focus:outline-none focus:scale-105 ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-red-400/50 focus:bg-white/10' : 'bg-black/5 border-black/10 text-black placeholder-gray-500 focus:border-red-500/50 focus:bg-black/10'}`}
                required
              />
            </div>

            <div className="relative group">
              <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-all duration-300 ${isDarkMode ? 'text-gray-400 group-focus-within:text-red-400' : 'text-gray-500 group-focus-within:text-red-500'}`} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Admin Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-12 pr-12 py-4 rounded-2xl border backdrop-blur-sm transition-all duration-300 focus:outline-none focus:scale-105 ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-red-400/50 focus:bg-white/10' : 'bg-black/5 border-black/10 text-black placeholder-gray-500 focus:border-red-500/50 focus:bg-black/10'}`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition-all duration-300 hover:scale-110 ${isDarkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-500'}`}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full py-4 rounded-2xl font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-105 disabled:opacity-50 ${isDarkMode ? 'bg-red-600 hover:bg-red-500' : 'bg-red-600 hover:bg-red-700'} text-white`}
            >
              <span className="relative z-10">
                {isLoading ? 'Authenticating...' : 'Admin Login'}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Demo credentials: admin / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAuthPage;
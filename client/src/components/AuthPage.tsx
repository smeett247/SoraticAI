import React, { useState } from 'react';
import { BookOpen, User, Lock, Mail, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { mockGoogleAuth, mockFacebookAuth, OAuthUser } from '../utils/oauth';

interface AuthPageProps {
  onBack: () => void;
  onLogin: () => void;
  isDarkMode: boolean;
}

const AuthPage: React.FC<AuthPageProps> = ({ onBack, onLogin, isDarkMode }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isOAuthLoading, setIsOAuthLoading] = useState<'google' | 'facebook' | null>(null);

  const themeClasses = {
    bg: isDarkMode ? 'bg-black' : 'bg-gray-50',
    cardBg: isDarkMode ? 'bg-gray-900/90' : 'bg-white/95',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    inputBg: isDarkMode ? 'bg-gray-800/50' : 'bg-white/80',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const endpoint = isLogin 
      ? 'http://localhost:8000/api/auth/login/'
      : 'http://localhost:8000/api/auth/register/';
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (isLogin) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          onLogin();
        } else {
          setToast({message: 'Registration successful! Please login.', type: 'success'});
          setIsLogin(true);
          setFormData({username: '', email: '', password: '', confirmPassword: ''});
        }
      } else {
        setToast({message: data.error || 'Authentication failed', type: 'error'});
      }
    } catch (error) {
      setToast({message: 'Network error occurred', type: 'error'});
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
    setIsOAuthLoading(provider);
    
    try {
      const oauthUser = provider === 'google' 
        ? await mockGoogleAuth() 
        : await mockFacebookAuth();
      
      // Send OAuth user data to backend
      const response = await fetch('http://localhost:8000/api/auth/oauth/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: oauthUser.provider,
          oauth_id: oauthUser.id,
          email: oauthUser.email,
          name: oauthUser.name,
          picture: oauthUser.picture
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin();
      } else {
        setToast({message: data.error || 'OAuth authentication failed', type: 'error'});
      }
    } catch (error) {
      setToast({message: 'Authentication cancelled or failed', type: 'error'});
    } finally {
      setIsOAuthLoading(null);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeClasses.bg} flex items-center justify-center p-4`}>
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-orange-500/5"></div>
      
      <div className={`relative w-full max-w-md ${themeClasses.cardBg} backdrop-blur-sm border ${themeClasses.border} rounded-3xl p-8 shadow-2xl`}>
        <button
          onClick={onBack}
          className={`absolute top-6 left-6 p-2 rounded-lg transition-all duration-200 hover:bg-gray-100/10`}
        >
          <ArrowLeft className={`w-5 h-5 ${themeClasses.text}`} />
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mb-4 shadow-lg">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className={`text-2xl font-bold mb-2 transition-colors duration-300 ${themeClasses.text}`}>
            {isLogin ? 'Welcome Back' : 'Join Us'}
          </h1>
          <p className={`transition-colors duration-300 ${themeClasses.textSecondary}`}>
            {isLogin ? 'Continue your learning journey' : 'Start your Socratic learning adventure'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${themeClasses.textSecondary}`} />
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleInputChange}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.text} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200`}
                required
              />
            </div>

            {!isLogin && (
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${themeClasses.textSecondary}`} />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.text} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200`}
                  required
                />
              </div>
            )}

            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${themeClasses.textSecondary}`} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full pl-12 pr-12 py-3 rounded-xl border ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.text} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded ${themeClasses.textSecondary} hover:text-orange-500 transition-colors`}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {!isLogin && (
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${themeClasses.textSecondary}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.text} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200`}
                  required
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl transition-all duration-200 hover:scale-105 shadow-lg font-semibold"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${themeClasses.border}`}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-2 ${themeClasses.cardBg} ${themeClasses.textSecondary}`}>Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              disabled={isOAuthLoading !== null}
              className={`w-full inline-flex justify-center py-3 px-4 border ${themeClasses.border} rounded-xl shadow-sm ${themeClasses.inputBg} ${themeClasses.text} hover:bg-gray-50/10 transition-all duration-200 disabled:opacity-50`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="ml-2">
                {isOAuthLoading === 'google' ? 'Connecting...' : 'Google'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleOAuthLogin('facebook')}
              disabled={isOAuthLoading !== null}
              className={`w-full inline-flex justify-center py-3 px-4 border ${themeClasses.border} rounded-xl shadow-sm ${themeClasses.inputBg} ${themeClasses.text} hover:bg-gray-50/10 transition-all duration-200 disabled:opacity-50`}
            >
              <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="ml-2">
                {isOAuthLoading === 'facebook' ? 'Connecting...' : 'Facebook'}
              </span>
            </button>
          </div>
        </div>

        {toast && (
          <div className={`mt-4 p-3 rounded-lg ${toast.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
            {toast.message}
          </div>
        )}

        <div className="mt-6 text-center">
          <p className={`text-sm ${themeClasses.textSecondary}`}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-orange-500 hover:text-orange-600 font-semibold transition-colors"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
import React, { useState, useEffect } from 'react';
import { Brain, User, Lock, Mail, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { mockGoogleAuth, mockFacebookAuth, OAuthUser } from '../utils/oauth';

interface AuthPageProps {
  onBack: () => void;
  onLogin: () => void;
  isDarkMode: boolean;
}

const AuthPage: React.FC<AuthPageProps> = ({ onBack, onLogin, isDarkMode }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isOAuthLoading, setIsOAuthLoading] = useState<'google' | 'facebook' | null>(null);

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);



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
    <div className={`min-h-screen transition-all duration-700 flex items-center justify-center p-6 ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-96 h-96 rounded-full opacity-10 blur-3xl transition-all duration-1000 ease-out"
          style={{
            background: isDarkMode ? 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' : 'radial-gradient(circle, #e2e8f0 0%, transparent 70%)',
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        />
      </div>
      
      <div className={`relative w-full max-w-md transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
        <div className={`relative p-8 rounded-3xl backdrop-blur-sm border transition-all duration-300 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
          <button
            onClick={onBack}
            className={`absolute top-6 left-6 p-2 rounded-xl transition-all duration-300 hover:scale-110 ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}
          >
            <ArrowLeft className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-black'}`} />
          </button>

          <div className={`text-center mb-8 transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 transition-all duration-700 ${mounted ? 'scale-100 rotate-0' : 'scale-0 rotate-180'} ${isDarkMode ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20' : 'bg-gradient-to-br from-blue-100 to-purple-100'}`}>
              <Brain className={`w-10 h-10 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <h1 className={`text-3xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-black'}`}>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {isLogin ? 'Welcome Back' : 'Join SorasticAI'}
              </span>
            </h1>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {isLogin ? 'Continue your learning journey' : 'Start your AI-powered learning adventure'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className={`space-y-6 transition-all duration-1000 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="space-y-4">
              <div className="relative group">
                <User className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-all duration-300 ${isDarkMode ? 'text-gray-400 group-focus-within:text-blue-400' : 'text-gray-500 group-focus-within:text-blue-500'}`} />
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`w-full pl-12 pr-4 py-4 rounded-2xl border backdrop-blur-sm transition-all duration-300 focus:outline-none focus:scale-105 ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-blue-400/50 focus:bg-white/10' : 'bg-black/5 border-black/10 text-black placeholder-gray-500 focus:border-blue-500/50 focus:bg-black/10'}`}
                  required
                />
              </div>

              {!isLogin && (
                <div className="relative group">
                  <Mail className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-all duration-300 ${isDarkMode ? 'text-gray-400 group-focus-within:text-blue-400' : 'text-gray-500 group-focus-within:text-blue-500'}`} />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-4 rounded-2xl border backdrop-blur-sm transition-all duration-300 focus:outline-none focus:scale-105 ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-blue-400/50 focus:bg-white/10' : 'bg-black/5 border-black/10 text-black placeholder-gray-500 focus:border-blue-500/50 focus:bg-black/10'}`}
                    required
                  />
                </div>
              )}

              <div className="relative group">
                <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-all duration-300 ${isDarkMode ? 'text-gray-400 group-focus-within:text-blue-400' : 'text-gray-500 group-focus-within:text-blue-500'}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-12 pr-12 py-4 rounded-2xl border backdrop-blur-sm transition-all duration-300 focus:outline-none focus:scale-105 ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-blue-400/50 focus:bg-white/10' : 'bg-black/5 border-black/10 text-black placeholder-gray-500 focus:border-blue-500/50 focus:bg-black/10'}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition-all duration-300 hover:scale-110 ${isDarkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-500 hover:text-blue-500'}`}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {!isLogin && (
                <div className="relative group">
                  <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-all duration-300 ${isDarkMode ? 'text-gray-400 group-focus-within:text-blue-400' : 'text-gray-500 group-focus-within:text-blue-500'}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-4 rounded-2xl border backdrop-blur-sm transition-all duration-300 focus:outline-none focus:scale-105 ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-blue-400/50 focus:bg-white/10' : 'bg-black/5 border-black/10 text-black placeholder-gray-500 focus:border-blue-500/50 focus:bg-black/10'}`}
                    required
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              className={`group relative w-full py-4 rounded-2xl font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-white text-black hover:bg-gray-100' : 'bg-black text-white hover:bg-gray-800'}`}
            >
              <span className="relative z-10">
                {isLogin ? 'Sign In' : 'Create Account'}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </form>

          <div className={`mt-8 transition-all duration-1000 delay-600 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${isDarkMode ? 'border-white/10' : 'border-black/10'}`}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-4 ${isDarkMode ? 'bg-black text-gray-400' : 'bg-white text-gray-500'}`}>
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleOAuthLogin('google')}
                disabled={isOAuthLoading !== null}
                className={`group w-full inline-flex justify-center items-center py-4 px-4 border rounded-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105 disabled:opacity-50 ${isDarkMode ? 'border-white/10 bg-white/5 text-white hover:bg-white/10' : 'border-black/10 bg-black/5 text-black hover:bg-black/10'}`}
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="ml-2 font-medium">
                  {isOAuthLoading === 'google' ? 'Connecting...' : 'Google'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleOAuthLogin('facebook')}
                disabled={isOAuthLoading !== null}
                className={`group w-full inline-flex justify-center items-center py-4 px-4 border rounded-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105 disabled:opacity-50 ${isDarkMode ? 'border-white/10 bg-white/5 text-white hover:bg-white/10' : 'border-black/10 bg-black/5 text-black hover:bg-black/10'}`}
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="ml-2 font-medium">
                  {isOAuthLoading === 'facebook' ? 'Connecting...' : 'Facebook'}
                </span>
              </button>
            </div>
          </div>

          {toast && (
            <div className={`mt-6 p-4 rounded-2xl backdrop-blur-sm border transition-all duration-300 ${toast.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
              {toast.message}
            </div>
          )}

          <div className={`mt-8 text-center transition-all duration-1000 delay-800 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold hover:scale-105 transition-transform duration-300"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
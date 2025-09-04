import React from 'react';

interface OAuthLoginProps {
  isDarkMode: boolean;
  onSuccess: (userData: any) => void;
}

const OAuthLogin: React.FC<OAuthLoginProps> = ({ isDarkMode, onSuccess }) => {
  const themeClasses = {
    bg: isDarkMode ? 'bg-slate-950' : 'bg-slate-50',
    cardBg: isDarkMode ? 'bg-slate-900/95' : 'bg-white/95',
    text: isDarkMode ? 'text-slate-100' : 'text-slate-900',
    border: isDarkMode ? 'border-slate-800' : 'border-slate-200',
  };

  const handleGoogleLogin = () => {
    // Mock Google OAuth - in production, use Google OAuth SDK
    const mockGoogleUser = {
      id: 'google_' + Date.now(),
      email: 'user@gmail.com',
      name: 'Google User',
      provider: 'google'
    };
    
    // Simulate OAuth popup
    const popup = window.open('about:blank', 'google-oauth', 'width=500,height=600');
    if (popup) {
      popup.document.write(`
        <html>
          <head><title>Google OAuth</title></head>
          <body style="font-family: Arial; padding: 20px; text-align: center;">
            <h2>Google OAuth Simulation</h2>
            <p>In production, this would be Google's OAuth page.</p>
            <button onclick="window.opener.postMessage({type: 'oauth-success', user: ${JSON.stringify(mockGoogleUser)}}, '*'); window.close();" 
                    style="background: #4285f4; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
              Continue with Google
            </button>
          </body>
        </html>
      `);
    }
  };

  const handleFacebookLogin = () => {
    // Mock Facebook OAuth
    const mockFacebookUser = {
      id: 'facebook_' + Date.now(),
      email: 'user@facebook.com',
      name: 'Facebook User',
      provider: 'facebook'
    };
    
    const popup = window.open('about:blank', 'facebook-oauth', 'width=500,height=600');
    if (popup) {
      popup.document.write(`
        <html>
          <head><title>Facebook OAuth</title></head>
          <body style="font-family: Arial; padding: 20px; text-align: center;">
            <h2>Facebook OAuth Simulation</h2>
            <p>In production, this would be Facebook's OAuth page.</p>
            <button onclick="window.opener.postMessage({type: 'oauth-success', user: ${JSON.stringify(mockFacebookUser)}}, '*'); window.close();" 
                    style="background: #1877f2; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
              Continue with Facebook
            </button>
          </body>
        </html>
      `);
    }
  };

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'oauth-success') {
        onSuccess(event.data.user);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSuccess]);

  return (
    <div className="space-y-3">
      <button
        onClick={handleGoogleLogin}
        className={`w-full flex items-center justify-center space-x-3 py-3 px-4 border ${themeClasses.border} rounded-xl transition-all duration-200 hover:scale-105 ${themeClasses.cardBg} ${themeClasses.text}`}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span>Continue with Google</span>
      </button>

      <button
        onClick={handleFacebookLogin}
        className={`w-full flex items-center justify-center space-x-3 py-3 px-4 border ${themeClasses.border} rounded-xl transition-all duration-200 hover:scale-105 ${themeClasses.cardBg} ${themeClasses.text}`}
      >
        <svg className="w-5 h-5" fill="#1877f2" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        <span>Continue with Facebook</span>
      </button>
    </div>
  );
};

export default OAuthLogin;
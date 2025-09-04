import React, { useEffect, useState } from 'react';
import { ArrowRight, Brain, Mic, Camera, Bot, MessageSquare, TrendingUp, Sparkles, Zap, Target } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  isDarkMode: boolean;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, isDarkMode }) => {
  const [mounted, setMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className={`min-h-screen transition-all duration-700 ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl transition-all duration-1000 ease-out"
          style={{
            background: isDarkMode ? 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' : 'radial-gradient(circle, #e2e8f0 0%, transparent 70%)',
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className={`transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <div className="mb-8">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-8 transition-all duration-700 ${mounted ? 'scale-100 rotate-0' : 'scale-0 rotate-180'} ${isDarkMode ? 'bg-white/10 backdrop-blur-sm' : 'bg-black/5 backdrop-blur-sm'}`}>
                <Brain className={`w-10 h-10 ${isDarkMode ? 'text-white' : 'text-black'}`} />
              </div>
              
              <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                  SorasticAI
                </span>
              </h1>
              
              <p className={`text-xl md:text-2xl mb-12 leading-relaxed max-w-2xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Advanced AI-powered learning platform that adapts to your pace and style.
                <span className="block mt-2 font-medium">Master any subject through intelligent conversation.</span>
              </p>
            </div>
            
            <div className={`flex flex-col sm:flex-row gap-6 justify-center mb-16 transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <button
                onClick={onGetStarted}
                className={`group relative px-8 py-4 rounded-full font-semibold text-lg overflow-hidden transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-white text-black hover:bg-gray-100' : 'bg-black text-white hover:bg-gray-800'}`}
              >
                <span className="relative z-10 flex items-center">
                  Start Learning
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
              
              <button className={`px-8 py-4 rounded-full font-semibold text-lg border-2 transition-all duration-300 hover:scale-105 ${isDarkMode ? 'border-white/20 hover:border-white/40 hover:bg-white/5' : 'border-black/20 hover:border-black/40 hover:bg-black/5'}`}>
                Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div className={`grid grid-cols-3 gap-8 max-w-lg mx-auto transition-all duration-1000 delay-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              {[
                { number: '50K+', label: 'Learners' },
                { number: '200+', label: 'Subjects' },
                { number: '95%', label: 'Success Rate' }
              ].map((stat, i) => (
                <div key={i} className="text-center group cursor-default">
                  <div className={`text-3xl font-bold mb-2 transition-all duration-300 group-hover:scale-110 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                    {stat.number}
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`py-32 ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50/50'}`}>
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Intelligent Features
              </span>
            </h2>
            <p className={`text-xl max-w-2xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Cutting-edge AI technology that revolutionizes how you learn
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Brain,
                title: 'Adaptive AI',
                description: 'Learns your style and adjusts difficulty in real-time for optimal learning efficiency.'
              },
              {
                icon: MessageSquare,
                title: 'Socratic Method',
                description: 'Guides you through questions that build deep understanding and critical thinking.'
              },
              {
                icon: TrendingUp,
                title: 'Smart Analytics',
                description: 'Track progress with detailed insights and personalized learning recommendations.'
              }
            ].map((feature, index) => (
              <div key={index} className={`group relative p-8 rounded-3xl transition-all duration-500 hover:scale-105 hover:-translate-y-4 cursor-default ${isDarkMode ? 'bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10' : 'bg-white/80 hover:bg-white backdrop-blur-sm border border-black/10'}`}>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${isDarkMode ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20' : 'bg-gradient-to-br from-blue-100 to-purple-100'}`}>
                  <feature.icon className={`w-8 h-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  {feature.title}
                </h3>
                <p className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {feature.description}
                </p>
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="py-32">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-12">
                <div>
                  <h2 className="text-5xl md:text-6xl font-bold mb-6">
                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      Next-Gen AI
                    </span>
                  </h2>
                  <p className={`text-xl leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Experience the future of personalized learning with advanced AI capabilities.
                  </p>
                </div>
                
                {[
                  {
                    icon: Mic,
                    title: 'Voice Learning',
                    description: 'Natural conversations with AI that understands context and adapts to your speaking style.'
                  },
                  {
                    icon: Camera,
                    title: 'Visual Recognition',
                    description: 'Upload images, diagrams, or handwritten notes for instant AI analysis and explanation.'
                  },
                  {
                    icon: Sparkles,
                    title: 'Adaptive Intelligence',
                    description: 'AI that learns from every interaction to provide increasingly personalized guidance.'
                  }
                ].map((capability, index) => (
                  <div key={index} className="group flex items-start space-x-6 hover:translate-x-2 transition-all duration-300">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${isDarkMode ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/20' : 'bg-gradient-to-br from-purple-100 to-blue-100'}`}>
                      <capability.icon className={`w-7 h-7 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                        {capability.title}
                      </h3>
                      <p className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {capability.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className={`relative p-8 rounded-3xl ${isDarkMode ? 'bg-white/5 backdrop-blur-sm border border-white/10' : 'bg-black/5 backdrop-blur-sm border border-black/10'}`}>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-3xl" />
                <div className="relative">
                  <h3 className={`text-2xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                    Learning Performance
                  </h3>
                  <div className="space-y-6">
                    {[
                      { metric: 'Retention Rate', value: 94 },
                      { metric: 'Engagement Score', value: 89 },
                      { metric: 'Completion Rate', value: 96 },
                      { metric: 'Satisfaction', value: 92 }
                    ].map((outcome, index) => (
                      <div key={index} className="group">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {outcome.metric}
                          </span>
                          <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                            {outcome.value}%
                          </span>
                        </div>
                        <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`}>
                          <div 
                            className="h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${outcome.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-32 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 to-black' : 'bg-gradient-to-br from-gray-50 to-white'}`}>
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold mb-8">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                Start Learning Today
              </span>
            </h2>
            <p className={`text-xl mb-12 leading-relaxed max-w-2xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Join thousands of learners who are already transforming their knowledge with AI-powered education.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button
                onClick={onGetStarted}
                className={`group relative px-10 py-5 rounded-full font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-white text-black hover:bg-gray-100' : 'bg-black text-white hover:bg-gray-800'}`}
              >
                <span className="relative z-10 flex items-center justify-center">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
              
              <button className={`px-10 py-5 rounded-full font-bold text-lg border-2 transition-all duration-300 hover:scale-105 ${isDarkMode ? 'border-white/30 hover:border-white/50 hover:bg-white/10' : 'border-black/30 hover:border-black/50 hover:bg-black/10'}`}>
                Schedule Demo
              </button>
            </div>
            
            <div className={`mt-16 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No credit card required • Free 14-day trial • Cancel anytime
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
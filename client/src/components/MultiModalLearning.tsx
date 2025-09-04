import React, { useState, useRef } from 'react';
import { Camera, Image, Upload, Zap, Eye, Brain, X } from 'lucide-react';

interface MultiModalLearningProps {
  isDarkMode: boolean;
  onImageAnalysis: (analysis: string) => void;
}

const MultiModalLearning: React.FC<MultiModalLearningProps> = ({ isDarkMode, onImageAnalysis }) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const themeClasses = {
    cardBg: isDarkMode ? 'bg-gray-900/80' : 'bg-white/90',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    inputBg: isDarkMode ? 'bg-gray-800/50' : 'bg-white/80',
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        analyzeImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Camera access denied:', error);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      
      const imageData = canvas.toDataURL('image/png');
      setUploadedImage(imageData);
      analyzeImage(imageData);
      
      // Stop camera
      const stream = video.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  const analyzeImage = async (imageData: string) => {
    setIsAnalyzing(true);
    
    // Simulate AI image analysis
    setTimeout(() => {
      const sampleAnalyses = [
        "I can see a physics diagram showing force vectors. Let me help you understand: What do you think the arrows represent in this diagram?",
        "This appears to be a mathematical graph. What patterns do you notice in the curve? How might the slope change as x increases?",
        "I notice this is a chemistry molecular structure. What do you observe about the bonds between atoms? How might this affect the molecule's properties?",
        "This looks like a circuit diagram. Can you identify the different components? What path do you think the current would take?"
      ];
      
      const randomAnalysis = sampleAnalyses[Math.floor(Math.random() * sampleAnalyses.length)];
      setAnalysisResult(randomAnalysis);
      setIsAnalyzing(false);
      setShowAnalysis(true);
      onImageAnalysis(randomAnalysis);
    }, 2000);
  };

  return (
    <div className="space-y-4">
      {/* Upload Options */}
      <div className={`${themeClasses.cardBg} backdrop-blur-sm border ${themeClasses.border} rounded-xl p-4`}>
        <div className="flex items-center space-x-2 mb-4">
          <Eye className="w-5 h-5 text-purple-500" />
          <span className={`font-medium ${themeClasses.text}`}>Visual Learning Assistant</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center space-y-2 p-4 border-2 border-dashed border-blue-500/30 rounded-lg hover:border-blue-500/50 hover:bg-blue-500/5 transition-all duration-200"
          >
            <Upload className="w-6 h-6 text-blue-500" />
            <span className={`text-sm font-medium ${themeClasses.text}`}>Upload Image</span>
            <span className={`text-xs ${themeClasses.textSecondary}`}>Diagrams, graphs, equations</span>
          </button>
          
          <button
            onClick={startCamera}
            disabled={cameraActive}
            className="flex flex-col items-center space-y-2 p-4 border-2 border-dashed border-green-500/30 rounded-lg hover:border-green-500/50 hover:bg-green-500/5 transition-all duration-200 disabled:opacity-50"
          >
            <Camera className="w-6 h-6 text-green-500" />
            <span className={`text-sm font-medium ${themeClasses.text}`}>Take Photo</span>
            <span className={`text-xs ${themeClasses.textSecondary}`}>Capture live problems</span>
          </button>
          
          <div className="flex flex-col items-center space-y-2 p-4 border-2 border-dashed border-purple-500/30 rounded-lg">
            <Brain className="w-6 h-6 text-purple-500" />
            <span className={`text-sm font-medium ${themeClasses.text}`}>AI Analysis</span>
            <span className={`text-xs ${themeClasses.textSecondary}`}>Instant understanding</span>
          </div>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {/* Camera View */}
      {cameraActive && (
        <div className={`${themeClasses.cardBg} backdrop-blur-sm border ${themeClasses.border} rounded-xl p-4`}>
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full max-w-md mx-auto rounded-lg"
            />
            <div className="flex justify-center mt-4 space-x-3">
              <button
                onClick={captureImage}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-200"
              >
                Capture & Analyze
              </button>
              <button
                onClick={() => {
                  const stream = videoRef.current?.srcObject as MediaStream;
                  stream?.getTracks().forEach(track => track.stop());
                  setCameraActive(false);
                }}
                className={`px-4 py-2 border ${themeClasses.border} rounded-lg ${themeClasses.text} hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview & Analysis */}
      {uploadedImage && (
        <div className={`${themeClasses.cardBg} backdrop-blur-sm border ${themeClasses.border} rounded-xl p-4`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Image className="w-5 h-5 text-blue-500" />
              <span className={`font-medium ${themeClasses.text}`}>Image Analysis</span>
            </div>
            <button
              onClick={() => {
                setUploadedImage(null);
                setAnalysisResult('');
                setShowAnalysis(false);
              }}
              className={`p-1 rounded ${themeClasses.textSecondary} hover:${themeClasses.text}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <img
                src={uploadedImage}
                alt="Uploaded content"
                className="w-full max-w-sm mx-auto rounded-lg shadow-lg"
              />
            </div>
            
            <div className="space-y-3">
              {isAnalyzing ? (
                <div className="flex items-center space-x-3 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                  <div>
                    <p className={`font-medium ${themeClasses.text}`}>Analyzing image...</p>
                    <p className={`text-sm ${themeClasses.textSecondary}`}>AI is examining the visual content</p>
                  </div>
                </div>
              ) : showAnalysis && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className={`font-medium ${themeClasses.text}`}>AI Insights</span>
                  </div>
                  <div className={`p-4 ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100/50'} rounded-lg`}>
                    <p className={`${themeClasses.text} leading-relaxed`}>{analysisResult}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-xs bg-blue-500/20 text-blue-500 rounded-full hover:bg-blue-500/30 transition-all duration-200">
                      Ask follow-up
                    </button>
                    <button className="px-3 py-1 text-xs bg-green-500/20 text-green-500 rounded-full hover:bg-green-500/30 transition-all duration-200">
                      Get explanation
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default MultiModalLearning;
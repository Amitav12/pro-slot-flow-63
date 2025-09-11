import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentText, setCurrentText] = useState(0);

  const loadingTexts = [
    "Service NB Link",
    "Home services at your doorstep",
    "Connecting you with professionals",
    "Almost ready..."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    const textTimer = setInterval(() => {
      setCurrentText(prev => (prev + 1) % loadingTexts.length);
    }, 800);

    return () => {
      clearInterval(timer);
      clearInterval(textTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-50 to-violet-100 flex items-center justify-center z-50">
      <div className="text-center space-y-6">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-violet-700 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-700 bg-clip-text text-transparent">
            Service NB Link
          </span>
        </div>
    
        {/* Animated Spinner */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-violet-500 rounded-full animate-spin mx-auto" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
        </div>
    
        {/* Loading Text */}
        <div className="space-y-2">
          <p className="text-purple-700 font-medium text-lg animate-pulse">
            {loadingTexts[currentText]}
          </p>
          
          {/* Progress Bar */}
          <div className="w-64 h-2 bg-purple-100 rounded-full mx-auto overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-600 to-violet-700 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <p className="text-purple-500 text-sm">
            {progress}% Complete
          </p>
        </div>
      </div>
    </div>
  );
};
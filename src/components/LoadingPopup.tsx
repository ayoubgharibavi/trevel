import React from 'react';

interface LoadingPopupProps {
  isVisible?: boolean;
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

const LoadingPopup: React.FC<LoadingPopupProps> = ({ 
  isVisible = true, 
  message = 'در حال بارگذاری...', 
  size = 'medium' 
}) => {
  if (!isVisible) return null;

  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm mx-4">
        <div className="flex flex-col items-center space-y-4">
          {/* Spinner */}
          <div className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}></div>
          
          {/* Message */}
          <p className="text-gray-700 text-center font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingPopup;
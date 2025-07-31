// src/components/common/QuestionCard.tsx
import React from 'react';

interface QuestionCardProps {
  children: React.ReactNode;
  title?: string;
  level?: 'junior' | 'middle' | 'senior';
  timeEstimate?: number;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ children, title, level, timeEstimate }) => {
  let borderColorClass = '';
  switch (level) {
    case 'junior':
      borderColorClass = 'border-blue-500';
      break;
    case 'middle':
      borderColorClass = 'border-yellow-500';
      break;
    case 'senior':
      borderColorClass = 'border-red-500';
      break;
    default:
      borderColorClass = 'border-gray-600';
  }

  return (
    <div className={`bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-lg shadow-xl p-6 md:p-8
                    max-w-3xl w-full border-t-4 ${borderColorClass} transition-all duration-300 ease-in-out`}>

      <div className="flex justify-between items-center mb-6">
        {title && <h2 className="text-xl md:text-2xl font-semibold text-gray-200">{title}</h2>}
        <div className="flex items-center space-x-4">
          {level && (
            <span className={`text-sm font-medium px-3 py-1 rounded-full
                              ${level === 'junior' ? 'bg-blue-600 text-white' : ''}
                              ${level === 'middle' ? 'bg-yellow-600 text-white' : ''}
                              ${level === 'senior' ? 'bg-red-600 text-white' : ''}`}>
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </span>
          )}
          {timeEstimate && (
            <span className="text-sm text-gray-400 flex items-center">
              <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              {timeEstimate} сек.
            </span>
          )}
        </div>
      </div>

      <div className="text-lg text-gray-100 leading-relaxed">
        {children}
      </div>
    </div>
  );
};

export default QuestionCard;

// src/components/test/MultipleChoiceQuestion.tsx

import React from 'react';
import { Question, Option } from '../../types/test';

interface MultipleChoiceQuestionProps {
  question: Question;
  onAnswerSelect: (questionId: string, selectedOptionId: string) => void;
  selectedAnswerId?: string; // Пропс для текущего выбранного ответа
}

const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
  question,
  onAnswerSelect,
  selectedAnswerId,
}) => {
  // --- ДОБАВЬТЕ ЭТУ СТРОКУ ---
  console.log(`Вопрос "${question.text.substring(0, 30)}...": selectedAnswerId =`, selectedAnswerId);
  // --- КОНЕЦ ДОБАВЛЯЕМОЙ СТРОКИ ---

  return (
    <div className="space-y-4">
      <p className="text-xl text-gray-200 mb-8 leading-relaxed">{question.text}</p>
      {question.options && question.options.map((option: Option) => (
        <div
          key={option.id}
          className={`relative flex items-center p-4 rounded-lg cursor-pointer transition duration-200 ease-in-out
                      ${selectedAnswerId === option.id
                          ? 'bg-blue-700/70 text-white shadow-lg border-blue-600'
                          : 'bg-gray-700/50 hover:bg-gray-600/70 border-gray-600'
                      }
                      border`}
          onClick={() => onAnswerSelect(question.id, option.id)}
        >
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center mr-4 flex-shrink-0
                        ${selectedAnswerId === option.id
                            ? 'bg-white border-blue-400'
                            : 'bg-gray-600 border-gray-500'
                        }
                        border-2`}
          >
            {selectedAnswerId === option.id && (
              <div className="w-2.5 h-2.5 bg-blue-700 rounded-full"></div>
            )}
          </div>
          <span className="text-lg">{option.text}</span>
        </div>
      ))}
    </div>
  );
};

export default MultipleChoiceQuestion;

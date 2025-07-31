// src/components/test/MultipleChoiceQuestion.tsx
import React from 'react';
import { Question, Option } from '../../types/test'; // Импортируем типы

interface MultipleChoiceQuestionProps {
  question: Question;
  onAnswerSelect: (questionId: string, selectedOptionId: string) => void;
  selectedAnswerId?: string; // Опционально: для отображения выбранного ответа
}

const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
  question,
  onAnswerSelect,
  selectedAnswerId,
}) => {
  // Убедимся, что у вопроса есть опции и он правильного типа
  if (question.type !== 'multiple-choice' || !question.options) {
    return <p className="text-red-400">Ошибка: Некорректный тип вопроса или отсутствуют опции для MultipleChoiceQuestion.</p>;
  }

  return (
    <div className="space-y-4">
      {/* Текст вопроса */}
      <p className="text-xl font-medium text-gray-50 mb-6">{question.text}</p>

      {/* Варианты ответов */}
      <div className="space-y-3">
        {question.options.map((option: Option) => (
          <label
            key={option.id}
            className={`flex items-center p-4 rounded-lg cursor-pointer transition duration-200 ease-in-out
                       ${selectedAnswerId === option.id
                          ? 'bg-blue-700 bg-opacity-70 text-white shadow-md border-blue-500 border'
                          : 'bg-gray-700 bg-opacity-50 text-gray-200 hover:bg-gray-600 hover:bg-opacity-70'}`}
          >
            <input
              type="radio"
              name={`question-${question.id}`} // Используем id вопроса для группировки radio-кнопок
              value={option.id}
              checked={selectedAnswerId === option.id}
              onChange={() => onAnswerSelect(question.id, option.id)}
              className="form-radio h-5 w-5 text-blue-500 bg-gray-900 border-gray-500 focus:ring-blue-400"
            />
            <span className="ml-4 text-lg">{option.text}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default MultipleChoiceQuestion;

import React from 'react';
import { Question, UserAnswer, QuestionLevel } from '../../types/test.d'; // Обновленный импорт для QuestionLevel

/**
 * @interface QuestionRendererProps
 * @description Пропсы для компонента QuestionRenderer.
 * @property {Question} question - Объект текущего вопроса для отображения.
 * @property {number} currentQuestionIndex - Текущий индекс вопроса (начиная с 0).
 * @property {number} totalQuestions - Общее количество вопросов в тесте.
 * @property {(questionId: string, selectedOptionId: string) => void} onAnswerSelect - Колбэк-функция для обработки выбора ответа.
 * @property {UserAnswer | undefined} currentUserAnswer - Текущий ответ пользователя на этот вопрос, если есть.
 * @property {() => void} onNextQuestion - Колбэк-функция для перехода к следующему вопросу.
 * @property {() => void} onPreviousQuestion - Колбэк-функция для перехода к предыдущему вопросу.
 * @property {boolean} isFirstQuestion - Флаг, указывающий, является ли текущий вопрос первым.
 * @property {boolean} isLastQuestion - Флаг, указывающий, является ли текущий вопрос последним.
 * @property {number} remainingTime - Оставшееся время для ответа на текущий вопрос в секундах.
 * @property {number} progressPercentage - Процент выполнения теста.
 */
interface QuestionRendererProps {
  question: Question;
  currentQuestionIndex: number;
  totalQuestions: number;
  onAnswerSelect: (questionId: string, selectedOptionId: string) => void;
  currentUserAnswer: UserAnswer | undefined;
  onNextQuestion: () => void;
  onPreviousQuestion: () => void;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  remainingTime: number;
  progressPercentage: number;
}

/**
 * @function formatTime
 * @description Форматирует количество секунд в строку "ММ:СС".
 * @param {number} seconds - Количество секунд.
 * @returns {string} Отформатированная строка времени.
 */
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * @function getLevelColor
 * @description Возвращает цвет для уровня сложности вопроса.
 * @param {QuestionLevel} level - Уровень сложности вопроса.
 * @returns {string} Строка с классом Tailwind CSS для цвета.
 */
const getLevelColor = (level: QuestionLevel): string => {
    switch (level) {
        case 'junior': return 'text-green-400';
        case 'middle': return 'text-yellow-400';
        case 'senior': return 'text-red-400';
        default: return 'text-gray-400';
    }
};

/**
 * @function QuestionRenderer
 * @description React компонент для отображения одного вопроса теста, его вариантов ответов,
 * таймера и навигационных кнопок.
 * @param {QuestionRendererProps} props - Пропсы компонента.
 * @returns {JSX.Element} Рендеринг компонента вопроса.
 */
const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  currentQuestionIndex,
  totalQuestions,
  onAnswerSelect,
  currentUserAnswer,
  onNextQuestion,
  onPreviousQuestion,
  isFirstQuestion,
  isLastQuestion,
  remainingTime,
  progressPercentage,
}) => {
  const selectedOptionId = currentUserAnswer?.selectedOptionId || '';

  return (
    <div className="bg-white bg-opacity-5 rounded-xl shadow-2xl backdrop-blur-md p-8 max-w-3xl w-full mx-auto border border-gray-700/50">
      {/* Progress Bar */}
      <div className="w-full bg-gray-700 rounded-full h-2.5 mb-6">
        <div
          className="bg-purple-600 h-2.5 rounded-full"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      <div className="flex justify-between items-center mb-6 text-gray-400 text-sm">
        <span>Вопрос {currentQuestionIndex + 1} из {totalQuestions}</span>
        <span className={`font-semibold ${getLevelColor(question.level)}`}>
            Уровень: {question.level.charAt(0).toUpperCase() + question.level.slice(1)}
        </span>
        <span className="font-semibold text-white">Время: {formatTime(remainingTime)}</span>
      </div>

      <h2 className="text-2xl font-bold text-white mb-6 leading-relaxed">{question.text}</h2>

      {question.type === 'multiple-choice' && (
        <div className="space-y-4">
          {question.options.map((option) => (
            <button
              key={option.id}
              onClick={() => onAnswerSelect(question.id, option.id)}
              className={`
                w-full text-left p-4 rounded-lg transition duration-200 ease-in-out
                ${selectedOptionId === option.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75
              `}
            >
              {option.text}
            </button>
          ))}
        </div>
      )}

      {/* Кнопки навигации */}
      <div className="flex justify-between mt-8">
        <button
          onClick={onPreviousQuestion}
          disabled={isFirstQuestion}
          className={`
            bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-full shadow-lg
            transition duration-300 ease-in-out transform hover:scale-105
            ${isFirstQuestion ? 'opacity-50 cursor-not-allowed' : ''}
            focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50
          `}
        >
          Предыдущий
        </button>
        <button
          onClick={onNextQuestion}
          className={`
            bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg
            transition duration-300 ease-in-out transform hover:scale-105
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
          `}
        >
          {isLastQuestion ? 'Завершить Тест' : 'Следующий'}
        </button>
      </div>
    </div>
  );
};

export default QuestionRenderer;

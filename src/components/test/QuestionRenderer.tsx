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
 * @property {(isLastQuestion: boolean) => void} onNextQuestion - Колбэк-функция для перехода к следующему вопросу. Обновлено для передачи флага завершения теста.
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
  onNextQuestion: (isLastQuestion: boolean) => void; 
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
 * @description Возвращает цвет для уровня сложности вопроса, используя цвета Баухаус.
 * @param {QuestionLevel} level - Уровень сложности вопроса.
 * @returns {string} Строка с классом Tailwind CSS для цвета.
 */
const getLevelColor = (level: QuestionLevel): string => {
    switch (level) {
        case 'junior': return 'text-bauhaus-blue';    // Используем синий Баухаус
        case 'middle': return 'text-bauhaus-yellow';  // Используем желтый Баухаус
        case 'senior': return 'text-bauhaus-red';     // Используем красный Баухаус
        default: return 'text-bauhaus-gray';          // Используем серый Баухаус
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
    <div className="bg-white bg-opacity-5 rounded-xl shadow-2xl backdrop-blur-md p-6 sm:p-8 max-w-3xl w-full mx-auto border border-gray-700/50">
      {/* Progress Bar */}
      <div className="w-full bg-gray-700 rounded-full h-2.5 mb-6">
        <div
          className="bg-bauhaus-yellow h-2.5 rounded-full transition-all duration-500 ease-in-out" // Используем bauhaus-yellow для прогресс-бара, добавил transition
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      <div className="flex justify-between items-center mb-6 text-gray-400 text-sm font-sans">
        <span>Вопрос {currentQuestionIndex + 1} из {totalQuestions}</span>
        <span className={`font-semibold ${getLevelColor(question.level)}`}>
            Уровень: {question.level.charAt(0).toUpperCase() + question.level.slice(1)}
        </span>
        <span className="font-semibold text-bauhaus-white">Время: {formatTime(remainingTime)}</span> {/* text-bauhaus-white */}
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-bauhaus-white mb-6 leading-relaxed font-heading">{question.text}</h2> {/* font-heading и text-bauhaus-white */}

      {question.type === 'multiple-choice' && (
        <div className="space-y-3 sm:space-y-4">
          {question.options.map((option) => (
            <button
              key={option.id}
              onClick={() => onAnswerSelect(question.id, option.id)}
              className={`
                w-full text-left py-3 px-4 rounded-lg transition duration-200 ease-in-out
                ${selectedOptionId === option.id
                  ? 'bg-bauhaus-blue text-bauhaus-white shadow-md' // ИСПОЛЬЗУЕМ bauhaus-blue
                  : 'bg-bauhaus-dark-gray hover:bg-bauhaus-gray text-bauhaus-white' // ИСПОЛЬЗУЕМ bauhaus-dark-gray и bauhaus-gray
                }
                focus:outline-none focus:ring-2 focus:ring-bauhaus-blue focus:ring-opacity-75
                text-base sm:text-lg font-sans
              `}
              disabled={currentUserAnswer !== undefined} // Отключаем кнопки после выбора ответа
            >
              {option.text}
            </button>
          ))}
        </div>
      )}

      {/* Кнопки навигации */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 space-y-4 sm:space-y-0 sm:space-x-4">
        {!isFirstQuestion && (
          <button
            onClick={onPreviousQuestion}
            className="w-full sm:w-auto bg-bauhaus-dark-gray hover:bg-bauhaus-gray text-bauhaus-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-bauhaus-gray focus:ring-opacity-50"
          >
            Предыдущий
          </button>
        )}

        {isLastQuestion ? (
          <button
            onClick={() => onNextQuestion(true)}
            className="w-full sm:w-auto bg-bauhaus-red hover:bg-red-700 text-bauhaus-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-bauhaus-red focus:ring-opacity-50"
          >
            Завершить Тест
          </button>
        ) : (
          <button
            onClick={() => onNextQuestion(false)}
            disabled={currentUserAnswer === undefined || currentUserAnswer === null}
            className={`w-full sm:w-auto font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50
              ${(currentUserAnswer === undefined || currentUserAnswer === null)
                  ? 'bg-bauhaus-dark-gray text-bauhaus-gray cursor-not-allowed opacity-70'
                  : 'bg-bauhaus-blue hover:bg-blue-700 text-bauhaus-white focus:ring-bauhaus-blue'
              }`}
          >
            Следующий
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestionRenderer;

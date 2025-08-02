import React from 'react';
import { Question, UserAnswer, QuestionLevel } from '../../types/test.d';

interface QuestionRendererProps {
  question: Question;
  currentQuestionIndex: number;
  totalQuestions: number;
  onAnswerSelect: (questionId: string, selectedOptionId: string) => void;
  currentUserAnswer: UserAnswer | null; // Исправлено на null
  onNextQuestion: (isLastQuestion: boolean) => void;
  onPreviousQuestion: () => void;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  remainingTime: number;
  progressPercentage: number;
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * @function getLevelColor
 * @description Возвращает класс Tailwind CSS для уровня сложности вопроса, используя новую палитру.
 * @param {QuestionLevel} level - Уровень сложности вопроса.
 * @returns {string} Строка с классом Tailwind CSS для цвета.
 */
const getLevelColor = (level: QuestionLevel): string => {
    switch (level) {
        case 'junior': return 'text-level-junior';    // Используем новый серо-голубой
        case 'middle': return 'text-level-middle';    // Используем новый оливково-зеленый
        case 'senior': return 'text-level-senior';    // Используем новый приглушенный серо-красный
        default: return 'text-level-default';        // Используем серо-коричневый для дефолта
    }
};

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
    <div
      className="rounded-xl shadow-2xl backdrop-blur-md p-6 sm:p-8 max-w-3xl w-full mx-auto border"
      style={{
        backgroundColor: 'var(--color-background-card)', // Фон карточки
        backgroundImage: 'var(--texture-grain)', // Зернистость фона карточки
        backgroundSize: '4px 4px',
        backgroundRepeat: 'repeat',
        borderColor: 'var(--color-neutral)', // Легкая рамка
        color: 'var(--color-text-primary)' // Основной цвет текста для всего блока
      }}
    >
      {/* Progress Bar */}
      <div
        className="w-full rounded-full h-2.5 mb-6"
        style={{ backgroundColor: 'var(--color-neutral)' }} // Фон для пустого прогресс-бара
      >
        <div
          className="h-2.5 rounded-full transition-all duration-500 ease-in-out"
          style={{
            width: `${progressPercentage}%`,
            backgroundColor: 'var(--color-accent-primary)', // Цвет заполнения
            backgroundImage: 'var(--texture-grain)', // Зернистость и здесь
            backgroundSize: '4px 4px',
            backgroundRepeat: 'repeat',
          }}
        ></div>
      </div>

      <div className="flex justify-between items-center mb-6 text-sm font-sans" style={{ color: 'var(--color-text-secondary)' }}>
        <span>Вопрос {currentQuestionIndex + 1} из {totalQuestions}</span>
        <span className={`font-semibold ${getLevelColor(question.level)}`}>
          Уровень: {question.level.charAt(0).toUpperCase() + question.level.slice(1)}
        </span>
        <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Время: {formatTime(remainingTime)}</span>
      </div>

      <h2 className="text-xl sm:text-2xl font-bold mb-6 leading-relaxed font-heading" style={{ color: 'var(--color-text-primary)' }}>{question.text}</h2>

      {question.type === 'multiple-choice' && (
        <div className="space-y-3 sm:space-y-4">
          {question.options.map((option) => (
            <button
              key={option.id}
              onClick={() => onAnswerSelect(question.id, option.id)}
              className={`
                w-full text-left py-3 px-4 rounded-lg transition duration-200 ease-in-out border
                ${selectedOptionId === option.id
                  ? 'shadow-md' // Для выбранной опции
                  : 'hover:shadow-md' // Для невыбранной опции
                }
                focus:outline-none focus:ring-2 focus:ring-offset-2
                text-base sm:text-lg font-sans
              `}
              style={{
                backgroundColor: selectedOptionId === option.id
                  ? 'var(--color-accent-primary)' // Выбранная опция - серо-голубой
                  : 'var(--color-background-card)', // Невыбранная опция - цвет карточки
                color: selectedOptionId === option.id
                  ? 'var(--color-button-text)' // Текст на выбранной опции - белый
                  : 'var(--color-text-primary)', // Текст на невыбранной опции - темно-серый
                borderColor: selectedOptionId === option.id
                  ? 'var(--color-accent-primary)' // Рамка выбранной опции - серо-голубой
                  : 'var(--color-option-border)', // Рамка невыбранной опции - светло-серый
                backgroundImage: 'var(--texture-grain)', // Зернистость
                backgroundSize: '4px 4px',
                backgroundRepeat: 'repeat',
                filter: selectedOptionId === option.id ? 'brightness(1.0)' : 'brightness(1.0)', // Начальная яркость
                transition: 'filter 0.3s ease',
              }}
              onMouseEnter={(e) => {
                if (selectedOptionId !== option.id && currentUserAnswer === null) {
                    e.currentTarget.style.filter = 'brightness(0.97)'; // Чуть затемнить невыбранную при наведении
                }
              }}
              onMouseLeave={(e) => {
                if (selectedOptionId !== option.id && currentUserAnswer === null) {
                    e.currentTarget.style.filter = 'brightness(1.0)';
                }
              }}
              disabled={currentUserAnswer !== null} // Отключаем кнопки после выбора ответа
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
            className="w-full sm:w-auto font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-opacity-50"
            style={{
              backgroundColor: 'var(--color-neutral)', // Светло-серый
              color: 'var(--color-text-primary)', // Темно-серый текст
              backgroundImage: 'var(--texture-grain)',
              backgroundSize: '4px 4px',
              backgroundRepeat: 'repeat',
              filter: 'brightness(1.0)',
              transition: 'filter 0.3s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(0.95)')}
            onMouseLeave={(e) => (e.currentTarget.style.filter = 'brightness(1.0)')}
          >
            Предыдущий
          </button>
        )}

        {isLastQuestion ? (
          <button
            onClick={() => onNextQuestion(true)}
            className="w-full sm:w-auto font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-opacity-50"
            style={{
              backgroundColor: 'var(--color-error)', // Приглушенный серо-красный для "Завершить тест"
              color: 'var(--color-button-text)', // Белый текст
              backgroundImage: 'var(--texture-grain)',
              backgroundSize: '4px 4px',
              backgroundRepeat: 'repeat',
              filter: 'brightness(1.0)',
              transition: 'filter 0.3s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.filter = 'brightness(1.0)')}
          >
            Завершить Тест
          </button>
        ) : (
          <button
            onClick={() => onNextQuestion(false)}
            disabled={currentUserAnswer === null} // Теперь currentUserAnswer точно null
            className={`w-full sm:w-auto font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-opacity-50
              ${(currentUserAnswer === null)
                  ? 'cursor-not-allowed opacity-70' // Для disabled
                  : '' // Если не disabled, apply normal styles
              }`}
            style={{
              backgroundColor: (currentUserAnswer === null)
                ? 'var(--color-neutral)' // Если не ответил - нейтральный серый
                : 'var(--color-accent-secondary)', // Если ответил - оливково-зеленый
              color: (currentUserAnswer === null)
                ? 'var(--color-text-secondary)' // Текст на disabled кнопке
                : 'var(--color-button-text)', // Текст на активной кнопке
              backgroundImage: 'var(--texture-grain)',
              backgroundSize: '4px 4px',
              backgroundRepeat: 'repeat',
              filter: (currentUserAnswer === null) ? 'brightness(1.0)' : 'brightness(1.0)',
              transition: 'filter 0.3s ease',
            }}
            onMouseEnter={(e) => {
              if (currentUserAnswer !== null) { // Только если кнопка активна
                e.currentTarget.style.filter = 'brightness(1.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentUserAnswer !== null) { // Только если кнопка активна
                e.currentTarget.style.filter = 'brightness(1.0)';
              }
            }}
          >
            Следующий
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestionRenderer;

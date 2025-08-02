import React from 'react';
import { Question, UserAnswer, QuestionLevel } from '../../types/test.d';

interface QuestionRendererProps {
  question: Question;
  currentQuestionIndex: number;
  totalQuestions: number;
  onAnswerSelect: (questionId: string, selectedOptionId: string) => void;
  currentUserAnswer: UserAnswer | null;
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
    case 'junior': return 'text-level-junior';
    case 'middle': return 'text-level-middle';
    case 'senior': return 'text-level-senior';
    default: return 'text-level-default';
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

  // УНИФИЦИРОВАННЫЕ СТИЛИ ДЛЯ КНОПОК
  // isPrimary: true - для основных кнопок действия (как "Следующий" в активном состоянии)
  // isDanger: true - для кнопок опасного действия (как "Завершить тест")
  // isSecondary: true - для второстепенных кнопок (как "Предыдущий", или "Следующий" в неактивном состоянии)
  const getButtonStyle = (type: 'primary' | 'secondary' | 'danger', isDisabled: boolean = false) => {
    let bgColorVar: string;
    let textColorVar: string;
    let borderColorVar: string;
    let hoverFilter: string;

    if (isDisabled) {
      bgColorVar = 'var(--color-neutral)';
      textColorVar = 'var(--color-text-secondary)';
      borderColorVar = 'var(--color-neutral)'; // Или можно var(--color-text-secondary) для более темной рамки
      hoverFilter = 'brightness(1.0)'; // Нет ховера для disabled
    } else {
      switch (type) {
        case 'primary':
          bgColorVar = 'var(--button-primary-bg)'; // Акцентный синий
          textColorVar = 'var(--button-primary-text)'; // Светлый бежевый
          borderColorVar = 'var(--button-primary-border)'; // Темная рамка
          hoverFilter = 'brightness(0.9)';
          break;
        case 'danger':
          bgColorVar = 'var(--color-error)'; // Оранжево-красный
          textColorVar = 'var(--color-neutral)'; // Светлый бежевый
          borderColorVar = 'var(--color-error)'; // Рамка в цвет кнопки
          hoverFilter = 'brightness(1.1)'; // Чуть светлее при ховере
          break;
        case 'secondary':
        default:
          bgColorVar = 'var(--button-secondary-bg)'; // Светлый бежевый (нейтральный)
          textColorVar = 'var(--button-secondary-text)'; // Темный зеленый
          borderColorVar = 'var(--button-secondary-border)'; // Светлая рамка
          hoverFilter = 'brightness(0.95)';
          break;
      }
    }

    return {
      backgroundColor: bgColorVar,
      color: textColorVar,
      backgroundImage: 'var(--texture-grain)',
      backgroundSize: '4px 4px',
      backgroundRepeat: 'repeat',
      filter: 'brightness(1.0)', // Начальная яркость
      transition: 'filter 0.3s ease',
      border: `1px solid ${borderColorVar}`,
      boxShadow: '2px 2px 0px 0px var(--color-text-primary)', // Эффект "стенки" для кнопок
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      opacity: isDisabled ? 0.7 : 1, // Немного прозрачности для disabled
      '--hover-filter': hoverFilter, // Используем CSS Custom Property для ховера
    };
  };

  const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>, type: 'primary' | 'secondary' | 'danger', isEnter: boolean, isDisabled: boolean) => {
    if (isDisabled) return;
    const hoverFilter = e.currentTarget.style.getPropertyValue('--hover-filter');
    e.currentTarget.style.filter = isEnter ? hoverFilter : 'brightness(1.0)';
  };

  // Стилизация опций вопросов
  const getOptionStyle = (optionId: string, isSelected: boolean, hasAnswered: boolean) => {
    let bgColorVar: string;
    let textColorVar: string;
    let borderColorVar: string;
    let boxShadowVar: string;
    let hoverFilter: string;

    if (isSelected) {
      bgColorVar = 'var(--color-accent-primary)'; // Синий
      textColorVar = 'var(--color-neutral)'; // Светлый бежевый
      borderColorVar = 'var(--color-accent-primary)'; // Синий
      boxShadowVar = '2px 2px 0px 0px var(--color-text-primary)'; // Эффект "стенки" для выбранной
      hoverFilter = 'brightness(1.0)'; // Не менять яркость выбранной при ховере
    } else {
      bgColorVar = 'var(--color-neutral)'; // Светлый бежевый (нейтральный)
      textColorVar = 'var(--color-text-primary)'; // Темный зеленый
      borderColorVar = 'var(--color-text-primary)'; // Темный зеленый (для контраста)
      boxShadowVar = '2px 2px 0px 0px var(--color-text-secondary)'; // Эффект "стенки" для невыбранной
      hoverFilter = 'brightness(0.97)'; // Чуть затемнить при ховере
    }

    return {
      backgroundColor: bgColorVar,
      color: textColorVar,
      backgroundImage: 'var(--texture-grain)',
      backgroundSize: '4px 4px',
      backgroundRepeat: 'repeat',
      border: `1px solid ${borderColorVar}`,
      boxShadow: boxShadowVar,
      filter: 'brightness(1.0)', // Начальная яркость
      transition: 'filter 0.3s ease',
      cursor: hasAnswered ? 'not-allowed' : 'pointer', // Курсор для disabled
      opacity: hasAnswered && !isSelected ? 0.8 : 1, // Невыбранные опции становятся немного прозрачными после ответа
      '--hover-filter-option': hoverFilter, // CSS Custom Property для ховера опций
    };
  };

  const handleOptionHover = (e: React.MouseEvent<HTMLButtonElement>, isSelected: boolean, hasAnswered: boolean, isEnter: boolean) => {
    if (hasAnswered && !isSelected) return; // Не применять ховер к невыбранным после ответа
    if (isSelected && hasAnswered) return; // Не менять яркость выбранной после ответа

    const hoverFilter = e.currentTarget.style.getPropertyValue('--hover-filter-option');
    e.currentTarget.style.filter = isEnter ? hoverFilter : 'brightness(1.0)';
  };

  return (
    <div
      className="rounded-xl shadow-2xl backdrop-blur-md p-6 sm:p-8 max-w-3xl w-full mx-auto"
      style={{
        backgroundColor: 'var(--color-background-card)',
        backgroundImage: 'var(--texture-grain)',
        backgroundSize: '4px 4px',
        backgroundRepeat: 'repeat',
        border: '2px solid var(--color-neutral)', // Более выраженная рамка
        boxShadow: '4px 4px 0px 0px var(--color-neutral)', // Эффект "стенки" для карточки
        color: 'var(--color-text-primary)'
      }}
    >
      {/* Progress Bar */}
      <div
        className="w-full rounded-full h-2.5 mb-6"
        style={{ backgroundColor: 'var(--color-neutral)' }}
      >
        <div
          className="h-2.5 rounded-full transition-all duration-500 ease-in-out"
          style={{
            width: `${progressPercentage}%`,
            backgroundColor: 'var(--color-accent-primary)',
            backgroundImage: 'var(--texture-grain)',
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
          {question.options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            const hasAnswered = currentUserAnswer !== null; // Пользователь уже выбрал ответ на этот вопрос

            return (
              <button
                key={option.id}
                onClick={() => onAnswerSelect(question.id, option.id)}
                className={`
                  w-full text-left py-3 px-4 rounded-lg transition duration-200 ease-in-out
                  ${isSelected ? 'transform scale-[1.005]' : ''}
                  focus:outline-none focus:ring-2 focus:ring-offset-2
                  text-base sm:text-lg font-sans
                `}
                style={getOptionStyle(option.id, isSelected, hasAnswered)}
                onMouseEnter={(e) => handleOptionHover(e, isSelected, hasAnswered, true)}
                onMouseLeave={(e) => handleOptionHover(e, isSelected, hasAnswered, false)}
                disabled={hasAnswered}
              >
                {option.text}
              </button>
            );
          })}
        </div>
      )}

      {/* Кнопки навигации */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 space-y-4 sm:space-y-0 sm:space-x-4">
        {!isFirstQuestion && (
          <button
            onClick={onPreviousQuestion}
            className="w-full sm:w-auto font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-opacity-50"
            style={getButtonStyle('secondary')}
            onMouseEnter={(e) => handleButtonHover(e, 'secondary', true, false)}
            onMouseLeave={(e) => handleButtonHover(e, 'secondary', false, false)}
          >
            Предыдущий
          </button>
        )}

        {isLastQuestion ? (
          <button
            onClick={() => onNextQuestion(true)}
            className="w-full sm:w-auto font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-opacity-50"
            style={getButtonStyle('danger')}
            onMouseEnter={(e) => handleButtonHover(e, 'danger', true, false)}
            onMouseLeave={(e) => handleButtonHover(e, 'danger', false, false)}
          >
            Завершить Тест
          </button>
        ) : (
          <button
            onClick={() => onNextQuestion(false)}
            disabled={currentUserAnswer === null}
            className={`w-full sm:w-auto font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-opacity-50 ${currentUserAnswer === null ? 'cursor-not-allowed' : ''}`}
            style={getButtonStyle(currentUserAnswer === null ? 'secondary' : 'primary', currentUserAnswer === null)}
            onMouseEnter={(e) => handleButtonHover(e, currentUserAnswer === null ? 'secondary' : 'primary', true, currentUserAnswer === null)}
            onMouseLeave={(e) => handleButtonHover(e, currentUserAnswer === null ? 'secondary' : 'primary', false, currentUserAnswer === null)}
          >
            Следующий
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestionRenderer;

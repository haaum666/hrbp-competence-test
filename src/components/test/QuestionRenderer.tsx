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

  // НОВАЯ ФУНКЦИЯ ДЛЯ ФОРМАТИРОВАНИЯ ТЕКСТА
  const formatQuestionText = (text: string): string => {
    // 1. Заменяем переносы строк на HTML-тег <br />
    let formattedText = text.replace(/\n/g, '<br />');
    // 2. Заменяем текст в **...** на жирный шрифт <strong>...</strong>
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // 3. Заменяем текст в *...* на курсив <em>...</em>
    formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
    return formattedText;
  };

  // УНИФИЦИРОВАННЫЕ СТИЛИ ДЛЯ КНОПОК
  const getButtonStyle = (type: 'primary' | 'secondary' | 'danger', isDisabled: boolean = false) => {
    let bgColorVar: string;
    let textColorVar: string;
    let borderColorVar: string;
    let hoverFilter: string;

    if (isDisabled) {
      bgColorVar = 'var(--color-neutral)';
      textColorVar = 'var(--color-text-secondary)';
      borderColorVar = 'var(--color-neutral)';
      hoverFilter = 'brightness(1.0)';
    } else {
      switch (type) {
        case 'primary':
          bgColorVar = 'var(--button-primary-bg)';
          textColorVar = 'var(--button-primary-text)';
          borderColorVar = 'var(--button-primary-border)';
          hoverFilter = 'brightness(0.9)';
          break;
        case 'danger':
          bgColorVar = 'var(--color-error)';
          textColorVar = 'var(--color-neutral)';
          borderColorVar = 'var(--color-error)';
          hoverFilter = 'brightness(1.1)';
          break;
        case 'secondary':
        default:
          bgColorVar = 'var(--button-secondary-bg)';
          textColorVar = 'var(--button-secondary-text)';
          borderColorVar = 'var(--button-secondary-border)';
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
      filter: 'brightness(1.0)',
      transition: 'filter 0.3s ease',
      border: `1px solid ${borderColorVar}`,
      boxShadow: '2px 2px 0px 0px var(--color-text-primary)',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      opacity: isDisabled ? 0.7 : 1,
      '--hover-filter': hoverFilter,
    };
  };

  const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>, type: 'primary' | 'secondary' | 'danger', isEnter: boolean, isDisabled: boolean) => {
    if (isDisabled) return;
    const hoverFilter = e.currentTarget.style.getPropertyValue('--hover-filter');
    e.currentTarget.style.filter = isEnter ? hoverFilter : 'brightness(1.0)';
  };

  // Стилизация опций вопросов
  const getOptionStyle = (optionId: string, isSelected: boolean) => {
    let bgColorVar: string;
    let textColorVar: string;
    let borderColorVar: string;
    let boxShadowVar: string;
    let hoverFilter: string;

    if (isSelected) {
      bgColorVar = 'var(--color-accent-primary)';
      textColorVar = 'var(--color-neutral)';
      borderColorVar = 'var(--color-accent-primary)';
      boxShadowVar = '2px 2px 0px 0px var(--color-text-primary)';
      hoverFilter = 'brightness(1.0)';
    } else {
      bgColorVar = 'var(--color-neutral)';
      textColorVar = 'var(--color-text-primary)';
      borderColorVar = 'var(--color-text-primary)';
      boxShadowVar = '2px 2px 0px 0px var(--color-text-secondary)';
      hoverFilter = 'brightness(0.97)';
    }

    return {
      backgroundColor: bgColorVar,
      color: textColorVar,
      backgroundImage: 'var(--texture-grain)',
      backgroundSize: '4px 4px',
      backgroundRepeat: 'repeat',
      border: `1px solid ${borderColorVar}`,
      boxShadow: boxShadowVar,
      filter: 'brightness(1.0)',
      transition: 'filter 0.3s ease',
      cursor: 'pointer',
      opacity: 1,
      '--hover-filter-option': hoverFilter,
    };
  };

  const handleOptionHover = (e: React.MouseEvent<HTMLButtonElement>, isSelected: boolean, isEnter: boolean) => {
    if (isSelected) return;
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
        border: '2px solid var(--color-neutral)',
        boxShadow: '4px 4px 0px 0px var(--color-neutral)',
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

      {/* ОБНОВЛЕННЫЙ БЛОК ДЛЯ ОТОБРАЖЕНИЯ ТЕКСТА ВОПРОСА */}
      <div
        className="text-xl sm:text-2xl mb-6 leading-relaxed font-heading"
        style={{ color: 'var(--color-text-primary)' }}
        dangerouslySetInnerHTML={{ __html: formatQuestionText(question.text) }}
      ></div>
      {/* КОНЕЦ ОБНОВЛЕННОГО БЛОКА */}

      {question.type === 'multiple-choice' && (
        <div className="space-y-3 sm:space-y-4">
          {question.options.map((option) => {
            const isSelected = selectedOptionId === option.id;

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
                style={getOptionStyle(option.id, isSelected)}
                onMouseEnter={(e) => handleOptionHover(e, isSelected, true)}
                onMouseLeave={(e) => handleOptionHover(e, isSelected, false)}
              >
                {option.text}
              </button>
            );
          })}
        </div>
      )}

      {/* Кнопки навигации */}
      <div className={`flex flex-col sm:flex-row items-center mt-6 space-y-4 sm:space-y-0 ${isFirstQuestion ? 'justify-center' : 'justify-between sm:space-x-4'}`}>
        {!isFirstQuestion && (
          <button
            onClick={onPreviousQuestion}
            className={`
              font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-opacity-50
              ${isLastQuestion ? 'w-full sm:w-auto' : 'w-full sm:w-1/2'}
            `}
            style={getButtonStyle('secondary')}
            onMouseEnter={(e) => handleButtonHover(e, 'secondary', true, false)}
            onMouseLeave={(e) => handleButtonHover(e, 'secondary', false, false)}
          >
            Предыдущий
          </button>
        )}

        {isLastQuestion && (
          <button
            onClick={() => onNextQuestion(true)}
            className={`
              font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-opacity-50
              ${isFirstQuestion ? 'w-full sm:w-auto' : 'w-full sm:w-1/2'}
            `}
            style={getButtonStyle('danger')}
            onMouseEnter={(e) => handleButtonHover(e, 'danger', true, false)}
            onMouseLeave={(e) => handleButtonHover(e, 'danger', false, false)}
          >
            Завершить Тест
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestionRenderer;

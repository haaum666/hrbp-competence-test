// src/components/test/QuestionRenderer.tsx

import React from 'react';
import { Question, UserAnswer } from '../../types/test';
import QuestionCard from '../common/QuestionCard';
import MultipleChoiceQuestion from './MultipleChoiceQuestion';

interface QuestionRendererProps {
  question: Question;
  currentQuestionIndex: number;
  totalQuestions: number;
  onAnswerSelect: (questionId: string, selectedOptionId: string) => void;
  currentUserAnswer?: UserAnswer;
  onNextQuestion: () => void;
  onPreviousQuestion: () => void;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  remainingTime: number;
  timeEstimate: number;
}

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
  timeEstimate,
}) => {
  const cardTitle = `Вопрос ${currentQuestionIndex + 1} из ${totalQuestions}`;

  // Функция для форматирования времени (минуты:секунды)
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Определяем цвет таймера в зависимости от оставшегося времени
  const timerColorClass = remainingTime <= 10 ? 'text-red-400 animate-pulse' : 'text-gray-400';

  return (
    <QuestionCard
      title={cardTitle}
      level={question.level}
      timeEstimate={question.timeEstimate} // Передаем timeEstimate в QuestionCard
    >
      {/* Отображение вопроса (MultipleChoiceQuestion, CaseStudy, Prioritization) */}
      {question.type === 'multiple-choice' && (
        <MultipleChoiceQuestion
          question={question}
          onAnswerSelect={onAnswerSelect}
          selectedAnswerId={currentUserAnswer?.selectedOptionId as string | undefined}
        />
      )}

      {question.type === 'case-study' && (
        <p className="text-gray-300">
          Это кейсовый вопрос. Функционал для него еще не реализован.
          <br/>
          {question.text}
        </p>
      )}

      {question.type === 'prioritization' && (
        <p className="text-gray-300">
          Это вопрос на приоритизацию. Функционал для него еще не реализован.
          <br/>
          {question.text}
        </p>
      )}

      {!['multiple-choice', 'case-study', 'prioritization'].includes(question.type) && (
        <p className="text-red-400">
          Неизвестный тип вопроса: {question.type}.
        </p>
      )}

      {/* Отображение таймера и кнопок навигации */}
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={onPreviousQuestion}
          disabled={isFirstQuestion}
          className={`px-6 py-3 rounded-lg font-bold transition duration-300
                      ${isFirstQuestion
                          ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
        >
          Назад
        </button>

        {/* Таймер посередине */}
        <span className={`text-xl font-bold ${timerColorClass}`}>
          {formatTime(remainingTime)}
        </span>

        <button
          onClick={onNextQuestion}
          disabled={isLastQuestion && remainingTime > 0} // Кнопка "Завершить Тест" становится неактивной, если это последний вопрос и время не истекло.
          className={`px-6 py-3 rounded-lg font-bold transition duration-300
                      ${isLastQuestion
                          ? 'bg-purple-600 hover:bg-purple-700 text-white' // Цвет для кнопки "Завершить тест"
                          : 'bg-blue-600 hover:bg-blue-700 text-white' // Цвет для кнопки "Далее"
                      }`}
        >
          {isLastQuestion ? 'Завершить Тест' : 'Далее'}
        </button>
      </div>
    </QuestionCard>
  );
};

export default QuestionRenderer;

// src/components/test/QuestionRenderer.tsx
import React from 'react';
import { Question, UserAnswer } from '../../types/test'; // Импортируем типы
import QuestionCard from '../common/QuestionCard'; // Импортируем QuestionCard
import MultipleChoiceQuestion from './MultipleChoiceQuestion'; // Импортируем компонент для множественного выбора

interface QuestionRendererProps {
  question: Question;
  currentQuestionIndex: number; // Для отображения номера вопроса
  totalQuestions: number; // Для отображения общего количества вопросов
  onAnswerSelect: (questionId: string, selectedOptionId: string) => void;
  currentUserAnswer?: UserAnswer; // Текущий ответ пользователя для этого вопроса
}

const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  currentQuestionIndex,
  totalQuestions,
  onAnswerSelect,
  currentUserAnswer,
}) => {
  // Определяем заголовок для QuestionCard
  const cardTitle = `Вопрос ${currentQuestionIndex + 1} из ${totalQuestions}`;

  return (
    <QuestionCard
      title={cardTitle}
      level={question.level}
      timeEstimate={question.timeEstimate}
    >
      {/* Динамическое отображение вопроса в зависимости от его типа */}
      {question.type === 'multiple-choice' && (
        <MultipleChoiceQuestion
          question={question}
          onAnswerSelect={onAnswerSelect}
          selectedAnswerId={currentUserAnswer?.selectedOptionId as string | undefined}
        />
      )}

      {/* Здесь можно будет добавить другие типы вопросов по мере их создания */}
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

      {/* Если тип вопроса неизвестен */}
      {!['multiple-choice', 'case-study', 'prioritization'].includes(question.type) && (
        <p className="text-red-400">
          Неизвестный тип вопроса: {question.type}.
        </p>
      )}
    </QuestionCard>
  );
};

export default QuestionRenderer;

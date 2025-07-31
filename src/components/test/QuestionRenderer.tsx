// src/components/test/QuestionRenderer.tsx
import React from 'react';
import { Question, UserAnswer } from '../../types/test'; // <-- Важный импорт
import QuestionCard from '../common/QuestionCard'; // <-- Важный импорт
import MultipleChoiceQuestion from './MultipleChoiceQuestion'; // <-- Важный импорт

interface QuestionRendererProps {
  question: Question;
  currentQuestionIndex: number;
  totalQuestions: number;
  onAnswerSelect: (questionId: string, selectedOptionId: string) => void;
  currentUserAnswer?: UserAnswer;
}

const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  currentQuestionIndex,
  totalQuestions,
  onAnswerSelect,
  currentUserAnswer,
}) => {
  const cardTitle = `Вопрос ${currentQuestionIndex + 1} из ${totalQuestions}`;

  return (
    <QuestionCard
      title={cardTitle}
      level={question.level}
      timeEstimate={question.timeEstimate}
    >
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
    </QuestionCard>
  );
};

export default QuestionRenderer;

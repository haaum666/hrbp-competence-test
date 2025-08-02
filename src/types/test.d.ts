// src/types/test.d.ts

export type QuestionLevel = 'junior' | 'middle' | 'senior';

export interface Option {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'case-study'; // ИЗМЕНЕНО: Добавлен 'case-study'
  options: Option[];
  correctAnswer: string;
  explanation?: string;
  level: QuestionLevel;
  timeLimitSeconds?: number;
  timeEstimate?: number; // ДОБАВЛЕНО: Для timeEstimate в минутах (если используется)
  categoryid?: string; // ДОБАВЛЕНО: Для categoryid, если он нужен для вопросов
}

export interface UserAnswer {
  questionId: string;
  selectedOptionId: string | null;
  isCorrect: boolean;
  timeSpent: number;
}

export interface AnswerDetail {
  question: Question;
  userAnswer: UserAnswer | null;
  isCorrect: boolean;
}

export interface TestResult {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unanswered: number;
  scorePercentage: number;
  answers: AnswerDetail[];
  timestamp: string;
  completionTime?: number;
  startTime?: string;
  endTime?: string;
}

export interface TestState {
  currentQuestionIndex: number;
  userAnswers: UserAnswer[];
  startTime: string;
  remainingTimeCurrentQuestion: number;
}

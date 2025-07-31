// src/types/test.d.ts

export type QuestionType = 'multiple-choice' | 'case-study' | 'prioritization';
export type QuestionLevel = 'junior' | 'middle' | 'senior';

export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  categoryid: string;
  level: QuestionLevel;
  type: QuestionType;
  text: string;
  options?: Option[]; // Опции для multiple-choice
  correctAnswer?: string; // ID правильного ответа для multiple-choice
  explanation?: string; // Объяснение правильного ответа
  sources?: string; // Источники информации
  difficulty: number; // Сложность вопроса (1-5)
  timeEstimate: number; // Примерное время на вопрос в секундах
}

export interface UserAnswer {
  questionId: string;
  selectedOptionId: string;
  answeredTime: string; // Добавлено: время, когда пользователь ответил
}

export interface TestResult {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unanswered: number;
  scorePercentage: number;
  answers: {
    question: Question;
    userAnswer: UserAnswer | undefined;
    isCorrect: boolean;
  }[];
}

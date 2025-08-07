// src/types/test.d.ts

export type QuestionLevel = 'junior' | 'middle' | 'senior';

export interface Option {
  id: string;
  text: string;
}

// Новый интерфейс для источников, которые могут быть объектами
export interface SourceResource {
  title: string;
  url?: string;
}

// Новый интерфейс для дополнительных ресурсов
export interface AdditionalResource {
  type: 'Course' | 'Book' | 'Article' | 'Other';
  title: string;
  url?: string;
  description?: string;
}

export interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'case-study';
  options: Option[];
  correctAnswer: string | null; // ID правильного ответа для multiple-choice, или null для case-study
  explanation?: string;
  level: QuestionLevel; // Это уже ваш уровень HRBP
  timeLimitSeconds?: number;
  timeEstimate?: number;
  categoryid?: string;
  sources?: (string | SourceResource)[]; // ИЗМЕНЕНО: теперь может быть строкой или объектом SourceResource
  relatedCompetencies?: string[]; // Компетенция вопроса
  explanationDetails?: { // Для объяснения неверных/менее подходящих вариантов
    optionId: string;
    reason: string;
  }[];
  developmentRecommendation?: string; // Рекомендации по развитию компетенции
  additionalResources?: AdditionalResource[]; // ИЗМЕНЕНО: теперь ссылается на отдельный интерфейс AdditionalResource
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

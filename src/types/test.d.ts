// src/types/test.d.ts

export type QuestionLevel = 'junior' | 'middle' | 'senior';

export interface Option {
  id: string;
  text: string;
  // isCorrect?: boolean; // УДАЛИТЬ ЭТУ СТРОКУ
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
  sources?: string[];
  relatedCompetencies?: string[]; // Компетенция вопроса
  // Добавим поля для дополнительной информации, которая у вас есть, но их пока нет в типе
  explanationDetails?: { // Для объяснения неверных/менее подходящих вариантов
    optionId: string;
    reason: string;
  }[];
  developmentRecommendation?: string; // Рекомендации по развитию компетенции
  additionalResources?: { // Дополнительные ресурсы для изучения
    type: 'Course' | 'Book' | 'Article' | 'Other';
    title: string;
    url?: string;
    description?: string;
  }[];
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

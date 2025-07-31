// src/types/test.d.ts

export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  categoryId: string;
  level: 'junior' | 'middle' | 'senior';
  type: 'multiple-choice' | 'case-study' | 'prioritization';
  text: string;
  options?: Option[];
  correctAnswer: string | string[];
  explanation: string;
  sources?: string;
  difficulty: number;
  timeEstimate: number;
}

export interface UserAnswer {
  questionId: string;
  selectedOptionId?: string | string[];
  textAnswer?: string;
  timeSpent: number;
}

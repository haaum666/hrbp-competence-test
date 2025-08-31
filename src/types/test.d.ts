export type QuestionLevel = 'junior' | 'middle' | 'senior';

// Новый тип для текстовых секций вопроса
export interface QuestionTextSection {
  title?: string;
  text: string;
}

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
  competency?: string;
  hrbpLevel?: 'Junior HRBP' | 'Middle HRBP' | 'Senior HRBP';

  // ЗАМЕНА: 'text: string;' заменено на 'sections: QuestionTextSection[];'
  sections: QuestionTextSection[];
  
  type: 'multiple-choice' | 'case-study';
  options: Option[];
  correctAnswer: string | null;
  explanation?: string;
  level: QuestionLevel;
  timeLimitSeconds?: number;
  timeEstimate?: number;
  categoryid?: string;
  sources?: (string | SourceResource)[];
  relatedCompetencies?: string[];
  explanationDetails?: {
    optionId: string;
    reason: string;
  }[];
  developmentRecommendation?: string;
  additionalResources?: AdditionalResource[];
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

// src/types/test.d.ts

export type QuestionLevel = 'junior' | 'middle' | 'senior';

export interface Option {
  id: string;
  text: string;
  isCorrect?: boolean; // Добавлено/скорректировано: может быть опциональным, но для ResultDetailView нужно.
                       // Если Question всегда содержит isCorrect для своей правильной опции, то для Option это
                       // свойство нужно, чтобы понять, является ли данная опция правильной.
}

export interface Question {
  id: string;
  text: string;
  type: 'multiple-choice';
  options: Option[];
  correctAnswer: string; // ID правильного ответа
  explanation?: string; // Поле для объяснения правильного ответа
  level: QuestionLevel; // Уровень сложности вопроса
  timeLimitSeconds?: number; // Ограничение по времени для вопроса
}

export interface UserAnswer {
  questionId: string;
  selectedOptionId: string | null; // null, если вопрос пропущен
  isCorrect: boolean; // ДОБАВЛЕНО: Булево значение, указывающее, был ли ответ правильным
  timeSpent: number; // Время, затраченное на ответ в секундах
}

export interface AnswerDetail {
  question: Question;
  userAnswer: UserAnswer | null; // null, если пользователь не ответил
  isCorrect: boolean; // Является ли ответ пользователя правильным для этого вопроса
}

export interface TestResult {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unanswered: number;
  scorePercentage: number;
  answers: AnswerDetail[]; // Детали по каждому вопросу
  timestamp: string; // Дата и время завершения теста (ISO string)
  completionTime?: number; // Общее время выполнения теста в секундах
  startTime?: string; // Время начала теста (ISO string)
  endTime?: string; // Время окончания теста (ISO string)
}

// Дополнительные типы для общего состояния теста
export interface TestState {
  currentQuestionIndex: number;
  userAnswers: UserAnswer[];
  startTime: string; // Время начала теста для расчета общей длительности
  remainingTimeCurrentQuestion: number; // Оставшееся время для текущего вопроса
}

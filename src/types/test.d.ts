// src/types/test.d.ts

// Интерфейс для опции ответа
export interface Option {
  id: string;
  text: string;
}

// Интерфейс для вопроса, согласно вашей спецификации
export interface Question {
  id: string;
  categoryId: string;
  level: 'junior' | 'middle' | 'senior';
  type: 'multiple-choice' | 'case-study' | 'prioritization';
  text: string;
  options?: Option[]; // Опционально для открытых вопросов
  correctAnswer: string | string[]; // Может быть ID опции или массив ID для множественного выбора/ранжирования
  explanation: string;
  sources?: string; // Опционально
  difficulty: number;
  timeEstimate: number; // Время в секундах
}

// Интерфейс для ответа пользователя
export interface UserAnswer {
  questionId: string;
  selectedOptionId?: string | string[]; // Для множественного выбора, или массив для приоритизации
  textAnswer?: string; // Для открытых вопросов
  timeSpent: number; // Время, затраченное на вопрос
}

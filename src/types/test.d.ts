// src/types/test.d.ts

/**
 * @typedef {'multiple-choice' | 'case-study' | 'prioritization'} QuestionType
 * @description Типы вопросов, которые могут быть в тесте.
 * - 'multiple-choice': Вопрос с одним правильным вариантом ответа из нескольких.
 * - 'case-study': Ситуационный вопрос, требующий анализа.
 * - 'prioritization': Вопрос на ранжирование или приоритизацию.
 */
export type QuestionType = 'multiple-choice' | 'case-study' | 'prioritization';

/**
 * @typedef {'junior' | 'middle' | 'senior'} QuestionLevel
 * @description Уровни сложности вопросов.
 */
export type QuestionLevel = 'junior' | 'middle' | 'senior';

/**
 * @interface Option
 * @description Интерфейс, описывающий один вариант ответа для вопроса.
 * @property {string} id - Уникальный идентификатор варианта ответа.
 * @property {string} text - Текст варианта ответа.
 */
export interface Option {
  id: string;
  text: string;
}

/**
 * @interface Question
 * @description Интерфейс, описывающий структуру вопроса теста.
 * @property {string} id - Уникальный идентификатор вопроса.
 * @property {string} text - Текст вопроса.
 * @property {QuestionType} type - Тип вопроса (например, 'multiple-choice', 'case-study').
 * @property {Option[]} options - Массив вариантов ответов для вопроса (для multiple-choice).
 * @property {string} correctAnswer - ID правильного варианта ответа (для multiple-choice).
 * @property {string} explanation - Подробное объяснение правильного ответа или решения кейса.
 * @property {number} timeEstimate - Оценочное время на ответ в секундах.
 * @property {string} categoryid - Идентификатор категории вопроса.
 * @property {QuestionLevel} level - Уровень сложности вопроса (junior, middle, senior).
 * @property {string[]} sources - Массив ссылок на источники информации, связанные с вопросом.
 * @property {string[]} [relatedCompetencies] - Опциональный массив компетенций, к которым относится вопрос.
 */
export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options: Option[];
  correctAnswer: string;
  explanation: string;
  timeEstimate: number;
  categoryid: string;
  level: QuestionLevel; // Здесь используется новый тип QuestionLevel
  sources: string[];
  relatedCompetencies?: string[];
}

/**
 * @interface UserAnswer
 * @description Интерфейс, описывающий ответ пользователя на вопрос.
 * @property {string} questionId - ID вопроса, на который был дан ответ.
 * @property {string} selectedOptionId - ID выбранного пользователем варианта ответа (пустая строка для пропущенных).
 * @property {string} answeredTime - Время, когда был дан ответ, в формате ISO 8601 (например, "2023-10-27T10:00:00.000Z").
 */
export interface UserAnswer {
  questionId: string;
  selectedOptionId?: string; // Используем '?' для необязательного свойства
  timeSpent?: number; // НОВОЕ: Время, затраченное на вопрос в секундах
  // Другие свойства, если они есть
}

/**
 * @interface AnswerDetail
 * @description Детальная информация об ответе на один вопрос для страницы результатов.
 * @property {Question} question - Объект вопроса.
 * @property {UserAnswer | undefined} userAnswer - Ответ пользователя на этот вопрос, или undefined если нет.
 * @property {boolean} isCorrect - True, если ответ пользователя правильный.
 */
export interface AnswerDetail {
  question: Question;
  userAnswer: UserAnswer | undefined;
  isCorrect: boolean;
}

/**
 * @interface TestResult
 * @description Интерфейс, описывающий полные результаты завершенного теста.
 * @property {number} totalQuestions - Общее количество вопросов в тесте.
 * @property {number} correctAnswers - Количество правильных ответов.
 * @property {number} incorrectAnswers - Количество неправильных ответов.
 * @property {number} unanswered - Количество вопросов, оставшихся без ответа.
 * @property {number} scorePercentage - Процент правильных ответов от общего числа вопросов.
 * @property {AnswerDetail[]} answers - Массив с детальной информацией по каждому вопросу и ответу.
 */
export interface TestResult {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unanswered: number;
  scorePercentage: number;
  answers: AnswerDetail[];
}

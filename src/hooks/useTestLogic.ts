import { useState, useEffect, useCallback } from 'react';
import { Question, UserAnswer, TestResult, AnswerDetail } from '../types/test.d';
import { generateQuestions } from '../data/questions';

// Константы для localStorage
const LOCAL_STORAGE_KEY_ANSWERS = 'testUserAnswers';
const LOCAL_STORAGE_KEY_CURRENT_INDEX = 'testCurrentQuestionIndex';
const LOCAL_STORAGE_KEY_TEST_STARTED = 'testStarted';
const LOCAL_STORAGE_KEY_START_TIME = 'testStartTime';

const INITIAL_TIME_PER_QUESTION = 60; // Время на вопрос по умолчанию в секундах

/**
 * @typedef {Object} UseTestLogicReturn
 * @property {number} currentQuestionIndex - Текущий индекс вопроса.
 * @property {UserAnswer[]} userAnswers - Массив ответов пользователя.
 * @property {boolean} testFinished - Флаг завершения теста.
 * @property {Question[]} questions - Массив вопросов теста.
 * @property {boolean} testStarted - Флаг начала теста.
 * @property {TestResult | null} testResult - Результаты теста после завершения.
 * @property {boolean} showResumeOption - Флаг, показывающий возможность продолжить тест.
 * @property {number} remainingTime - Оставшееся время на текущий вопрос.
 * @property {number} progressPercentage - Процент выполнения теста.
 * @property {(questionId: string, selectedOptionId: string) => void} handleAnswerSelect - Функция для обработки выбора ответа.
 * @property {() => void} handleNextQuestion - Функция для перехода к следующему вопросу.
 * @property {() => void} handlePreviousQuestion - Функция для перехода к предыдущему вопросу.
 * @property {() => void} startNewTest - Функция для начала нового теста.
 * @property {() => void} resumeTest - Функция для продолжения прерванного теста.
 */
interface UseTestLogicReturn {
  currentQuestionIndex: number;
  userAnswers: UserAnswer[];
  testFinished: boolean;
  questions: Question[];
  testStarted: boolean;
  testResult: TestResult | null;
  showResumeOption: boolean;
  remainingTime: number;
  progressPercentage: number;
  handleAnswerSelect: (questionId: string, selectedOptionId: string) => void;
  handleNextQuestion: () => void;
  handlePreviousQuestion: () => void;
  startNewTest: () => void;
  resumeTest: () => void;
}

/**
 * @function useTestLogic
 * @description Пользовательский React хук, инкапсулирующий всю логику теста:
 * управление состоянием, таймером, ответами пользователя, сохранением/загрузкой прогресса.
 * @returns {UseTestLogicReturn} Объект с состоянием и функциями для управления тестом.
 */
const useTestLogic = (): UseTestLogicReturn => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [testStarted, setTestStarted] = useState<boolean>(false);
  const [testFinished, setTestFinished] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [showResumeOption, setShowResumeOption] = useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState<number>(INITIAL_TIME_PER_QUESTION);

  // Effect для инициализации вопросов при первом рендере
  useEffect(() => {
    setQuestions(generateQuestions());
  }, []);

  // Effect для проверки сохраненного прогресса при загрузке
  useEffect(() => {
    const savedAnswers = localStorage.getItem(LOCAL_STORAGE_KEY_ANSWERS);
    const savedIndex = localStorage.getItem(LOCAL_STORAGE_KEY_CURRENT_INDEX);
    const savedTestStarted = localStorage.getItem(LOCAL_STORAGE_KEY_TEST_STARTED);

    if (savedAnswers && savedIndex && savedTestStarted === 'true') {
      try {
        const parsedAnswers: UserAnswer[] = JSON.parse(savedAnswers);
        const parsedIndex: number = parseInt(savedIndex, 10);

        if (parsedAnswers.length > 0 && !isNaN(parsedIndex) && parsedIndex < questions.length) {
          setShowResumeOption(true);
        }
      } catch (e) {
        console.error('Failed to parse saved test data:', e);
        // Очищаем localStorage, если данные повреждены
        clearLocalStorage();
      }
    }
  }, [questions.length]); // Зависит от questions.length, чтобы убедиться, что вопросы загружены

  // Функция для очистки localStorage связанных с тестом
  const clearLocalStorage = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEY_ANSWERS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_CURRENT_INDEX);
    localStorage.removeItem(LOCAL_STORAGE_KEY_TEST_STARTED);
    localStorage.removeItem(LOCAL_STORAGE_KEY_START_TIME);
  }, []);

  /**
   * @function startNewTest
   * @description Инициализирует новый тест, сбрасывая все состояния и очищая localStorage.
   */
  const startNewTest = useCallback(() => {
    clearLocalStorage();
    setQuestions(generateQuestions()); // Перезагружаем вопросы для чистоты
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setTestStarted(true);
    setTestFinished(false);
    setTestResult(null);
    setShowResumeOption(false);
    localStorage.setItem(LOCAL_STORAGE_KEY_TEST_STARTED, 'true');
    localStorage.setItem(LOCAL_STORAGE_KEY_START_TIME, Date.now().toString()); // Записываем время начала
    setRemainingTime(questions[0]?.timeEstimate || INITIAL_TIME_PER_QUESTION);
  }, [clearLocalStorage, questions]); // Добавлена зависимость questions

  /**
   * @function resumeTest
   * @description Продолжает тест с сохраненного состояния из localStorage.
   */
  const resumeTest = useCallback(() => {
    const savedAnswers = localStorage.getItem(LOCAL_STORAGE_KEY_ANSWERS);
    const savedIndex = localStorage.getItem(LOCAL_STORAGE_KEY_CURRENT_INDEX);
    const savedStartTime = localStorage.getItem(LOCAL_STORAGE_KEY_START_TIME);

    if (savedAnswers && savedIndex) {
      try {
        const parsedAnswers: UserAnswer[] = JSON.parse(savedAnswers);
        const parsedIndex: number = parseInt(savedIndex, 10);
        const parsedStartTime: number = parseInt(savedStartTime || '0', 10);

        if (parsedIndex < questions.length) {
          setUserAnswers(parsedAnswers);
          setCurrentQuestionIndex(parsedIndex);
          setTestStarted(true);
          setTestFinished(false);
          setTestResult(null);
          setShowResumeOption(false);

          // Рассчитываем оставшееся время
          const elapsed = (Date.now() - parsedStartTime) / 1000; // Прошло времени в секундах
          const questionTime = questions[parsedIndex]?.timeEstimate || INITIAL_TIME_PER_QUESTION;
          const remaining = Math.max(0, questionTime - elapsed);
          setRemainingTime(remaining);

          localStorage.setItem(LOCAL_STORAGE_KEY_TEST_STARTED, 'true'); // Подтверждаем, что тест продолжен
        } else {
          // Если сохраненный индекс больше или равен количеству вопросов, начинаем новый тест
          console.warn('Saved index out of bounds, starting a new test.');
          startNewTest();
        }
      } catch (e) {
        console.error('Failed to resume test:', e);
        startNewTest(); // В случае ошибки парсинга, начинаем новый тест
      }
    } else {
      startNewTest(); // Если нет сохраненных данных, начинаем новый тест
    }
  }, [questions, startNewTest]);

  /**
   * @function calculateTestResult
   * @description Вычисляет итоговые результаты теста.
   */
  const calculateTestResult = useCallback(() => {
    if (questions.length === 0) return;

    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let unanswered = 0;
    const answersDetails: AnswerDetail[] = [];

    questions.forEach((question) => {
      const userAnswer = userAnswers.find((ans) => ans.questionId === question.id);
      let isCorrect = false;

      if (userAnswer && userAnswer.selectedOptionId) {
        if (question.type === 'multiple-choice') {
          isCorrect = userAnswer.selectedOptionId === question.correctAnswer;
        } else {
          // Для кейсов или приоритизации, где нет однозначного "правильного" ответа
          // можно считать ответ правильным, если он просто был дан.
          // Или внедрить более сложную логику оценки.
          isCorrect = true; // Считаем, что если пользователь дал ответ, то он "правильный" для этого типа
        }
      }

      if (isCorrect) {
        correctAnswers++;
      } else if (userAnswer && userAnswer.selectedOptionId) {
        incorrectAnswers++;
      } else {
        unanswered++;
      }

      answersDetails.push({
        question,
        userAnswer,
        isCorrect,
      });
    });

    const totalQuestions = questions.length;
    const scorePercentage = (correctAnswers / totalQuestions) * 100;

    setTestResult({
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      unanswered,
      scorePercentage,
      answers: answersDetails,
    });

    setTestFinished(true);
    clearLocalStorage(); // Очищаем localStorage после завершения теста
  }, [questions, userAnswers, clearLocalStorage]);

  // Effect для обработки таймера
  useEffect(() => {
    let timerId: number | null = null; // ИЗМЕНЕНО здесь: NodeJS.Timeout заменен на number

    if (testStarted && !testFinished && questions[currentQuestionIndex]) {
      const questionStartTime = parseInt(localStorage.getItem(LOCAL_STORAGE_KEY_START_TIME) || Date.now().toString(), 10);
      const elapsedSinceStart = (Date.now() - questionStartTime) / 1000;
      const initialTimeForCurrentQuestion = questions[currentQuestionIndex].timeEstimate || INITIAL_TIME_PER_QUESTION;
      const timeLeftOnLoad = Math.max(0, initialTimeTimeForCurrentQuestion - elapsedSinceStart);

      setRemainingTime(timeLeftOnLoad);

      timerId = window.setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime <= 1) {
            window.clearInterval(timerId!);
            // Если время вышло, автоматически переходим к следующему вопросу
            handleNextQuestion();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (timerId) {
      window.clearInterval(timerId);
    }

    // Cleanup function
    return () => {
      if (timerId) {
        window.clearInterval(timerId);
      }
    };
  }, [testStarted, testFinished, currentQuestionIndex, questions, handleNextQuestion]);


  // Effect для сохранения прогресса и сброса таймера при смене вопроса
  useEffect(() => {
    if (testStarted && !testFinished) {
      localStorage.setItem(LOCAL_STORAGE_KEY_ANSWERS, JSON.stringify(userAnswers));
      localStorage.setItem(LOCAL_STORAGE_KEY_CURRENT_INDEX, currentQuestionIndex.toString());
      // Сбрасываем время начала для нового вопроса, чтобы таймер отсчитывал правильно
      localStorage.setItem(LOCAL_STORAGE_KEY_START_TIME, Date.now().toString());

      // Устанавливаем время для нового вопроса
      if (questions[currentQuestionIndex]) {
        setRemainingTime(questions[currentQuestionIndex].timeEstimate || INITIAL_TIME_PER_QUESTION);
      }
    }
  }, [userAnswers, currentQuestionIndex, testStarted, testFinished, questions]);

  /**
   * @function handleAnswerSelect
   * @description Обрабатывает выбор ответа пользователем, сохраняет его и переходит к следующему вопросу.
   * @param {string} questionId - ID вопроса, на который был дан ответ.
   * @param {string} selectedOptionId - ID выбранного варианта ответа.
   */
  const handleAnswerSelect = useCallback((questionId: string, selectedOptionId: string) => {
    setUserAnswers((prevAnswers) => {
      const existingAnswerIndex = prevAnswers.findIndex(
        (answer) => answer.questionId === questionId
      );

      const newAnswer: UserAnswer = {
        questionId,
        selectedOptionId,
        answeredTime: new Date().toISOString(),
      };

      if (existingAnswerIndex > -1) {
        const updatedAnswers = [...prevAnswers];
        updatedAnswers[existingAnswerIndex] = newAnswer;
        return updatedAnswers;
      } else {
        return [...prevAnswers, newAnswer];
      }
    });
  }, []);

  /**
   * @function handleNextQuestion
   * @description Переходит к следующему вопросу или завершает тест, если это последний вопрос.
   */
  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    } else {
      // Если это последний вопрос, завершаем тест
      calculateTestResult();
    }
  }, [currentQuestionIndex, questions.length, calculateTestResult]);

  /**
   * @function handlePreviousQuestion
   * @description Переходит к предыдущему вопросу.
   */
  const handlePreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
    }
  }, [currentQuestionIndex]);

  const progressPercentage = questions.length > 0 ? ((currentQuestionIndex) / questions.length) * 100 : 0;


  return {
    currentQuestionIndex,
    userAnswers,
    testFinished,
    questions,
    testStarted,
    testResult,
    showResumeOption,
    remainingTime,
    progressPercentage,
    handleAnswerSelect,
    handleNextQuestion,
    handlePreviousQuestion,
    startNewTest,
    resumeTest,
  };
};

export default useTestLogic;

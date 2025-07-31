import { useState, useEffect, useCallback, useRef } from 'react'; // Добавлен useRef
import { Question, UserAnswer, TestResult, AnswerDetail } from '../types/test.d';
import { generateQuestions } from '../data/questions';

// Константы для localStorage
const LOCAL_STORAGE_KEY_ANSWERS = 'testUserAnswers';
const LOCAL_STORAGE_KEY_CURRENT_INDEX = 'testCurrentQuestionIndex';
const LOCAL_STORAGE_KEY_TEST_STARTED = 'testStarted';
const LOCAL_STORAGE_KEY_LAST_QUESTION_START_TIME = 'testLastQuestionStartTime'; // Обновлено имя ключа

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

  // Ref для хранения времени начала текущего вопроса, чтобы избежать проблем с замыканиями в useCallback
  const questionStartTimeRef = useRef<number>(Date.now());


  // --- НАЧАЛО: Все функции useCallback определяются здесь, перед useEffect ---

  // Функция для очистки localStorage связанных с тестом
  const clearLocalStorage = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEY_ANSWERS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_CURRENT_INDEX);
    localStorage.removeItem(LOCAL_STORAGE_KEY_TEST_STARTED);
    localStorage.removeItem(LOCAL_STORAGE_KEY_LAST_QUESTION_START_TIME);
  }, []);

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
          isCorrect = true;
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

  /**
   * @function handleNextQuestion
   * @description Переходит к следующему вопросу или завершает тест, если это последний вопрос.
   */
  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      // При переходе к следующему вопросу, сбрасываем время начала в ref
      questionStartTimeRef.current = Date.now();
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
      // При переходе назад, также сбрасываем время начала в ref
      questionStartTimeRef.current = Date.now();
    }
  }, [currentQuestionIndex]);

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

      // Вычисляем время, потраченное на текущий вопрос
      const initialTime = questions[currentQuestionIndex]?.timeEstimate || INITIAL_TIME_PER_QUESTION;
      const timeSpentOnQuestion = initialTime - remainingTime;

      const newAnswer: UserAnswer = {
        questionId,
        selectedOptionId,
        timeSpent: Math.max(0, timeSpentOnQuestion), // Гарантируем неотрицательное значение
      };

      if (existingAnswerIndex > -1) {
        const updatedAnswers = [...prevAnswers];
        updatedAnswers[existingAnswerIndex] = newAnswer;
        return updatedAnswers;
      } else {
        return [...prevAnswers, newAnswer];
      }
    });
  }, [questions, currentQuestionIndex, remainingTime]); // Добавлены зависимости

  /**
   * @function startNewTest
   * @description Инициализирует новый тест, сбрасывая все состояния и очищая localStorage.
   */
  const startNewTest = useCallback(() => {
    clearLocalStorage();
    const newQuestions = generateQuestions(); // Генерируем вопросы только один раз
    setQuestions(newQuestions);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setTestStarted(true);
    setTestFinished(false);
    setTestResult(null);
    setShowResumeOption(false);
    localStorage.setItem(LOCAL_STORAGE_KEY_TEST_STARTED, 'true');
    // Устанавливаем время начала для первого вопроса
    localStorage.setItem(LOCAL_STORAGE_KEY_LAST_QUESTION_START_TIME, Date.now().toString());
    questionStartTimeRef.current = Date.now(); // Обновляем ref
    setRemainingTime(newQuestions[0]?.timeEstimate || INITIAL_TIME_PER_QUESTION);
  }, [clearLocalStorage]);

  /**
   * @function resumeTest
   * @description Продолжает тест с сохраненного состояния из localStorage.
   */
  const resumeTest = useCallback(() => {
    const savedAnswers = localStorage.getItem(LOCAL_STORAGE_KEY_ANSWERS);
    const savedIndex = localStorage.getItem(LOCAL_STORAGE_KEY_CURRENT_INDEX);
    const savedLastQuestionStartTime = localStorage.getItem(LOCAL_STORAGE_KEY_LAST_QUESTION_START_TIME);

    const loadedQuestions = generateQuestions(); // Генерируем вопросы для загрузки
    setQuestions(loadedQuestions); // Устанавливаем вопросы, чтобы они были доступны

    if (savedAnswers && savedIndex) {
      try {
        const parsedAnswers: UserAnswer[] = JSON.parse(savedAnswers);
        const parsedIndex: number = parseInt(savedIndex, 10);
        const parsedLastQuestionStartTime: number = parseInt(savedLastQuestionStartTime || '0', 10);


        if (parsedIndex < loadedQuestions.length) {
          setUserAnswers(parsedAnswers);
          setCurrentQuestionIndex(parsedIndex);
          setTestStarted(true);
          setTestFinished(false);
          setTestResult(null);
          setShowResumeOption(false);

          // Рассчитываем оставшееся время для текущего вопроса
          const elapsed = (Date.now() - parsedLastQuestionStartTime) / 1000; // Прошло времени в секундах
          const questionTime = loadedQuestions[parsedIndex]?.timeEstimate || INITIAL_TIME_PER_QUESTION;
          const remaining = Math.max(0, questionTime - elapsed);
          setRemainingTime(remaining);
          questionStartTimeRef.current = parsedLastQuestionStartTime; // Восстанавливаем ref

          localStorage.setItem(LOCAL_STORAGE_KEY_TEST_STARTED, 'true');
        } else {
          console.warn('Saved index out of bounds, starting a new test.');
          startNewTest();
        }
      } catch (e) {
        console.error('Failed to resume test:', e);
        startNewTest();
      }
    } else {
      startNewTest();
    }
  }, [startNewTest]); // Зависимость от startNewTest

  // --- КОНЕЦ: Все функции useCallback определены ---


  // Effect для инициализации вопросов при первом рендере и проверки прогресса
  useEffect(() => {
    const initialQuestions = generateQuestions();
    setQuestions(initialQuestions);

    const savedAnswers = localStorage.getItem(LOCAL_STORAGE_KEY_ANSWERS);
    const savedIndex = localStorage.getItem(LOCAL_STORAGE_KEY_CURRENT_INDEX);
    const savedTestStarted = localStorage.getItem(LOCAL_STORAGE_KEY_TEST_STARTED);

    if (savedAnswers && savedIndex && savedTestStarted === 'true') {
      try {
        const parsedAnswers: UserAnswer[] = JSON.parse(savedAnswers);
        const parsedIndex: number = parseInt(savedIndex, 10);

        // Проверяем, что сохраненные данные валидны и не приводят к выходу за пределы массива вопросов
        if (parsedAnswers.length > 0 && !isNaN(parsedIndex) && parsedIndex < initialQuestions.length) {
          setShowResumeOption(true);
        } else {
          clearLocalStorage(); // Данные некорректны, очищаем
        }
      } catch (e) {
        console.error('Failed to parse saved test data during initial load:', e);
        clearLocalStorage(); // Данные повреждены, очищаем
      }
    }
  }, [clearLocalStorage]); // Зависит от clearLocalStorage

  // Effect для обработки таймера
  useEffect(() => {
    let timerId: number | undefined;

    if (testStarted && !testFinished && questions[currentQuestionIndex]) {
      // Если это первый запуск таймера для текущего вопроса, или переход к нему
      // используем время из ref
      const initialTimeForCurrentQuestion = questions[currentQuestionIndex].timeEstimate || INITIAL_TIME_PER_QUESTION;
      const elapsedSinceStart = (Date.now() - questionStartTimeRef.current) / 1000;
      const timeLeftOnLoad = Math.max(0, initialTimeForCurrentQuestion - elapsedSinceStart);

      setRemainingTime(timeLeftOnLoad);

      timerId = window.setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime <= 1) {
            window.clearInterval(timerId);
            handleNextQuestion(); // Автоматически переходим к следующему вопросу
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (!testStarted || testFinished) { // Если тест не начат или завершен, останавливаем таймер
      if (timerId) {
        window.clearInterval(timerId);
      }
      setRemainingTime(INITIAL_TIME_PER_QUESTION); // Сбрасываем время при остановке теста
    }

    // Cleanup function
    return () => {
      if (timerId) {
        window.clearInterval(timerId);
      }
    };
  }, [testStarted, testFinished, currentQuestionIndex, questions, handleNextQuestion]); // Добавлены зависимости

  // Effect для сохранения прогресса и сброса таймера при смене вопроса или при выборе ответа
  useEffect(() => {
    if (testStarted && !testFinished) {
      localStorage.setItem(LOCAL_STORAGE_KEY_ANSWERS, JSON.stringify(userAnswers));
      localStorage.setItem(LOCAL_STORAGE_KEY_CURRENT_INDEX, currentQuestionIndex.toString());
      // Обновляем время начала вопроса при сохранении, чтобы корректно возобновить таймер при перезагрузке
      localStorage.setItem(LOCAL_STORAGE_KEY_LAST_QUESTION_START_TIME, questionStartTimeRef.current.toString());

      // Устанавливаем время для нового вопроса, если мы перешли на него
      if (questions[currentQuestionIndex]) {
        setRemainingTime(questions[currentQuestionIndex].timeEstimate || INITIAL_TIME_PER_QUESTION);
      }
    }
  }, [userAnswers, currentQuestionIndex, testStarted, testFinished, questions]); // Добавлены зависимости

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

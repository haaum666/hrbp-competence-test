import { useState, useEffect, useCallback, useRef } from 'react';
import { Question, UserAnswer, TestResult, AnswerDetail } from '../types/test.d';
import { generateQuestions } from '../data/questions';

// Константы для localStorage
const LOCAL_STORAGE_KEY_ANSWERS = 'testUserAnswers';
const LOCAL_STORAGE_KEY_CURRENT_INDEX = 'testCurrentQuestionIndex';
const LOCAL_STORAGE_KEY_TEST_STARTED = 'testStarted';
const LOCAL_STORAGE_KEY_LAST_QUESTION_START_TIME = 'testLastQuestionStartTime';
const LOCAL_STORAGE_KEY_ALL_RESULTS = 'allTestResults'; // Ключ для всех результатов
const LOCAL_STORAGE_KEY_OVERALL_TEST_START_TIME = 'overallTestStartTime'; // НОВЫЙ КЛЮЧ: Для общего времени начала теста

const INITIAL_TIME_PER_QUESTION = 60; // Время на вопрос по умолчанию в секундах

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

const useTestLogic = (): UseTestLogicReturn => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [testStarted, setTestStarted] = useState<boolean>(false);
  const [testFinished, setTestFinished] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [overallTestStartTime, setOverallTestStartTime] = useState<string | null>(null); // НОВОЕ: Состояние для общего времени начала теста
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
    localStorage.removeItem(LOCAL_STORAGE_KEY_OVERALL_TEST_START_TIME); // НОВОЕ: Очищаем время начала общего теста
    // LOCAL_STORAGE_KEY_ALL_RESULTS не очищается здесь, так как это история
  }, []);

  /**
   * @function calculateTestResult
   * @description Вычисляет итоговые результаты теста.
   */
  const calculateTestResult = useCallback(() => {
    if (questions.length === 0) return;

    const currentEndTime = new Date().toISOString(); // Время завершения теста

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
          isCorrect = true; // Упрощенно для примера, для реальных кейсов нужно доработать
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

    const finalResult: TestResult = {
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      unanswered,
      scorePercentage,
      answers: answersDetails,
      timestamp: currentEndTime, // Это временная метка завершения теста
      startTime: overallTestStartTime || new Date(0).toISOString(), // Используем общее время начала
      endTime: currentEndTime,   // Явно устанавливаем время завершения
    };

    setTestResult(finalResult);

    // Сохраняем результат в localStorage для аналитики
    const savedResultsString = localStorage.getItem(LOCAL_STORAGE_KEY_ALL_RESULTS);
    let allResults: TestResult[] = [];
    if (savedResultsString) {
      try {
        allResults = JSON.parse(savedResultsString);
      } catch (e) {
        console.error('Ошибка парсинга сохраненных результатов тестов:', e);
        allResults = []; // В случае ошибки парсинга, начинаем с пустого массива
      }
    }
    allResults.push(finalResult); // Добавляем текущий результат
    localStorage.setItem(LOCAL_STORAGE_KEY_ALL_RESULTS, JSON.stringify(allResults)); // Сохраняем обновленный массив

    setTestFinished(true);
    setTestStarted(false); // Сбрасываем флаг теста после завершения
    setOverallTestStartTime(null); // Сбрасываем общее время начала после завершения теста
    clearLocalStorage(); // Очищаем localStorage связанных с текущим тестом (кроме всех результатов)
  }, [questions, userAnswers, clearLocalStorage, overallTestStartTime]); // Зависимости для useCallback

  /**
   * @function handleNextQuestion
   * @description Переходит к следующему вопросу или завершает тест, если это последний вопрос.
   */
  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      // При переходе к следующему вопросу, сбрасываем время начала в ref
      questionStartTimeRef.current = Date.now();
      // И сбрасываем remainingTime для нового вопроса
      setRemainingTime(questions[currentQuestionIndex + 1]?.timeEstimate || INITIAL_TIME_PER_QUESTION);
    } else {
      // Если это последний вопрос, завершаем тест
      calculateTestResult();
    }
  }, [currentQuestionIndex, questions, calculateTestResult]);

  /**
   * @function handlePreviousQuestion
   * @description Переходит к предыдущему вопросу.
   */
  const handlePreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
      // При переходе назад, также сбрасываем время начала в ref
      questionStartTimeRef.current = Date.now();
      // И сбрасываем remainingTime для предыдущего вопроса
      setRemainingTime(questions[currentQuestionIndex - 1]?.timeEstimate || INITIAL_TIME_PER_QUESTION);
    }
  }, [currentQuestionIndex, questions]);

  /**
   * @function handleAnswerSelect
   * @description Обрабатывает выбор ответа пользователем, сохраняет его и переходит к следующему вопросу.
   * @param {string} questionId - ID вопроса, на который был дан ответ.
   * @param {string} selectedOptionId - ID выбранного варианта ответа.
   */
  const handleAnswerSelect = useCallback((questionId: string, selectedOptionId: string) => {
    // Вычисляем время, потраченное на текущий вопрос
    const timeSpentOnQuestion = (questions[currentQuestionIndex]?.timeEstimate || INITIAL_TIME_PER_QUESTION) - remainingTime;
    const actualTimeSpent = Math.max(0, timeSpentOnQuestion); // Гарантируем неотрицательное значение

    setUserAnswers((prevAnswers) => {
      const existingAnswerIndex = prevAnswers.findIndex(
        (answer) => answer.questionId === questionId
      );

      const newAnswer: UserAnswer = {
        questionId,
        selectedOptionId,
        timeSpent: actualTimeSpent,
      };

      if (existingAnswerIndex > -1) {
        const updatedAnswers = [...prevAnswers];
        updatedAnswers[existingAnswerIndex] = newAnswer;
        return updatedAnswers;
      } else {
        return [...prevAnswers, newAnswer];
      }
    });

    // Автоматический переход к следующему вопросу после выбора ответа
    handleNextQuestion();
  }, [questions, currentQuestionIndex, remainingTime, handleNextQuestion]);

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

    // НОВОЕ: Устанавливаем и сохраняем общее время начала теста
    const now = new Date().toISOString();
    setOverallTestStartTime(now);
    localStorage.setItem(LOCAL_STORAGE_KEY_OVERALL_TEST_START_TIME, now);

    localStorage.setItem(LOCAL_STORAGE_KEY_TEST_STARTED, 'true');
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
    const savedTestStarted = localStorage.getItem(LOCAL_STORAGE_KEY_TEST_STARTED);
    const savedLastQuestionStartTime = localStorage.getItem(LOCAL_STORAGE_KEY_LAST_QUESTION_START_TIME);
    const savedOverallTestStartTime = localStorage.getItem(LOCAL_STORAGE_KEY_OVERALL_TEST_START_TIME); // НОВОЕ

    const loadedQuestions = generateQuestions(); // Генерируем вопросы для загрузки
    setQuestions(loadedQuestions); // Устанавливаем вопросы, чтобы они были доступны

    if (savedAnswers && savedIndex && savedTestStarted === 'true') {
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

          // Восстанавливаем общее время начала теста
          if (savedOverallTestStartTime) {
            setOverallTestStartTime(savedOverallTestStartTime);
          } else {
            // Если по какой-то причине общее время начала не было сохранено, используем текущее
            // и сохраняем его на всякий случай.
            const now = new Date().toISOString();
            setOverallTestStartTime(now);
            localStorage.setItem(LOCAL_STORAGE_KEY_OVERALL_TEST_START_TIME, now);
          }

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
  }, [startNewTest]); // Зависимости для useCallback

  // --- КОНЕЦ: Все функции useCallback определены ---


  // Effect для инициализации вопросов при первом рендере и проверки прогресса
  useEffect(() => {
    const initialQuestions = generateQuestions();
    setQuestions(initialQuestions);

    const savedAnswers = localStorage.getItem(LOCAL_STORAGE_KEY_ANSWERS);
    const savedIndex = localStorage.getItem(LOCAL_STORAGE_KEY_CURRENT_INDEX);
    const savedTestStarted = localStorage.getItem(LOCAL_STORAGE_KEY_TEST_STARTED);

    // НОВОЕ: Проверяем, есть ли сохраненное общее время начала теста
    const savedOverallTestStartTime = localStorage.getItem(LOCAL_STORAGE_KEY_OVERALL_TEST_START_TIME);

    if (savedAnswers && savedIndex && savedTestStarted === 'true' && savedOverallTestStartTime) {
      try {
        const parsedAnswers: UserAnswer[] = JSON.parse(savedAnswers);
        const parsedIndex: number = parseInt(savedIndex, 10);

        // Проверяем, что сохраненные данные валидны и не приводят к выходу за пределы массива вопросов
        if (parsedAnswers.length > 0 && !isNaN(parsedIndex) && parsedIndex < initialQuestions.length) {
          setShowResumeOption(true);
          // Устанавливаем startTime из localStorage, если тест можно возобновить
          setOverallTestStartTime(savedOverallTestStartTime);
        } else {
          clearLocalStorage(); // Данные некорректны, очищаем
        }
      } catch (e) {
        console.error('Failed to parse saved test data during initial load:', e);
        clearLocalStorage(); // Данные повреждены, очищаем
      }
    } else {
      // Если нет полного набора данных для возобновления, очищаем все связанные с тестом,
      // чтобы избежать частичного сохранения или ошибок.
      clearLocalStorage();
    }
  }, [clearLocalStorage]); // Зависимости для useEffect

  // Effect для обработки таймера
  useEffect(() => {
    let timerId: number | undefined;

    if (testStarted && !testFinished && questions[currentQuestionIndex]) {
      // При каждом рендере с активным тестом, пересчитываем оставшееся время
      // на основе последнего сохраненного времени начала вопроса
      const initialTimeForCurrentQuestion = questions[currentQuestionIndex].timeEstimate || INITIAL_TIME_PER_QUESTION;
      const elapsedSinceStart = (Date.now() - questionStartTimeRef.current) / 1000;
      const timeLeftOnLoad = Math.max(0, initialTimeForCurrentQuestion - elapsedSinceStart);

      // Устанавливаем remainingTime только если оно не равно текущему значению, чтобы избежать лишних ререндеров
      if (Math.round(remainingTime) !== Math.round(timeLeftOnLoad)) {
        setRemainingTime(timeLeftOnLoad);
      }
      
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
    } else { // Если тест не начат или завершен, останавливаем таймер
      if (timerId) {
        window.clearInterval(timerId);
      }
      // setRemainingTime(INITIAL_TIME_PER_QUESTION); // Это может быть лишним и приводить к миганию
    }

    // Cleanup function
    return () => {
      if (timerId) {
        window.clearInterval(timerId);
      }
    };
  }, [testStarted, testFinished, currentQuestionIndex, questions, handleNextQuestion]); // Зависимости для useEffect

  // Effect для сохранения прогресса при смене вопроса или при выборе ответа
  useEffect(() => {
    if (testStarted && !testFinished) {
      localStorage.setItem(LOCAL_STORAGE_KEY_ANSWERS, JSON.stringify(userAnswers));
      localStorage.setItem(LOCAL_STORAGE_KEY_CURRENT_INDEX, currentQuestionIndex.toString());
      localStorage.setItem(LOCAL_STORAGE_KEY_LAST_QUESTION_START_TIME, questionStartTimeRef.current.toString());
      // LOCAL_STORAGE_KEY_OVERALL_TEST_START_TIME уже сохраняется в startNewTest и resumeTest
    }
  }, [userAnswers, currentQuestionIndex, testStarted, testFinished]); // Зависимости для useEffect

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

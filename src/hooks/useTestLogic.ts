import { useState, useEffect, useCallback, useRef } from 'react';
import { Question, UserAnswer, TestResult, AnswerDetail } from '../types/test.d';
import { generateQuestions } from '../data/questions';

// Константы для localStorage
const LOCAL_STORAGE_KEY_ANSWERS = 'testUserAnswers';
const LOCAL_STORAGE_KEY_CURRENT_INDEX = 'testCurrentQuestionIndex';
const LOCAL_STORAGE_KEY_TEST_STARTED = 'testStarted';
const LOCAL_STORAGE_KEY_LAST_QUESTION_START_TIME = 'testLastQuestionStartTime';
const LOCAL_STORAGE_KEY_ALL_RESULTS = 'allTestResults'; // Ключ для всех результатов
const LOCAL_STORAGE_KEY_OVERALL_TEST_START_TIME = 'overallTestStartTime'; // Ключ: Для общего времени начала теста

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
  resetTestStateForNavigation: () => void; // <-- ДОБАВЛЕНО: Новая функция
}

const useTestLogic = (): UseTestLogicReturn => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [testStarted, setTestStarted] = useState<boolean>(false);
  const [testFinished, setTestFinished] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [overallTestStartTime, setOverallTestStartTime] = useState<string | null>(null);
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
    localStorage.removeItem(LOCAL_STORAGE_KEY_OVERALL_TEST_START_TIME);
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
      // ИСПРАВЛЕНО: Преобразование undefined в null
      const userAnswer = userAnswers.find((ans) => ans.questionId === question.id) || null;
      let isCorrect = false;

      if (userAnswer && userAnswer.selectedOptionId) {
        // Теперь isCorrect берется из сохраненного ответа пользователя
        isCorrect = userAnswer.isCorrect;
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
      timestamp: currentEndTime,
      startTime: overallTestStartTime || new Date(0).toISOString(),
      endTime: currentEndTime,
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
        allResults = [];
      }
    }
    allResults.push(finalResult);
    localStorage.setItem(LOCAL_STORAGE_KEY_ALL_RESULTS, JSON.stringify(allResults));

    setTestFinished(true);
    setTestStarted(false);
    setOverallTestStartTime(null);
    clearLocalStorage();
  }, [questions, userAnswers, clearLocalStorage, overallTestStartTime]);

  /**
   * @function handleNextQuestion
   * @description Переходит к следующему вопросу или завершает тест, если это последний вопрос.
   */
  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      questionStartTimeRef.current = Date.now();
      setRemainingTime(questions[currentQuestionIndex + 1]?.timeEstimate || INITIAL_TIME_PER_QUESTION);
    } else {
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
      questionStartTimeRef.current = Date.now();
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
    const actualTimeSpent = Math.max(0, timeSpentOnQuestion);

    // Получаем текущий вопрос для определения isCorrect
    const currentQuestion = questions[currentQuestionIndex];
    let isAnswerCorrect: boolean;

    if (currentQuestion.type === 'multiple-choice') {
        isAnswerCorrect = selectedOptionId === currentQuestion.correctAnswer;
    } else {
      // Для 'case-study' или других типов, где нет однозначного correctAnswer,
      // считаем ответ "правильным", если он был предоставлен.
      // Если нужна более сложная логика для case-study, ее нужно будет реализовать здесь.
      isAnswerCorrect = true;
    }

    setUserAnswers((prevAnswers) => {
      const existingAnswerIndex = prevAnswers.findIndex(
        (answer) => answer.questionId === questionId
      );

      const newAnswer: UserAnswer = {
        questionId,
        selectedOptionId,
        isCorrect: isAnswerCorrect, // ИСПРАВЛЕНО: Добавлен isCorrect
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
    setQuestions(newQuestions); // Устанавливаем вопросы
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setTestStarted(true);
    setTestFinished(false);
    setTestResult(null);
    setShowResumeOption(false);

    // Устанавливаем и сохраняем общее время начала теста
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
    const savedOverallTestStartTime = localStorage.getItem(LOCAL_STORAGE_KEY_OVERALL_TEST_START_TIME);

    const loadedQuestions = generateQuestions(); // Генерируем вопросы для загрузки
    setQuestions(loadedQuestions); // Устанавливаем вопросы, чтобы они были доступны

    if (savedAnswers && savedIndex && savedTestStarted === 'true') {
      try {
        const parsedAnswers: UserAnswer[] = JSON.parse(savedAnswers);
        const parsedIndex: number = parseInt(savedIndex, 10);

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
          const elapsed = (Date.now() - parsedLastQuestionStartTime) / 1000;
          const questionTime = loadedQuestions[parsedIndex]?.timeEstimate || INITIAL_TIME_PER_QUESTION;
          const remaining = Math.max(0, questionTime - elapsed);
          setRemainingTime(remaining);
          questionStartTimeRef.current = parsedLastQuestionStartTime;

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
  }, [startNewTest]);

  // ДОБАВЛЕНО: Новая функция для сброса состояния теста при навигации
  const resetTestStateForNavigation = useCallback(() => {
    setTestStarted(false); // Сбрасываем флаг, что тест запущен
    setCurrentQuestionIndex(0); // Сбрасываем индекс вопроса на 0
    // userAnswers не сбрасываем, чтобы сохранить showResumeOption
    setTestFinished(false); // Убеждаемся, что флаг завершения теста сброшен
    setTestResult(null); // Очищаем результаты, если они были показаны
    // showResumeOption, overallTestStartTime, remainingTime, questionStartTimeRef не сбрасываем
    // Это позволит useTestLogic корректно определить showResumeOption на основе localStorage
  }, []);


  // --- КОНЕЦ: Все функции useCallback определены ---


  // Effect для начальной загрузки состояния из localStorage и определения showResumeOption
  useEffect(() => {
    const savedAnswers = localStorage.getItem(LOCAL_STORAGE_KEY_ANSWERS);
    const savedIndex = localStorage.getItem(LOCAL_STORAGE_KEY_CURRENT_INDEX);
    const savedTestStarted = localStorage.getItem(LOCAL_STORAGE_KEY_TEST_STARTED);
    const savedOverallTestStartTime = localStorage.getItem(LOCAL_STORAGE_KEY_OVERALL_TEST_START_TIME);

    // Только если тест был начат и есть сохраненные данные, показываем опцию "Продолжить"
    if (savedAnswers && savedIndex && savedTestStarted === 'true' && savedOverallTestStartTime) {
      try {
        const parsedAnswers: UserAnswer[] = JSON.parse(savedAnswers);
        const parsedIndex: number = parseInt(savedIndex, 10);
        
        // Генерируем вопросы здесь, чтобы проверить их длину для showResumeOption
        // Но НЕ устанавливаем их в состояние questions, это делает startNewTest/resumeTest
        const initialQuestionsCheck = generateQuestions(); 

        if (parsedAnswers.length > 0 && !isNaN(parsedIndex) && parsedIndex < initialQuestionsCheck.length) {
          setShowResumeOption(true);
          setOverallTestStartTime(savedOverallTestStartTime);
          // ВАЖНО: Мы не устанавливаем questions здесь. Они будут установлены startNewTest/resumeTest
        } else {
          clearLocalStorage(); // Очищаем, если данные некорректны
        }
      } catch (e) {
        console.error('Failed to parse saved test data during initial load:', e);
        clearLocalStorage();
      }
    } else {
      clearLocalStorage(); // Очищаем, если нет сохраненных данных или они неполные
    }
  }, [clearLocalStorage]); // Зависимости

  // Effect для обработки таймера
  useEffect(() => {
    let timerId: number | undefined;

    if (testStarted && !testFinished && questions[currentQuestionIndex]) {
      const initialTimeForCurrentQuestion = questions[currentQuestionIndex].timeEstimate || INITIAL_TIME_PER_QUESTION;
      const elapsedSinceStart = (Date.now() - questionStartTimeRef.current) / 1000;
      const timeLeftOnLoad = Math.max(0, initialTimeForCurrentQuestion - elapsedSinceStart);

      if (Math.round(remainingTime) !== Math.round(timeLeftOnLoad)) {
        setRemainingTime(timeLeftOnLoad);
      }

      timerId = window.setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime <= 1) {
            window.clearInterval(timerId);
            handleNextQuestion();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      if (timerId) {
        window.clearInterval(timerId);
      }
    }

    return () => {
      if (timerId) {
        window.clearInterval(timerId);
      }
    };
  }, [testStarted, testFinished, currentQuestionIndex, questions, handleNextQuestion]);

  // Effect для сохранения прогресса при смене вопроса или при выборе ответа
  useEffect(() => {
    if (testStarted && !testFinished) {
      localStorage.setItem(LOCAL_STORAGE_KEY_ANSWERS, JSON.stringify(userAnswers));
      localStorage.setItem(LOCAL_STORAGE_KEY_CURRENT_INDEX, currentQuestionIndex.toString());
      localStorage.setItem(LOCAL_STORAGE_KEY_LAST_QUESTION_START_TIME, questionStartTimeRef.current.toString());
    }
  }, [userAnswers, currentQuestionIndex, testStarted, testFinished]);

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
    resetTestStateForNavigation, // <-- ОБЯЗАТЕЛЬНО ВОЗВРАЩАЕМ
  };
};

export default useTestLogic;

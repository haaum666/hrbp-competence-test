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
    console.log('clearLocalStorage: Выполняется очистка связанных ключей localStorage.');
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
      const userAnswer = userAnswers.find((ans) => ans.questionId === question.id) || null;
      let isCorrect = false;

      if (userAnswer && userAnswer.selectedOptionId) {
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
      isAnswerCorrect = true; // Для 'case-study' или других типов
    }

    setUserAnswers((prevAnswers) => {
      const existingAnswerIndex = prevAnswers.findIndex(
        (answer) => answer.questionId === questionId
      );

      const newAnswer: UserAnswer = {
        questionId,
        selectedOptionId,
        isCorrect: isAnswerCorrect,
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
    console.log('startNewTest: Запуск нового теста.');
    clearLocalStorage();
    const newQuestions = generateQuestions(); // Генерируем вопросы только один раз
    setQuestions(newQuestions); // Устанавливаем вопросы
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setTestFinished(false);
    setTestResult(null);
    setShowResumeOption(false);

    // Устанавливаем и сохраняем общее время начала теста
    const now = new Date().toISOString();
    setOverallTestStartTime(now);
    localStorage.setItem(LOCAL_STORAGE_KEY_OVERALL_TEST_START_TIME, now); // Сохраняем время до флага testStarted

    setTestStarted(true); // Устанавливаем в true только после инициализации вопросов и времени
    localStorage.setItem(LOCAL_STORAGE_KEY_TEST_STARTED, 'true'); // Сохраняем флаг
    localStorage.setItem(LOCAL_STORAGE_KEY_LAST_QUESTION_START_TIME, Date.now().toString());
    questionStartTimeRef.current = Date.now(); // Обновляем ref
    setRemainingTime(newQuestions[0]?.timeEstimate || INITIAL_TIME_PER_QUESTION);
    console.log('startNewTest: Новый тест успешно инициализирован и сохранен в localStorage.');
  }, [clearLocalStorage]);

  /**
   * @function resumeTest
   * @description Продолжает тест с сохраненного состояния из localStorage.
   */
  const resumeTest = useCallback(() => {
    console.log('resumeTest: Попытка возобновить тест.');
    const savedAnswers = localStorage.getItem(LOCAL_STORAGE_KEY_ANSWERS);
    const savedIndex = localStorage.getItem(LOCAL_STORAGE_KEY_CURRENT_INDEX);
    const savedTestStarted = localStorage.getItem(LOCAL_STORAGE_KEY_TEST_STARTED);
    const savedLastQuestionStartTime = localStorage.getItem(LOCAL_STORAGE_KEY_LAST_QUESTION_START_TIME);
    const savedOverallTestStartTime = localStorage.getItem(LOCAL_STORAGE_KEY_OVERALL_TEST_START_TIME);

    const loadedQuestions = generateQuestions(); // Генерируем вопросы для загрузки
    setQuestions(loadedQuestions); // Устанавливаем вопросы, чтобы они были доступны

    if (savedAnswers && savedIndex && savedTestStarted === 'true' && savedOverallTestStartTime) { // Убеждаемся, что все данные есть
      try {
        const parsedAnswers: UserAnswer[] = JSON.parse(savedAnswers);
        const parsedIndex: number = parseInt(savedIndex, 10);

        if (!isNaN(parsedIndex) && parsedIndex < loadedQuestions.length) { // Проверка индекса, без проверки на parsedAnswers.length
          setUserAnswers(parsedAnswers);
          setCurrentQuestionIndex(parsedIndex);
          setTestStarted(true);
          setTestFinished(false);
          setTestResult(null);
          setShowResumeOption(false);

          setOverallTestStartTime(savedOverallTestStartTime); // Восстанавливаем общее время начала теста

          // Рассчитываем оставшееся время для текущего вопроса
          const elapsed = (Date.now() - parseInt(savedLastQuestionStartTime || '0', 10)) / 1000;
          const questionTime = loadedQuestions[parsedIndex]?.timeEstimate || INITIAL_TIME_PER_QUESTION;
          const remaining = Math.max(0, questionTime - elapsed);
          setRemainingTime(remaining);
          questionStartTimeRef.current = parseInt(savedLastQuestionStartTime || '0', 10);

          localStorage.setItem(LOCAL_STORAGE_KEY_TEST_STARTED, 'true'); // Подтверждаем, что тест запущен
          console.log('resumeTest: Тест успешно возобновлен.');
        } else {
          console.warn('resumeTest: Сохраненный индекс вне допустимых границ или невалиден, начинаем новый тест.');
          startNewTest();
        }
      } catch (e) {
        console.error('resumeTest: Ошибка парсинга сохраненных данных, начинаем новый тест:', e);
        startNewTest();
      }
    } else {
      console.log('resumeTest: Отсутствуют необходимые данные для возобновления, запускаем новый тест.');
      startNewTest();
    }
  }, [startNewTest]);

  // ДОБАВЛЕНО: Новая функция для сброса состояния теста при навигации
  const resetTestStateForNavigation = useCallback(() => {
    console.log('resetTestStateForNavigation: Сброс состояния для навигации.');
    setTestStarted(false);
    setCurrentQuestionIndex(0);
    setTestFinished(false);
    setTestResult(null);
    // showResumeOption, overallTestStartTime, remainingTime, questionStartTimeRef не сбрасываем,
    // чтобы useTestLogic мог корректно определить showResumeOption при следующем рендере
  }, []);


  // --- КОНЕЦ: Все функции useCallback определены ---


  // Effect для начальной загрузки состояния из localStorage и определения showResumeOption
  useEffect(() => {
    console.log('useEffect (showResumeOption): -- Начало выполнения эффекта --');

    const savedAnswers = localStorage.getItem(LOCAL_STORAGE_KEY_ANSWERS);
    const savedIndex = localStorage.getItem(LOCAL_STORAGE_KEY_CURRENT_INDEX);
    const savedTestStarted = localStorage.getItem(LOCAL_STORAGE_KEY_TEST_STARTED);
    const savedOverallTestStartTime = localStorage.getItem(LOCAL_STORAGE_KEY_OVERALL_TEST_START_TIME);

    console.log(`useEffect (showResumeOption): savedAnswers: ${savedAnswers ? 'есть' : 'нет'} (Значение: '${savedAnswers}')`);
    console.log(`useEffect (showResumeOption): savedIndex: ${savedIndex ? 'есть' : 'нет'} (Значение: '${savedIndex}')`);
    console.log(`useEffect (showResumeOption): savedTestStarted: '${savedTestStarted}'`);
    console.log(`useEffect (showResumeOption): savedOverallTestStartTime: ${savedOverallTestStartTime ? 'есть' : 'нет'} (Значение: '${savedOverallTestStartTime}')`);

    let shouldShowResume = false;
    let shouldClearStorage = false;

    // Проверяем, что ВСЕ ключевые данные для возобновления теста существуют в localStorage
    if (savedAnswers !== null && savedIndex !== null && savedTestStarted === 'true' && savedOverallTestStartTime !== null) {
      console.log('useEffect (showResumeOption): **Условие 1 (наличие всех ключей) ВЫПОЛНЕНО.**');
      try {
        const parsedAnswers: UserAnswer[] = JSON.parse(savedAnswers);
        const parsedIndex: number = parseInt(savedIndex, 10);
        const initialQuestionsCheck = generateQuestions(); // Генерируем вопросы для проверки длины

        console.log(`useEffect (showResumeOption): parsedAnswers.length: ${parsedAnswers.length}`);
        console.log(`useEffect (showResumeOption): parsedIndex (parseInt): ${parsedIndex}`);
        console.log(`useEffect (showResumeOption): initialQuestionsCheck.length (from generateQuestions): ${initialQuestionsCheck.length}`);

        const isIndexValid = !isNaN(parsedIndex) && parsedIndex < initialQuestionsCheck.length;
        console.log(`useEffect (showResumeOption): isIndexValid (!isNaN(parsedIndex) && parsedIndex < initialQuestionsCheck.length): ${isIndexValid}`);
        // Убрали isAnswersNotEmpty, так как даже 0 ответов при старте теста - это валидное состояние
        // const isAnswersNotEmpty = parsedAnswers.length > 0;
        // console.log(`useEffect (showResumeOption): isAnswersNotEmpty (parsedAnswers.length > 0): ${isAnswersNotEmpty}`);

        // Теперь для showResumeOption достаточно, чтобы индекс был валиден
        if (isIndexValid) {
          shouldShowResume = true;
          setOverallTestStartTime(savedOverallTestStartTime);
          console.log('useEffect (showResumeOption): **Условие 2 (валидность индекса) ВЫПОЛНЕНО.** shouldShowResume = true.');
        } else {
          console.warn('useEffect (showResumeOption): Сохраненные данные теста невалидны или неполны (индекс вне границ). Инициируем очистку.');
          shouldClearStorage = true;
        }
      } catch (e) {
        console.error('useEffect (showResumeOption): Ошибка парсинга сохраненных данных:', e);
        shouldClearStorage = true;
      }
    } else {
      console.log('useEffect (showResumeOption): **Условие 1 (наличие всех ключей) НЕ ВЫПОЛНЕНО.** Отсутствуют необходимые данные для возобновления теста (один или более ключей отсутствуют/null).');
    }

    // Применяем изменения после всех проверок
    setShowResumeOption(shouldShowResume);
    if (shouldClearStorage) {
      clearLocalStorage();
      console.log('useEffect (showResumeOption): localStorage очищен из-за некорректных данных.');
    }
    console.log(`useEffect (showResumeOption): -- Завершение выполнения эффекта. Итоговое showResumeOption: ${shouldShowResume} --`);

  }, [clearLocalStorage]); // Зависимость от clearLocalStorage

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
    console.log(`useEffect (сохранение прогресса): testStarted: ${testStarted}, testFinished: ${testFinished}`);
    if (testStarted && !testFinished) {
      console.log('useEffect (сохранение прогресса): Сохраняем данные в localStorage...');
      localStorage.setItem(LOCAL_STORAGE_KEY_ANSWERS, JSON.stringify(userAnswers));
      localStorage.setItem(LOCAL_STORAGE_KEY_CURRENT_INDEX, currentQuestionIndex.toString());
      localStorage.setItem(LOCAL_STORAGE_KEY_LAST_QUESTION_START_TIME, questionStartTimeRef.current.toString());
      localStorage.setItem(LOCAL_STORAGE_KEY_OVERALL_TEST_START_TIME, overallTestStartTime || new Date().toISOString());
    } else {
      console.log('useEffect (сохранение прогресса): Условия для сохранения не выполнены.');
    }
  }, [userAnswers, currentQuestionIndex, testStarted, testFinished, overallTestStartTime]);

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
    resetTestStateForNavigation,
  };
};

export default useTestLogic;

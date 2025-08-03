// src/hooks/useTestLogic.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { Question, UserAnswer, TestResult, AnswerDetail } from '../types/test.d';
import { generateQuestions } from '../data/questions';

// Константы для localStorage
const LOCAL_STORAGE_KEY_ANSWERS = 'testUserAnswers';
const LOCAL_STORAGE_KEY_CURRENT_INDEX = 'testCurrentQuestionIndex';
const LOCAL_STORAGE_KEY_TEST_STARTED = 'testStarted';
const LOCAL_STORAGE_KEY_LAST_QUESTION_START_TIME = 'testLastQuestionStartTime';
const LOCAL_STORAGE_KEY_ALL_RESULTS = 'allTestResults';
const LOCAL_STORAGE_KEY_OVERALL_TEST_START_TIME = 'overallTestStartTime';

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
  resetTestStateForNavigation: () => void;
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

  const questionStartTimeRef = useRef<number>(Date.now());

  const clearLocalStorage = useCallback(() => {
    console.log('clearLocalStorage: Выполняется очистка связанных ключей localStorage.');
    localStorage.removeItem(LOCAL_STORAGE_KEY_ANSWERS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_CURRENT_INDEX);
    localStorage.removeItem(LOCAL_STORAGE_KEY_TEST_STARTED);
    localStorage.removeItem(LOCAL_STORAGE_KEY_LAST_QUESTION_START_TIME);
    localStorage.removeItem(LOCAL_STORAGE_KEY_OVERALL_TEST_START_TIME);
  }, []);

  const calculateTestResult = useCallback(() => {
    if (questions.length === 0 || !overallTestStartTime) return;

    const correctAnswers = userAnswers.filter(answer => {
      const question = questions.find(q => q.id === answer.questionId);
      return question && question.correctAnswer === answer.selectedOptionId;
    }).length;

    const totalQuestions = questions.length;
    const incorrectAnswers = userAnswers.filter(answer => {
      const question = questions.find(q => q.id === answer.questionId);
      return question && question.correctAnswer !== answer.selectedOptionId;
    }).length;
    const unanswered = totalQuestions - userAnswers.length;

    const scorePercentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    const testDuration = Date.now() - new Date(overallTestStartTime).getTime();

    const answerDetails: AnswerDetail[] = questions.map(question => {
      const userAnswerFound = userAnswers.find(ua => ua.questionId === question.id);
      return {
        question: question,
        userAnswer: userAnswerFound || null,
        isCorrect: userAnswerFound ? (question.correctAnswer === userAnswerFound.selectedOptionId) : false,
      };
    });

    const finalResult: TestResult = {
      scorePercentage: parseFloat(scorePercentage.toFixed(2)),
      correctAnswers: correctAnswers,
      incorrectAnswers: incorrectAnswers,
      unanswered: unanswered,
      totalQuestions: totalQuestions,
      answers: answerDetails,
      timestamp: new Date().toISOString(),
      completionTime: Math.floor(testDuration / 1000),
      startTime: overallTestStartTime,
      endTime: new Date().toISOString(),
    };

    const allResults = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_ALL_RESULTS) || '[]') as TestResult[];
    allResults.push(finalResult);
    localStorage.setItem(LOCAL_STORAGE_KEY_ALL_RESULTS, JSON.stringify(allResults));

    setTestResult(finalResult);
    setTestFinished(true);
    setTestStarted(false);
    console.log('useTestLogic: testStarted установлен в FALSE (из calculateTestResult)');
    setOverallTestStartTime(null);
    clearLocalStorage();
  }, [questions, userAnswers, clearLocalStorage, overallTestStartTime]);

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      questionStartTimeRef.current = Date.now();
      // Убеждаемся, что следующий вопрос существует, прежде чем получить его время
      setRemainingTime(questions[currentQuestionIndex + 1]?.timeEstimate || INITIAL_TIME_PER_QUESTION);
    } else {
      calculateTestResult();
    }
  }, [currentQuestionIndex, questions, calculateTestResult]);

  const handlePreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
      questionStartTimeRef.current = Date.now(); // Сброс таймера для предыдущего вопроса
      // Убеждаемся, что предыдущий вопрос существует, прежде чем получить его время
      setRemainingTime(questions[currentQuestionIndex - 1]?.timeEstimate || INITIAL_TIME_PER_QUESTION);
    }
  }, [currentQuestionIndex, questions]);

  const handleAnswerSelect = useCallback((questionId: string, selectedOptionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) {
      console.error(`Question with ID ${questionId} not found.`);
      return;
    }

    const timeSpent = Math.floor((Date.now() - questionStartTimeRef.current) / 1000);

    const newAnswer: UserAnswer = {
      questionId: questionId,
      selectedOptionId: selectedOptionId,
      isCorrect: question.correctAnswer === selectedOptionId,
      timeSpent: timeSpent,
    };

    setUserAnswers((prevAnswers) => {
      const existingAnswerIndex = prevAnswers.findIndex(
        (answer) => answer.questionId === questionId
      );

      if (existingAnswerIndex > -1) {
        const updatedAnswers = [...prevAnswers];
        updatedAnswers[existingAnswerIndex] = newAnswer;
        return updatedAnswers;
      } else {
        return [...prevAnswers, newAnswer];
      }
    });
    // <--- УДАЛЕНО: handleNextQuestion() больше не вызывается автоматически здесь.
    // Это позволит пользователю оставаться на вопросе после выбора ответа.
  }, [questions]); // Убрал currentQuestionIndex и remainingTime из зависимостей, т.к. handleNextQuestion не вызывается

  const startNewTest = useCallback(() => {
    console.log('startNewTest: Запуск нового теста.');
    clearLocalStorage();
    const newQuestions = generateQuestions();
    setQuestions(newQuestions);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setTestFinished(false);
    setTestResult(null);
    setShowResumeOption(false);

    const now = new Date().toISOString();
    setOverallTestStartTime(now);
    localStorage.setItem(LOCAL_STORAGE_KEY_OVERALL_TEST_START_TIME, now);

    setTestStarted(true);
    console.log('useTestLogic: testStarted установлен в TRUE (из startNewTest)');
    localStorage.setItem(LOCAL_STORAGE_KEY_TEST_STARTED, 'true');
    localStorage.setItem(LOCAL_STORAGE_KEY_LAST_QUESTION_START_TIME, Date.now().toString());
    questionStartTimeRef.current = Date.now();
    setRemainingTime(newQuestions[0]?.timeEstimate || INITIAL_TIME_PER_QUESTION);
    console.log('startNewTest: Новый тест успешно инициализирован и сохранен в localStorage.');
  }, [clearLocalStorage]);

  const resumeTest = useCallback(() => {
    console.log('resumeTest: Попытка возобновить тест.');
    const savedAnswers = localStorage.getItem(LOCAL_STORAGE_KEY_ANSWERS);
    const savedIndex = localStorage.getItem(LOCAL_STORAGE_KEY_CURRENT_INDEX);
    const savedTestStarted = localStorage.getItem(LOCAL_STORAGE_KEY_TEST_STARTED);
    const savedOverallTestStartTime = localStorage.getItem(LOCAL_STORAGE_KEY_OVERALL_TEST_START_TIME);

    const loadedQuestions = generateQuestions();
    setQuestions(loadedQuestions);

    if (savedAnswers && savedIndex && savedTestStarted === 'true' && savedOverallTestStartTime) {
      try {
        const parsedAnswers: UserAnswer[] = JSON.parse(savedAnswers);
        const parsedIndex: number = parseInt(savedIndex, 10);
        const savedLastQuestionStartTime = localStorage.getItem(LOCAL_STORAGE_KEY_LAST_QUESTION_START_TIME);

        const initialQuestionsCheck = generateQuestions(); // Для проверки валидности индекса

        console.log('useEffect (showResumeOption): savedAnswers:', savedAnswers ? 'есть' : 'нет', '(Значение:', savedAnswers, ')');
        console.log('useEffect (showResumeOption): savedIndex:', savedIndex ? 'есть' : 'нет', '(Значение:', savedIndex, ')');
        console.log('useEffect (showResumeOption): savedTestStarted:', savedTestStarted);
        console.log('useEffect (showResumeOption): savedOverallTestStartTime:', savedOverallTestStartTime ? 'есть' : 'нет', '(Значение:', savedOverallTestStartTime, ')');

        const hasAllKeys = savedAnswers && savedIndex && savedTestStarted && savedOverallTestStartTime;
        if (!hasAllKeys) {
          console.log('useEffect (showResumeOption): **Условие 1 (наличие всех ключей) НЕ ВЫПОЛНЕНО.** Отсутствуют необходимые данные для возобновления теста (один или более ключей отсутствуют/null).');
        } else {
          console.log('useEffect (showResumeOption): **Условие 1 (наличие всех ключей) ВЫПОЛНЕНО.**');
        }

        const isIndexValid = !isNaN(parsedIndex) && parsedIndex < initialQuestionsCheck.length && parsedIndex >= 0;
        console.log('useEffect (showResumeOption): parsedAnswers.length:', parsedAnswers.length);
        console.log('useEffect (showResumeOption): parsedIndex (parseInt):', parsedIndex);
        console.log('useEffect (showResumeOption): initialQuestionsCheck.length (from generateQuestions):', initialQuestionsCheck.length);
        console.log('useEffect (showResumeOption): isIndexValid (!isNaN(parsedIndex) && parsedIndex < initialQuestionsCheck.length):', isIndexValid);

        if (hasAllKeys && isIndexValid) {
          setUserAnswers(parsedAnswers);
          setCurrentQuestionIndex(parsedIndex);
          setTestStarted(true);
          console.log('useTestLogic: testStarted установлен в TRUE (из resumeTest)');
          setTestFinished(false);
          setTestResult(null);
          setShowResumeOption(false);
          setOverallTestStartTime(savedOverallTestStartTime);

          if (savedLastQuestionStartTime) {
            const timeElapsedSinceLastQuestion = Math.floor((Date.now() - parseInt(savedLastQuestionStartTime, 10)) / 1000);
            const questionTimeEstimate = loadedQuestions[parsedIndex]?.timeEstimate || INITIAL_TIME_PER_QUESTION;
            setRemainingTime(Math.max(0, questionTimeEstimate - timeElapsedSinceLastQuestion));
            questionStartTimeRef.current = parseInt(savedLastQuestionStartTime, 10);
          } else {
            questionStartTimeRef.current = Date.now();
            setRemainingTime(loadedQuestions[parsedIndex]?.timeEstimate || INITIAL_TIME_PER_QUESTION);
          }
          localStorage.setItem(LOCAL_STORAGE_KEY_TEST_STARTED, 'true');
          console.log('resumeTest: Тест успешно возобновлен.');
        } else {
          console.log('useEffect (showResumeOption): **Условие 2 (валидности индекса) НЕ ВЫПОЛНЕНО.** Начинаем новый тест.');
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

  const resetTestStateForNavigation = useCallback(() => {
    console.log('resetTestStateForNavigation: Сброс состояния для навигации.');
    setTestStarted(false);
    console.log('useTestLogic: testStarted установлен в FALSE (из resetTestStateForNavigation)');
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setTestFinished(false);
    setTestResult(null);
    setRemainingTime(INITIAL_TIME_PER_QUESTION);
    questionStartTimeRef.current = Date.now();
    setOverallTestStartTime(null);
    clearLocalStorage();
    setShowResumeOption(false);
  }, [clearLocalStorage]);

  // Эффект для инициализации или возобновления теста при загрузке компонента
  useEffect(() => {
    console.log('useEffect (инициализация/возобновление): -- Начало выполнения эффекта --');

    const savedAnswers = localStorage.getItem(LOCAL_STORAGE_KEY_ANSWERS);
    const savedIndex = localStorage.getItem(LOCAL_STORAGE_KEY_CURRENT_INDEX);
    const savedTestStarted = localStorage.getItem(LOCAL_STORAGE_KEY_TEST_STARTED);
    const savedOverallTestStartTime = localStorage.getItem(LOCAL_STORAGE_KEY_OVERALL_TEST_START_TIME);

    const initialQuestionsCheck = generateQuestions();

    console.log('useEffect (showResumeOption): savedAnswers:', savedAnswers ? 'есть' : 'нет', '(Значение:', savedAnswers, ')');
    console.log('useEffect (showResumeOption): savedIndex:', savedIndex ? 'есть' : 'нет', '(Значение:', savedIndex, ')');
    console.log('useEffect (showResumeOption): savedTestStarted:', savedTestStarted);
    console.log('useEffect (showResumeOption): savedOverallTestStartTime:', savedOverallTestStartTime ? 'есть' : 'нет', '(Значение:', savedOverallTestStartTime, ')');

    const hasAllKeys = savedAnswers && savedIndex && savedTestStarted && savedOverallTestStartTime;
    if (!hasAllKeys) {
      console.log('useEffect (showResumeOption): **Условие 1 (наличие всех ключей) НЕ ВЫПОЛНЕНО.** Отсутствуют необходимые данные для возобновления теста (один или более ключей отсутствуют/null).');
    } else {
      console.log('useEffect (showResumeOption): **Условие 1 (наличие всех ключей) ВЫПОЛНЕНО.**');
    }

    let parsedIndex = -1;
    try {
      if (savedIndex) {
        parsedIndex = parseInt(savedIndex, 10);
      }
    } catch (e) {
      console.error('Ошибка при парсинге savedIndex:', e);
    }

    const isIndexValid = !isNaN(parsedIndex) && parsedIndex < initialQuestionsCheck.length && parsedIndex >= 0;
    console.log('useEffect (showResumeOption): parsedAnswers.length:', (savedAnswers ? JSON.parse(savedAnswers).length : 'N/A'));
    console.log('useEffect (showResumeOption): parsedIndex (parseInt):', parsedIndex);
    console.log('useEffect (showResumeOption): initialQuestionsCheck.length (from generateQuestions):', initialQuestionsCheck.length);
    console.log('useEffect (showResumeOption): isIndexValid (!isNaN(parsedIndex) && parsedIndex < initialQuestionsCheck.length):', isIndexValid);


    if (hasAllKeys && isIndexValid) {
      console.log('useEffect (showResumeOption): **Условие 2 (валидности индекса) ВЫПОЛНЕНО.** shouldShowResume = true.');
      setShowResumeOption(true);
    } else {
      console.log('useEffect (showResumeOption): **Условие 2 (валидности индекса) НЕ ВЫПОЛНЕНО или данные неполные.** shouldShowResume = false.');
      setShowResumeOption(false);
      if (savedTestStarted === 'true') {
        clearLocalStorage();
        setTestStarted(false);
        setQuestions(generateQuestions());
      }
    }
    console.log('useEffect (showResumeOption): -- Завершение выполнения эффекта. Итоговое showResumeOption:', hasAllKeys && isIndexValid, '--');

  }, [clearLocalStorage]);

  // Эффект для таймера обратного отсчета
  useEffect(() => {
    if (!testStarted || testFinished) {
      return;
    }

    const timer = setInterval(() => {
      setRemainingTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          if (currentQuestionIndex < questions.length - 1) {
            handleNextQuestion();
          } else {
            calculateTestResult();
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testStarted, testFinished, remainingTime, currentQuestionIndex, questions, handleNextQuestion, calculateTestResult]);

  // Эффект для сохранения прогресса в localStorage
  useEffect(() => {
    console.log('useEffect (сохранение прогресса): testStarted:', testStarted, ', testFinished:', testFinished);
    if (testStarted && !testFinished) {
      console.log('useEffect (сохранение прогресса): Сохраняем данные в localStorage...');
      localStorage.setItem(LOCAL_STORAGE_KEY_ANSWERS, JSON.stringify(userAnswers));
      localStorage.setItem(LOCAL_STORAGE_KEY_CURRENT_INDEX, currentQuestionIndex.toString());
      localStorage.setItem(LOCAL_STORAGE_KEY_TEST_STARTED, 'true');
      localStorage.setItem(LOCAL_STORAGE_KEY_LAST_QUESTION_START_TIME, questionStartTimeRef.current.toString());
    } else {
      console.log('useEffect (сохранение прогресса): Условия для сохранения не выполнены.');
    }
  }, [userAnswers, currentQuestionIndex, testStarted, testFinished]);

  // Расчет процента выполнения теста
  const progressPercentage = questions.length > 0 ? (currentQuestionIndex / questions.length) * 100 : 0;

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

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
  testStarted: boolean; // <--- Это состояние
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
  const [testStarted, setTestStarted] = useState<boolean>(false); // <--- Это состояние
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
    if (questions.length === 0) return;

    // ... (остальной код calculateTestResult)

    setTestResult(finalResult);

    // ... (сохранение в localStorage)

    setTestFinished(true);
    setTestStarted(false); // <--- Здесь testStarted устанавливается в false
    console.log('useTestLogic: testStarted установлен в FALSE (из calculateTestResult)'); // НОВЫЙ ЛОГ
    setOverallTestStartTime(null);
    clearLocalStorage();
  }, [questions, userAnswers, clearLocalStorage, overallTestStartTime]);

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      questionStartTimeRef.current = Date.now();
      setRemainingTime(questions[currentQuestionIndex + 1]?.timeEstimate || INITIAL_TIME_PER_QUESTION);
    } else {
      calculateTestResult();
    }
  }, [currentQuestionIndex, questions, calculateTestResult]);

  const handlePreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
      questionStartTimeRef.current = Date.now();
      setRemainingTime(questions[currentQuestionIndex - 1]?.timeEstimate || INITIAL_TIME_PER_QUESTION);
    }
  }, [currentQuestionIndex, questions]);

  const handleAnswerSelect = useCallback((questionId: string, selectedOptionId: string) => {
    // ... (остальной код handleAnswerSelect)

    setUserAnswers((prevAnswers) => {
      // ... (логика обновления/добавления ответа)
    });

    handleNextQuestion();
  }, [questions, currentQuestionIndex, remainingTime, handleNextQuestion]);

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

    setTestStarted(true); // <--- Здесь testStarted устанавливается в true
    console.log('useTestLogic: testStarted установлен в TRUE (из startNewTest)'); // НОВЫЙ ЛОГ
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
        // ... (логика парсинга и установки состояний)

        setTestStarted(true); // <--- Здесь testStarted устанавливается в true
        console.log('useTestLogic: testStarted установлен в TRUE (из resumeTest)'); // НОВЫЙ ЛОГ
        setTestFinished(false);
        setTestResult(null);
        setShowResumeOption(false);

        setOverallTestStartTime(savedOverallTestStartTime);

        // ... (расчет времени и установка рефа)

        localStorage.setItem(LOCAL_STORAGE_KEY_TEST_STARTED, 'true');
        console.log('resumeTest: Тест успешно возобновлен.');
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
    setTestStarted(false); // <--- Здесь testStarted устанавливается в false
    console.log('useTestLogic: testStarted установлен в FALSE (из resetTestStateForNavigation)'); // НОВЫЙ ЛОГ
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

  // ... (остальные useEffects и return)

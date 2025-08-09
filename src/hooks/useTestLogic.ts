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
const LOCAL_STORAGE_KEY_FINISHED_ANSWERS = 'testFinishedUserAnswers'; 
const LOCAL_STORAGE_KEY_LAST_TEST_RESULT = 'lastTestResult'; 

const INITIAL_TIME_PER_QUESTION = 60; 

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
  handleAnswerSelect: (questionId: string, selectedOptionId: string | null) => void;
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
    localStorage.removeItem(LOCAL_STORAGE_KEY_FINISHED_ANSWERS); 
    localStorage.removeItem(LOCAL_STORAGE_KEY_LAST_TEST_RESULT); 
  }, []);

  const calculateTestResult = useCallback(() => {
    if (questions.length === 0 || !overallTestStartTime) return;

    // Сохраняем ответы и результат перед установкой состояний
    localStorage.setItem(LOCAL_STORAGE_KEY_FINISHED_ANSWERS, JSON.stringify(userAnswers)); 

    const correctAnswers = userAnswers.filter(answer => {
      const question = questions.find(q => q.id === answer.questionId);
      return question && question.correctAnswer === answer.selectedOptionId;
    }).length;

    const totalQuestions = questions.length;
    
    const incorrectAnswers = userAnswers.filter(answer => {
      const question = questions.find(q => q.id === answer.questionId);
      return question && answer.selectedOptionId !== null && question.correctAnswer !== answer.selectedOptionId;
    }).length;

    const answeredQuestionIds = new Set(userAnswers.map(answer => answer.questionId));
    const unanswered = questions.filter(question => !answeredQuestionIds.has(question.id)).length;

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

    localStorage.setItem(LOCAL_STORAGE_KEY_LAST_TEST_RESULT, JSON.stringify(finalResult)); 

    setTestResult(finalResult); // Устанавливаем результат теста
    setTestFinished(true); // Устанавливаем, что тест завершен
    setTestStarted(false); // Тест завершен, устанавливаем testStarted в FALSE
    console.log('useTestLogic: testStarted установлен в FALSE (из calculateTestResult)');
    setOverallTestStartTime(null);

    // Дополнительная очистка временных ключей активного теста, если они остались
    localStorage.removeItem(LOCAL_STORAGE_KEY_ANSWERS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_CURRENT_INDEX);
    localStorage.removeItem(LOCAL_STORAGE_KEY_TEST_STARTED);
    localStorage.removeItem(LOCAL_STORAGE_KEY_LAST_QUESTION_START_TIME);
    localStorage.removeItem(LOCAL_STORAGE_KEY_OVERALL_TEST_START_TIME);

  }, [questions, userAnswers, overallTestStartTime]);

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex === questions.length - 1) {
      calculateTestResult(); 
    } else {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      questionStartTimeRef.current = Date.now();
      setRemainingTime(questions[currentQuestionIndex + 1]?.timeEstimate || INITIAL_TIME_PER_QUESTION);
    }
  }, [currentQuestionIndex, questions, calculateTestResult]);

  const handlePreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
      questionStartTimeRef.current = Date.now(); 
      setRemainingTime(questions[currentQuestionIndex - 1]?.timeEstimate || INITIAL_TIME_PER_QUESTION);
    }
  }, [currentQuestionIndex, questions]);

  const handleAnswerSelect = useCallback((questionId: string, selectedOptionId: string | null) => { 
    const question = questions.find(q => q.id === questionId);
    if (!question) {
      console.error(`Question with ID ${questionId} not found.`);
      return;
    }

    const timeSpent = Math.floor((Date.now() - questionStartTimeRef.current) / 1000);

    const newAnswer: UserAnswer = {
      questionId: questionId,
      selectedOptionId: selectedOptionId, 
      isCorrect: selectedOptionId !== null && question.correctAnswer === selectedOptionId, 
      timeSpent: timeSpent,
    };

    setUserAnswers((prevAnswers) => {
      const existingAnswerIndex = prevAnswers.findIndex(
        (answer) => answer.questionId === questionId
      );

      let updatedAnswers;
      if (existingAnswerIndex > -1) {
        updatedAnswers = [...prevAnswers];
        updatedAnswers[existingAnswerIndex] = newAnswer;
      } else {
        updatedAnswers = [...prevAnswers, newAnswer];
      }
      return updatedAnswers;
    });

    handleNextQuestion(); 

  }, [questions, handleNextQuestion]);

  const startNewTest = useCallback(() => {
    console.log('startNewTest: Запуск нового теста.');
    clearLocalStorage(); 
    const newQuestions = generateQuestions();
    setQuestions(newQuestions); 
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setTestFinished(false);
    setTestResult(null); // Сбрасываем результат при старте нового теста
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

        const initialQuestionsCheck = generateQuestions(); // для проверки валидности индекса

        const hasAllKeys = savedAnswers && savedIndex && savedTestStarted && savedOverallTestStartTime;
        if (!hasAllKeys) {
          console.log('resumeTest: **Условие 1 (наличие всех ключей) НЕ ВЫПОЛНЕНО.** Отсутствуют необходимые данные для возобновления теста.');
        } else {
          console.log('resumeTest: **Условие 1 (наличие всех ключей) ВЫПОЛНЕНО.**');
        }

        const isIndexValid = !isNaN(parsedIndex) && parsedIndex < initialQuestionsCheck.length && parsedIndex >= 0;

        if (hasAllKeys && isIndexValid) {
          setUserAnswers(parsedAnswers);
          setCurrentQuestionIndex(parsedIndex);
          setTestStarted(true); 
          console.log('useTestLogic: testStarted установлен в TRUE (из resumeTest)');
          setTestFinished(false);
          setTestResult(null); // Сбрасываем результат при возобновлении теста
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
          console.log('resumeTest: **Условие 2 (валидности индекса) НЕ ВЫПОЛНЕНО.** Начинаем новый тест.');
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
    setTestResult(null); // Сбрасываем результат при сбросе состояния
    setRemainingTime(INITIAL_TIME_PER_QUESTION);
    questionStartTimeRef.current = Date.now();
    setOverallTestStartTime(null);
    clearLocalStorage(); 
    setShowResumeOption(false);
  }, [clearLocalStorage]);

  // Основной useEffect для инициализации и загрузки состояния
  useEffect(() => {
    console.log('useEffect (инициализация/возобновление): -- Начало выполнения эффекта --');

    const savedFinishedAnswers = localStorage.getItem(LOCAL_STORAGE_KEY_FINISHED_ANSWERS);
    const savedLastTestResult = localStorage.getItem(LOCAL_STORAGE_KEY_LAST_TEST_RESULT); 

    // **СЦЕНАРИЙ 1: Загрузка результатов завершенного теста.**
    // Выполняем это, если тест не запущен, но есть сохраненные завершенные данные,
    // ИЛИ если тест завершен, но `testResult` еще не загружен в состояние.
    if (!testStarted && savedFinishedAnswers && savedLastTestResult) { 
        console.log('useEffect (инициализация/возобновление): Обнаружены сохраненные завершенные данные. Попытка загрузки.');
        try {
            const parsedFinishedAnswers: UserAnswer[] = JSON.parse(savedFinishedAnswers);
            const parsedLastTestResult: TestResult = JSON.parse(savedLastTestResult); 

            setUserAnswers(parsedFinishedAnswers);
            setTestResult(parsedLastTestResult); 
            setTestFinished(true); 
            setTestStarted(false); // Убедимся, что тест не активен
            console.log('useEffect (инициализация/возобновление): Загружены ответы и результат завершенного теста.');
            
            // После загрузки завершенного теста, мы **не** выходим сразу,
            // чтобы дать возможность `showResumeOption` обновиться, если нужно,
            // но мы уже установили `testFinished` и `testResult`.
            // clearLocalStorage() здесь не нужен, так как мы хотим сохранить аналитику.
        } catch (e) {
            console.error('Ошибка парсинга сохраненных результатов завершенного теста:', e);
            clearLocalStorage(); // Очищаем все, если данные некорректны
            setTestFinished(false); // Сброс состояния, чтобы можно было начать новый тест
            setTestStarted(false);
        }
    } 

    // **СЦЕНАРИЙ 2: Предотвращение лишней инициализации, если тест уже в правильном состоянии.**
    // Если тест запущен ИЛИ тест завершен И результаты уже загружены в состояние, выходим.
    if (testStarted || (testFinished && testResult !== null)) {
      console.log('useEffect (инициализация/возобновление): Тест уже в активном/завершенном состоянии с загруженным результатом. Пропускаем инициализацию остальной логики.');
      return; 
    }

    const savedAnswers = localStorage.getItem(LOCAL_STORAGE_KEY_ANSWERS);
    const savedIndex = localStorage.getItem(LOCAL_STORAGE_KEY_CURRENT_INDEX);
    const savedTestStarted = localStorage.getItem(LOCAL_STORAGE_KEY_TEST_STARTED);
    const savedOverallTestStartTime = localStorage.getItem(LOCAL_STORAGE_KEY_OVERALL_TEST_START_TIME);
    
    const initialQuestions = generateQuestions(); 
    // Устанавливаем вопросы только если они еще не загружены (т.е. questions.length === 0)
    if (questions.length === 0) {
      setQuestions(initialQuestions); 
    }


    // **СЦЕНАРИЙ 3: Определение, показывать ли опцию "Возобновить тест".**
    let parsedIndex = -1;
    try {
      if (savedIndex) {
        parsedIndex = parseInt(savedIndex, 10);
      }
    } catch (e) {
      console.error('Ошибка при парсинге savedIndex:', e);
    }
    const isIndexValid = !isNaN(parsedIndex) && parsedIndex < initialQuestions.length && parsedIndex >= 0;

    const hasResumeKeys = savedAnswers && savedIndex && savedTestStarted === 'true' && savedOverallTestStartTime;

    if (hasResumeKeys && isIndexValid) {
      console.log('useEffect (showResumeOption): **Условие 2 (валидности индекса) ВЫПОЛНЕНО.** shouldShowResume = true.');
      setShowResumeOption(true);
    } else {
      console.log('useEffect (showResumeOption): **Условие 2 (валидности индекса) НЕ ВЫПОЛНЕНО или данные неполные.** shouldShowResume = false.');
      setShowResumeOption(false);
      
      // Если savedTestStarted был true, но данные невалидны, то очищаем временные ключи.
      // (Это не затронет savedFinishedAnswers и savedLastTestResult, так как они обрабатываются выше)
      if (savedTestStarted === 'true') {
        localStorage.removeItem(LOCAL_STORAGE_KEY_ANSWERS);
        localStorage.removeItem(LOCAL_STORAGE_KEY_CURRENT_INDEX);
        localStorage.removeItem(LOCAL_STORAGE_KEY_TEST_STARTED);
        localStorage.removeItem(LOCAL_STORAGE_KEY_LAST_QUESTION_START_TIME);
        localStorage.removeItem(LOCAL_STORAGE_KEY_OVERALL_TEST_START_TIME);
        setTestStarted(false); 
        console.log('useEffect (инициализация/возобновление): Обнаружены неполные/невалидные данные активного теста. Очищены ключи и testStarted сброшен на false.');
      }
    }
    console.log('useEffect (showResumeOption): -- Завершение выполнения эффекта. Итоговое showResumeOption:', showResumeOption, '--');

  }, [clearLocalStorage, testStarted, testFinished, testResult, questions.length]); // Убрали setQuestions из зависимостей, добавили questions.length

  useEffect(() => {
    if (!testStarted || testFinished) {
      return;
    }

    const timer = setInterval(() => {
      setRemainingTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleAnswerSelect(questions[currentQuestionIndex].id, null); 
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testStarted, testFinished, remainingTime, handleAnswerSelect, questions, currentQuestionIndex]);

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

  const progressPercentage = questions.length > 0 ? ((currentQuestionIndex) / questions.length) * 100 : 0;

  return {
    currentQuestionIndex,
    userAnswers,
    testFinished,
    testStarted,
    questions,
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

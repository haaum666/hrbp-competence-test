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
   // Добавляем useRef для userAnswers, чтобы calculateTestResult всегда имел доступ к актуальному состоянию
   const userAnswersRef = useRef<UserAnswer[]>(userAnswers);

   // Обновляем userAnswersRef при каждом изменении userAnswers
   useEffect(() => {
       userAnswersRef.current = userAnswers;
   }, [userAnswers]);


  const clearLocalStorage = useCallback(() => {
    console.log('clearLocalStorage: Выполняется очистка связанных ключей localStorage.');
    localStorage.removeItem(LOCAL_STORAGE_KEY_ANSWERS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_CURRENT_INDEX);
    localStorage.removeItem(LOCAL_STORAGE_KEY_TEST_STARTED);
    localStorage.removeItem(LOCAL_STORAGE_KEY_LAST_QUESTION_START_TIME);
    localStorage.removeItem(LOCAL_STORAGE_KEY_OVERALL_TEST_START_TIME);
    localStorage.removeItem(LOCAL_STORAGE_KEY_FINISHED_ANSWERS); 
    localStorage.removeItem(LOCAL_STORAGE_KEY_LAST_TEST_RESULT); 
    // НЕ удаляем LOCAL_STORAGE_KEY_ALL_RESULTS, так как это история всех тестов
  }, []);

  // --- Расчет результатов теста ---
  const calculateTestResult = useCallback(() => {
    console.log('calculateTestResult: Начинаем расчет результатов...');
    console.log('calculateTestResult: Текущие questions:', questions);
    console.log('calculateTestResult: Текущие userAnswers (из ref):', userAnswersRef.current); // Используем ref

    if (questions.length === 0 || !overallTestStartTime) {
      console.warn('calculateTestResult: Отсутствуют вопросы или время начала теста. Расчет невозможен.');
      return;
    }

    const totalQuestions = questions.length;
    let correctAnswersCount = 0;
    let incorrectAnswersCount = 0;
    let unansweredCount = 0;

    // Используем userAnswersRef.current для гарантированного доступа к последним ответам
    const currentAnswers = userAnswersRef.current;

    // Проходим по ВСЕМ вопросам, чтобы определить их статус
    questions.forEach(question => {
        const userAnswerFound = currentAnswers.find(ua => ua.questionId === question.id);
        
        if (userAnswerFound) {
            // Вопрос был отвечен
            if (question.correctAnswer === userAnswerFound.selectedOptionId) {
                correctAnswersCount++;
            } else {
                incorrectAnswersCount++; // Включает неправильные ответы, даже если selectedOptionId !== null
            }
        } else {
            // Вопрос не был отвечен (не найден в userAnswers)
            unansweredCount++;
        }
    });

    const scorePercentage = totalQuestions > 0 ? (correctAnswersCount / totalQuestions) * 100 : 0;

    const testDuration = Date.now() - new Date(overallTestStartTime).getTime();

    const answerDetails: AnswerDetail[] = questions.map(question => {
      const userAnswerFound = currentAnswers.find(ua => ua.questionId === question.id); // Используем currentAnswers
      return {
        question: question,
        userAnswer: userAnswerFound || null,
        isCorrect: userAnswerFound ? (question.correctAnswer === userAnswerFound.selectedOptionId) : false,
      };
    });

    const finalResult: TestResult = {
      scorePercentage: parseFloat(scorePercentage.toFixed(2)),
      correctAnswers: correctAnswersCount,
      incorrectAnswers: incorrectAnswersCount,
      unanswered: unansweredCount,
      totalQuestions: totalQuestions,
      answers: answerDetails,
      timestamp: new Date().toISOString(),
      completionTime: Math.floor(testDuration / 1000),
      startTime: overallTestStartTime,
      endTime: new Date().toISOString(),
    };

    console.log('calculateTestResult: Правильных ответов:', correctAnswersCount);
    console.log('calculateTestResult: Неправильных ответов:', incorrectAnswersCount);
    console.log('calculateTestResult: Без ответа:', unansweredCount);
    console.log('calculateTestResult: Итоговый процент:', scorePercentage.toFixed(2));
    console.log('calculateTestResult: Финальный TestResult:', finalResult);

    // Сохраняем финальные ответы и результат перед установкой состояний
    localStorage.setItem(LOCAL_STORAGE_KEY_FINISHED_ANSWERS, JSON.stringify(currentAnswers)); // Используем currentAnswers
    localStorage.setItem(LOCAL_STORAGE_KEY_LAST_TEST_RESULT, JSON.stringify(finalResult));

    setTestResult(finalResult); 
    setTestFinished(true); 
    setTestStarted(false); 
    console.log('useTestLogic: testStarted установлен в FALSE (из calculateTestResult)');
    setOverallTestStartTime(null);

    // Дополнительная очистка временных ключей активного теста
    localStorage.removeItem(LOCAL_STORAGE_KEY_ANSWERS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_CURRENT_INDEX);
    localStorage.removeItem(LOCAL_STORAGE_KEY_TEST_STARTED);
    localStorage.removeItem(LOCAL_STORAGE_KEY_LAST_QUESTION_START_TIME);
    localStorage.removeItem(LOCAL_STORAGE_KEY_OVERALL_TEST_START_TIME);

  }, [questions, overallTestStartTime]); // userAnswers убраны из зависимостей, так как используем ref


  // --- Логика перехода к следующему вопросу (или завершения теста) ---
  const handleNextQuestion = useCallback(() => {
    console.log('handleNextQuestion: Текущий индекс:', currentQuestionIndex, 'Всего вопросов:', questions.length);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        questionStartTimeRef.current = Date.now(); // Сброс времени для нового вопроса
        setRemainingTime(questions[nextIndex]?.timeEstimate || INITIAL_TIME_PER_QUESTION);
        console.log('handleNextQuestion: Переход к следующему вопросу:', nextIndex);
        return nextIndex;
      });
    } else {
      console.log('handleNextQuestion: Последний вопрос. Завершаем тест.');
      calculateTestResult(); // <-- Теперь эта функция объявлена выше и доступна
    }
  }, [currentQuestionIndex, questions.length, calculateTestResult]); // calculateTestResult здесь оставим, так как она вызывается.

  // --- Инициализация и загрузка состояния теста из localStorage ---
  useEffect(() => {
    console.log('useEffect (инициализация/возобновление): -- Начало выполнения эффекта --');

    const savedTestStarted = localStorage.getItem(LOCAL_STORAGE_KEY_TEST_STARTED) === 'true';
    const savedCurrentIndex = localStorage.getItem(LOCAL_STORAGE_KEY_CURRENT_INDEX);
    const savedAnswers = localStorage.getItem(LOCAL_STORAGE_KEY_ANSWERS);
    const savedOverallStartTime = localStorage.getItem(LOCAL_STORAGE_KEY_OVERALL_TEST_START_TIME);
    const savedLastQuestionStartTime = localStorage.getItem(LOCAL_STORAGE_KEY_LAST_QUESTION_START_TIME);
    const savedLastTestResult = localStorage.getItem(LOCAL_STORAGE_KEY_LAST_TEST_RESULT);
    const savedFinishedAnswers = localStorage.getItem(LOCAL_STORAGE_KEY_FINISHED_ANSWERS);

    // Загрузка завершенных данных, если тест был закончен
    if (savedLastTestResult && !testResult) {
      console.log('useEffect (инициализация/возобновление): Обнаружены сохраненные завершенные данные и testResult еще не установлен. Попытка загрузки.');
      setTestResult(JSON.parse(savedLastTestResult));
      // Также загрузим вопросы и ответы для детального просмотра, если они были сохранены
      // ЭТО ВАЖНО, если пользователь переходит на детальный просмотр после перезагрузки
      if (savedFinishedAnswers) {
          setUserAnswers(JSON.parse(savedFinishedAnswers));
      }
      // Вопросы должны быть всегда сгенерированы, чтобы ResultDetailView мог сопоставить
      setQuestions(generateQuestions()); // Перегенерируем вопросы, чтобы они были доступны
      setTestFinished(true);
      setTestStarted(false); // Убедимся, что тест не считается "активным"
      console.log('useEffect (инициализация/возобновление): Загружены ответы и результат завершенного теста.');
      return; // Прерываем дальнейшую инициализацию, так как тест завершен
    }

    if (savedTestStarted && savedCurrentIndex && savedAnswers && savedOverallStartTime) {
      console.log('useEffect (инициализация/возобновление): Обнаружен незавершенный тест. Восстанавливаем состояние...');
      setTestStarted(true);
      setCurrentQuestionIndex(parseInt(savedCurrentIndex, 10));
      setUserAnswers(JSON.parse(savedAnswers));
      setOverallTestStartTime(savedOverallStartTime);
      questionStartTimeRef.current = savedLastQuestionStartTime ? parseInt(savedLastQuestionStartTime, 10) : Date.now();
      setQuestions(generateQuestions()); // Генерируем вопросы при возобновлении
      setTestFinished(false);
      console.log('useEffect (инициализация/возобновление): Состояние теста успешно восстановлено.');
    } else if (!testStarted && !testFinished) {
      // Если нет сохраненного активного или завершенного теста, и мы не в процессе,
      // но есть что-то в localStorage, что может быть возобновлено.
      // Это для кнопки "Продолжить тест" на стартовом экране.
      const lastAnswers = localStorage.getItem(LOCAL_STORAGE_KEY_ANSWERS);
      const lastIndex = localStorage.getItem(LOCAL_STORAGE_KEY_CURRENT_INDEX);
      if (lastAnswers && lastIndex && parseInt(lastIndex, 10) < generateQuestions().length) {
        setShowResumeOption(true);
        console.log('useEffect (инициализация/возобновление): Обнаружена возможность возобновить тест.');
      } else {
        setShowResumeOption(false);
        console.log('useEffect (инициализация/возобновление): Нет сохраненных данных для возобновления.');
        setQuestions(generateQuestions()); // Генерируем вопросы, если это чистый старт
      }
    } else if (testStarted && questions.length === 0) {
        // Если тест "начался", но вопросов нет (например, после горячей перезагрузки)
        setQuestions(generateQuestions());
    }

    console.log('useEffect (инициализация/возобновление): -- Завершение выполнения эффекта --');
  }, [testResult, testStarted, testFinished]); // Добавил testResult, testStarted, testFinished в зависимости для корректного повторного выполнения при изменении этих состояний.

  // --- Эффект для сохранения прогресса теста в localStorage ---
  useEffect(() => {
    console.log('useEffect (сохранение прогресса): testStarted:', testStarted, ', testFinished:', testFinished);
    if (testStarted && !testFinished) {
      console.log('useEffect (сохранение прогресса): Сохраняем данные в localStorage...');
      localStorage.setItem(LOCAL_STORAGE_KEY_ANSWERS, JSON.stringify(userAnswers));
      localStorage.setItem(LOCAL_STORAGE_KEY_CURRENT_INDEX, currentQuestionIndex.toString());
      localStorage.setItem(LOCAL_STORAGE_KEY_TEST_STARTED, 'true');
      localStorage.setItem(LOCAL_STORAGE_KEY_LAST_QUESTION_START_TIME, questionStartTimeRef.current.toString());
      localStorage.setItem(LOCAL_STORAGE_KEY_OVERALL_TEST_START_TIME, overallTestStartTime || new Date().toISOString());
    } else if (testFinished) {
        // Если тест завершен, мы уже сохранили финальный результат в calculateTestResult.
        // Здесь можно убедиться, что временные ключи удалены.
        localStorage.removeItem(LOCAL_STORAGE_KEY_ANSWERS);
        localStorage.removeItem(LOCAL_STORAGE_KEY_CURRENT_INDEX);
        localStorage.removeItem(LOCAL_STORAGE_KEY_TEST_STARTED);
        localStorage.removeItem(LOCAL_STORAGE_KEY_LAST_QUESTION_START_TIME);
        localStorage.removeItem(LOCAL_STORAGE_KEY_OVERALL_TEST_START_TIME);
        console.log('useEffect (сохранение прогресса): Тест завершен, временные данные удалены.');
    } else {
      console.log('useEffect (сохранение прогресса): Условия для сохранения не выполнены.');
    }
  }, [userAnswers, currentQuestionIndex, testStarted, testFinished, overallTestStartTime]);

  // --- Эффект для таймера вопроса ---
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (testStarted && !testFinished && questions[currentQuestionIndex]) {
      const timeEstimate = questions[currentQuestionIndex].timeEstimate || INITIAL_TIME_PER_QUESTION;
      setRemainingTime(timeEstimate - Math.floor((Date.now() - questionStartTimeRef.current) / 1000));

      timer = setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            // Автоматический переход к следующему вопросу или завершение теста
            handleNextQuestion();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [testStarted, testFinished, currentQuestionIndex, questions, handleNextQuestion]);

  // --- Расчет прогресса для индикатора ---
  const progressPercentage = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  // --- Инициализация нового теста ---
  const startNewTest = useCallback(() => {
    console.log('startNewTest: Запуск нового теста.');
    clearLocalStorage(); // Убедимся, что старые временные данные удалены
    const newQuestions = generateQuestions();
    setQuestions(newQuestions);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setTestFinished(false);
    setTestResult(null);
    setTestStarted(true);
    const now = new Date().toISOString();
    setOverallTestStartTime(now);
    localStorage.setItem(LOCAL_STORAGE_KEY_OVERALL_TEST_START_TIME, now);
    questionStartTimeRef.current = Date.now();
    setRemainingTime(newQuestions[0]?.timeEstimate || INITIAL_TIME_PER_QUESTION);
    console.log('startNewTest: Новый тест успешно инициализирован и сохранен в localStorage.');
  }, [clearLocalStorage]);

  // --- Возобновление теста ---
  const resumeTest = useCallback(() => {
    console.log('resumeTest: Возобновление теста.');
    const savedCurrentIndex = localStorage.getItem(LOCAL_STORAGE_KEY_CURRENT_INDEX);
    const savedAnswers = localStorage.getItem(LOCAL_STORAGE_KEY_ANSWERS);
    const savedOverallStartTime = localStorage.getItem(LOCAL_STORAGE_KEY_OVERALL_TEST_START_TIME);
    const savedLastQuestionStartTime = localStorage.getItem(LOCAL_STORAGE_KEY_LAST_QUESTION_START_TIME);

    if (savedCurrentIndex && savedAnswers && savedOverallStartTime) {
      const restoredQuestions = generateQuestions(); // Генерируем вопросы для возобновления
      setQuestions(restoredQuestions);
      setCurrentQuestionIndex(parseInt(savedCurrentIndex, 10));
      setUserAnswers(JSON.parse(savedAnswers));
      setOverallTestStartTime(savedOverallStartTime);
      questionStartTimeRef.current = savedLastQuestionStartTime ? parseInt(savedLastQuestionStartTime, 10) : Date.now();
      setTestStarted(true);
      setTestFinished(false);
      setTestResult(null);
      setRemainingTime(restoredQuestions[parseInt(savedCurrentIndex, 10)]?.timeEstimate || INITIAL_TIME_PER_QUESTION);
      console.log('resumeTest: Тест успешно возобновлен.');
    } else {
      console.warn('resumeTest: Не удалось возобновить тест. Данные в localStorage отсутствуют или неполны. Начинаем новый тест.');
      startNewTest();
    }
  }, [startNewTest]);

  // --- Логика выбора ответа ---
  const handleAnswerSelect = useCallback((questionId: string, selectedOptionId: string | null) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) {
      console.error(`handleAnswerSelect: Вопрос с ID ${questionId} не найден.`);
      return;
    }

    const timeSpent = Math.floor((Date.now() - questionStartTimeRef.current) / 1000);

    const newAnswer: UserAnswer = {
      questionId: questionId,
      selectedOptionId: selectedOptionId,
      isCorrect: selectedOptionId !== null && question.correctAnswer === selectedOptionId,
      timeSpent: timeSpent,
    };

    console.log(`handleAnswerSelect: Вопрос ${questionId}, Выбран: ${selectedOptionId}, Верно: ${newAnswer.isCorrect}, Время: ${timeSpent}s`);

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
      console.log('handleAnswerSelect: Обновленные userAnswers (после setUserAnswers):', updatedAnswers);
      return updatedAnswers;
    });
  }, [questions]); // Зависимость от questions нужна, так как question.correctAnswer используется

  // --- Логика перехода к предыдущему вопросу ---
  const handlePreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prevIndex) => {
        const prevIndexValue = prevIndex - 1;
        questionStartTimeRef.current = Date.now();
        setRemainingTime(questions[prevIndexValue]?.timeEstimate || INITIAL_TIME_PER_QUESTION);
        console.log('handlePreviousQuestion: Переход к предыдущему вопросу:', prevIndexValue);
        return prevIndexValue;
      });
    }
  }, [currentQuestionIndex, questions]);

  // --- Сброс состояния для навигации (например, при выходе из теста) ---
  const resetTestStateForNavigation = useCallback(() => {
    console.log('resetTestStateForNavigation: Сброс состояния для навигации.');
    clearLocalStorage();
    setQuestions(generateQuestions()); // Перегенерируем вопросы на старте
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setTestStarted(false);
    setTestFinished(false);
    setTestResult(null);
    setOverallTestStartTime(null);
    setShowResumeOption(false);
    setRemainingTime(INITIAL_TIME_PER_QUESTION);
    questionStartTimeRef.current = Date.now();
  }, [clearLocalStorage]);


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

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
// Новые ключи для сохранения завершенных тестов
const LOCAL_STORAGE_KEY_FINISHED_ANSWERS = 'testFinishedUserAnswers'; 
const LOCAL_STORAGE_KEY_LAST_TEST_RESULT = 'lastTestResult'; 

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
  handleAnswerSelect: (questionId: string, selectedOptionId: string | null) => void; // Изменено на string | null
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

  // --- Расчет результатов теста (перемещен выше для избежания ошибок с объявлением) ---
  const calculateTestResult = useCallback(() => {
    console.log('calculateTestResult: Начинаем расчет результатов...');
    console.log('calculateTestResult: Текущие questions:', questions);
    console.log('calculateTestResult: Текущие userAnswers (из ref):', userAnswersRef.current); // Используем ref для актуальных ответов

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
                incorrectAnswersCount++; // Включает неправильные ответы
            }
        } else {
            // Вопрос не был отвечен (не найден в userAnswersRef.current)
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

    // Сохраняем общий результат в массив всех результатов
    const allResults = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_ALL_RESULTS) || '[]') as TestResult[];
    allResults.push(finalResult);
    localStorage.setItem(LOCAL_STORAGE_KEY_ALL_RESULTS, JSON.stringify(allResults));

    setTestResult(finalResult); 
    setTestFinished(true); 
    setTestStarted(false); 
    console.log('useTestLogic: testStarted установлен в FALSE (из calculateTestResult)');
    setOverallTestStartTime(null);

    // Очистка временных ключей активного теста
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
        // Убеждаемся, что следующий вопрос существует, прежде чем получить его время
        setRemainingTime(questions[nextIndex]?.timeEstimate || INITIAL_TIME_PER_QUESTION);
        console.log('handleNextQuestion: Переход к следующему вопросу:', nextIndex);
        return nextIndex;
      });
    } else {
      console.log('handleNextQuestion: Последний вопрос. Завершаем тест.');
      calculateTestResult(); // Вызываем calculateTestResult
    }
  }, [currentQuestionIndex, questions.length, calculateTestResult, questions]); // Добавил `questions` в зависимости для `setRemainingTime`

  // --- Логика перехода к предыдущему вопросу ---
  const handlePreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prevIndex) => {
        const prevIndexValue = prevIndex - 1;
        questionStartTimeRef.current = Date.now(); // Сброс таймера для предыдущего вопроса
        // Убеждаемся, что предыдущий вопрос существует, прежде чем получить его время
        setRemainingTime(questions[prevIndexValue]?.timeEstimate || INITIAL_TIME_PER_QUESTION);
        console.log('handlePreviousQuestion: Переход к предыдущему вопросу:', prevIndexValue);
        return prevIndexValue;
      });
    }
  }, [currentQuestionIndex, questions]);


  // --- Логика выбора ответа ---
  const handleAnswerSelect = useCallback((questionId: string, selectedOptionId: string | null) => { // Изменено на string | null
    const question = questions.find(q => q.id === questionId);
    if (!question) {
      console.error(`handleAnswerSelect: Вопрос с ID ${questionId} не найден.`);
      return;
    }

    const timeSpent = Math.floor((Date.now() - questionStartTimeRef.current) / 1000);

    const newAnswer: UserAnswer = {
      questionId: questionId,
      selectedOptionId: selectedOptionId,
      isCorrect: selectedOptionId !== null && question.correctAnswer === selectedOptionId, // Проверка на null
      timeSpent: timeSpent,
    };

    // Добавляем логи для отладки
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
      console.log('handleAnswerSelect: Обновленные userAnswers (после setUserAnswers):', updatedAnswers); // Лог обновленного состояния
      return updatedAnswers;
    });
    // ВОЗВРАЩЕНО: автоматический переход к следующему вопросу после выбора ответа.
    handleNextQuestion();
  }, [questions, handleNextQuestion]); // handleNextQuestion теперь снова в зависимостях

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

        console.log('resumeTest: savedAnswers:', savedAnswers ? 'есть' : 'нет', '(Значение:', savedAnswers, ')');
        console.log('resumeTest: savedIndex:', savedIndex ? 'есть' : 'нет', '(Значение:', savedIndex, ')');
        console.log('resumeTest: savedTestStarted:', savedTestStarted);
        console.log('resumeTest: savedOverallTestStartTime:', savedOverallTestStartTime ? 'есть' : 'нет', '(Значение:', savedOverallTestStartTime, ')');

        const hasAllKeys = savedAnswers && savedIndex && savedTestStarted && savedOverallTestStartTime;
        if (!hasAllKeys) {
          console.log('resumeTest: **Условие 1 (наличие всех ключей) НЕ ВЫПОЛНЕНО.** Отсутствуют необходимые данные для возобновления теста (один или более ключей отсутствуют/null).');
        } else {
          console.log('resumeTest: **Условие 1 (наличие всех ключей) ВЫПОЛНЕНО.**');
        }

        const isIndexValid = !isNaN(parsedIndex) && parsedIndex < initialQuestionsCheck.length && parsedIndex >= 0;
        console.log('resumeTest: parsedAnswers.length:', parsedAnswers.length);
        console.log('resumeTest: parsedIndex (parseInt):', parsedIndex);
        console.log('resumeTest: initialQuestionsCheck.length (from generateQuestions):', initialQuestionsCheck.length);
        console.log('resumeTest: isIndexValid (!isNaN(parsedIndex) && parsedIndex < initialQuestionsCheck.length):', isIndexValid);

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

    // Если тест уже завершен (например, мы на странице результатов после перезагрузки),
    // загружаем сохраненный результат и answers
    const savedLastTestResult = localStorage.getItem(LOCAL_STORAGE_KEY_LAST_TEST_RESULT);
    const savedFinishedAnswers = localStorage.getItem(LOCAL_STORAGE_KEY_FINISHED_ANSWERS);

    if (savedLastTestResult && !testResult) {
        console.log('useEffect (инициализация/возобновление): Обнаружен сохраненный результат завершенного теста. Загружаем...');
        setTestResult(JSON.parse(savedLastTestResult));
        if (savedFinishedAnswers) {
            setUserAnswers(JSON.parse(savedFinishedAnswers));
        }
        setQuestions(generateQuestions()); // Важно: вопросы должны быть, чтобы детализация работала
        setTestFinished(true);
        setTestStarted(false);
        console.log('useEffect (инициализация/возобновление): Тест успешно загружен как завершенный.');
        return; // Прерываем дальнейшую инициализацию, так как тест уже завершен
    }

    const savedAnswers = localStorage.getItem(LOCAL_STORAGE_KEY_ANSWERS);
    const savedIndex = localStorage.getItem(LOCAL_STORAGE_KEY_CURRENT_INDEX);
    const savedTestStarted = localStorage.getItem(LOCAL_STORAGE_KEY_TEST_STARTED);
    const savedOverallTestStartTime = localStorage.getItem(LOCAL_STORAGE_KEY_OVERALL_TEST_START_TIME);

    const initialQuestionsCheck = generateQuestions(); // Генерируем вопросы для проверки длины

    console.log('useEffect (инициализация/возобновление - проверка возобновления): savedAnswers:', savedAnswers ? 'есть' : 'нет');
    console.log('useEffect (инициализация/возобновление - проверка возобновления): savedIndex:', savedIndex ? 'есть' : 'нет');
    console.log('useEffect (инициализация/возобновление - проверка возобновления): savedTestStarted:', savedTestStarted);
    console.log('useEffect (инициализация/возобновление - проверка возобновления): savedOverallTestStartTime:', savedOverallTestStartTime ? 'есть' : 'нет');

    const hasAllKeys = savedAnswers && savedIndex && savedTestStarted === 'true' && savedOverallTestStartTime;
    
    let parsedIndex = -1;
    try {
      if (savedIndex) {
        parsedIndex = parseInt(savedIndex, 10);
      }
    } catch (e) {
      console.error('Ошибка при парсинге savedIndex в useEffect (инициализация/возобновление):', e);
    }

    const isIndexValid = !isNaN(parsedIndex) && parsedIndex < initialQuestionsCheck.length && parsedIndex >= 0;

    // Логика для определения, показывать ли кнопку "Продолжить тест"
    if (hasAllKeys && isIndexValid && !testStarted && !testFinished) {
      console.log('useEffect (инициализация/возобновление): Обнаружена возможность возобновить тест. Устанавливаем showResumeOption в true.');
      setShowResumeOption(true);
    } else {
      console.log('useEffect (инициализация/возобновление): Условия для возобновления не выполнены. showResumeOption в false.');
      setShowResumeOption(false);
      // Если нет возможности возобновить или тест уже завершен, но `testStarted` почему-то 'true'
      if (!testStarted && !testFinished) {
            // Если тест не запущен и не завершен, и нет сохраненных данных, генерируем новые вопросы
            setQuestions(initialQuestionsCheck);
        } else if (testStarted && !testFinished && questions.length === 0) {
            // Если тест запущен, но вопросов нет (например, после горячей перезагрузки), генерируем их
            setQuestions(initialQuestionsCheck);
        }
    }
    console.log('useEffect (инициализация/возобновление): -- Завершение выполнения эффекта --');

  }, [clearLocalStorage, testStarted, testFinished, testResult, questions.length]); // Добавил вопросы в зависимости

  // Эффект для таймера обратного отсчета
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
  }, [testStarted, testFinished, currentQuestionIndex, questions, handleNextQuestion]); // remainingTime убран из зависимостей

  // Эффект для сохранения прогресса в localStorage
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
        // Здесь просто убедимся, что временные ключи удалены.
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

  // Расчет процента выполнения теста
  const progressPercentage = questions.length > 0 ? (currentQuestionIndex / questions.length) * 100 : 0;

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

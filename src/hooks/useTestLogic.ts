// src/hooks/useTestLogic.ts

import { useState, useEffect, useCallback } from 'react';
import { Question, UserAnswer, TestResult } from '../types/test';
import { generateQuestions } from '../data/questions';
import { useNavigate } from 'react-router-dom'; // Добавляем импорт useNavigate обратно сюда

/**
 * @interface UseTestLogicResult
 * @description Интерфейс, описывающий значения и функции, возвращаемые хуком useTestLogic.
 * @property {number} currentQuestionIndex - Текущий индекс вопроса в тесте.
 * @property {UserAnswer[]} userAnswers - Массив ответов пользователя.
 * @property {boolean} testFinished - Флаг, указывающий, завершен ли тест.
 * @property {Question[]} questions - Массив вопросов теста.
 * @property {boolean} testStarted - Флаг, указывающий, начат ли тест.
 * @property {TestResult | null} testResult - Результаты теста после его завершения, или null.
 * @property {boolean} showResumeOption - Флаг, показывающий опцию "Продолжить тест" на главной странице.
 * @property {number} remainingTime - Оставшееся время для текущего вопроса в секундах.
 * @property {number} progressPercentage - Процент завершения теста.
 * @property {(questionId: string, selectedOptionId: string) => void} handleAnswerSelect - Функция для записи ответа пользователя.
 * @property {() => void} handleNextQuestion - Функция для перехода к следующему вопросу.
 * @property {() => void} handlePreviousQuestion - Функция для перехода к предыдущему вопросу.
 * @property {() => void} startNewTest - Функция для начала нового теста.
 * @property {() => void} resumeTest - Функция для продолжения ранее начатого теста.
 */
interface UseTestLogicResult {
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
 * @description Кастомный React хук, инкапсулирующий всю логику прохождения HRBP-теста.
 * Управляет состоянием теста, таймером, сохранением/загрузкой прогресса и обработкой действий пользователя.
 * @returns {UseTestLogicResult} Объект, содержащий текущее состояние теста и функции для управления им.
 */
const useTestLogic = (): UseTestLogicResult => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [testFinished, setTestFinished] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [testStarted, setTestStarted] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [showResumeOption, setShowResumeOption] = useState(false);

  const [remainingTime, setRemainingTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  const navigate = useNavigate(); // Переносим useNavigate сюда, где он используется

  // При загрузке компонента генерируем вопросы
  useEffect(() => {
    setQuestions(generateQuestions());
  }, []);

  // Загрузка состояния из localStorage при первом рендере
  useEffect(() => {
    const savedProgress = localStorage.getItem('hrbpTestProgress');
    if (savedProgress) {
      try {
        const { savedCurrentQuestionIndex, savedUserAnswers } = JSON.parse(savedProgress);
        // Проверяем, что есть вопросы и сохраненный индекс в разумных пределах
        if (questions.length > 0 && savedUserAnswers.length > 0 && savedCurrentQuestionIndex < questions.length) {
          setCurrentQuestionIndex(savedCurrentQuestionIndex);
          setUserAnswers(savedUserAnswers);
          setShowResumeOption(true);
        } else {
            // Если сохраненный прогресс некорректен (например, вопросы поменялись или индекс вышел за границы), очищаем его
            localStorage.removeItem('hrbpTestProgress');
        }
      } catch (e) {
        console.error("Failed to parse saved progress from localStorage", e);
        localStorage.removeItem('hrbpTestProgress'); // Очищаем некорректные данные
      }
    }
  }, [questions.length]);

  // Сохранение состояния в localStorage при изменении currentQuestionIndex или userAnswers
  useEffect(() => {
    if (testStarted && !testFinished && questions.length > 0) {
      const progressToSave = {
        savedCurrentQuestionIndex: currentQuestionIndex,
        savedUserAnswers: userAnswers,
      };
      localStorage.setItem('hrbpTestProgress', JSON.stringify(progressToSave));
    }
  }, [currentQuestionIndex, userAnswers, testStarted, testFinished, questions.length]);

  /**
   * @function handleAnswerSelect
   * @description Обрабатывает выбор ответа пользователем для заданного вопроса.
   * Обновляет массив userAnswers, либо добавляя новый ответ, либо изменяя существующий.
   * @param {string} questionId - Уникальный идентификатор вопроса.
   * @param {string} selectedOptionId - Идентификатор выбранного варианта ответа.
   * @returns {void}
   */
  const handleAnswerSelect = useCallback((questionId: string, selectedOptionId: string) => {
    setUserAnswers(prevAnswers => {
      const existingAnswerIndex = prevAnswers.findIndex(
        (answer) => answer.questionId === questionId
      );

      if (existingAnswerIndex !== -1) {
        const updatedAnswers = [...prevAnswers];
        updatedAnswers[existingAnswerIndex] = {
          questionId,
          selectedOptionId,
          answeredTime: new Date().toISOString(),
        };
        return updatedAnswers;
      } else {
        return [
          ...prevAnswers,
          {
            questionId,
            selectedOptionId,
            answeredTime: new Date().toISOString(),
          },
        ];
      }
    });
  }, []);

  /**
   * @function handleNextQuestion
   * @description Переходит к следующему вопросу теста.
   * Если текущий вопрос последний, завершает тест.
   * Если на текущий вопрос не был дан ответ, добавляет пустой ответ (пропуск).
   * @returns {void}
   */
  const handleNextQuestion = useCallback(() => {
    setTimerActive(false);

    const currentQuestion = questions[currentQuestionIndex];
    const userAnswered = userAnswers.some(answer => answer.questionId === currentQuestion.id);

    // Если на вопрос не ответили, добавляем пустой ответ
    if (!userAnswered) {
      setUserAnswers(prevAnswers => [
        ...prevAnswers,
        {
          questionId: currentQuestion.id,
          selectedOptionId: '', // Пустая строка означает, что вопрос пропущен
          answeredTime: new Date().toISOString(),
        }
      ]);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      // Если это последний вопрос, завершаем тест
      setTestFinished(true);
    }
  }, [currentQuestionIndex, questions, userAnswers]);

  /**
   * @function handlePreviousQuestion
   * @description Переходит к предыдущему вопросу теста.
   * Работает только если текущий вопрос не первый.
   * @returns {void}
   */
  const handlePreviousQuestion = useCallback(() => {
    setTimerActive(false);
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prevIndex => prevIndex - 1);
    }
  }, [currentQuestionIndex]);

  /**
   * @function calculateTestResult
   * @description Вычисляет итоговые результаты теста на основе ответов пользователя и вопросов.
   * Устанавливает состояние `testResult` и очищает сохраненный прогресс.
   * @returns {void}
   */
  const calculateTestResult = useCallback(() => {
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let unanswered = 0;
    const resultsDetails: TestResult['answers'] = [];

    questions.forEach(question => {
      const userAnswer = userAnswers.find(ua => ua.questionId === question.id);
      let isCorrect = false;

      if (question.type === 'multiple-choice') {
          if (userAnswer && userAnswer.selectedOptionId) {
              isCorrect = userAnswer.selectedOptionId === question.correctAnswer;
          }
      }

      if (userAnswer && userAnswer.selectedOptionId !== '') {
          if (isCorrect) {
              correctAnswers++;
          } else if (question.type === 'multiple-choice') { // Проверяем некорректные только для multiple-choice
              incorrectAnswers++;
          }
      } else {
          unanswered++;
      }

      resultsDetails.push({
        question,
        userAnswer,
        isCorrect: isCorrect,
      });
    });

    const totalQuestions = questions.length;
    const scorePercentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    setTestResult({
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      unanswered,
      scorePercentage,
      answers: resultsDetails,
    });
    setTimerActive(false);
    localStorage.removeItem('hrbpTestProgress'); // Очищаем прогресс после завершения теста
  }, [questions, userAnswers]);

  // Логика таймера: уменьшает remainingTime каждую секунду
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (timerActive && remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime(prevTime => prevTime - 1);
      }, 1000);
    } else if (remainingTime === 0 && timerActive) {
      // Если время вышло и тест еще не завершен, автоматически переходим к следующему вопросу
      if (currentQuestionIndex < questions.length - 1 && testStarted && !testFinished) {
        handleNextQuestion();
      } else if (currentQuestionIndex === questions.length - 1 && testStarted && !testFinished) {
        setTestFinished(true); // Если время вышло на последнем вопросе, завершаем тест
      }
    }

    // Очистка интервала при размонтировании или изменении зависимостей
    return () => clearInterval(timer);
  }, [remainingTime, timerActive, currentQuestionIndex, questions.length, testStarted, testFinished, handleNextQuestion]);

  // Обновляем таймер при смене вопроса или начале теста
  useEffect(() => {
    if (testStarted && questions.length > 0 && currentQuestionIndex < questions.length && !testFinished) {
      const currentQuestion = questions[currentQuestionIndex];
      setRemainingTime(currentQuestion.timeEstimate);
      setTimerActive(true);
    } else if (testFinished) {
      setTimerActive(false);
    }
  }, [currentQuestionIndex, questions, testStarted, testFinished]);

  // Запускаем расчет результатов, когда тест завершен
  useEffect(() => {
    if (testFinished && !testResult) {
      calculateTestResult();
      navigate('/results'); // Перенаправляем на страницу результатов после расчета
    }
  }, [testFinished, testResult, calculateTestResult, navigate]);

  /**
   * @function startNewTest
   * @description Инициализирует все состояния для начала нового теста.
   * Очищает предыдущий прогресс и перенаправляет на страницу теста.
   * @returns {void}
   */
  const startNewTest = useCallback(() => {
    setTestStarted(true);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setTestFinished(false);
    setTestResult(null);
    setShowResumeOption(false);
    localStorage.removeItem('hrbpTestProgress');
    navigate('/test'); // Перенаправляем на страницу теста при старте
  }, [navigate]); // Зависимость от navigate

  /**
   * @function resumeTest
   * @description Продолжает тест с сохраненного прогресса.
   * Активирует тест и перенаправляет на страницу теста.
   * @returns {void}
   */
  const resumeTest = useCallback(() => {
    setTestStarted(true);
    setShowResumeOption(false);
    navigate('/test'); // Перенаправляем на страницу теста при продолжении
  }, [navigate]); // Зависимость от navigate

  // Расчет процента прогресса теста
  const progressPercentage = questions.length > 0
    ? ((currentQuestionIndex + 1) / questions.length) * 100
    : 0;

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

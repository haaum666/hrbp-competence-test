// src/hooks/useTestLogic.ts

import { useState, useEffect, useCallback } from 'react';
import { Question, UserAnswer, TestResult } from '../types/test';
import { generateQuestions } from '../data/questions';

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
        if (questions.length > 0 && savedUserAnswers.length > 0 && savedCurrentQuestionIndex < questions.length) {
          setCurrentQuestionIndex(savedCurrentQuestionIndex);
          setUserAnswers(savedUserAnswers);
          setShowResumeOption(true);
        } else {
            localStorage.removeItem('hrbpTestProgress');
        }
      } catch (e) {
        console.error("Failed to parse saved progress from localStorage", e);
        localStorage.removeItem('hrbpTestProgress');
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

  const handleNextQuestion = useCallback(() => {
    setTimerActive(false);

    const currentQuestion = questions[currentQuestionIndex];
    const userAnswered = userAnswers.some(answer => answer.questionId === currentQuestion.id);

    if (!userAnswered) {
      setUserAnswers(prevAnswers => [
        ...prevAnswers,
        {
          questionId: currentQuestion.id,
          selectedOptionId: '',
          answeredTime: new Date().toISOString(),
        }
      ]);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      setTestFinished(true);
    }
  }, [currentQuestionIndex, questions, userAnswers]);

  const handlePreviousQuestion = useCallback(() => {
    setTimerActive(false);
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prevIndex => prevIndex - 1);
    }
  }, [currentQuestionIndex]);

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
          } else if (question.type === 'multiple-choice') {
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
    localStorage.removeItem('hrbpTestProgress');
  }, [questions, userAnswers]);

  // Логика таймера
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (timerActive && remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime(prevTime => prevTime - 1);
      }, 1000);
    } else if (remainingTime === 0 && timerActive) {
      if (currentQuestionIndex < questions.length - 1 && testStarted && !testFinished) {
        handleNextQuestion();
      } else if (currentQuestionIndex === questions.length - 1 && testStarted && !testFinished) {
        setTestFinished(true);
      }
    }

    return () => clearInterval(timer);
  }, [remainingTime, timerActive, currentQuestionIndex, questions.length, testStarted, testFinished, handleNextQuestion]);

  // Обновляем таймер при смене вопроса
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
    }
  }, [testFinished, testResult, calculateTestResult]);

  const startNewTest = useCallback(() => {
    setTestStarted(true);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setTestFinished(false);
    setTestResult(null);
    setShowResumeOption(false);
    localStorage.removeItem('hrbpTestProgress');
  }, []); // Зависимости отсутствуют, так как это функция сброса

  const resumeTest = useCallback(() => {
    setTestStarted(true);
    setShowResumeOption(false);
  }, []); // Зависимости отсутствуют, так как это просто активация теста с текущим прогрессом

  // Расчет процента прогресса
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

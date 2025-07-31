import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom'; // Добавил useNavigate
import { Question, UserAnswer, TestResult } from './types/test';
import { generateQuestions } from './data/questions';
import QuestionRenderer from './components/test/QuestionRenderer';
import ResultDetailView from './components/test/ResultDetailView';

const App: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [testFinished, setTestFinished] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [testStarted, setTestStarted] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [showResumeOption, setShowResumeOption] = useState(false); // НОВОЕ: для показа опции продолжения теста

  const [remainingTime, setRemainingTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  const navigate = useNavigate(); // НОВОЕ: для программной навигации

  // При загрузке компонента генерируем вопросы
  useEffect(() => {
    setQuestions(generateQuestions());
  }, []);

  // НОВОЕ: Загрузка состояния из localStorage при первом рендере
  useEffect(() => {
    const savedProgress = localStorage.getItem('hrbpTestProgress');
    if (savedProgress) {
      const { savedCurrentQuestionIndex, savedUserAnswers } = JSON.parse(savedProgress);
      if (savedUserAnswers.length > 0 && savedCurrentQuestionIndex < questions.length) {
        setCurrentQuestionIndex(savedCurrentQuestionIndex);
        setUserAnswers(savedUserAnswers);
        setShowResumeOption(true); // Показываем кнопку "Продолжить тест"
      }
    }
  }, [questions.length]); // Зависимость от questions.length, чтобы убедиться, что вопросы загружены

  // НОВОЕ: Сохранение состояния в localStorage при изменении currentQuestionIndex или userAnswers
  useEffect(() => {
    if (testStarted && !testFinished && questions.length > 0) {
      const progressToSave = {
        savedCurrentQuestionIndex: currentQuestionIndex,
        savedUserAnswers: userAnswers,
      };
      localStorage.setItem('hrbpTestProgress', JSON.stringify(progressToSave));
    }
  }, [currentQuestionIndex, userAnswers, testStarted, testFinished, questions.length]);


  // Функции-обработчики объявлены выше, обернуты в useCallback
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
          selectedOptionId: '', // Пустой ответ
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

  // Функция для расчета результатов теста
  const calculateTestResult = useCallback(() => {
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let unanswered = 0;
    const resultsDetails: TestResult['answers'] = [];

    questions.forEach(question => {
      const userAnswer = userAnswers.find(ua => ua.questionId === question.id);
      let isCorrect = false;

      // Проверка только для multiple-choice вопросов
      if (question.type === 'multiple-choice') {
          if (userAnswer && userAnswer.selectedOptionId) {
              isCorrect = userAnswer.selectedOptionId === question.correctAnswer;
          }
      }

      if (userAnswer && userAnswer.selectedOptionId !== '') { // Если пользователь выбрал что-то (даже для кейсов)
          if (isCorrect) {
              correctAnswers++;
          } else if (question.type === 'multiple-choice') { // Неправильный ответ только для multiple-choice
              incorrectAnswers++;
          }
      } else { // Если ответа нет или он пустой
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
    setTimerActive(false); // Останавливаем таймер
    localStorage.removeItem('hrbpTestProgress'); // НОВОЕ: Удаляем сохраненный прогресс после завершения теста
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

  const startNewTest = () => { // НОВОЕ: Функция для начала нового теста
    setTestStarted(true);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setTestFinished(false);
    setTestResult(null);
    setShowResumeOption(false); // Скрываем опцию продолжения
    localStorage.removeItem('hrbpTestProgress'); // Очищаем прогресс
    navigate('/test'); // Переходим на страницу теста
  };

  const resumeTest = () => { // НОВОЕ: Функция для продолжения теста
    setTestStarted(true);
    setShowResumeOption(false); // Скрываем опцию продолжения
    navigate('/test'); // Переходим на страницу теста с загруженными данными
  };


  // Расчет процента прогресса
  const progressPercentage = questions.length > 0
    ? ((currentQuestionIndex + 1) / questions.length) * 100
    : 0;

  return (
    <Router>
      <div className="min-h-screen bg-gray-900 font-sans text-gray-100 p-4">
        <header className="text-center py-8">
          <h1 className="text-5xl font-extrabold text-white mb-4">HRBP-Тест</h1>
          <p className="text-xl text-gray-300">Оценка компетенций HR Business Partner</p>
        </header>

        <main className="container mx-auto mt-8">
          <Routes>
            <Route
              path="/"
              element={
                <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
                  <p className="text-3xl font-semibold text-white mb-8 text-center max-w-2xl leading-relaxed">
                    Этот тест поможет оценить ваши компетенции HR Business Partner для российского рынка.
                    Разработан как инструмент уровня специализированных образовательных учреждений.
                  </p>
                  {showResumeOption ? ( // НОВОЕ: Условное отображение кнопок
                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                      <button
                        onClick={resumeTest}
                        className="bg-gradient-to-r from-green-700 to-green-900 hover:from-green-800 hover:to-green-950 text-white font-bold py-4 px-12 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-50 inline-block"
                      >
                        Продолжить Тест
                      </button>
                      <button
                        onClick={startNewTest}
                        className="bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 text-white font-bold py-4 px-12 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 inline-block"
                      >
                        Начать Новый Тест
                      </button>
                    </div>
                  ) : (
                    <Link to="/test"
                      onClick={startNewTest} //

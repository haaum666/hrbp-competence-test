import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Question, UserAnswer, TestResult } from './types/test';
import { generateQuestions } from './data/questions';
import QuestionRenderer from './components/test/QuestionRenderer';
import ResultDetailView from './components/test/ResultDetailView'; // НОВОЕ: Импорт компонента детального просмотра

const App: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [testFinished, setTestFinished] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [testStarted, setTestStarted] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const [remainingTime, setRemainingTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // При загрузке компонента генерируем вопросы
  useEffect(() => {
    setQuestions(generateQuestions());
  }, []);

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
      // Если пользователь не ответил, но перешел дальше, сохраняем пустой ответ
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
          // Для кейсов и приоритизации, если выбран ответ (не пустой), они не попадают в unanswered/incorrect
          // Их правильность оценивается через 'explanation' в детальном просмотре
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

  const handleStartTest = () => {
    setTestStarted(false); // Сначала сбрасываем, чтобы страница начала теста обновилась
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setTestFinished(false);
    setTestResult(null); // Сбрасываем результаты при новом старте
    // Не устанавливаем testStarted сразу в true, т.к. Link ведет на /test,
    // где testStarted уже будет установлен через проход по Route.
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
                  <Link to="/test"
                    onClick={handleStartTest}
                    className="bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 text-white font-bold py-4 px-12 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 inline-block"
                  >
                    Начать Тест
                  </Link>
                </div>
              }
            />
            <Route
              path="/test"
              element={
                <div className="min-h-[calc(100vh-200px)] flex flex-col justify-center items-center">
                  {testStarted && questions.length > 0 && !testFinished ? (
                    <QuestionRenderer
                      question={questions[currentQuestionIndex]}
                      currentQuestionIndex={currentQuestionIndex}
                      totalQuestions={questions.length}
                      onAnswerSelect={handleAnswerSelect}
                      currentUserAnswer={userAnswers.find(ua => ua.questionId === questions[currentQuestionIndex].id)}
                      onNextQuestion={handleNextQuestion}
                      onPreviousQuestion={handlePreviousQuestion}
                      isFirstQuestion={currentQuestionIndex === 0}
                      isLastQuestion={currentQuestionIndex === questions.length - 1}
                      remainingTime={remainingTime}
                      progressPercentage={progressPercentage}
                    />
                  ) : testFinished ? (
                    <div className="bg-white bg-opacity-5 rounded-xl shadow-2xl backdrop-blur-md p-8 max-w-2xl w-full mx-auto text-center border border-gray-700/50">
                      {testResult ? (
                        <>
                          <h2 className="text-4xl font-bold text-white mb-4">Тест завершен!</h2>
                          <p className="text-xl text-gray-300 mb-6">
                            Ваши результаты:
                          </p>
                          <div className="text-left mx-auto max-w-md space-y-2 mb-8 text-lg">
                            <p>Всего вопросов: <span className="font-semibold text-white">{testResult.totalQuestions}</span></p>
                            <p>Правильных ответов: <span className="font-semibold text-green-400">{testResult.correctAnswers}</span></p>
                            <p>Неправильных ответов: <span className="font-semibold text-red-400">{testResult.incorrectAnswers}</span></p>
                            <p>Пропущено вопросов: <span className="font-semibold text-yellow-400">{testResult.unanswered}</span></p>
                            <p className="text-2xl pt-4">Итоговый балл: <span className="font-extrabold text-white">{testResult.scorePercentage.toFixed(2)}%</span></p>
                          </div>
                          {/* НОВОЕ: Кнопка для перехода к детальным результатам */}
                          <Link to="/results"
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 inline-block mt-4 mr-4"
                          >
                            Посмотреть детальные результаты
                          </Link>
                          <Link to="/" onClick={handleStartTest} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 inline-block mt-4">
                            Пройти тест снова
                          </Link>
                        </>
                      ) : (
                        <p className="text-white text-2xl">Расчет результатов...</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-white text-2xl">Загрузка вопросов или тест еще не начат...</p>
                  )}
                </div>
              }
            />
            {/* НОВОЕ: Маршрут для детального просмотра результатов */}
            <Route
              path="/results"
              element={
                <div className="min-h-[calc(100vh-200px)] flex flex-col justify-center items-center">
                  {testResult ? (
                    <ResultDetailView testResult={testResult} />
                  ) : (
                    <div className="bg-white bg-opacity-5 rounded-xl shadow-2xl backdrop-blur-md p-8 max-w-2xl w-full mx-auto text-center border border-gray-700/50">
                      <p className="text-white text-2xl">Результаты не найдены. Пожалуйста, пройдите тест.</p>
                      <Link to="/" onClick={handleStartTest} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 inline-block">
                        Начать Тест
                      </Link>
                    </div>
                  )}
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;

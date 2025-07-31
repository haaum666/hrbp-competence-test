import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Question, UserAnswer, TestResult } from './types/test';
import QuestionRenderer from './components/test/QuestionRenderer';
import { generateQuestions } from './data/questions'; // Ваш файл с вопросами

const App: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [testFinished, setTestFinished] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [testStarted, setTestStarted] = useState(false); // Новое состояние для отслеживания начала теста

  // Состояние для таймера
  const [remainingTime, setRemainingTime] = useState(0); // Оставшееся время в секундах
  const [timerActive, setTimerActive] = useState(false); // Активен ли таймер

  // При загрузке компонента генерируем вопросы
  useEffect(() => {
    setQuestions(generateQuestions());
  }, []);

  // Логика таймера
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (timerActive && remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime(prevTime => prevTime - 1);
      }, 1000); // Обновляем каждую секунду
    } else if (remainingTime === 0 && timerActive) {
      // Время вышло, автоматически переходим к следующему вопросу
      handleNextQuestion();
    }

    return () => clearInterval(timer); // Очищаем таймер при уходе со страницы или остановке
  }, [remainingTime, timerActive]);

  // Обновляем таймер при смене вопроса
  useEffect(() => {
    if (testStarted && questions.length > 0 && currentQuestionIndex < questions.length) {
      const currentQuestion = questions[currentQuestionIndex];
      setRemainingTime(currentQuestion.timeEstimate); // Устанавливаем время для текущего вопроса
      setTimerActive(true); // Активируем таймер
    } else if (testFinished) {
      setTimerActive(false); // Выключаем таймер, если тест завершен
    }
  }, [currentQuestionIndex, questions, testStarted, testFinished]); // Добавил testStarted и testFinished в зависимости

  const handleStartTest = () => {
    setTestStarted(true); // Устанавливаем, что тест начат
    setCurrentQuestionIndex(0); // Начинаем с первого вопроса
    setUserAnswers([]); // Сбрасываем ответы, если вдруг остались от предыдущего
    setTestFinished(false); // Сбрасываем флаг завершения теста
    // Логика для установки начального времени для первого вопроса будет в useEffect выше
  };


  const handleAnswerSelect = (questionId: string, selectedOptionId: string) => {
    setUserAnswers(prevAnswers => {
      const existingAnswerIndex = prevAnswers.findIndex(
        (answer) => answer.questionId === questionId
      );

      if (existingAnswerIndex !== -1) {
        // Если ответ на этот вопрос уже есть, обновляем его
        const updatedAnswers = [...prevAnswers];
        updatedAnswers[existingAnswerIndex] = {
          questionId,
          selectedOptionId,
          answeredTime: new Date().toISOString(), // Сохраняем время ответа
        };
        return updatedAnswers;
      } else {
        // Если ответа на этот вопрос еще нет, добавляем новый
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
  };

  const handleNextQuestion = () => {
    setTimerActive(false); // Останавливаем таймер перед переходом

    // Проверяем, есть ли ответ на текущий вопрос
    const currentQuestion = questions[currentQuestionIndex];
    const userAnswered = userAnswers.some(answer => answer.questionId === currentQuestion.id);

    if (!userAnswered) {
      // Если пользователь не ответил, добавляем пустой ответ
      setUserAnswers(prevAnswers => [
        ...prevAnswers,
        {
          questionId: currentQuestion.id,
          selectedOptionId: '', // Пустой ID для неотвеченных вопросов
          answeredTime: new Date().toISOString(),
        }
      ]);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      setTestFinished(true);
    }
  };

  const handlePreviousQuestion = () => {
    setTimerActive(false); // Останавливаем таймер перед переходом
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prevIndex => prevIndex - 1);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Здесь мог бы быть компонент TestResults, если бы он был реализован
  // const calculateResults = (): TestResult => { ... };


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
                    onClick={handleStartTest} // Вызываем handleStartTest при нажатии на кнопку
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
                      remainingTime={remainingTime} // Передаем оставшееся время
                      timeEstimate={questions[currentQuestionIndex].timeEstimate} // Передаем полное время на вопрос
                    />
                  ) : testFinished ? (
                    <div className="bg-white bg-opacity-5 rounded-xl shadow-2xl backdrop-blur-md p-8 max-w-2xl w-full mx-auto text-center border border-gray-700/50">
                      <h2 className="text-4xl font-bold text-white mb-4">Тест завершен!</h2>
                      <p className="text-xl text-gray-300 mb-8">
                        Спасибо за прохождение теста. Результаты будут доступны здесь.
                      </p>
                      {/* Здесь будет компонент результатов */}
                      <Link to="/" className="text-blue-400 hover:underline">Вернуться на главную</Link>
                    </div>
                  ) : (
                    <p className="text-white text-2xl">Загрузка вопросов или тест еще не начат...</p>
                  )}
                </div>
              }
            />
            {/* Здесь могут быть другие маршруты, например, для страницы результатов */}
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import QuestionRenderer from './components/test/QuestionRenderer';
import ResultDetailView from './components/test/ResultDetailView';
import useTestLogic from './hooks/useTestLogic';
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard';

const App: React.FC = () => {
  const {
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
  } = useTestLogic();

  return (
    <Router>
      {/* Главный контейнер приложения: фон, минимальная высота, центрирование, отступы */}
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col items-center justify-center p-4">
        {/* Шапка приложения */}
        <header className="text-center py-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">HRBP-Тест</h1>
          <p className="text-lg sm:text-xl text-gray-300">Оценка компетенций HR Business Partner</p>
        </header>

        {/* Основной контент (динамически отображаемый через Routes) */}
        <main className="container mx-auto mt-8 flex-grow max-w-4xl px-4 sm:px-6 lg:px-8">
          <Routes>
            {/* Домашняя страница */}
            <Route
              path="/"
              element={
                <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
                  <p className="text-xl sm:text-3xl font-semibold text-white mb-8 max-w-2xl leading-relaxed">
                    Этот тест поможет оценить ваши компетенции HR Business Partner для российского рынка.
                    Разработан как инструмент уровня специализированных образовательных учреждений.
                  </p>
                  {showResumeOption ? (
                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full max-w-md">
                      <button
                        onClick={resumeTest}
                        className="w-full bg-gradient-to-r from-green-700 to-green-900 hover:from-green-800 hover:to-green-950 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-50"
                      >
                        Продолжить Тест
                      </button>
                      <button
                        onClick={startNewTest}
                        className="w-full bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50"
                      >
                        Начать Новый Тест
                      </button>
                    </div>
                  ) : (
                    <Link to="/test"
                      onClick={startNewTest}
                      className="bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 inline-block"
                    >
                      Начать Тест
                    </Link>
                  )}
                </div>
              }
            />
            {/* Экран теста */}
            <Route
              path="/test"
              element={
                <div className="min-h-[calc(100vh-200px)] flex flex-col justify-center items-center p-4">
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
                    /* Блок отображения общих результатов после завершения теста */
                    <div className="bg-white bg-opacity-5 rounded-xl shadow-2xl backdrop-blur-md p-6 sm:p-8 max-w-3xl w-full mx-auto text-center border border-gray-700/50">
                      {testResult ? (
                        <>
                          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Тест завершен!</h2>
                          <p className="text-lg sm:text-xl text-gray-300 mb-6">
                            Ваши результаты:
                          </p>
                          <div className="text-left mx-auto max-w-sm space-y-2 mb-8 text-base sm:text-lg">
                            <p>Всего вопросов: <span className="font-semibold text-white">{testResult.totalQuestions}</span></p>
                            <p>Правильных ответов: <span className="font-semibold text-green-400">{testResult.correctAnswers}</span></p>
                            <p>Неправильных ответов: <span className="font-semibold text-red-400">{testResult.incorrectAnswers}</span></p>
                            <p>Пропущено вопросов: <span className="font-semibold text-yellow-400">{testResult.unanswered}</span></p>
                            <p className="text-xl sm:text-2xl pt-4">Итоговый балл: <span className="font-extrabold text-white">{testResult.scorePercentage.toFixed(2)}%</span></p>
                          </div>
                          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mt-6">
                            <Link to="/results"
                              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 inline-block text-center"
                            >
                              Посмотреть детальные результаты
                            </Link>
                            <Link to="/" onClick={startNewTest} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 inline-block text-center">
                              Пройти тест снова
                            </Link>
                          </div>
                        </>
                      ) : (
                        <p className="text-white text-xl sm:text-2xl">Расчет результатов...</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-white text-xl sm:text-2xl">Загрузка вопросов или тест еще не начат...</p>
                  )}
                </div>
              }
            />
            {/* Экран детальных результатов */}
            <Route
              path="/results"
              element={
                <div className="min-h-[calc(100vh-200px)] flex flex-col justify-center items-center p-4">
                  {testResult ? (
                    <ResultDetailView testResult={testResult} questions={questions} userAnswers={userAnswers} />
                  ) : (
                    <div className="bg-white bg-opacity-5 rounded-xl shadow-2xl backdrop-blur-md p-6 sm:p-8 max-w-3xl w-full mx-auto text-center border border-gray-700/50">
                      <p className="text-white text-xl sm:text-2xl">Результаты не найдены. Пожалуйста, пройдите тест.</p>
                      <Link to="/" onClick={startNewTest} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 inline-block">
                        Начать Тест
                      </Link>
                    </div>
                  )}
                </div>
              }
            />
            {/* Маршрут для дашборда аналитики */}
            <Route path="/analytics" element={<AnalyticsDashboard />} />
          </Routes>
        </main>

        {/* Кнопка для перехода на дашборд (расположена после main) */}
        <div className="mt-8 text-center pb-4 px-4 sm:px-6 lg:px-8">
          <Link
            to="/analytics"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 text-base sm:text-lg"
          >
            Посмотреть Аналитику
          </Link>
        </div>
      </div>
    </Router>
  );
};

export default App;

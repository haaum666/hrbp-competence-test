import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'; // Изменено
import QuestionRenderer from './components/test/QuestionRenderer';
import ResultDetailView from './components/test/ResultDetailView';
import useTestLogic from './hooks/useTestLogic';

const App: React.FC = () => {
  // const navigate = useNavigate(); // Эту строку удаляем, так как navigate используется внутри useTestLogic

  // Используем наш кастомный хук для всей логики теста
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
    startNewTest, // Эти функции уже содержат навигацию
    resumeTest,   // Эти функции уже содержат навигацию
  } = useTestLogic();

  // Убрали отдельные handleStartNewTestAndNavigate и handleResumeTestAndNavigate,
  // так как логика навигации теперь внутри startNewTest и resumeTest в useTestLogic

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
                  {showResumeOption ? (
                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                      <button
                        onClick={resumeTest} // Напрямую вызываем resumeTest
                        className="bg-gradient-to-r from-green-700 to-green-900 hover:from-green-800 hover:to-green-950 text-white font-bold py-4 px-12 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-50 inline-block"
                      >
                        Продолжить Тест
                      </button>
                      <button
                        onClick={startNewTest} // Напрямую вызываем startNewTest
                        className="bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 text-white font-bold py-4 px-12 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 inline-block"
                      >
                        Начать Новый Тест
                      </button>
                    </div>
                  ) : (
                    <Link to="/test"
                      onClick={startNewTest} // Напрямую вызываем startNewTest
                      className="bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 text-white font-bold py-4 px-12 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 inline-block"
                    >
                      Начать Тест
                    </Link>
                  )}
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
                          <Link to="/results"
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 inline-block mt-4 mr-4"
                          >
                            Посмотреть детальные результаты
                          </Link>
                          <Link to="/" onClick={startNewTest} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 inline-block mt-4">
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
            <Route
              path="/results"
              element={
                <div className="min-h-[calc(100vh-200px)] flex flex-col justify-center items-center">
                  {testResult ? (
                    <ResultDetailView testResult={testResult} />
                  ) : (
                    <div className="bg-white bg-opacity-5 rounded-xl shadow-2xl backdrop-blur-md p-8 max-w-2xl w-full mx-auto text-center border border-gray-700/50">
                      <p className="text-white text-2xl">Результаты не найдены. Пожалуйста, пройдите тест.</p>
                      <Link to="/" onClick={startNewTest} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 inline-block">
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

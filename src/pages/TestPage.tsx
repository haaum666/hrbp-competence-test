import React from 'react';
import { Link } from 'react-router-dom';
import QuestionRenderer from '../components/test/QuestionRenderer';
import ResultDetailView from '../components/test/ResultDetailView';
import useTestLogic from '../hooks/useTestLogic';

const TestPage: React.FC = () => {
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
    <>
      {/* Условия отображения: если тест еще не начат, показываем стартовый экран */}
      {!testStarted && !testFinished && (
        <div className="flex flex-col items-center justify-center text-center p-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">HRBP-Тест</h1>
          <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl leading-relaxed">
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
            <button
              onClick={startNewTest}
              className="bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 inline-block"
            >
              Начать Тест
            </button>
          )}
        </div>
      )}

      {/* Отображение самого теста */}
      {testStarted && questions.length > 0 && !testFinished && (
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
      )}

      {/* Отображение общих результатов после завершения теста (первый экран результатов) */}
      {testFinished && testResult && !userAnswers.length && ( // Добавлена проверка userAnswers.length для отличия от ResultDetailView
        <div className="bg-white bg-opacity-5 rounded-xl shadow-2xl backdrop-blur-md p-6 sm:p-8 max-w-3xl w-full mx-auto text-center border border-gray-700/50">
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
            {/* Теперь детальные результаты будут показываться через отдельный компонент */}
            <button
              onClick={() => { /* Здесь может быть логика для показа детальных результатов, 
                                 например, изменение состояния TestPage или навигация.
                                 Если мы решили отложить детальный отчет, то можно просто скрывать эту кнопку.
                                 Но лучше дать пользователю возможность пересмотреть ответы.*/
                                 // Для просмотра детальных результатов на этой же странице:
                                 // setUserAnswers(testResult.answers.map(a => a.userAnswer!).filter(Boolean)); 
                                 // setTestFinished(false); // Нужно будет подумать, как лучше управлять состоянием для просмотра
                              }}
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 inline-block text-center cursor-not-allowed opacity-50" // Временно отключим, пока нет детального отчета
              disabled // Временно отключим кнопку
            >
              Посмотреть детальные результаты (скоро)
            </button>
            <Link to="/" onClick={startNewTest} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 inline-block text-center">
              Пройти тест снова
            </Link>
          </div>
        </div>
      )}

      {/* Отображение детальных результатов теста (если это предусмотрено TestPage) */}
      {testFinished && testResult && userAnswers.length > 0 && ( // Показываем ResultDetailView, если userAnswers есть
        <ResultDetailView testResult={testResult} questions={questions} userAnswers={userAnswers} />
      )}

      {/* Сообщение, если что-то пошло не так (например, вопросы не загрузились) */}
      {!testStarted && !testFinished && questions.length === 0 && (
        <p className="text-white text-xl sm:text-2xl">Загрузка вопросов или тест еще не начат...</p>
      )}
    </>
  );
};

export default TestPage;

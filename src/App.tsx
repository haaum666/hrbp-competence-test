import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import React, { useState } from 'react';

// <-- Важные импорты
import { mockQuestions } from './data/questions'; 
import QuestionRenderer from './components/test/QuestionRenderer';

const TestPage = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string | string[] }>({}); 

  const currentQuestion = mockQuestions[currentQuestionIndex];

  const handleAnswerSelect = (questionId: string, selectedOptionId: string) => {
    setUserAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: selectedOptionId,
    }));
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < mockQuestions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      alert('Тест завершен! Скоро здесь будут результаты.');
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prevIndex => prevIndex - 1);
    }
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white text-3xl">
        Вопросов нет или тест завершен.
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4
                    bg-gradient-to-br from-gray-900 via-gray-800 to-black
                    text-white font-sans overflow-hidden">

      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-bl from-red-800 to-yellow-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gradient-to-tr from-purple-800 to-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tl from-green-800 to-teal-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 flex flex-col items-center justify-center p-8">
        <QuestionRenderer
          question={currentQuestion}
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={mockQuestions.length}
          onAnswerSelect={handleAnswerSelect}
          currentUserAnswer={{ questionId: currentQuestion.id, selectedOptionId: userAnswers[currentQuestion.id] }}
        />

        <div className="flex mt-8 space-x-4">
          <button
            onClick={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg
                       transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Назад
          </button>
          <button
            onClick={goToNextQuestion}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg
                       transition duration-300 ease-in-out"
          >
            {currentQuestionIndex === mockQuestions.length - 1 ? 'Завершить Тест' : 'Далее'}
          </button>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4
                          bg-gradient-to-br from-gray-900 via-gray-800 to-black
                          text-white font-sans overflow-hidden">

            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-bl from-red-800 to-yellow-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
            <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gradient-to-tr from-purple-800 to-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tl from-green-800 to-teal-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

            <div className="relative z-10 flex flex-col items-center justify-center text-center p-8
                            bg-white bg-opacity-5 rounded-xl shadow-2xl backdrop-blur-md border border-gray-700/50
                            max-w-4xl mx-auto transform hover:scale-102 transition-transform duration-300 ease-in-out">

              <h1 className="text-6xl md:text-7xl font-extrabold mb-6 tracking-tight drop-shadow-lg"
                  style={{ textShadow: '0 0 10px rgba(0,0,0,0.5)' }}>
                HRBP-Тест
              </h1>

              <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mb-10 leading-relaxed">
                Здесь скоро будет тест на HRBP.
                <br/><br/>
               

              <Link to="/test" className="bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 text-white font-bold py-4 px-12 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 inline-block">
                Начать Тест
              </Link>

              <div className="mt-12 p-6 bg-white bg-opacity-5 rounded-lg backdrop-blur-sm shadow-xl border border-gray-700/30">
                <p className="text-lg text-gray-300">Нажмите "Начать Тест", чтобы перейти!</p>
              </div>

            </div>
          </div>
        } />
        <Route path="/test" element={<TestPage />} />
        <Route path="/results" element={
          <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white text-3xl">
            Страница результатов (скоро)
          </div>
        } />
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white text-3xl">
            Страница не найдена
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;

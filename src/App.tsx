import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import React, { useState } from 'react'; // Добавляем useState для состояния вопросов

// Импортируем моковые данные вопросов
import { mockQuestions } from './data/questions'; 
// Импортируем компонент для рендеринга вопросов
import QuestionRenderer from './components/test/QuestionRenderer';

// Определение компонента TestPage
const TestPage = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  // Используем объект для хранения ответов по questionId
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string | string[] }>({}); 

  const currentQuestion = mockQuestions[currentQuestionIndex];

  // Функция для обработки выбора ответа
  const handleAnswerSelect = (questionId: string, selectedOptionId: string) => {
    setUserAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: selectedOptionId,
    }));
  };

  // Функция для перехода к следующему вопросу
  const goToNextQuestion = () => {
    if (currentQuestionIndex < mockQuestions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      // Если это последний вопрос
      alert('Тест завершен! Скоро здесь будут результаты.');
      // В будущем здесь можно будет добавить навигацию на страницу результатов
      // navigate('/results');
    }
  };

  // Функция для перехода к предыдущему вопросу
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prevIndex => prevIndex - 1);
    }
  };

  // Если вопросов нет или индекс вышел за границы
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
      {/* Абстрактные фоновые элементы (повторяем для TestPage, чтобы фон был везде) */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-bl from-red-800 to-yellow-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gradient-to-tr from-purple-800 to-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tl from-green-800 to-teal-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 flex flex-col items-center justify-center p-8">
        <QuestionRenderer
          question={currentQuestion}
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={mockQuestions.length}
          onAnswerSelect={handleAnswerSelect}
          // Передаем выбранный пользователем ответ для текущего вопроса
          currentUserAnswer={{ questionId: currentQuestion.id, selectedOptionId: userAnswers[currentQuestion.id] }}
        />

        {/* Кнопки навигации */}
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

// Основной компонент App
function App() {
  return (
    <Router>
      <Routes>
        {/* Маршрут для главной страницы */}
        <Route path="/" element={
          <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4
                          bg-gradient-to-br from-gray-900 via-gray-800 to-black
                          text-white font-sans overflow-hidden">
            
            {/* Абстрактные фоновые элементы */}
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-bl from-red-800 to-yellow-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
            <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gradient-to-tr from-purple-800 to-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tl from-green-800 to-teal-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

            {/* Контейнер для основного содержимого (над фоновыми элементами) */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center p-8
                            bg-white bg-opacity-5 rounded-xl shadow-2xl backdrop-blur-md border border-gray-700/50
                            max-w-4xl mx-auto transform hover:scale-102 transition-transform duration-300 ease-in-out">
              
              {/* Заголовок */}
              <h1 className="text-6xl md:text-7xl font-extrabold mb-6 tracking-tight drop-shadow-lg"
                  style={{ textShadow: '0 0 10px rgba(0,0,0,0.5)' }}>
                HRBP-Тест
              </h1>
              
              {/* Анонс теста */}
              <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mb-10 leading-relaxed">
                Ребятушки, я тут совсем угорел по своей работе и начал собирать тест на HRBP.
                <br/><br/>
                Сейчас он на стадии валидации, параллельно собираю web-версию (на скрине).
                <br/>
                Исследования и аналитику уже прошел - проработал источники уровня Harvard Business Review, SHRM.
                <br/>
                В течение месяца планирую выпустить в прод.
                <br/><br/>
                76 вопросов: кейсы, приоритизация, знания • От Junior до Senior • Персональная аналитика.
                <br/>
                Бесплатно и без ограничений - я таких в открытом доступе еще не видел.
                <br/><br/>
                Каждый вопрос с детальными объяснениями и персональными рекомендациями по развитию.
                <br/>
                Закрываю свою потребность - мне не хватало подобного теста, решил сделать сам.

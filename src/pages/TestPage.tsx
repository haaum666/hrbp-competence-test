import React, { useEffect } from 'react'; // Убедитесь, что useEffect импортирован
import { Link, useLocation } from 'react-router-dom'; // Убедитесь, что useLocation импортирован
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
    resetTestStateForNavigation, // <-- ДОБАВЛЕНО: Импортируем новую функцию
  } = useTestLogic();

  const location = useLocation(); // <-- ДОБАВЛЕНО: Получаем объект местоположения

  // ДОБАВЛЕНО: Эффект для сброса состояния теста при навигации на главную страницу
  useEffect(() => {
    // Этот эффект срабатывает при каждом изменении маршрута.
    // Если мы находимся на главной странице теста ('/')
    // и тест был запущен, мы хотим сбросить его состояние
    // до "стартового экрана", чтобы пользователь мог выбрать
    // "Продолжить тест" или "Начать новый тест".
    if (location.pathname === '/' && testStarted) {
      resetTestStateForNavigation();
    }
  }, [location.pathname, testStarted, resetTestStateForNavigation]); // Зависимости useEffect


  // Функция для стилизации кнопок с нашей палитрой и текстурой
  const getButtonStyle = (isPrimary: boolean, isHoverable: boolean = true) => ({
    backgroundColor: isPrimary ? 'var(--color-accent-secondary)' : 'var(--color-neutral)',
    color: isPrimary ? 'var(--color-button-text)' : 'var(--color-text-primary)',
    backgroundImage: 'var(--texture-grain)',
    backgroundSize: '4px 4px',
    backgroundRepeat: 'repeat',
    filter: isHoverable ? 'brightness(1.0)' : 'none', // Начальная яркость для hover
    transition: isHoverable ? 'filter 0.3s ease' : 'none',
  });

  // Функции для обработки hover-эффектов кнопок
  const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>, isPrimary: boolean, isEnter: boolean) => {
    if (isPrimary) {
      e.currentTarget.style.filter = isEnter ? 'brightness(1.1)' : 'brightness(1.0)'; // Оливковый: слегка ярче при наведении
    } else {
      e.currentTarget.style.filter = isEnter ? 'brightness(0.95)' : 'brightness(1.0)'; // Нейтральный: слегка темнее при наведении
    }
  };


  return (
    <>
      {/* Стартовый экран теста */}
      {!testStarted && !testFinished && (
        <div
          className="flex flex-col items-center justify-center text-center p-4 rounded-lg shadow-xl max-w-2xl w-full"
          style={{
            backgroundColor: 'var(--color-background-card)', // Фон карточки
            backgroundImage: 'var(--texture-grain)', // Зернистость фона карточки
            backgroundSize: '4px 4px',
            backgroundRepeat: 'repeat',
            color: 'var(--color-text-primary)', // Основной цвет текста
            border: '1px solid var(--color-neutral)' // Легкая рамка
          }}
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4" style={{ color: 'var(--color-text-primary)' }}>HRBP-Тест</h1>
          <p className="text-lg sm:text-xl mb-8 max-w-2xl leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            Этот тест поможет оценить ваши компетенции HR Business Partner для российского рынка.
            Разработан как инструмент уровня специализированных образовательных учреждений.
          </p>
          {showResumeOption ? (
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full max-w-md">
              <button
                onClick={resumeTest}
                className="w-full font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50"
                style={getButtonStyle(true)} // Основная кнопка
                onMouseEnter={(e) => handleButtonHover(e, true, true)}
                onMouseLeave={(e) => handleButtonHover(e, true, false)}
              >
                Продолжить Тест
              </button>
              <button
                onClick={startNewTest}
                className="w-full font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50"
                style={getButtonStyle(false)} // Вторичная кнопка
                onMouseEnter={(e) => handleButtonHover(e, false, true)}
                onMouseLeave={(e) => handleButtonHover(e, false, false)}
              >
                Начать Новый Тест
              </button>
            </div>
          ) : (
            <button
              onClick={startNewTest}
              className="font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50 inline-block"
              style={getButtonStyle(true)} // Основная кнопка
              onMouseEnter={(e) => handleButtonHover(e, true, true)}
              onMouseLeave={(e) => handleButtonHover(e, true, false)}
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
          currentUserAnswer={userAnswers.find(ua => ua.questionId === questions[currentQuestionIndex].id) || null}
          onNextQuestion={handleNextQuestion}
          onPreviousQuestion={handlePreviousQuestion}
          isFirstQuestion={currentQuestionIndex === 0}
          isLastQuestion={currentQuestionIndex === questions.length - 1}
          remainingTime={remainingTime}
          progressPercentage={progressPercentage}
        />
      )}

      {/* Отображение общих результатов после завершения теста */}
      {testFinished && testResult && (
        <div
          className="rounded-xl shadow-2xl backdrop-blur-md p-6 sm:p-8 max-w-3xl w-full mx-auto text-center border"
          style={{
            backgroundColor: 'var(--color-background-card)', // Фон карточки
            backgroundImage: 'var(--texture-grain)',
            backgroundSize: '4px 4px',
            backgroundRepeat: 'repeat',
            color: 'var(--color-text-primary)', // Основной цвет текста
            borderColor: 'var(--color-neutral)', // Цвет рамки
          }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Тест завершен!</h2>
          <p className="text-lg sm:text-xl mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            Ваши результаты:
          </p>
          <div className="text-left mx-auto max-w-sm space-y-2 mb-8 text-base sm:text-lg">
            <p>Всего вопросов: <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{testResult.totalQuestions}</span></p>
            <p>Правильных ответов: <span className="font-semibold" style={{ color: 'var(--color-success)' }}>{testResult.correctAnswers}</span></p>
            <p>Неправильных ответов: <span className="font-semibold" style={{ color: 'var(--color-error)' }}>{testResult.incorrectAnswers}</span></p>
            <p>Пропущено вопросов: <span className="font-semibold" style={{ color: 'var(--color-neutral)' }}>{testResult.unanswered}</span></p>
            <p className="text-xl sm:text-2xl pt-4">Итоговый балл: <span className="font-extrabold" style={{ color: 'var(--color-text-primary)' }}>{testResult.scorePercentage.toFixed(2)}%</span></p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mt-6">
            <button
              onClick={() => { /* Логика для детальных результатов */ }}
              className="w-full sm:w-auto font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 inline-block text-center cursor-not-allowed opacity-50"
              style={getButtonStyle(false, false)} // Неактивная кнопка, без hover
              disabled
            >
              Посмотреть детальные результаты (скоро)
            </button>
            <Link
              to="/"
              onClick={startNewTest}
              className="w-full sm:w-auto font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 inline-block text-center"
              style={getButtonStyle(true)} // Основная кнопка
              onMouseEnter={(e) => handleButtonHover(e as unknown as React.MouseEvent<HTMLButtonElement>, true, true)}
              onMouseLeave={(e) => handleButtonHover(e as unknown as React.MouseEvent<HTMLButtonElement>, true, false)}
            >
              Пройти тест снова
            </Link>
          </div>
        </div>
      )}

      {/* Сообщение, если что-то пошло не так (например, вопросы не загрузились) */}
      {!testStarted && !testFinished && questions.length === 0 && (
        <p className="text-xl sm:text-2xl" style={{ color: 'var(--color-text-primary)' }}>Загрузка вопросов или тест еще не начат...</p>
      )}
    </>
  );
};

export default TestPage;

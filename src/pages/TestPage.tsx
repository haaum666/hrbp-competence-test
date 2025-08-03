// src/pages/TestPage.tsx
import React, { useEffect, useRef, useState } from 'react'; // Добавили useState
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Добавили useNavigate
import QuestionRenderer from '../components/test/QuestionRenderer';
import ResultDetailView from '../components/test/ResultDetailView'; // Предполагается, что этот компонент используется для детального просмотра
import Sidebar from '../components/layout/Sidebar'; // Импортируем новый Sidebar
import Footer from '../components/layout/Footer';   // Импортируем новый Footer
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
    resetTestStateForNavigation,
  } = useTestLogic();

  const location = useLocation();
  const navigate = useNavigate(); // Инициализируем useNavigate

  // Состояние для управления видимостью модального окна
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Дополнительный реф для отслеживания предыдущего пути
  const prevPathnameRef = useRef(location.pathname);

  useEffect(() => {
    const currentPath = location.pathname;
    const previousPath = prevPathnameRef.current;

    if (testStarted && previousPath !== '/' && currentPath === '/') {
      console.log('TestPage useEffect: Обнаружен переход с тестовой страницы на главную. Сброс состояния.');
      resetTestStateForNavigation();
    }
      
    prevPathnameRef.current = currentPath; 
  }, [location.pathname, testStarted, resetTestStateForNavigation]);

  // Функции для управления модальным окном
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleConfirmExit = () => {
    resetTestStateForNavigation(); // Сброс состояния теста
    setIsModalOpen(false);        // Закрываем модальное окно
    navigate('/');                // Переходим на главную страницу
  };

  // УНИФИЦИРОВАННЫЕ СТИЛИ ДЛЯ КНОПОК
  const getButtonStyle = (isPrimary: boolean, isHoverable: boolean = true) => ({
    backgroundColor: isPrimary ? 'var(--button-primary-bg)' : 'var(--button-secondary-bg)',
    color: isPrimary ? 'var(--button-primary-text)' : 'var(--button-secondary-text)',
    backgroundImage: 'var(--texture-grain)',
    backgroundSize: '4px 4px',
    backgroundRepeat: 'repeat',
    filter: isHoverable ? 'brightness(1.0)' : 'none',
    transition: isHoverable ? 'filter 0.3s ease' : 'none',
    border: isPrimary ? `1px solid var(--button-primary-border)` : `1px solid var(--button-secondary-border)`,
  });

  const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>, isPrimaryButton: boolean, isEnter: boolean) => {
    if (isPrimaryButton) {
      e.currentTarget.style.filter = isEnter ? 'brightness(0.9)' : 'brightness(1.0)';
    } else {
      e.currentTarget.style.filter = isEnter ? 'brightness(0.95)' : 'brightness(1.0)';
    }
  };

  return (
    <>
      {/* Стартовый экран теста - остается без изменений в логике отображения */}
      {!testStarted && !testFinished && (
        <div
          className="flex flex-col items-center justify-center text-center p-4 rounded-lg shadow-xl max-w-2xl w-full"
          style={{
            backgroundColor: 'var(--color-background-card)',
            backgroundImage: 'var(--texture-grain)',
            backgroundSize: '4px 4px',
            backgroundRepeat: 'repeat',
            color: 'var(--color-text-primary)',
            border: '2px solid var(--color-neutral)',
            boxShadow: '4px 4px 0px 0px var(--color-neutral)',
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
                style={getButtonStyle(true)}
                onMouseEnter={(e) => handleButtonHover(e, true, true)}
                onMouseLeave={(e) => handleButtonHover(e, true, false)}
              >
                Продолжить Тест
              </button>
              <button
                onClick={startNewTest}
                className="w-full font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50"
                style={getButtonStyle(false)}
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
              style={getButtonStyle(true)}
              onMouseEnter={(e) => handleButtonHover(e, true, true)}
              onMouseLeave={(e) => handleButtonHover(e, true, false)}
            >
              Начать Тест
            </button>
          )}
        </div>
      )}

      {/* Отображение самого теста и боковой панели */}
      {testStarted && questions.length > 0 && !testFinished && (
        <div className="flex w-full items-start justify-center p-4 md:space-x-4"> {/* Контейнер для сайдбара и рендерера */}
          <Sidebar
            isModalOpen={isModalOpen}
            onOpenModal={handleOpenModal}
            onCloseModal={handleCloseModal}
            onConfirmExit={handleConfirmExit}
            testStarted={testStarted}
          />
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
        </div>
      )}

      {/* Отображение общих результатов после завершения теста */}
      {testFinished && testResult && (
        <div
          className="rounded-xl shadow-2xl backdrop-blur-md p-6 sm:p-8 max-w-3xl w-full mx-auto text-center"
          style={{
            backgroundColor: 'var(--color-background-card)',
            backgroundImage: 'var(--texture-grain)',
            backgroundSize: '4px 4px',
            backgroundRepeat: 'repeat',
            color: 'var(--color-text-primary)',
            border: '2px solid var(--color-neutral)',
            boxShadow: '4px 4px 0px 0px var(--color-neutral)',
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
            <p>Пропущено вопросов: <span className="font-semibold" style={{ color: 'var(--color-text-secondary)' }}>{testResult.unanswered}</span></p>
            <p className="text-xl sm:text-2xl pt-4">Итоговый балл: <span className="font-extrabold" style={{ color: 'var(--color-text-primary)' }}>{testResult.scorePercentage.toFixed(2)}%</span></p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mt-6">
            <button
              onClick={() => { /* Логика для детальных результатов */ }}
              className="w-full sm:w-auto font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 inline-block text-center cursor-not-allowed opacity-50"
              style={getButtonStyle(false, false)}
              onMouseEnter={(e) => handleButtonHover(e, false, true)}
              onMouseLeave={(e) => handleButtonHover(e, false, false)}
              disabled
            >
              Посмотреть детальные результаты (скоро)
            </button>
            <Link
              to="/"
              onClick={startNewTest}
              className="w-full sm:w-auto font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 inline-block text-center"
              style={getButtonStyle(true)}
              onMouseEnter={(e) => handleButtonHover(e as unknown as React.MouseEvent<HTMLButtonElement>, true, true)}
              onMouseLeave={(e) => handleButtonHover(e as unknown as React.MouseEvent<HTMLButtonElement>, true, false)}
            >
              Пройти тест снова
            </Link>
          </div>
        </div>
      )}

      {/* Футер для мобильных - отображается только когда тест запущен */}
      {testStarted && !testFinished && ( // Показываем футер только когда тест активен
        <Footer
          isModalOpen={isModalOpen}
          onOpenModal={handleOpenModal}
          onCloseModal={handleCloseModal}
          onConfirmExit={handleConfirmExit}
          testStarted={testStarted}
        />
      )}
    </>
  );
};

export default TestPage;

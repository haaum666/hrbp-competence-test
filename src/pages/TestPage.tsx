import React, { useEffect, useRef } from 'react'; // Добавили useRef
import { Link, useLocation } from 'react-router-dom';
import QuestionRenderer from '../components/test/QuestionRenderer';
import ResultDetailView from '../components/test/ResultDetailView'; // Предполагается, что этот компонент используется для детального просмотра
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

  // Дополнительный реф для отслеживания предыдущего пути
  const prevPathnameRef = useRef(location.pathname);

  useEffect(() => {
    // Этот эффект сбрасывает состояние теста ПРИ НАВИГАЦИИ на главную страницу
    // И только если тест БЫЛ запущен.
    // Это предотвращает сброс при первом рендере TestPage, когда мы уже на главной.
    const currentPath = location.pathname;
    const previousPath = prevPathnameRef.current;

    // Условие:
    // 1. Тест был запущен (testStarted)
    // 2. Предыдущий путь НЕ был главной страницей (т.е. мы были на странице теста или другой)
    // 3. Текущий путь СТАЛ главной страницей ('/')
    if (testStarted && previousPath !== '/' && currentPath === '/') {
      console.log('TestPage useEffect: Обнаружен переход с тестовой страницы на главную. Сброс состояния.');
      resetTestStateForNavigation();
    }
    
    // Обновляем реф с текущим путем для следующего рендера
    prevPathnameRef.current = currentPath; 
  }, [location.pathname, testStarted, resetTestStateForNavigation]);

  // УНИФИЦИРОВАННЫЕ СТИЛИ ДЛЯ КНОПОК
  // isPrimary: true - для кнопок действия (Начать тест, Продолжить, Пройти тест снова)
  // isPrimary: false - для кнопок вторичного действия (Начать Новый Тест, Детальные результаты)
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
      {/* Стартовый экран теста */}
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
                style={getButtonStyle(true)} // Используем Primary стиль (акцентный фон, светлый текст)
                onMouseEnter={(e) => handleButtonHover(e, true, true)}
                onMouseLeave={(e) => handleButtonHover(e, true, false)}
              >
                Продолжить Тест
              </button>
              <button
                onClick={startNewTest}
                className="w-full font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50"
                style={getButtonStyle(false)} // Используем Secondary стиль (светлый фон, темный текст)
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
              style={getButtonStyle(true)} // Используем Primary стиль
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
              style={getButtonStyle(false, false)} // Вторичный стиль, неактивная
              onMouseEnter={(e) => handleButtonHover(e, false, true)}
              onMouseLeave={(e) => handleButtonHover(e, false, false)}
              disabled
            >
              Посмотреть детальные результаты (скоро)
            </button>
            <Link
              to="/"
              onClick={startNewTest} // Уберите вызов startNewTest здесь, если вы хотите просто вернуться
              className="w-full sm:w-auto font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 inline-block text-center"
              style={getButtonStyle(true)} // Первичный стиль
              onMouseEnter={(e) => handleButtonHover(e as unknown as React.MouseEvent<HTMLButtonElement>, true, true)}
              onMouseLeave={(e) => handleButtonHover(e as unknown as React.MouseEvent<HTMLButtonElement>, true, false)}
            >
              Пройти тест снова
            </Link>
          </div>
        </div>
      )}
    </>
  );
};

export default TestPage;

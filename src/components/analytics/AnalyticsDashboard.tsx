import React, { useState, useEffect } from 'react';
import { TestResult } from '../../types/test.d';
import { Link } from 'react-router-dom';

// НОВЫЕ ИМПОРТЫ ДЛЯ ГРАФИКОВ
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// НОВАЯ РЕГИСТРАЦИЯ КОМПОНЕНТОВ CHART.JS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const LOCAL_STORAGE_KEY_ALL_RESULTS = 'allTestResults';

const AnalyticsDashboard: React.FC = () => {
  const [allResults, setAllResults] = useState<TestResult[]>([]);
  const [averageScore, setAverageScore] = useState<string>('0.00');
  const [totalTestsCompleted, setTotalTestsCompleted] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // НОВЫЕ СОСТОЯНИЯ ДЛЯ АНАЛИТИКИ ОТВЕТОВ И ВРЕМЕНИ
  const [avgCorrect, setAvgCorrect] = useState<number>(0);
  const [avgIncorrect, setAvgIncorrect] = useState<number>(0);
  const [avgUnanswered, setAvgUnanswered] = useState<number>(0);
  const [averageTestDuration, setAverageTestDuration] = useState<string>('00:00');

  useEffect(() => {
    try {
      const savedResultsString = localStorage.getItem(LOCAL_STORAGE_KEY_ALL_RESULTS);
      if (savedResultsString) {
        const parsedResults: TestResult[] = JSON.parse(savedResultsString);

        // Сортируем результаты по времени, чтобы новые были сверху
        const sortedResults = parsedResults.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setAllResults(sortedResults);

        setTotalTestsCompleted(sortedResults.length);

        if (sortedResults.length > 0) {
          const totalScores = sortedResults.reduce((sum, result) => sum + result.scorePercentage, 0);
          const avgScore = totalScores / sortedResults.length;
          setAverageScore(avgScore.toFixed(2));

          const totalCorrect = sortedResults.reduce((sum, result) => sum + result.correctAnswers, 0);
          const totalIncorrect = sortedResults.reduce((sum, result) => sum + result.incorrectAnswers, 0);
          const totalUnanswered = sortedResults.reduce((sum, result) => sum + result.unanswered, 0);
          const totalQuestionsOverall = sortedResults.reduce((sum, result) => sum + result.totalQuestions, 0);

          if (totalQuestionsOverall > 0) {
            setAvgCorrect((totalCorrect / totalQuestionsOverall) * 100);
            setAvgIncorrect((totalIncorrect / totalQuestionsOverall) * 100);
            setAvgUnanswered((totalUnanswered / totalQuestionsOverall) * 100);
          } else {
            setAvgCorrect(0);
            setAvgIncorrect(0);
            setAvgUnanswered(0);
          }

          let totalDurationSeconds = 0;
          let validDurationsCount = 0;
          sortedResults.forEach(result => {
            try {
              if (result.startTime && result.endTime) {
                const start = new Date(result.startTime).getTime();
                const end = new Date(result.endTime).getTime();
                if (!isNaN(start) && !isNaN(end) && end > start) {
                  totalDurationSeconds += (end - start) / 1000;
                  validDurationsCount++;
                } else {
                    console.warn(`Пропущено некорректное время для теста: startTime=${result.startTime}, endTime=${result.endTime}`);
                }
              } else {
                  console.warn(`Пропущен тест без startTime или endTime:`, result);
              }
            } catch (e) {
              console.warn("Ошибка парсинга даты для расчета длительности теста:", result, e);
            }
          });

          if (validDurationsCount > 0) {
            const averageSec = totalDurationSeconds / validDurationsCount;
            const minutes = Math.floor(averageSec / 60);
            const seconds = Math.round(averageSec % 60);
            setAverageTestDuration(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
          } else {
            setAverageTestDuration('00:00');
          }

        } else {
          setAverageScore('0.00');
          setAvgCorrect(0);
          setAvgIncorrect(0);
          setAvgUnanswered(0);
          setAverageTestDuration('00:00');
        }
      } else {
        setAllResults([]);
        setTotalTestsCompleted(0);
        setAverageScore('0.00');
        setAvgCorrect(0);
        setAvgIncorrect(0);
        setAvgUnanswered(0);
        setAverageTestDuration('00:00');
      }
    } catch (e) {
      console.error('Ошибка при загрузке или парсинге данных аналитики из localStorage:', e);
      setError("Ошибка при загрузке аналитических данных. Возможно, данные повреждены.");
      setAllResults([]);
      setTotalTestsCompleted(0);
      setAverageScore('0.00');
      setAvgCorrect(0);
      setAvgIncorrect(0);
      setAvgUnanswered(0);
      setAverageTestDuration('00:00');
      localStorage.removeItem(LOCAL_STORAGE_KEY_ALL_RESULTS);
    } finally {
      setLoading(false);
    }
  }, []);

  // Функция для очистки всех результатов
  const handleClearAllResults = () => {
    if (window.confirm('Вы уверены, что хотите удалить все данные о пройденных тестах? Это действие необратимо.')) {
      localStorage.removeItem(LOCAL_STORAGE_KEY_ALL_RESULTS);
      setAllResults([]);
      setTotalTestsCompleted(0);
      setAverageScore('0.00');
      setAvgCorrect(0);
      setAvgIncorrect(0);
      setAvgUnanswered(0);
      setAverageTestDuration('00:00');
      setError(null);
    }
  };

  // НОВАЯ ЛОГИКА ДЛЯ ДАННЫХ ГРАФИКА
  const chartData = {
    labels: allResults.map((_, index) => `Тест #${allResults.length - index}`), // Обратный порядок для Labels
    datasets: [
      {
        label: 'Балл теста (%)',
        data: allResults.map(result => result.scorePercentage),
        fill: false,
        borderColor: 'var(--color-accent-primary)', // ИСПОЛЬЗУЕМ ПАЛИТРУ
        tension: 0.2,
        pointBackgroundColor: 'var(--color-accent-primary)', // ИСПОЛЬЗУЕМ ПАЛИТРУ
        pointBorderColor: 'var(--color-neutral)', // ИСПОЛЬЗУЕМ ПАЛИТРУ
        pointHoverBackgroundColor: 'var(--color-error)', // ИСПОЛЬЗУЕМ ПАЛИТРУ
        pointHoverBorderColor: 'var(--color-neutral)', // ИСПОЛЬЗУЕМ ПАЛИТРУ
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'var(--color-text-primary)', // ИСПОЛЬЗУЕМ ПАЛИТРУ (темный текст на светлом фоне графика)
          font: {
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: 'Прогресс по баллам за тесты',
        color: 'var(--color-text-primary)', // ИСПОЛЬЗУЕМ ПАЛИТРУ
        font: {
          family: 'Montserrat',
          size: 20,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `Балл: ${context.raw.toFixed(2)}%`;
          }
        },
        backgroundColor: 'var(--color-text-primary)', // ИСПОЛЬЗУЕМ ПАЛИТРУ
        titleColor: 'var(--color-neutral)', // ИСПОЛЬЗУЕМ ПАЛИТРУ
        bodyColor: 'var(--color-neutral)', // ИСПОЛЬЗУЕМ ПАЛИТРУ
        borderColor: 'var(--color-text-secondary)', // ИСПОЛЬЗУЕМ ПАЛИТРУ
        borderWidth: 1,
      }
    },
    scales: {
      x: {
        ticks: {
          color: 'var(--color-text-secondary)', // ИСПОЛЬЗУЕМ ПАЛИТРУ
          font: {
            family: 'Inter',
          }
        },
        grid: {
          color: 'rgba(58, 66, 50, 0.2)', // bauhaus-dark-gray с прозрачностью (изменен цвет)
        },
        title: {
            display: true,
            text: 'Номер теста (по убыванию даты)',
            color: 'var(--color-text-primary)', // ИСПОЛЬЗУЕМ ПАЛИТРУ
            font: {
                family: 'Inter',
                size: 14,
            }
        }
      },
      y: {
        ticks: {
          color: 'var(--color-text-secondary)', // ИСПОЛЬЗУЕМ ПАЛИТРУ
          callback: function(value: string | number) {
            return `${value}%`;
          },
          font: {
            family: 'Inter',
          }
        },
        grid: {
          color: 'rgba(58, 66, 50, 0.2)', // bauhaus-dark-gray с прозрачностью (изменен цвет)
        },
        min: 0,
        max: 100,
        title: {
            display: true,
            text: 'Процент правильных ответов',
            color: 'var(--color-text-primary)', // ИСПОЛЬЗУЕМ ПАЛИТРУ
            font: {
                family: 'Inter',
                size: 14,
            }
        }
      },
    },
  };

  // НОВЫЕ ДАННЫЕ И ОПЦИИ ДЛЯ КРУГОВОЙ ДИАГРАММЫ
  const pieChartData = {
    labels: ['Правильные', 'Неправильные', 'Без ответа'],
    datasets: [
      {
        label: 'Среднее соотношение ответов (%)',
        data: [avgCorrect, avgIncorrect, avgUnanswered],
        backgroundColor: [
          'var(--color-accent-primary)', // ИСПОЛЬЗУЕМ ПАЛИТРУ (серо-голубой для правильных)
          'var(--color-error)', // ИСПОЛЬЗУЕМ ПАЛИТРУ (оранжево-красный для неправильных)
          'var(--color-text-secondary)', // ИСПОЛЬЗУЕМ ПАЛИТРУ (приглушенный средне-серый для без ответа)
        ],
        borderColor: 'var(--color-background-card)', // ИСПОЛЬЗУЕМ ПАЛИТРУ (светлый бежевый для разделения)
        borderWidth: 2,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: 'var(--color-text-primary)', // ИСПОЛЬЗУЕМ ПАЛИТРУ
          font: {
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: 'Среднее соотношение ответов по всем тестам',
        color: 'var(--color-text-primary)', // ИСПОЛЬЗУЕМ ПАЛИТРУ
        font: {
          family: 'Montserrat',
          size: 20,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw;
            return `${label}: ${value.toFixed(2)}%`;
          }
        },
        backgroundColor: 'var(--color-text-primary)', // ИСПОЛЬЗУЕМ ПАЛИТРУ
        titleColor: 'var(--color-neutral)', // ИСПОЛЬЗУЕМ ПАЛИТРУ
        bodyColor: 'var(--color-neutral)', // ИСПОЛЬЗУЕМ ПАЛИТРУ
        borderColor: 'var(--color-text-secondary)', // ИСПОЛЬЗУЕМ ПАЛИТРУ
        borderWidth: 1,
      }
    },
  };

  // Стили кнопок для этой страницы
  const getButtonStyle = (isPrimary: boolean, isHoverable: boolean = true) => ({
    backgroundColor: isPrimary ? 'var(--color-accent-primary)' : 'var(--color-error)', // Для кнопок "Вернуться" и "Очистить"
    color: 'var(--color-neutral)', // Текст всегда светлый на цветной кнопке
    backgroundImage: 'var(--texture-grain)',
    backgroundSize: '4px 4px',
    backgroundRepeat: 'repeat',
    filter: isHoverable ? 'brightness(1.0)' : 'none',
    transition: isHoverable ? 'filter 0.3s ease' : 'none',
    border: '1px solid var(--color-text-primary)', // Тонкая темная граница для кнопок
  });

  const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>, isEnter: boolean) => {
    e.currentTarget.style.filter = isEnter ? 'brightness(0.9)' : 'brightness(1.0)';
  };


  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center text-center p-6 sm:p-8 rounded-xl shadow-xl max-w-2xl w-full mx-auto"
        style={{
          backgroundColor: 'var(--color-background-card)', // Новый фон
          backgroundImage: 'var(--texture-grain)', // Зернистость
          backgroundSize: '4px 4px',
          backgroundRepeat: 'repeat',
          color: 'var(--color-text-primary)', // Темный текст
          border: '2px solid var(--color-neutral)', // Светлая каёмочка
          boxShadow: '4px 4px 0px 0px var(--color-neutral)', // Эффект "стенки"
        }}
      >
        <p className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Загрузка аналитических данных...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center text-center p-6 sm:p-8 rounded-xl shadow-xl max-w-2xl w-full mx-auto"
        style={{
          backgroundColor: 'var(--color-background-card)', // Новый фон
          backgroundImage: 'var(--texture-grain)', // Зернистость
          backgroundSize: '4px 4px',
          backgroundRepeat: 'repeat',
          color: 'var(--color-error)', // Красный текст для ошибки
          border: '2px solid var(--color-neutral)', // Светлая каёмочка
          boxShadow: '4px 4px 0px 0px var(--color-neutral)', // Эффект "стенки"
        }}
      >
        <p className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--color-error)' }}>{error}</p>
        <Link
          to="/"
          className="mt-6 font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 inline-block text-center"
          style={getButtonStyle(true)} // Используем акцентный синий
          onMouseEnter={(e) => handleButtonHover(e as unknown as React.MouseEvent<HTMLButtonElement>, true)}
          onMouseLeave={(e) => handleButtonHover(e as unknown as React.MouseEvent<HTMLButtonElement>, false)}
        >
          Вернуться на главную
        </Link>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl shadow-2xl p-6 sm:p-8 max-w-4xl w-full mx-auto" // Удален backdrop-blur-md
      style={{
        backgroundColor: 'var(--color-background-card)', // НОВЫЙ ФОН для всей панели
        backgroundImage: 'var(--texture-grain)', // Зернистость
        backgroundSize: '4px 4px',
        backgroundRepeat: 'repeat',
        color: 'var(--color-text-primary)', // НОВЫЙ ОСНОВНОЙ ЦВЕТ ТЕКСТА
        border: '2px solid var(--color-neutral)', // НОВАЯ КАЁМОЧКА
        boxShadow: '4px 4px 0px 0px var(--color-neutral)', // НОВЫЙ ЭФФЕКТ "СТЕНКИ"
      }}
    >
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center" style={{ color: 'var(--color-text-primary)' }}>
        Панель Аналитики Тестов
      </h2>

      {/* Блок с общей статистикой */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <div
          className="p-5 sm:p-6 rounded-lg border shadow-md flex flex-col items-center justify-center text-center"
          style={{
            backgroundColor: 'var(--color-background-card)', // Фон остается светлым
            backgroundImage: 'var(--texture-grain)',
            backgroundSize: '4px 4px',
            backgroundRepeat: 'repeat',
            borderColor: 'var(--color-neutral)', // Тонкая светлая граница
            boxShadow: '2px 2px 0px 0px var(--color-neutral)', // Более легкая тень
          }}
        >
          <p className="text-4xl sm:text-5xl font-extrabold mb-2" style={{ color: 'var(--color-accent-primary)' }}>{totalTestsCompleted}</p>
          <p className="text-lg sm:text-xl" style={{ color: 'var(--color-text-secondary)' }}>Пройдено тестов</p>
        </div>
        <div
          className="p-5 sm:p-6 rounded-lg border shadow-md flex flex-col items-center justify-center text-center"
          style={{
            backgroundColor: 'var(--color-background-card)',
            backgroundImage: 'var(--texture-grain)',
            backgroundSize: '4px 4px',
            backgroundRepeat: 'repeat',
            borderColor: 'var(--color-neutral)',
            boxShadow: '2px 2px 0px 0px var(--color-neutral)',
          }}
        >
          <p className="text-4xl sm:text-5xl font-extrabold mb-2" style={{ color: 'var(--color-accent-secondary)' }}>{averageScore}%</p>
          <p className="text-lg sm:text-xl" style={{ color: 'var(--color-text-secondary)' }}>Средний балл</p>
        </div>
        <div
          className="p-5 sm:p-6 rounded-lg border shadow-md flex flex-col items-center justify-center text-center"
          style={{
            backgroundColor: 'var(--color-background-card)',
            backgroundImage: 'var(--texture-grain)',
            backgroundSize: '4px 4px',
            backgroundRepeat: 'repeat',
            borderColor: 'var(--color-neutral)',
            boxShadow: '2px 2px 0px 0px var(--color-neutral)',
          }}
        >
          <p className="text-4xl sm:text-5xl font-extrabold mb-2" style={{ color: 'var(--color-error)' }}>{averageTestDuration}</p>
          <p className="text-lg sm:text-xl" style={{ color: 'var(--color-text-secondary)' }}>Среднее время теста</p>
        </div>
      </div>

      {/* Блок с графиком прогресса по баллам (линейный) */}
      {allResults.length > 0 && (
        <div
          className="mb-8 p-4 rounded-lg border shadow-md"
          style={{
            backgroundColor: 'var(--color-background-card)', // Фон графика
            backgroundImage: 'var(--texture-grain)',
            backgroundSize: '4px 4px',
            backgroundRepeat: 'repeat',
            borderColor: 'var(--color-neutral)', // Тонкая светлая граница
            boxShadow: '2px 2px 0px 0px var(--color-neutral)', // Более легкая тень
          }}
        >
          <div style={{ height: '350px' }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* НОВОЕ: Блок с круговой диаграммой соотношения ответов */}
      {allResults.length > 0 && (
        <div
          className="mb-8 p-4 rounded-lg border shadow-md"
          style={{
            backgroundColor: 'var(--color-background-card)', // Фон графика
            backgroundImage: 'var(--texture-grain)',
            backgroundSize: '4px 4px',
            backgroundRepeat: 'repeat',
            borderColor: 'var(--color-neutral)', // Тонкая светлая граница
            boxShadow: '2px 2px 0px 0px var(--color-neutral)', // Более легкая тень
          }}
        >
          <div style={{ height: '350px' }}>
            <Pie data={pieChartData} options={pieChartOptions} />
          </div>
        </div>
      )}

      {/* Блок со списком пройденных тестов */}
      <h3 className="text-xl sm:text-2xl font-bold mb-4 text-center" style={{ color: 'var(--color-text-primary)' }}>История Пройденных Тестов</h3>
      {allResults.length === 0 ? (
        <div
          className="text-center text-base sm:text-lg p-4 rounded-lg border shadow-md"
          style={{
            backgroundColor: 'var(--color-background-card)', // Фон блока
            backgroundImage: 'var(--texture-grain)',
            backgroundSize: '4px 4px',
            backgroundRepeat: 'repeat',
            color: 'var(--color-text-secondary)', // Вторичный текст
            borderColor: 'var(--color-neutral)', // Тонкая светлая граница
            boxShadow: '2px 2px 0px 0px var(--color-neutral)', // Более легкая тень
          }}
        >
          <p className="mb-4">Нет данных о пройденных тестах для отображения истории.</p>
          <p>Пройдите несколько тестов, чтобы увидеть их список.</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4 max-h-[50vh] overflow-y-auto pr-2 sm:pr-3 scrollbar-thin scrollbar-thumb-bauhaus-dark-gray scrollbar-track-bauhaus-black">
          {allResults.map((result, index) => (
            <div
              key={index}
              className="p-3 sm:p-4 rounded-lg border flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm"
              style={{
                backgroundColor: 'var(--color-background-card)', // Фон каждого элемента списка
                backgroundImage: 'var(--texture-grain)',
                backgroundSize: '4px 4px',
                backgroundRepeat: 'repeat',
                borderColor: 'var(--color-neutral)', // Тонкая светлая граница
                boxShadow: '1px 1px 0px 0px var(--color-neutral)', // Еще более легкая тень
              }}
            >
              <div className="mb-1 sm:mb-0">
                <p className="text-sm sm:text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  Тест #{allResults.length - index} (
                  {new Date(result.timestamp).toLocaleDateString()} {new Date(result.timestamp).toLocaleTimeString()}
                  )
                </p>
                <p className="text-xs sm:text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Балл: <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{result.scorePercentage.toFixed(2)}%</span>
                </p>
                <p className="text-xs sm:text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Правильных: <span style={{ color: 'var(--color-accent-primary)' }}>{result.correctAnswers}</span> / Всего: <span style={{ color: 'var(--color-text-primary)' }}>{result.totalQuestions}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Блок с кнопками, включая "Очистить все результаты" */}
      <div className="flex flex-col sm:flex-row justify-center items-center mt-8 space-y-4 sm:space-y-0 sm:space-x-4">
        <button
          onClick={handleClearAllResults}
          className="font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 inline-block text-base sm:text-lg w-full sm:w-auto focus:outline-none focus:ring-4 focus:ring-opacity-50"
          style={getButtonStyle(false)} // Используем error-цвет
          onMouseEnter={(e) => handleButtonHover(e, true)}
          onMouseLeave={(e) => handleButtonHover(e, false)}
        >
          Очистить все результаты
        </button>
        <Link
          to="/"
          className="font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 inline-block text-center text-base sm:text-lg w-full sm:w-auto focus:outline-none focus:ring-4 focus:ring-opacity-50"
          style={getButtonStyle(true)} // Используем accent-primary
          onMouseEnter={(e) => handleButtonHover(e as unknown as React.MouseEvent<HTMLButtonElement>, true)}
          onMouseLeave={(e) => handleButtonHover(e as unknown as React.MouseEvent<HTMLButtonElement>, false)}
        >
          Вернуться к началу
        </Link>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

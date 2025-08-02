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

  const [avgCorrect, setAvgCorrect] = useState<number>(0);
  const [avgIncorrect, setAvgIncorrect] = useState<number>(0);
  const [avgUnanswered, setAvgUnanswered] = useState<number>(0);
  const [averageTestDuration, setAverageTestDuration] = useState<string>('00:00');

  useEffect(() => {
    try {
      const savedResultsString = localStorage.getItem(LOCAL_STORAGE_KEY_ALL_RESULTS);
      if (savedResultsString) {
        const parsedResults: TestResult[] = JSON.parse(savedResultsString);

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
    labels: allResults.map((_, index) => `Тест #${allResults.length - index}`),
    datasets: [
      {
        label: 'Балл теста (%)',
        data: allResults.map(result => result.scorePercentage),
        fill: false,
        borderColor: 'var(--color-accent-primary)',
        tension: 0.2,
        pointBackgroundColor: 'var(--color-accent-primary)',
        pointBorderColor: 'var(--color-neutral)',
        pointHoverBackgroundColor: 'var(--color-error)',
        pointHoverBorderColor: 'var(--color-neutral)',
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
          color: 'var(--color-text-primary)',
          font: {
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: 'Прогресс по баллам за тесты',
        color: 'var(--color-text-primary)',
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
        backgroundColor: 'var(--color-text-primary)',
        titleColor: 'var(--color-neutral)',
        bodyColor: 'var(--color-neutral)',
        borderColor: 'var(--color-text-secondary)',
        borderWidth: 1,
      }
    },
    scales: {
      x: {
        ticks: {
          color: 'var(--color-text-secondary)',
          font: {
            family: 'Inter',
          }
        },
        grid: {
          color: 'rgba(58, 66, 50, 0.2)', // Adjusted to our text-primary with transparency
        },
        title: {
            display: true,
            text: 'Номер теста (по убыванию даты)',
            color: 'var(--color-text-primary)',
            font: {
                family: 'Inter',
                size: 14,
            }
        }
      },
      y: {
        ticks: {
          color: 'var(--color-text-secondary)',
          callback: function(value: string | number) {
            return `${value}%`;
          },
          font: {
            family: 'Inter',
          }
        },
        grid: {
          color: 'rgba(58, 66, 50, 0.2)', // Adjusted to our text-primary with transparency
        },
        min: 0,
        max: 100,
        title: {
            display: true,
            text: 'Процент правильных ответов',
            color: 'var(--color-text-primary)',
            font: {
                family: 'Inter',
                size: 14,
            }
        }
      },
    },
  };

  const pieChartData = {
    labels: ['Правильные', 'Неправильные', 'Без ответа'],
    datasets: [
      {
        label: 'Среднее соотношение ответов (%)',
        data: [avgCorrect, avgIncorrect, avgUnanswered],
        backgroundColor: [
          'var(--color-accent-primary)',
          'var(--color-error)',
          'var(--color-text-secondary)',
        ],
        borderColor: 'var(--color-background-card)',
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
          color: 'var(--color-text-primary)',
          font: {
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: 'Среднее соотношение ответов по всем тестам',
        color: 'var(--color-text-primary)',
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
        backgroundColor: 'var(--color-text-primary)',
        titleColor: 'var(--color-neutral)',
        bodyColor: 'var(--color-neutral)',
        borderColor: 'var(--color-text-secondary)',
        borderWidth: 1,
      }
    },
  };

  return (
    <div
      className="rounded-xl p-6 sm:p-8 max-w-4xl w-full mx-auto" // Удалили shadow-2xl и backdrop-blur-md, добавим свою тень
      style={{
        backgroundColor: 'var(--color-background-card)',
        backgroundImage: 'var(--texture-grain)',
        backgroundSize: '4px 4px',
        backgroundRepeat: 'repeat',
        color: 'var(--color-text-primary)',
        border: '2px solid var(--color-neutral)',
        boxShadow: '4px 4px 0px 0px var(--color-neutral)', // Эффект "стенки" для всей панели
      }}
    >
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center" style={{ color: 'var(--color-text-primary)' }}>
        Панель Аналитики Тестов
      </h2>

      {/* Блок с общей статистикой */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <div
          className="p-5 sm:p-6 rounded-lg border flex flex-col items-center justify-center text-center" // Удален shadow-md
          style={{
            backgroundColor: 'var(--color-background-card)',
            backgroundImage: 'var(--texture-grain)',
            backgroundSize: '4px 4px',
            backgroundRepeat: 'repeat',
            borderColor: 'var(--color-neutral)',
            boxShadow: '2px 2px 0px 0px var(--color-neutral)', // Более легкая тень для вложенных карточек
          }}
        >
          <p className="text-4xl sm:text-5xl font-extrabold mb-2" style={{ color: 'var(--color-accent-primary)' }}>{totalTestsCompleted}</p>
          <p className="text-lg sm:text-xl" style={{ color: 'var(--color-text-secondary)' }}>Пройдено тестов</p>
        </div>
        <div
          className="p-5 sm:p-6 rounded-lg border flex flex-col items-center justify-center text-center"
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
          className="p-5 sm:p-6 rounded-lg border flex flex-col items-center justify-center text-center"
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
          className="mb-8 p-4 rounded-lg border" // Удален shadow-md
          style={{
            backgroundColor: 'var(--color-background-card)',
            backgroundImage: 'var(--texture-grain)',
            backgroundSize: '4px 4px',
            backgroundRepeat: 'repeat',
            borderColor: 'var(--color-neutral)',
            boxShadow: '2px 2px 0px 0px var(--color-neutral)',
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
          className="mb-8 p-4 rounded-lg border" // Удален shadow-md
          style={{
            backgroundColor: 'var(--color-background-card)',
            backgroundImage: 'var(--texture-grain)',
            backgroundSize: '4px 4px',
            backgroundRepeat: 'repeat',
            borderColor: 'var(--color-neutral)',
            boxShadow: '2px 2px 0px 0px var(--color-neutral)',
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
          className="text-center text-base sm:text-lg p-4 rounded-lg border" // Удален shadow-md
          style={{
            backgroundColor: 'var(--color-background-card)',
            backgroundImage: 'var(--texture-grain)',
            backgroundSize: '4px 4px',
            backgroundRepeat: 'repeat',
            color: 'var(--color-text-secondary)',
            borderColor: 'var(--color-neutral)',
            boxShadow: '2px 2px 0px 0px var(--color-neutral)',
          }}
        >
          <p className="mb-4">Нет данных о пройденных тестах для отображения истории.</p>
          <p>Пройдите несколько тестов, чтобы увидеть их список.</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4 max-h-[50vh] overflow-y-auto pr-2 sm:pr-3 scrollbar-custom"> {/* Изменен скроллбар на custom-класс */}
          {allResults.map((result, index) => (
            <div
              key={index}
              className="p-3 sm:p-4 rounded-lg border flex flex-col sm:flex-row justify-between items-start sm:items-center" // Удален shadow-sm
              style={{
                backgroundColor: 'var(--color-background-card)',
                backgroundImage: 'var(--texture-grain)',
                backgroundSize: '4px 4px',
                backgroundRepeat: 'repeat',
                borderColor: 'var(--color-neutral)',
                boxShadow: '2px 2px 0px 0px var(--color-neutral)', // Более легкая тень для элементов списка
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

      {/* Блок с кнопками */}
      <div className="flex flex-col sm:flex-row justify-center items-center mt-8 space-y-4 sm:space-y-0 sm:space-x-4">
        <button
          onClick={handleClearAllResults}
          className="font-bold py-3 px-8 rounded-full transition duration-300 ease-in-out transform hover:scale-105 inline-block text-base sm:text-lg w-full sm:w-auto focus:outline-none focus:ring-4 focus:ring-opacity-50
          button-error-style" // ИСПОЛЬЗУЕМ НОВЫЕ КЛАССЫ
        >
          Очистить все результаты
        </button>
        <Link
          to="/"
          className="font-bold py-3 px-8 rounded-full transition duration-300 ease-in-out transform hover:scale-105 inline-block text-center text-base sm:text-lg w-full sm:w-auto focus:outline-none focus:ring-4 focus:ring-opacity-50
          button-primary-style" // ИСПОЛЬЗУЕМ НОВЫЕ КЛАССЫ
        >
          Вернуться к началу
        </Link>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

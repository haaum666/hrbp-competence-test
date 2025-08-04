// src/components/analytics/AnalyticsDashboard.tsx

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

  // НОВЫЕ СОСТОЯНИЯ ДЛЯ ХРАНЕНИЯ ЦВЕТОВ
  const [chartColors, setChartColors] = useState({
    accentPrimary: '#739072', // Дефолтные значения, если CSS-переменные не загрузятся
    error: '#B31312',
    textSecondary: '#6F6F6F',
    backgroundCard: '#EADBC8',
    textPrimary: '#3A4232',
    neutral: '#A79277',
    accentSecondary: '#F0B86E',
  });

  useEffect(() => {
    // Функция для получения значения CSS-переменной
    const getCssVariable = (variable: string) => {
      if (typeof window !== 'undefined') {
        return window.getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
      }
      return '';
    };

    // Получаем цвета из CSS-переменных при монтировании компонента
    const accentPrimary = getCssVariable('--color-accent-primary');
    const error = getCssVariable('--color-error');
    const textSecondary = getCssVariable('--color-text-secondary');
    const backgroundCard = getCssVariable('--color-background-card');
    const textPrimary = getCssVariable('--color-text-primary');
    const neutral = getCssVariable('--color-neutral');
    const accentSecondary = getCssVariable('--color-accent-secondary');

    setChartColors({
      accentPrimary: accentPrimary || '#739072',
      error: error || '#B31312',
      textSecondary: textSecondary || '#6F6F6F',
      backgroundCard: backgroundCard || '#EADBC8',
      textPrimary: textPrimary || '#3A4232',
      neutral: neutral || '#A79277',
      accentSecondary: accentSecondary || '#F0B86E',
    });

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
  }, []); // Пустой массив зависимостей означает, что useEffect запускается один раз при монтировании

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
  // Теперь используем chartColors для определения цветов
  const chartData = {
    labels: allResults.map((_, index) => `Тест #${allResults.length - index}`),
    datasets: [
      {
        label: 'Балл теста (%)',
        data: allResults.map(result => result.scorePercentage),
        fill: false,
        borderColor: chartColors.accentPrimary, // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
        tension: 0.2,
        pointBackgroundColor: chartColors.accentPrimary, // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
        pointBorderColor: chartColors.neutral, // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
        pointHoverBackgroundColor: chartColors.error, // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
        pointHoverBorderColor: chartColors.neutral, // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
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
          color: chartColors.textPrimary, // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
          font: {
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: 'Прогресс по баллам за тесты',
        color: chartColors.textPrimary, // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
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
        backgroundColor: chartColors.textPrimary, // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
        titleColor: chartColors.neutral, // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
        bodyColor: chartColors.neutral, // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
        borderColor: chartColors.textSecondary, // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
        borderWidth: 1,
      }
    },
    scales: {
      x: {
        ticks: {
          color: chartColors.textSecondary, // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
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
            color: chartColors.textPrimary, // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
            font: {
                family: 'Inter',
                size: 14,
            }
        }
      },
      y: {
        ticks: {
          color: chartColors.textSecondary, // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
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
            color: chartColors.textPrimary, // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
            font: {
                family: 'Inter',
                size: 14,
            }
        }
      },
    },
  };

  // ИСПРАВЛЕННЫЕ ЦВЕТА ДЛЯ КРУГОВОЙ ДИАГРАММЫ
  const pieChartData = {
    labels: ['Правильные', 'Неправильные', 'Без ответа'],
    datasets: [
      {
        label: 'Среднее соотношение ответов (%)',
        data: [avgCorrect, avgIncorrect, avgUnanswered],
        backgroundColor: [
          chartColors.accentPrimary,    // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
          chartColors.error,            // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
          chartColors.textSecondary,    // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
        ],
        borderColor: chartColors.backgroundCard, // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
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
          color: chartColors.textPrimary, // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
          font: {
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: 'Среднее соотношение ответов по всем тестам',
        color: chartColors.textPrimary, // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
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
        backgroundColor: chartColors.textPrimary, // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
        titleColor: chartColors.neutral, // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
        bodyColor: chartColors.neutral, // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
        borderColor: chartColors.textSecondary, // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
        borderWidth: 1,
      }
    },
  };

  return (
    <div
      className="rounded-xl p-6 sm:p-8 max-w-4xl w-full mx-auto"
      style={{
        backgroundColor: chartColors.backgroundCard, // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
        backgroundImage: 'var(--texture-grain)',
        backgroundSize: '4px 4px',
        backgroundRepeat: 'repeat',
        color: chartColors.textPrimary, // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
        border: `2px solid ${chartColors.neutral}`, // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
        boxShadow: `4px 4px 0px 0px ${chartColors.neutral}`, // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
      }}
    >
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center" style={{ color: chartColors.textPrimary }}> {/* ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА */}
        Панель Аналитики Тестов
      </h2>

      {/* Блок с общей статистикой */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <div
          className="p-5 sm:p-6 rounded-lg border flex flex-col items-center justify-center text-center"
          style={{
            backgroundColor: chartColors.backgroundCard, // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
            backgroundImage: 'var(--texture-grain)',
            backgroundSize: '4px 4px',
            backgroundRepeat: 'repeat',
            borderColor: chartColors.neutral, // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
            boxShadow: `2px 2px 0px 0px ${chartColors.neutral}`, // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
          }}
        >
          <p className="text-4xl sm:text-5xl font-extrabold mb-2" style={{ color: chartColors.accentPrimary }}>{totalTestsCompleted}</p> {/* ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА */}
          <p className="text-lg sm:text-xl" style={{ color: chartColors.textSecondary }}>Пройдено тестов</p> {/* ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА */}
        </div>
        <div
          className="p-5 sm:p-6 rounded-lg border flex flex-col items-center justify-center text-center"
          style={{
            backgroundColor: chartColors.backgroundCard, // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
            backgroundImage: 'var(--texture-grain)',
            backgroundSize: '4px 4px',
            backgroundRepeat: 'repeat',
            borderColor: chartColors.neutral, // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
            boxShadow: `2px 2px 0px 0px ${chartColors.neutral}`, // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
          }}
        >
          <p className="text-4xl sm:text-5xl font-extrabold mb-2" style={{ color: chartColors.accentSecondary }}>{averageScore}%</p> {/* ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА */}
          <p className="text-lg sm:text-xl" style={{ color: chartColors.textSecondary }}>Средний балл</p> {/* ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА */}
        </div>
        <div
          className="p-5 sm:p-6 rounded-lg border flex flex-col items-center justify-center text-center"
          style={{
            backgroundColor: chartColors.backgroundCard, // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
            backgroundImage: 'var(--texture-grain)',
            backgroundSize: '4px 4px',
            backgroundRepeat: 'repeat',
            borderColor: chartColors.neutral, // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
            boxShadow: `2px 2px 0px 0px ${chartColors.neutral}`, // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
          }}
        >
          <p className="text-4xl sm:text-5xl font-extrabold mb-2" style={{ color: chartColors.error }}>{averageTestDuration}</p> {/* ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА */}
          <p className="text-lg sm:text-xl" style={{ color: chartColors.textSecondary }}>Среднее время теста</p> {/* ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА */}
        </div>
      </div>

      {/* Блок с графиком прогресса по баллам (линейный) */}
      {allResults.length > 0 && (
        <div
          className="mb-8 p-4 rounded-lg border"
          style={{
            backgroundColor: chartColors.backgroundCard, // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
            backgroundImage: 'var(--texture-grain)',
            backgroundSize: '4px 4px',
            backgroundRepeat: 'repeat',
            borderColor: chartColors.neutral, // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
            boxShadow: `2px 2px 0px 0px ${chartColors.neutral}`, // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
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
          className="mb-8 p-4 rounded-lg border"
          style={{
            backgroundColor: chartColors.backgroundCard, // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
            backgroundImage: 'var(--texture-grain)',
            backgroundSize: '4px 4px',
            backgroundRepeat: 'repeat',
            borderColor: chartColors.neutral, // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
            boxShadow: `2px 2px 0px 0px ${chartColors.neutral}`, // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
          }}
        >
          <div style={{ height: '350px' }}>
            <Pie data={pieChartData} options={pieChartOptions} />
          </div>
        </div>
      )}

      {/* Блок со списком пройденных тестов */}
      <h3 className="text-xl sm:text-2xl font-bold mb-4 text-center" style={{ color: chartColors.textPrimary }}>История Пройденных Тестов</h3> {/* ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА */}
      {allResults.length === 0 ? (
        <div
          className="text-center text-base sm:text-lg p-4 rounded-lg border"
          style={{
            backgroundColor: chartColors.backgroundCard, // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
            backgroundImage: 'var(--texture-grain)',
            backgroundSize: '4px 4px',
            backgroundRepeat: 'repeat',
            color: chartColors.textSecondary, // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
            borderColor: chartColors.neutral, // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
            boxShadow: `2px 2px 0px 0px ${chartColors.neutral}`, // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
          }}
        >
          <p className="mb-4">Нет данных о пройденных тестах для отображения истории.</p>
          <p>Пройдите несколько тестов, чтобы увидеть их список.</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4 max-h-[50vh] overflow-y-auto pr-2 sm:pr-3 scrollbar-custom">
          {allResults.map((result, index) => (
            <div
              key={index}
              className="p-3 sm:p-4 rounded-lg border flex flex-col sm:flex-row justify-between items-start sm:items-center"
              style={{
                backgroundColor: chartColors.backgroundCard, // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
                backgroundImage: 'var(--texture-grain)',
                backgroundSize: '4px 4px',
                backgroundRepeat: 'repeat',
                borderColor: chartColors.neutral, // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
                boxShadow: `2px 2px 0px 0px ${chartColors.neutral}`, // ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА
              }}
            >
              <div className="mb-1 sm:mb-0">
                <p className="text-sm sm:text-base font-semibold" style={{ color: chartColors.textPrimary }}> {/* ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА */}
                  Тест #{allResults.length - index} (
                  {new Date(result.timestamp).toLocaleDateString()} {new Date(result.timestamp).toLocaleTimeString()}
                  )
                </p>
                <p className="text-xs sm:text-sm" style={{ color: chartColors.textSecondary }}> {/* ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА */}
                  Балл: <span className="font-bold" style={{ color: chartColors.textPrimary }}>{result.scorePercentage.toFixed(2)}%</span> {/* ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА */}
                </p>
                <p className="text-xs sm:text-sm" style={{ color: chartColors.textSecondary }}> {/* ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА */}
                  Правильных: <span style={{ color: chartColors.accentPrimary }}>{result.correctAnswers}</span> / Всего: <span style={{ color: chartColors.textPrimary }}>{result.totalQuestions}</span> {/* ИСПОЛЬЗУЕМ СОСТОЯНИЕ ЦВЕТА */}
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
          button-error-style"
        >
          Очистить все результаты
        </button>
        <Link
          to="/"
          className="font-bold py-3 px-8 rounded-full transition duration-300 ease-in-out transform hover:scale-105 inline-block text-center text-base sm:text-lg w-full sm:w-auto focus:outline-none focus:ring-4 focus:ring-opacity-50
          button-primary-style"
        >
          Вернуться к началу
        </Link>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

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
        borderColor: '#005D9A', // bauhaus-blue
        tension: 0.2, // Немного сглаживаем линию
        pointBackgroundColor: '#005D9A', // bauhaus-blue
        pointBorderColor: '#F8F8F8', // bauhaus-white
        pointHoverBackgroundColor: '#D4002D', // bauhaus-red
        pointHoverBorderColor: '#F8F8F8', // bauhaus-white
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
          color: '#F8F8F8', // bauhaus-white
          font: {
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: 'Прогресс по баллам за тесты',
        color: '#F8F8F8', // bauhaus-white
        font: {
          family: 'Montserrat', // Используем font-heading
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
        backgroundColor: '#1A1A1A', // bauhaus-black
        titleColor: '#F8F8F8', // bauhaus-white
        bodyColor: '#D0D0D0', // bauhaus-light-gray
        borderColor: '#4A4A4A', // bauhaus-dark-gray
        borderWidth: 1,
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#D0D0D0', // bauhaus-light-gray
          font: {
            family: 'Inter', // font-sans
          }
        },
        grid: {
          color: 'rgba(74, 74, 74, 0.4)', // bauhaus-dark-gray с прозрачностью
        },
        title: {
            display: true,
            text: 'Номер теста (по убыванию даты)', // Уточняем подпись оси X
            color: '#F8F8F8',
            font: {
                family: 'Inter',
                size: 14,
            }
        }
      },
      y: {
        ticks: {
          color: '#D0D0D0', // bauhaus-light-gray
          callback: function(value: string | number) {
            return `${value}%`;
          },
          font: {
            family: 'Inter', // font-sans
          }
        },
        grid: {
          color: 'rgba(74, 74, 74, 0.4)', // bauhaus-dark-gray с прозрачностью
        },
        min: 0,
        max: 100,
        title: {
            display: true,
            text: 'Процент правильных ответов',
            color: '#F8F8F8',
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
          '#005D9A', // bauhaus-blue для правильных
          '#D4002D', // bauhaus-red для неправильных
          '#AAAAAA', // bauhaus-gray для без ответа
        ],
        borderColor: '#1A1A1A', // bauhaus-black
        borderWidth: 2,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const, // Перемещаем легенду вправо для Pie
        labels: {
          color: '#F8F8F8', // bauhaus-white
          font: {
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: 'Среднее соотношение ответов по всем тестам',
        color: '#F8F8F8', // bauhaus-white
        font: {
          family: 'Montserrat', // font-heading
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
        backgroundColor: '#1A1A1A', // bauhaus-black
        titleColor: '#F8F8F8', // bauhaus-white
        bodyColor: '#D0D0D0', // bauhaus-light-gray
        borderColor: '#4A4A4A', // bauhaus-dark-gray
        borderWidth: 1,
      }
    },
  };

  if (loading) {
    return (
      <div className="bg-white bg-opacity-5 rounded-xl shadow-2xl backdrop-blur-md p-6 sm:p-8 max-w-4xl w-full mx-auto text-center border border-bauhaus-dark-gray text-bauhaus-white font-sans">
        <p className="text-xl sm:text-2xl font-heading">Загрузка аналитических данных...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white bg-opacity-5 rounded-xl shadow-2xl backdrop-blur-md p-6 sm:p-8 max-w-4xl w-full mx-auto text-center border border-bauhaus-dark-gray text-bauhaus-red font-sans">
        <p className="text-xl sm:text-2xl font-heading">{error}</p>
        <Link to="/" className="mt-6 bg-bauhaus-blue hover:bg-blue-700 text-bauhaus-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition duration-300 ease-in-out transform hover:scale-105 inline-block">
          Вернуться на главную
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white bg-opacity-5 rounded-xl shadow-2xl backdrop-blur-md p-6 sm:p-8 max-w-4xl w-full mx-auto border border-bauhaus-dark-gray text-bauhaus-white font-sans">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-bauhaus-white text-center font-heading">
        Панель Аналитики Тестов
      </h2>

      {/* Блок с общей статистикой */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <div className="bg-bauhaus-black bg-opacity-70 p-5 sm:p-6 rounded-lg border border-bauhaus-dark-gray text-center flex flex-col items-center justify-center shadow-md">
          <p className="text-4xl sm:text-5xl font-extrabold text-bauhaus-blue mb-2">{totalTestsCompleted}</p>
          <p className="text-lg sm:text-xl text-bauhaus-light-gray">Пройдено тестов</p>
        </div>
        <div className="bg-bauhaus-black bg-opacity-70 p-5 sm:p-6 rounded-lg border border-bauhaus-dark-gray text-center flex flex-col items-center justify-center shadow-md">
          <p className="text-4xl sm:text-5xl font-extrabold text-bauhaus-yellow mb-2">{averageScore}%</p> {/* Изменен цвет на bauhaus-yellow */}
          <p className="text-lg sm:text-xl text-bauhaus-light-gray">Средний балл</p>
        </div>
        {/* НОВОЕ: Среднее время прохождения теста */}
        <div className="bg-bauhaus-black bg-opacity-70 p-5 sm:p-6 rounded-lg border border-bauhaus-dark-gray text-center flex flex-col items-center justify-center shadow-md">
          <p className="text-4xl sm:text-5xl font-extrabold text-bauhaus-red mb-2">{averageTestDuration}</p> {/* Изменен цвет на bauhaus-red */}
          <p className="text-lg sm:text-xl text-bauhaus-light-gray">Среднее время теста</p>
        </div>
      </div>

      {/* Блок с графиком прогресса по баллам (линейный) */}
      {allResults.length > 0 && (
        <div className="mb-8 p-4 bg-bauhaus-black bg-opacity-70 rounded-lg border border-bauhaus-dark-gray shadow-md">
          <div style={{ height: '350px' }}> {/* Увеличил высоту для лучшей читаемости */}
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* НОВОЕ: Блок с круговой диаграммой соотношения ответов */}
      {allResults.length > 0 && (
        <div className="mb-8 p-4 bg-bauhaus-black bg-opacity-70 rounded-lg border border-bauhaus-dark-gray shadow-md">
          <div style={{ height: '350px' }}> {/* Задаем фиксированную высоту для графика */}
            <Pie data={pieChartData} options={pieChartOptions} />
          </div>
        </div>
      )}

      {/* Блок со списком пройденных тестов */}
      <h3 className="text-xl sm:text-2xl font-bold mb-4 text-bauhaus-white text-center font-heading">История Пройденных Тестов</h3>
      {allResults.length === 0 ? (
        <div className="text-center text-bauhaus-light-gray text-base sm:text-lg p-4 bg-bauhaus-black bg-opacity-70 rounded-lg border border-bauhaus-dark-gray shadow-md">
          <p className="mb-4">Нет данных о пройденных тестах для отображения истории.</p>
          <p>Пройдите несколько тестов, чтобы увидеть их список.</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4 max-h-[50vh] overflow-y-auto pr-2 sm:pr-3 scrollbar-thin scrollbar-thumb-bauhaus-dark-gray scrollbar-track-bauhaus-black">
          {allResults.map((result, index) => (
            <div key={index} className="bg-bauhaus-dark-gray bg-opacity-50 p-3 sm:p-4 rounded-lg border border-bauhaus-gray flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm">
              <div className="mb-1 sm:mb-0">
                <p className="text-sm sm:text-base font-semibold text-bauhaus-white">
                  Тест #{allResults.length - index} (
                  {new Date(result.timestamp).toLocaleDateString()} {new Date(result.timestamp).toLocaleTimeString()}
                  )
                </p>
                <p className="text-xs sm:text-sm text-bauhaus-light-gray">
                  Балл: <span className="font-bold text-bauhaus-white">{result.scorePercentage.toFixed(2)}%</span>
                </p>
                <p className="text-xs sm:text-sm text-bauhaus-light-gray">
                  Правильных: <span className="text-bauhaus-blue">{result.correctAnswers}</span> / Всего: <span className="text-bauhaus-white">{result.totalQuestions}</span>
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
          className="bg-bauhaus-red hover:bg-red-700 text-bauhaus-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition duration-300 ease-in-out transform hover:scale-105 inline-block text-base sm:text-lg w-full sm:w-auto focus:outline-none focus:ring-4 focus:ring-bauhaus-red focus:ring-opacity-50"
        >
          Очистить все результаты
        </button>
        <Link to="/" className="bg-bauhaus-blue hover:bg-blue-700 text-bauhaus-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition duration-300 ease-in-out transform hover:scale-105 inline-block text-base sm:text-lg w-full sm:w-auto focus:outline-none focus:ring-4 focus:ring-bauhaus-blue focus:ring-opacity-50">
          Вернуться к началу
        </Link>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

import React, { useState, useEffect } from 'react';
import { TestResult } from '../../types/test.d';
import { Link } from 'react-router-dom';

// НОВЫЕ ИМПОРТЫ ДЛЯ ГРАФИКОВ
import { Line, Pie } from 'react-chartjs-2'; // Добавляем Pie
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement, // Для круговой диаграммы
} from 'chart.js';

// НОВАЯ РЕГИСТРАЦИЯ КОМПОНЕНТОВ CHART.JS (добавляем ArcElement)
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement // Регистрируем ArcElement
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
  const [averageTestDuration, setAverageTestDuration] = useState<string>('00:00'); // Среднее время прохождения

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

          // НОВЫЙ РАСЧЕТ: Среднее количество правильных, неправильных, без ответа
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

          // НОВЫЙ РАСЧЕТ: Среднее время прохождения теста
          let totalDurationSeconds = 0;
          let validDurationsCount = 0;
          sortedResults.forEach(result => {
            try {
              // Убедимся, что startTime и endTime существуют и являются валидными датами
              if (result.startTime && result.endTime) {
                const start = new Date(result.startTime).getTime();
                const end = new Date(result.endTime).getTime();
                if (!isNaN(start) && !isNaN(end) && end > start) {
                  totalDurationSeconds += (end - start) / 1000; // Разница в секундах
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
          // Сбрасываем значения, если тестов нет
          setAvgCorrect(0);
          setAvgIncorrect(0);
          setAvgUnanswered(0);
          setAverageTestDuration('00:00');
        }
      } else {
        setAllResults([]);
        setTotalTestsCompleted(0);
        setAverageScore('0.00');
        // Сбрасываем значения здесь тоже
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
      // Сбрасываем значения здесь тоже
      setAvgCorrect(0);
      setAvgIncorrect(0);
      setAvgUnanswered(0);
      setAverageTestDuration('00:00');
      localStorage.removeItem(LOCAL_STORAGE_KEY_ALL_RESULTS); // Очищаем, если данные повреждены
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
      // Сбрасываем также и новые метрики
      setAvgCorrect(0);
      setAvgIncorrect(0);
      setAvgUnanswered(0);
      setAverageTestDuration('00:00');
      setError(null);
    }
  };

  // НОВАЯ ЛОГИКА ДЛЯ ДАННЫХ ГРАФИКА
  const chartData = {
    // Labels: номера тестов в порядке возрастания (старые к новым)
    labels: allResults.map((_, index) => `Тест #${index + 1}`),
    datasets: [
      {
        label: 'Балл теста (%)',
        data: allResults.map(result => result.scorePercentage),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        pointBackgroundColor: 'rgb(75, 192, 192)',
        pointBorderColor: 'rgb(75, 192, 192)',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(75, 192, 192)',
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
          color: 'white',
        },
      },
      title: {
        display: true,
        text: 'Прогресс по баллам за тесты',
        color: 'white',
        font: {
          size: 18,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `Балл: ${context.raw.toFixed(2)}%`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: 'lightgray',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      y: {
        ticks: {
          color: 'lightgray',
          callback: function(value: string | number) {
            return `${value}%`;
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        min: 0,
        max: 100,
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
          'rgba(76, 175, 80, 0.8)', // Зеленый для правильных
          'rgba(244, 67, 54, 0.8)', // Красный для неправильных
          'rgba(158, 158, 158, 0.8)', // Серый для без ответа
        ],
        borderColor: [
          'rgba(76, 175, 80, 1)',
          'rgba(244, 67, 54, 1)',
          'rgba(158, 158, 158, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'white',
        },
      },
      title: {
        display: true,
        text: 'Среднее соотношение ответов по всем тестам',
        color: 'white',
        font: {
          size: 18,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw;
            return `${label}: ${value.toFixed(2)}%`;
          }
        }
      }
    },
  };

  if (loading) {
    return (
      <div className="bg-white bg-opacity-5 rounded-xl shadow-2xl backdrop-blur-md p-6 sm:p-8 max-w-4xl w-full mx-auto text-center border border-gray-700/50 text-white">
        <p className="text-xl sm:text-2xl">Загрузка аналитических данных...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white bg-opacity-5 rounded-xl shadow-2xl backdrop-blur-md p-6 sm:p-8 max-w-4xl w-full mx-auto text-center border border-gray-700/50 text-red-400">
        <p className="text-xl sm:text-2xl">{error}</p>
        <Link to="/" className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 inline-block">
          Вернуться на главную
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white bg-opacity-5 rounded-xl shadow-2xl backdrop-blur-md p-6 sm:p-8 max-w-4xl w-full mx-auto border border-gray-700/50 text-white">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-white text-center">Панель Аналитики Тестов</h2>

      {/* Блок с общей статистикой */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8"> {/* ОБНОВЛЕНО: Добавлено lg:grid-cols-3 */}
        <div className="bg-gray-800 p-5 sm:p-6 rounded-lg border border-gray-700 text-center flex flex-col items-center justify-center">
          <p className="text-4xl sm:text-5xl font-extrabold text-blue-400 mb-2">{totalTestsCompleted}</p>
          <p className="text-lg sm:text-xl text-gray-300">Пройдено тестов</p>
        </div>
        <div className="bg-gray-800 p-5 sm:p-6 rounded-lg border border-gray-700 text-center flex flex-col items-center justify-center">
          <p className="text-4xl sm:text-5xl font-extrabold text-purple-400 mb-2">{averageScore}%</p>
          <p className="text-lg sm:text-xl text-gray-300">Средний балл</p>
        </div>
        {/* НОВОЕ: Среднее время прохождения теста */}
        <div className="bg-gray-800 p-5 sm:p-6 rounded-lg border border-gray-700 text-center flex flex-col items-center justify-center">
          <p className="text-4xl sm:text-5xl font-extrabold text-teal-400 mb-2">{averageTestDuration}</p>
          <p className="text-lg sm:text-xl text-gray-300">Среднее время теста</p>
        </div>
      </div>


      {/* Блок с графиком прогресса по баллам (линейный) */}
      {allResults.length > 0 && (
        <div className="mb-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div style={{ height: '300px' }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* НОВОЕ: Блок с круговой диаграммой соотношения ответов */}
      {allResults.length > 0 && (
        <div className="mb-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div style={{ height: '300px' }}> {/* Задаем фиксированную высоту для графика */}
            <Pie data={pieChartData} options={pieChartOptions} />
          </div>
        </div>
      )}

      {/* Блок со списком пройденных тестов */}
      <h3 className="text-xl sm:text-2xl font-bold mb-4 text-white text-center">История Пройденных Тестов</h3>
      {allResults.length === 0 ? (
        <div className="text-center text-gray-300 text-base sm:text-lg p-4">
          <p className="mb-4">Нет данных о пройденных тестах для отображения истории.</p>
          <p>Пройдите несколько тестов, чтобы увидеть их список.</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4 max-h-[50vh] overflow-y-auto pr-2 sm:pr-3">
          {allResults.map((result, index) => (
            <div key={index} className="bg-gray-800 p-3 sm:p-4 rounded-lg border border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="mb-1 sm:mb-0">
                <p className="text-sm sm:text-base font-semibold text-gray-100">
                  Тест #{allResults.length - index} (
                  {new Date(result.timestamp).toLocaleDateString()} {new Date(result.timestamp).toLocaleTimeString()}
                  )
                </p>
                <p className="text-xs sm:text-sm text-gray-300">
                  Балл: <span className="font-bold text-white">{result.scorePercentage.toFixed(2)}%</span>
                </p>
                <p className="text-xs sm:text-sm text-gray-300">
                  Правильных: <span className="text-green-400">{result.correctAnswers}</span> / Всего: <span className="text-blue-400">{result.totalQuestions}</span>
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
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 inline-block text-base sm:text-lg w-full sm:w-auto"
        >
          Очистить все результаты
        </button>
        <Link to="/" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 inline-block text-base sm:text-lg w-full sm:w-auto">
          Вернуться к началу
        </Link>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

import React, { useState, useEffect } from 'react';
import { TestResult } from '../../types/test.d';
import { Link } from 'react-router-dom'; // Используем Link для навигации

const LOCAL_STORAGE_KEY_ALL_RESULTS = 'allTestResults';

const AnalyticsDashboard: React.FC = () => {
  const [allResults, setAllResults] = useState<TestResult[]>([]);
  const [averageScore, setAverageScore] = useState<string>('0.00');
  const [totalTestsCompleted, setTotalTestsCompleted] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true); // Вернули состояние загрузки
  const [error, setError] = useState<string | null>(null); // Вернули состояние ошибки

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
        } else {
          setAverageScore('0.00');
        }
      } else {
        setAllResults([]);
        setTotalTestsCompleted(0);
        setAverageScore('0.00');
      }
    } catch (e) {
      console.error('Ошибка при загрузке или парсинге данных аналитики из localStorage:', e);
      setError("Ошибка при загрузке аналитических данных. Возможно, данные повреждены.");
      setAllResults([]);
      setTotalTestsCompleted(0);
      setAverageScore('0.00');
      localStorage.removeItem(LOCAL_STORAGE_KEY_ALL_RESULTS); // Очищаем, если данные повреждены
    } finally {
      setLoading(false); // Завершили загрузку
    }
  }, []);

  // НОВОЕ: Функция для очистки всех результатов
  const handleClearAllResults = () => {
    if (window.confirm('Вы уверены, что хотите удалить все данные о пройденных тестах? Это действие необратимо.')) {
      localStorage.removeItem(LOCAL_STORAGE_KEY_ALL_RESULTS);
      setAllResults([]);
      setTotalTestsCompleted(0);
      setAverageScore('0.00');
      setError(null); // Сбрасываем ошибку, если была
      // Можно добавить временное сообщение об успехе, если это необходимо для UX
    }
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
        <div className="bg-gray-800 p-5 sm:p-6 rounded-lg border border-gray-700 text-center flex flex-col items-center justify-center">
          <p className="text-4xl sm:text-5xl font-extrabold text-blue-400 mb-2">{totalTestsCompleted}</p>
          <p className="text-lg sm:text-xl text-gray-300">Пройдено тестов</p>
        </div>
        <div className="bg-gray-800 p-5 sm:p-6 rounded-lg border border-gray-700 text-center flex flex-col items-center justify-center">
          <p className="text-4xl sm:text-5xl font-extrabold text-purple-400 mb-2">{averageScore}%</p>
          <p className="text-lg sm:text-xl text-gray-300">Средний балл</p>
        </div>
      </div>

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

      {/* НОВОЕ: Блок с кнопками, включая "Очистить все результаты" */}
      <div className="flex flex-col sm:flex-row justify-center items-center mt-8 space-y-4 sm:space-y-0 sm:space-x-4">
        <button
          onClick={handleClearAllResults}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 inline-block text-base sm:text-lg w-full sm:w-auto"
        >
          Очистить все результаты
        </button>
        <Link to="/" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-

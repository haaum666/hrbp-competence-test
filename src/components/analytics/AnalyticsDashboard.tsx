import React, { useState, useEffect } from 'react';
import { TestResult } from '../../types/test.d'; // Убедитесь, что TestResult импортирован

const LOCAL_STORAGE_KEY_ALL_RESULTS = 'allTestResults'; // Тот же ключ, что и в useTestLogic

const AnalyticsDashboard: React.FC = () => {
  const [allResults, setAllResults] = useState<TestResult[]>([]);
  const [averageScore, setAverageScore] = useState<string>('0.00');
  const [totalTestsCompleted, setTotalTestsCompleted] = useState<number>(0);

  useEffect(() => {
    const savedResultsString = localStorage.getItem(LOCAL_STORAGE_KEY_ALL_RESULTS);
    if (savedResultsString) {
      try {
        const parsedResults: TestResult[] = JSON.parse(savedResultsString);
        setAllResults(parsedResults);

        setTotalTestsCompleted(parsedResults.length);

        if (parsedResults.length > 0) {
          const totalScores = parsedResults.reduce((sum, result) => sum + result.scorePercentage, 0);
          const avgScore = totalScores / parsedResults.length;
          setAverageScore(avgScore.toFixed(2));
        } else {
          setAverageScore('0.00');
        }

      } catch (e) {
        console.error('Ошибка при загрузке аналитики из localStorage:', e);
        // Очищаем, если данные повреждены
        localStorage.removeItem(LOCAL_STORAGE_KEY_ALL_RESULTS);
      }
    }
  }, []); // Пустой массив зависимостей означает, что эффект запустится один раз при монтировании

  return (
    <div className="bg-white bg-opacity-5 rounded-xl shadow-2xl backdrop-blur-md p-8 max-w-2xl w-full mx-auto text-white border border-gray-700/50">
      <h2 className="text-3xl font-bold mb-6 text-center">Общая Статистика Тестов (на этом устройстве)</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
          <p className="text-5xl font-extrabold text-blue-400 mb-2">{totalTestsCompleted}</p>
          <p className="text-lg text-gray-300">Пройдено тестов</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
          <p className="text-5xl font-extrabold text-purple-400 mb-2">{averageScore}%</p>
          <p className="text-lg text-gray-300">Средний балл</p>
        </div>
      </div>

      <div className="mt-8 text-center">
        <a href="/" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 inline-block">
          Вернуться к началу
        </a>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

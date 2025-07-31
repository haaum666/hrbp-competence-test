import React from 'react';
import { TestResult, Question, UserAnswer } from '../../types/test.d'; // Обновленный импорт для Question, UserAnswer
import { exportToCsv, exportToXlsx } from '../../utils/exportUtils'; // Импортируем функции экспорта CSV/XLSX

interface DataExporterProps {
  testResult: TestResult | null; // Может быть null
  questions: Question[]; // ВОЗВРАЩЕНО: для соответствия ResultDetailView
  userAnswers: UserAnswer[]; // ВОЗВРАЩЕНО: для соответствия ResultDetailView
}

const DataExporter: React.FC<DataExporterProps> = ({ testResult }) => { // questions и userAnswers не деструктурируются, так как они не используются здесь напрямую
  const fileName = `hrbp_test_results_${new Date().toISOString().slice(0,10)}`;

  return (
    <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
      <button
        onClick={() => {
          if (testResult) {
            exportToCsv(testResult, fileName);
          } else {
            alert('Нет данных для экспорта. Пожалуйста, сначала пройдите тест.');
          }
        }}
        disabled={!testResult}
        className={`
          py-3 px-8 rounded-full font-bold text-lg
          transition duration-300 ease-in-out transform hover:scale-105 shadow-lg
          focus:outline-none focus:ring-2 focus:ring-opacity-75
          ${testResult
            ? 'bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500'
            : 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-70'
          }
        `}
      >
        Экспорт в CSV
      </button>

      <button
        onClick={() => {
          if (testResult) {
            exportToXlsx(testResult, fileName);
          } else {
            alert('Нет данных для экспорта. Пожалуйста, сначала пройдите тест.');
          }
        }}
        disabled={!testResult}
        className={`
          py-3 px-8 rounded-full font-bold text-lg
          transition duration-300 ease-in-out transform hover:scale-105 shadow-lg
          focus:outline-none focus:ring-2 focus:ring-opacity-75
          ${testResult
            ? 'bg-teal-600 hover:bg-teal-700 text-white focus:ring-teal-500'
            : 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-70'
          }
        `}
      >
        Экспорт в XLSX
      </button>
    </div>
  );
};

export default DataExporter;

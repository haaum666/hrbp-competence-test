import React from 'react';
import { TestResult, Question, UserAnswer } from '../../types/test.d'; // Обновленный импорт для Question, UserAnswer
import { exportToCsv, exportToXlsx } from '../../utils/exportUtils'; // Импортируем функции экспорта CSV/XLSX

interface DataExporterProps {
  testResult: TestResult | null; // Может быть null
  questions: Question[]; // ВОЗВРАЩЕНО: для соответствия ResultDetailView
  userAnswers: UserAnswer[]; // ВОЗВРАЩЕНО: для соответствия ResultDetailView
}

const DataExporter: React.FC<DataExporterProps> = ({ testResult, questions, userAnswers }) => { 
  // Примечание: questions и userAnswers не деструктурируются, так как они не используются здесь напрямую,
  // но важно, что они передаются, если exportUtils их требует.
  const fileName = `hrbp_test_results_${new Date().toISOString().slice(0,10)}`;

  return (
    <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 font-sans">
      <button
        onClick={() => {
          if (testResult) {
            // Предполагаем, что exportToCsv и exportToXlsx могут использовать questions и userAnswers
            // Если нет, то их можно удалить из пропсов DataExporterProps
            exportToCsv(testResult, fileName); 
          } else {
            alert('Нет данных для экспорта. Пожалуйста, сначала пройдите тест.');
          }
        }}
        disabled={!testResult}
        className={`
          py-3 px-8 rounded-full font-bold text-lg text-bauhaus-white
          transition duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-xl
          focus:outline-none focus:ring-4 focus:ring-opacity-75
          ${testResult
            ? 'bg-bauhaus-blue hover:bg-blue-700 focus:ring-bauhaus-blue' // Активный: Синий Баухаус
            : 'bg-bauhaus-dark-gray text-bauhaus-gray cursor-not-allowed opacity-70' // Неактивный: Темно-серый Баухаус
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
          py-3 px-8 rounded-full font-bold text-lg text-bauhaus-white
          transition duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-xl
          focus:outline-none focus:ring-4 focus:ring-opacity-75
          ${testResult
            ? 'bg-bauhaus-red hover:bg-red-700 focus:ring-bauhaus-red' // Активный: Красный Баухаус
            : 'bg-bauhaus-dark-gray text-bauhaus-gray cursor-not-allowed opacity-70' // Неактивный: Темно-серый Баухаус
          }
        `}
      >
        Экспорт в XLSX
      </button>
    </div>
  );
};

export default DataExporter;

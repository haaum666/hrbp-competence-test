// src/components/test/DataExporter.tsx

import React from 'react';
import { TestResult, Question, UserAnswer } from '../../types/test.d';
import { exportToCsv, exportToXlsx } from '../../utils/exportUtils';

interface DataExporterProps {
  testResult: TestResult | null; // Может быть null
  questions: Question[];
  userAnswers: UserAnswer[];
  // Добавлены новые пропсы для стилизации кнопок
  csvButtonClassName?: string;
  csvButtonStyles?: React.CSSProperties; // Тип для inline стилей
  xlsxButtonClassName?: string;
  xlsxButtonStyles?: React.CSSProperties;
}

const DataExporter: React.FC<DataExporterProps> = ({
  testResult,
  questions,
  userAnswers,
  csvButtonClassName,
  csvButtonStyles,
  xlsxButtonClassName,
  xlsxButtonStyles,
}) => {
  const fileName = `hrbp_test_results_${new Date().toISOString().slice(0, 10)}`;

  return (
    <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 font-sans">
      <button
        onClick={() => {
          if (testResult) {
            // Передаем questions и userAnswers, если exportUtils их требует
            exportToCsv(testResult, fileName, questions, userAnswers);
          } else {
            alert('Нет данных для экспорта. Пожалуйста, сначала пройдите тест.');
          }
        }}
        disabled={!testResult}
        // Применяем переданные className и style
        className={csvButtonClassName}
        style={csvButtonStyles}
      >
        Экспорт в CSV
      </button>

      <button
        onClick={() => {
          if (testResult) {
            // Передаем questions и userAnswers, если exportUtils их требует
            exportToXlsx(testResult, fileName, questions, userAnswers);
          } else {
            alert('Нет данных для экспорта. Пожалуйста, сначала пройдите тест.');
          }
        }}
        disabled={!testResult}
        // Применяем переданные className и style
        className={xlsxButtonClassName}
        style={xlsxButtonStyles}
      >
        Экспорт в XLSX
      </button>
    </div>
  );
};

export default DataExporter;

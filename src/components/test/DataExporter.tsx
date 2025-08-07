// src/components/test/DataExporter.tsx

import React from 'react';
import { TestResult, Question, UserAnswer } from '../../types/test.d';
import { exportToCsv, exportToXlsx } from '../../utils/exportUtils';

interface DataExporterProps {
  testResult: TestResult | null; // Может быть null
  questions: Question[];
  userAnswers: UserAnswer[];
  csvButtonClassName?: string;
  csvButtonStyles?: React.CSSProperties; // Тип для inline стилей
  xlsxButtonClassName?: string;
  xlsxButtonStyles?: React.CSSProperties;
}

const DataExporter: React.FC<DataExporterProps> = ({
  testResult,
  questions, // Эти пропсы остаются, так как они часть DataExporterProps, но не используются напрямую в exportToCsv/Xlsx
  userAnswers, // Эти пропсы остаются, так как они часть DataExporterProps, но не используются напрямую в exportToCsv/Xlsx
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
            // ИСПРАВЛЕНО: Убраны лишние аргументы questions и userAnswers
            exportToCsv(testResult, fileName);
          } else {
            alert('Нет данных для экспорта. Пожалуйста, сначала пройдите тест.');
          }
        }}
        disabled={!testResult}
        className={csvButtonClassName}
        style={csvButtonStyles}
      >
        Экспорт в CSV
      </button>

      <button
        onClick={() => {
          if (testResult) {
            // ИСПРАВЛЕНО: Убраны лишние аргументы questions и userAnswers
            exportToXlsx(testResult, fileName);
          } else {
            alert('Нет данных для экспорта. Пожалуйста, сначала пройдите тест.');
          }
        }}
        disabled={!testResult}
        className={xlsxButtonClassName}
        style={xlsxButtonStyles}
      >
        Экспорт в XLSX
      </button>
    </div>
  );
};

export default DataExporter;

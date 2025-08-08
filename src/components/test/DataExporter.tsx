// src/components/test/DataExporter.tsx

import React from 'react';
import * as XLSX from 'xlsx';
import { TestResult, Question, UserAnswer } from '../../types/test.d';

interface DataExporterProps {
  testResult: TestResult;
  questions: Question[];
  userAnswers: UserAnswer[];
  buttonClassNamesCsv?: string; // Новый пропс для классов кнопки CSV
  buttonClassNamesXlsx?: string; // Новый пропс для классов кнопки XLSX
}

const DataExporter: React.FC<DataExporterProps> = ({ testResult, questions, userAnswers, buttonClassNamesCsv, buttonClassNamesXlsx }) => {
  const exportToCSV = () => {
    // ... (ваш существующий код для экспорта в CSV) ...
    const csvData = [
      ["HRBP Тест - Результаты"],
      ["Дата:", new Date().toLocaleDateString()],
      ["Всего вопросов:", testResult.totalQuestions],
      ["Правильных ответов:", testResult.correctAnswers],
      ["Неправильных ответов:", testResult.incorrectAnswers],
      ["Без ответа:", testResult.unanswered],
      ["Итоговый балл:", `${testResult.scorePercentage.toFixed(2)}%`],
      [], // Пустая строка для разделения
      ["ID Вопроса", "Вопрос", "Тип", "Сложность", "Ваш Ответ", "Правильный Ответ", "Верно/Неверно", "Объяснение", "Рекомендации по развитию"],
    ];

    testResult.answers.forEach(answerDetail => {
      const question = questions.find(q => q.id === answerDetail.question.id) || answerDetail.question;
      const userAnswer = userAnswers.find(ua => ua.questionId === question.id);

      const userAnswerText = userAnswer && userAnswer.selectedOptionId
        ? question.options.find(opt => opt.id === userAnswer.selectedOptionId)?.text || 'Не выбран'
        : 'Не отвечено';
      
      const correctOptionText = question.options.find(opt => opt.id === question.correctAnswer)?.text || 'N/A';
      
      const isCorrect = userAnswer ? (userAnswer.isCorrect ? "Верно" : "Неверно") : "Без ответа";

      csvData.push([
        question.id,
        question.text,
        question.type,
        question.level,
        userAnswerText,
        correctOptionText,
        isCorrect,
        question.explanation || '',
        question.developmentRecommendation || '',
      ]);
    });

    const csvContent = csvData.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'HRBP_Test_Results.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const exportToXLSX = () => {
    // ... (ваш существующий код для экспорта в XLSX) ...
    const worksheetData = [
      ["HRBP Тест - Результаты"],
      ["Дата:", new Date().toLocaleDateString()],
      ["Всего вопросов:", testResult.totalQuestions],
      ["Правильных ответов:", testResult.correctAnswers],
      ["Неправильных ответов:", testResult.incorrectAnswers],
      ["Без от ответа:", testResult.unanswered],
      ["Итоговый балл:", `${testResult.scorePercentage.toFixed(2)}%`],
      [], // Пустая строка для разделения
      ["ID Вопроса", "Вопрос", "Тип", "Сложность", "Ваш Ответ", "Правильный Ответ", "Верно/Неверно", "Объяснение", "Рекомендации по развитию", "Источники", "Дополнительные ресурсы"],
    ];

    testResult.answers.forEach(answerDetail => {
      const question = questions.find(q => q.id === answerDetail.question.id) || answerDetail.question;
      const userAnswer = userAnswers.find(ua => ua.questionId === question.id);

      const userAnswerText = userAnswer && userAnswer.selectedOptionId
        ? question.options.find(opt => opt.id === userAnswer.selectedOptionId)?.text || 'Не выбран'
        : 'Не отвечено';
      
      const correctOptionText = question.options.find(opt => opt.id === question.correctAnswer)?.text || 'N/A';
      
      const isCorrect = userAnswer ? (userAnswer.isCorrect ? "Верно" : "Неверно") : "Без ответа";

      const sourcesText = question.sources ? question.sources.map(s => typeof s === 'string' ? s : s.title).join('; ') : '';
      const additionalResourcesText = question.additionalResources ? question.additionalResources.map(ar => ar.title).join('; ') : '';

      worksheetData.push([
        question.id,
        question.text,
        question.type,
        question.level,
        userAnswerText,
        correctOptionText,
        isCorrect,
        question.explanation || '',
        question.developmentRecommendation || '',
        sourcesText,
        additionalResourcesText,
      ]);
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(wb, ws, "Результаты Теста");
    XLSX.writeFile(wb, "HRBP_Test_Results.xlsx");
  };

  return (
    <>
      <button onClick={exportToCSV} className={buttonClassNamesCsv}> {/* ИСПОЛЬЗУЕМ НОВЫЙ ПРОПС */}
        Экспорт в CSV
      </button>
      <button onClick={exportToXLSX} className={buttonClassNamesXlsx}> {/* ИСПОЛЬЗУЕМ НОВЫЙ ПРОПС */}
        Экспорт в XLSX
      </button>
    </>
  );
};

export default DataExporter;

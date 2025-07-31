import React from 'react';
import { TestResult, UserAnswer, Question } from '../../types/test.d';

interface DataExporterProps {
  testResult: TestResult | null;
  questions: Question[]; // Нужны для получения полного текста вопросов и опций
  userAnswers: UserAnswer[]; // Нужны для более детального экспорта ответов
}

const DataExporter: React.FC<DataExporterProps> = ({ testResult, questions, userAnswers }) => {

  const handleExportData = () => {
    if (!testResult) {
      alert('Нет данных для экспорта. Пожалуйста, сначала пройдите тест.');
      return;
    }

    // Подготавливаем данные для экспорта
    const exportData = {
      summary: {
        totalQuestions: testResult.totalQuestions,
        correctAnswers: testResult.correctAnswers,
        incorrectAnswers: testResult.incorrectAnswers,
        unanswered: testResult.unanswered,
        scorePercentage: testResult.scorePercentage.toFixed(2) + '%',
        testCompletionDate: new Date().toISOString(), // Добавляем дату и время экспорта
      },
      detailedAnswers: testResult.answers.map(detail => {
        const question = questions.find(q => q.id === detail.question.id);
        const userAnswer = userAnswers.find(ua => ua.questionId === detail.question.id);
        const selectedOption = userAnswer?.selectedOptionId
          ? question?.options?.find(opt => opt.id === userAnswer.selectedOptionId)
          : null;
        const correctAnswer = question?.correctAnswer
          ? question?.options?.find(opt => opt.id === question.correctAnswer)
          : null;

        return {
          questionId: detail.question.id,
          questionText: detail.question.text,
          questionLevel: detail.question.level,
          userAnswer: selectedOption ? selectedOption.text : 'N/A', // Текст ответа пользователя
          isCorrect: detail.isCorrect,
          correctAnswer: correctAnswer ? correctAnswer.text : 'N/A', // Текст правильного ответа
          explanation: detail.question.explanation || 'N/A', // Объяснение вопроса
          timeSpent: userAnswer?.timeSpent || 0, // Время, затраченное на вопрос (если есть)
        };
      }),
    };

    const jsonString = JSON.stringify(exportData, null, 2); // Красивое форматирование JSON

    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hrbp-test-results-${new Date().toISOString().split('T')[0]}.json`; // Имя файла с датой
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // Освобождаем URL
  };

  return (
    <button
      onClick={handleExportData}
      disabled={!testResult} // Кнопка неактивна, если нет результатов
      className={`
        mt-6 py-3 px-8 rounded-full font-bold text-lg
        transition duration-300 ease-in-out transform hover:scale-105 shadow-lg
        focus:outline-none focus:ring-2 focus:ring-opacity-75
        ${testResult
          ? 'bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500'
          : 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-70'
        }
      `}
    >
      Экспортировать Результаты (JSON)
    </button>
  );
};

export default DataExporter;

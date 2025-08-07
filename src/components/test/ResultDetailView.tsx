// src/components/test/ResultDetailView.tsx

import React from 'react';
import { TestResult, AnswerDetail, Question, UserAnswer } from '../../types/test.d';
import DataExporter from './DataExporter'; // Это компонент, который мы модифицировали
import { Link } from 'react-router-dom';

interface ResultDetailViewProps {
  testResult: TestResult | null;
  questions: Question[];
  userAnswers: UserAnswer[];
}

const ResultDetailView: React.FC<ResultDetailViewProps> = ({ testResult, questions, userAnswers }) => {
  if (!testResult) {
    return (
      <div className="rounded-xl shadow-2xl backdrop-blur-md p-6 sm:p-8 max-w-3xl w-full mx-auto text-center"
           style={{
             backgroundColor: 'var(--color-background-card)',
             backgroundImage: 'var(--texture-grain)',
             backgroundSize: '4px 4px',
             backgroundRepeat: 'repeat',
             border: '2px solid var(--color-neutral)',
             boxShadow: '4px 4px 0px 0px var(--color-neutral)',
             color: 'var(--color-text-primary)',
           }}>
        <p className="text-2xl font-heading">Результаты теста не найдены.</p>
        <Link to="/" className="mt-6 inline-block font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50
            button-primary-style" // ИСПОЛЬЗУЕМ КЛАСС
        >
          Начать новый тест
        </Link>
      </div>
    );
  }

  const { totalQuestions, correctAnswers, incorrectAnswers, unanswered, scorePercentage, answers } = testResult;

  // Определяем общие стили для кнопок экспорта, теперь с использованием классов
  // Передаем в DataExporter классы, а не inline-стили напрямую
  const buttonStyles = {
    base: "w-full sm:w-auto font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 inline-block text-center",
    csv: "button-secondary-style", // ИСПОЛЬЗУЕМ КЛАСС
    xlsx: "button-error-style",    // ИСПОЛЬЗУЕМ КЛАСС
  };

  return (
    <div
      className="rounded-xl shadow-2xl backdrop-blur-md p-6 sm:p-8 max-w-4xl w-full mx-auto font-sans"
      style={{
        backgroundColor: 'var(--color-background-card)',
        backgroundImage: 'var(--texture-grain)',
        backgroundSize: '4px 4px',
        backgroundRepeat: 'repeat',
        border: '2px solid var(--color-neutral)',
        boxShadow: '4px 4px 0px 0px var(--color-neutral)',
      }}
    >
      <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-center font-heading" style={{ color: 'var(--color-text-primary)' }}>
        Детальный Отчет по Тесту
      </h2>

      {/* Сводка результатов - УЛУЧШЕННАЯ РАМКА */}
      <div className="text-lg space-y-2 mb-8 p-4 rounded-lg shadow-inner"
           style={{
             backgroundColor: 'var(--color-background-accent)',
             border: '2px solid var(--color-text-primary)',
             boxShadow: '2px 2px 0px 0px var(--color-neutral-dark)', // <-- Эту переменную у вас нет, будет предупреждение
             backgroundImage: 'var(--texture-grain)',
             backgroundSize: '4px 4px',
             backgroundRepeat: 'repeat',
             color: 'var(--color-text-primary)' // Установлен цвет текста для этого блока
           }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>Всего вопросов: <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{totalQuestions}</span></p>
        <p style={{ color: 'var(--color-text-secondary)' }}>Правильных ответов: <span className="font-semibold" style={{ color: 'var(--color-success)' }}>{correctAnswers}</span></p>
        <p style={{ color: 'var(--color-text-secondary)' }}>Неправильных ответов: <span className="font-semibold" style={{ color: 'var(--color-error)' }}>{incorrectAnswers}</span></p>
        <p style={{ color: 'var(--color-text-secondary)' }}>Без ответа: <span className="font-semibold" style={{ color: 'var(--color-warning)' }}>{unanswered}</span></p>
        <p className="text-2xl sm:text-3xl pt-4 border-t" style={{ borderColor: 'var(--color-text-secondary)' }}>Итоговый балл: <span className="font-extrabold" style={{ color: 'var(--color-text-primary)' }}>{scorePercentage.toFixed(2)}%</span></p>
      </div>

      {/* Кнопка экспорта данных - ТЕПЕРЬ ПЕРЕДАЕМ КЛАССЫ */}
      <div className="flex justify-center mb-8">
        <DataExporter
          testResult={testResult}
          questions={questions}
          userAnswers={userAnswers}
          csvButtonClassName={`${buttonStyles.base} ${buttonStyles.csv}`}
          xlsxButtonClassName={`${buttonStyles.base} ${buttonStyles.xlsx}`}
        />
      </div>

      {/* Детали по каждому вопросу */}
      <h3 className="text-xl sm:text-2xl font-semibold mb-4 font-heading" style={{ color: 'var(--color-text-primary)' }}>Разбор вопросов:</h3>
      <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-3 scrollbar-custom"> {/* Используем общий scrollbar-custom */}
        {answers.map((detail: AnswerDetail, index: number) => {
          const questionData = questions.find(q => q.id === detail.question.id);
          const finalQuestionData: Question = questionData || detail.question;
          const userAnswerData = userAnswers.find(ua => ua.questionId === finalQuestionData.id);

          const isCorrect = userAnswerData ? userAnswerData.isCorrect : false;
          const selectedOptionText = userAnswerData && userAnswerData.selectedOptionId
            ? finalQuestionData.options.find(opt => opt.id === userAnswerData.selectedOptionId)?.text || 'Не выбран'
            : 'Не отвечено';
          const correctOptionText = finalQuestionData.options.find(opt => opt.id === finalQuestionData.correctAnswer)?.text || 'N/A';

          // Используем новые переменные для границ
          const borderColor = isCorrect ? 'var(--color-success)' : (userAnswerData ? 'var(--color-error)' : 'var(--color-warning)');

          return (
            <div
              key={finalQuestionData.id}
              className={`bg-opacity-50 p-5 rounded-lg border-l-4 shadow-md mt-6`}
              style={{
                backgroundColor: 'var(--color-background)', // Темный фон для вопросов
                borderColor: borderColor, // Динамический цвет границы
                color: 'var(--color-text-primary)' // Цвет текста внутри карточки вопроса
              }}
            >
              <p className="font-medium mb-3 text-lg sm:text-xl font-heading" style={{ color: 'var(--color-text-primary)' }}>
                Вопрос {index + 1}: {finalQuestionData.text}
                <span className={`ml-3 text-sm sm:text-base font-semibold ${
                  isCorrect ? 'text-green-500' : (userAnswerData ? 'text-red-500' : 'text-yellow-500')
                }`}
                style={{
                  color: isCorrect ? 'var(--color-success)' : (userAnswerData ? 'var(--color-error)' : 'var(--color-warning)')
                }}
                >
                  ({isCorrect ? 'Верно' : (userAnswerData ? 'Неверно' : 'Без ответа')})
                </span>
              </p>

              {selectedOptionText !== 'Не отвечено' && (
                <p className="text-sm sm:text-base mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                  Ваш ответ: <span className={`font-normal`} style={{ color: isCorrect ? 'var(--color-success)' : 'var(--color-error)' }}>{selectedOptionText}</span>
                </p>
              )}

              {finalQuestionData.type === 'multiple-choice' && correctOptionText !== 'N/A' && (
                <p className="text-sm sm:text-base" style={{ color: 'var(--color-text-secondary)' }}>
                  Правильный ответ: <span className="font-normal" style={{ color: 'var(--color-warning)' }}>{correctOptionText}</span>
                </p>
              )}
              {finalQuestionData.type === 'case-study' && (
                <p className="text-sm sm:text-base" style={{ color: 'var(--color-text-secondary)' }}>
                  Этот вопрос не предполагает выбора из вариантов.
                </p>
              )}

              {finalQuestionData.explanation && (
                <div className="mt-3 p-3 rounded-md text-sm sm:text-base italic"
                     style={{
                       backgroundColor: 'var(--color-background-accent)', // Использовать акцентный фон
                       color: 'var(--color-text-primary)'
                     }}>
                  <strong style={{ color: 'var(--color-text-primary)' }}>Объяснение:</strong> {finalQuestionData.explanation}
                </div>
              )}

              {finalQuestionData.explanationDetails && finalQuestionData.explanationDetails.length > 0 && (
                <div className="mt-3 p-3 rounded-md text-sm sm:text-base italic"
                     style={{
                       backgroundColor: 'var(--color-background-accent)',
                       color: 'var(--color-text-primary)'
                     }}>
                  <strong className="block mb-2" style={{ color: 'var(--color-text-primary)' }}>Детали неверных/менее подходящих вариантов:</strong>
                  <ul className="list-disc list-inside space-y-1">
                    {finalQuestionData.explanationDetails.map((detail, idx) => (
                      <li key={idx}>
                        <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{finalQuestionData.options.find(opt => opt.id === detail.optionId)?.text || `Вариант ${detail.optionId}`}:</span> {detail.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {finalQuestionData.sources && finalQuestionData.sources.length > 0 && (
                <div className="mt-3 p-3 rounded-md text-sm sm:text-base"
                     style={{
                       backgroundColor: 'var(--color-background-accent)',
                       color: 'var(--color-text-primary)'
                     }}>
                  <strong className="block mb-2" style={{ color: 'var(--color-text-primary)' }}>Источники:</strong>
                  <ul className="list-disc list-inside space-y-1">
                    {finalQuestionData.sources.map((source, idx) => (
                      <li key={idx}>
                        {source.startsWith('http') ? <a href={source} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: 'var(--color-accent-primary)' }}>{source}</a> : source.title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {finalQuestionData.developmentRecommendation && (
                <div className="mt-3 p-3 rounded-md text-sm sm:text-base italic"
                     style={{
                       backgroundColor: 'var(--color-background-accent)',
                       color: 'var(--color-text-primary)'
                     }}>
                  <strong style={{ color: 'var(--color-text-primary)' }}>Рекомендации по развитию компетенции:</strong> {finalQuestionData.developmentRecommendation}
                </div>
              )}

              {finalQuestionData.additionalResources && finalQuestionData.additionalResources.length > 0 && (
                <div className="mt-3 p-3 rounded-md text-sm sm:text-base"
                     style={{
                       backgroundColor: 'var(--color-background-accent)',
                       color: 'var(--color-text-primary)'
                     }}>
                  <strong className="block mb-2" style={{ color: 'var(--color-text-primary)' }}>Дополнительные ресурсы для изучения:</strong>
                  <ul className="list-disc list-inside space-y-1">
                    {finalQuestionData.additionalResources.map((resource, idx) => (
                      <li key={idx}>
                        {resource.type && <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>[{resource.type}] </span>}
                        {resource.url ? <a href={resource.url} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: 'var(--color-accent-primary)' }}>{resource.title}</a> : resource.title}
                        {resource.description && `: ${resource.description}`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-center mt-8">
        <Link to="/" onClick={() => {
          localStorage.removeItem('currentTestState');
        }}
        className="w-full max-w-sm sm:max-w-md font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 inline-block text-center
            button-primary-style" // ИСПОЛЬЗУЕМ КЛАСС
        >
          Вернуться к началу / Пройти тест снова
        </Link>
      </div>
    </div>
  );
};

export default ResultDetailView;

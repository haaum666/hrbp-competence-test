// src/components/test/ResultDetailView.tsx

import React from 'react';
import { TestResult, AnswerDetail, Question, UserAnswer, SourceResource } from '../../types/test.d';
import DataExporter from './DataExporter';
import { Link } from 'react-router-dom';

interface ResultDetailViewProps {
  testResult: TestResult | null;
  questions: Question[];
  userAnswers: UserAnswer[];
}

const ResultDetailView: React.FC<ResultDetailViewProps> = ({ testResult, questions, userAnswers }) => {
  if (!testResult) {
    return (
      // Контейнер сообщения "Результаты теста не найдены"
      <div
        className="rounded-xl p-6 sm:p-8 max-w-3xl w-full mx-auto text-center font-sans
                   bg-card-background text-text-main border-neutral-light shadow-[4px_4px_0px_0px_var(--color-neutral)]" // ИЗМЕНЕНО: Используем Tailwind-классы
        style={{
          backgroundImage: 'var(--texture-grain)',
          backgroundSize: '4px 4px',
          backgroundRepeat: 'repeat',
          // color: 'var(--color-text-primary)', // ИЗМЕНЕНО: Удалено, т.к. используется Tailwind-класс
          // border: '2px solid var(--color-neutral)', // ИЗМЕНЕНО: Удалено, т.к. используется Tailwind-класс
          // boxShadow: '4px 4px 0px 0px var(--color-neutral)', // ИЗМЕНЕНО: Частично заменено, var() оставлено для соответствия стилю
        }}
      >
        <p className="text-2xl font-heading mb-6">Результаты теста не найдены.</p>
        <Link to="/" className="button-primary-style inline-block text-lg shadow-lg hover:shadow-xl transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50">
          Начать новый тест
        </Link>
      </div>
    );
  }

  const { totalQuestions, correctAnswers, incorrectAnswers, unanswered, scorePercentage, answers } = testResult;

  return (
    // Главный контейнер детального отчета
    <div
      className="rounded-xl p-6 sm:p-8 max-w-4xl w-full mx-auto
                 bg-card-background text-text-main border-neutral-light shadow-[4px_4px_0px_0px_var(--color-neutral)]" // ИЗМЕНЕНО: Используем Tailwind-классы
      style={{
        backgroundImage: 'var(--texture-grain)',
        backgroundSize: '4px 4px',
        backgroundRepeat: 'repeat',
        // color: 'var(--color-text-primary)', // ИЗМЕНЕНО: Удалено, т.к. используется Tailwind-класс
        // border: '2px solid var(--color-neutral)', // ИЗМЕНЕНО: Удалено, т.к. используется Tailwind-класс
        // boxShadow: '4px 4px 0px 0px var(--color-neutral)', // ИЗМЕНЕНО: Частично заменено, var() оставлено для соответствия стилю
      }}
    >
      <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-center font-heading text-text-main"> {/* ИЗМЕНЕНО: Используем Tailwind-класс */}
        Детальный Отчет по Тесту
      </h2>

      {/* Сводка результатов */}
      <div
        className="text-lg space-y-2 mb-8 p-4 rounded-lg shadow-inner
                   bg-primary-background border border-neutral-light shadow-[2px_2px_0px_0px_var(--color-neutral)]" // ИЗМЕНЕНО: Используем Tailwind-классы
      >
        <p className="text-text-main">Всего вопросов: <span className="font-semibold text-text-main">{totalQuestions}</span></p> {/* ИЗМЕНЕНО: Используем Tailwind-класс */}
        <p className="text-text-main">Правильных ответов: <span className="font-semibold text-accent-blue-green">{correctAnswers}</span></p> {/* ИЗМЕНЕНО: Используем Tailwind-класс */}
        <p className="text-text-main">Неправильных ответов: <span className="font-semibold text-status-error">{incorrectAnswers}</span></p> {/* ИЗМЕНЕНО: Используем Tailwind-класс */}
        <p className="text-text-main">Без ответа: <span className="font-semibold text-status-warning">{unanswered}</span></p> {/* ИЗМЕНЕНО: Используем Tailwind-класс */}
        <p className="text-2xl sm:text-3xl pt-4 border-t mt-4 border-neutral-light text-text-main">Итоговый балл: <span className="font-extrabold text-accent-blue-green">{scorePercentage.toFixed(2)}%</span></p> {/* ИЗМЕНЕНО: Используем Tailwind-класс */}
      </div>

      {/* Кнопка экспорта данных */}
      <div className="flex justify-center mb-8">
        <DataExporter
          testResult={testResult}
          questions={questions}
          userAnswers={userAnswers}
        />
      </div>

      {/* Детали по каждому вопросу */}
      <h3 className="text-xl sm:text-2xl font-semibold mb-4 font-heading text-text-main">Разбор вопросов:</h3> {/* ИЗМЕНЕНО: Используем Tailwind-класс */}
      <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-3 scrollbar-custom">
        {answers.map((detail: AnswerDetail, index: number) => {
          const questionData = questions.find(q => q.id === detail.question.id);
          const finalQuestionData: Question = questionData || detail.question;

          const userAnswerData = userAnswers.find(ua => ua.questionId === finalQuestionData.id);

          const isCorrect = userAnswerData ? userAnswerData.isCorrect : false;
          const selectedOptionText = userAnswerData && userAnswerData.selectedOptionId
            ? finalQuestionData.options.find(opt => opt.id === userAnswerData.selectedOptionId)?.text || 'Не выбран'
            : 'Не отвечено';
          const correctOptionText = finalQuestionData.options.find(opt => opt.id === finalQuestionData.correctAnswer)?.text || 'N/A';

          // Сохраняем borderColor как переменную для динамического boxShadow
          const borderColor = isCorrect ? 'var(--color-accent-primary)' : (userAnswerData ? 'var(--color-error)' : 'var(--color-text-secondary)');

          return (
            // Карточка вопроса
            <div
              key={finalQuestionData.id}
              className={`p-5 rounded-lg border-l-4 shadow-md
                          bg-card-background border-neutral-light
                          ${isCorrect ? 'border-l-accent-blue-green' : (userAnswerData ? 'border-l-status-error' : 'border-l-text-secondary-light')}`} // ИЗМЕНЕНО: Используем Tailwind-классы
              style={{
                backgroundImage: 'var(--texture-grain)',
                backgroundSize: '4px 4px',
                backgroundRepeat: 'repeat',
                // borderLeftColor: borderColor, // ИЗМЕНЕНО: Удалено, т.к. используется Tailwind-класс
                // borderTop: '1px solid var(--color-neutral)', // ИЗМЕНЕНО: Удалено
                // borderRight: '1px solid var(--color-neutral)', // ИЗМЕНЕНО: Удалено
                // borderBottom: '1px solid var(--color-neutral)', // ИЗМЕНЕНО: Удалено
                boxShadow: `2px 2px 0px 0px ${borderColor}`, // ИЗМЕНЕНО: Оставлено для динамической тени
              }}
            >
              <p className="font-medium mb-3 text-lg sm:text-xl font-heading text-text-main"> {/* ИЗМЕНЕНО: Используем Tailwind-класс */}
                Вопрос {index + 1}: {finalQuestionData.text}
                <span className={`ml-3 text-sm sm:text-base font-semibold ${
                  isCorrect ? 'text-accent-blue-green' : (userAnswerData ? 'text-status-error' : 'text-status-warning')
                }`}> {/* ИЗМЕНЕНО: Используем Tailwind-классы */}
                  ({isCorrect ? 'Верно' : (userAnswerData ? 'Неверно' : 'Без ответа')})
                </span>
              </p>

              {selectedOptionText !== 'Не отвечено' && (
                <p className="text-sm sm:text-base text-text-secondary-light"> {/* ИЗМЕНЕНО: Используем Tailwind-класс */}
                  Ваш ответ: <span className={`font-normal ${isCorrect ? 'text-accent-blue-green' : 'text-status-error'}`}>{selectedOptionText}</span> {/* ИЗМЕНЕНО: Используем Tailwind-классы */}
                </p>
              )}

              {finalQuestionData.type === 'multiple-choice' && correctOptionText !== 'N/A' && (
                <p className="text-sm sm:text-base text-text-secondary-light"> {/* ИЗМЕНЕНО: Используем Tailwind-класс */}
                  Правильный ответ: <span className="font-normal text-accent-olive">{correctOptionText}</span> {/* ИЗМЕНЕНО: Используем Tailwind-класс */}
                </p>
              )}
              {finalQuestionData.type === 'case-study' && (
                <p className="text-sm sm:text-base text-text-secondary-light"> {/* ИЗМЕНЕНО: Используем Tailwind-класс */}
                  Этот вопрос не предполагает выбора из вариантов.
                </p>
              )}

              {finalQuestionData.explanation && (
                <div
                  className="mt-3 p-3 rounded-md text-sm sm:text-base italic
                             bg-primary-background text-text-secondary-light border border-neutral-light" // ИЗМЕНЕНО: Используем Tailwind-классы
                >
                  <strong className="text-text-main">Объяснение:</strong> {finalQuestionData.explanation} {/* ИЗМЕНЕНО: Используем Tailwind-класс */}
                </div>
              )}

              {finalQuestionData.explanationDetails && finalQuestionData.explanationDetails.length > 0 && (
                <div
                  className="mt-3 p-3 rounded-md text-sm sm:text-base italic
                             bg-primary-background text-text-secondary-light border border-neutral-light" // ИЗМЕНЕНО: Используем Tailwind-классы
                >
                  <strong className="text-text-main block mb-2">Детали неверных/менее подходящих вариантов:</strong> {/* ИЗМЕНЕНО: Используем Tailwind-класс */}
                  <ul className="list-disc list-inside space-y-1">
                    {finalQuestionData.explanationDetails.map((detail, idx) => (
                      <li key={idx}>
                        <span className="font-semibold text-text-main">{finalQuestionData.options.find(opt => opt.id === detail.optionId)?.text || `Вариант ${detail.optionId}`}:</span> {detail.reason} {/* ИЗМЕНЕНО: Используем Tailwind-класс */}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {finalQuestionData.sources && finalQuestionData.sources.length > 0 && (
                <div
                  className="mt-3 p-3 rounded-md text-sm sm:text-base
                             bg-primary-background text-text-secondary-light border border-neutral-light" // ИЗМЕНЕНО: Используем Tailwind-классы
                >
                  <strong className="text-text-main block mb-2">Источники:</strong> {/* ИЗМЕНЕНО: Используем Tailwind-класс */}
                  <ul className="list-disc list-inside space-y-1">
                    {finalQuestionData.sources.map((source, idx) => (
                      <li key={idx}>
                        {typeof source === 'string' ? (
                            source.startsWith('http') ? (
                                <a href={source} target="_blank" rel="noopener noreferrer" className="hover:underline text-accent-blue-green"> {/* ИЗМЕНЕНО: Используем Tailwind-класс */}
                                    {source}
                                </a>
                            ) : (
                                source
                            )
                        ) : (
                            <>
                                {source.title}
                                {source.url && (
                                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:underline ml-1 text-accent-blue-green"> {/* ИЗМЕНЕНО: Используем Tailwind-класс */}
                                        (ссылка)
                                    </a>
                                )}
                            </>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {finalQuestionData.developmentRecommendation && (
                <div
                  className="mt-3 p-3 rounded-md text-sm sm:text-base italic
                             bg-primary-background text-text-secondary-light border border-neutral-light" // ИЗМЕНЕНО: Используем Tailwind-классы
                >
                  <strong className="text-text-main">Рекомендации по развитию компетенции:</strong> {finalQuestionData.developmentRecommendation} {/* ИЗМЕНЕНО: Используем Tailwind-класс */}
                </div>
              )}

              {finalQuestionData.additionalResources && finalQuestionData.additionalResources.length > 0 && (
                <div
                  className="mt-3 p-3 rounded-md text-sm sm:text-base
                             bg-primary-background text-text-secondary-light border border-neutral-light" // ИЗМЕНЕНО: Используем Tailwind-классы
                >
                  <strong className="text-text-main block mb-2">Дополнительные ресурсы для изучения:</strong> {/* ИЗМЕНЕНО: Используем Tailwind-класс */}
                  <ul className="list-disc list-inside space-y-1">
                    {finalQuestionData.additionalResources.map((resource, idx) => (
                      <li key={idx}>
                        {resource.type && <span className="font-semibold text-text-main">[{resource.type}] </span>} {/* ИЗМЕНЕНО: Используем Tailwind-класс */}
                        {resource.url ? <a href={resource.url} target="_blank" rel="noopener noreferrer" className="hover:underline text-accent-blue-green">{resource.title}</a> : resource.title} {/* ИЗМЕНЕНО: Используем Tailwind-класс */}
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
          localStorage.removeItem('currentTestState'); // Очищаем состояние теста
        }} className="button-primary-style inline-block text-lg shadow-lg hover:shadow-xl transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50">
          Вернуться к началу / Пройти тест снова
        </Link>
      </div>
    </div>
  );
};

export default ResultDetailView;

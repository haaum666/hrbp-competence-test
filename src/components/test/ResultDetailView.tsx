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
        className="rounded-xl p-6 sm:p-8 max-w-3xl w-full mx-auto text-center font-sans"
        style={{
          backgroundColor: 'var(--color-background-card)', // Используем переменную
          backgroundImage: 'var(--texture-grain)',
          backgroundSize: '4px 4px',
          backgroundRepeat: 'repeat',
          color: 'var(--color-text-primary)',
          border: '2px solid var(--color-neutral)',
          boxShadow: '4px 4px 0px 0px var(--color-neutral)',
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
      className="rounded-xl p-6 sm:p-8 max-w-4xl w-full mx-auto"
      style={{
        backgroundColor: 'var(--color-background-card)', // Используем переменную
        backgroundImage: 'var(--texture-grain)',
        backgroundSize: '4px 4px',
        backgroundRepeat: 'repeat',
        color: 'var(--color-text-primary)',
        border: '2px solid var(--color-neutral)',
        boxShadow: '4px 4px 0px 0px var(--color-neutral)',
      }}
    >
      <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-center font-heading" style={{ color: 'var(--color-text-primary)' }}>
        Детальный Отчет по Тесту
      </h2>

      {/* Сводка результатов */}
      <div
        className="text-lg space-y-2 mb-8 p-4 rounded-lg shadow-inner"
        style={{
          backgroundColor: 'var(--color-background)', // ИЗМЕНЕНО: Возвращаем к var(--color-background)
          border: '1px solid var(--color-neutral)', // ИЗМЕНЕНО: Возвращаем к var(--color-neutral)
          boxShadow: '2px 2px 0px 0px var(--color-neutral)', // ИЗМЕНЕНО: Возвращаем к var(--color-neutral)
        }}
      >
        <p style={{ color: 'var(--color-text-primary)' }}>Всего вопросов: <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{totalQuestions}</span></p>
        <p style={{ color: 'var(--color-text-primary)' }}>Правильных ответов: <span className="font-semibold" style={{ color: 'var(--color-accent-primary)' }}>{correctAnswers}</span></p>
        <p style={{ color: 'var(--color-text-primary)' }}>Неправильных ответов: <span className="font-semibold" style={{ color: 'var(--color-error)' }}>{incorrectAnswers}</span></p>
        <p style={{ color: 'var(--color-text-primary)' }}>Без ответа: <span className="font-semibold" style={{ color: 'var(--color-warning)' }}>{unanswered}</span></p>
        <p className="text-2xl sm:text-3xl pt-4 border-t mt-4" style={{ borderColor: 'var(--color-neutral)', color: 'var(--color-text-primary)' }}>Итоговый балл: <span className="font-extrabold" style={{ color: 'var(--color-accent-primary)' }}>{scorePercentage.toFixed(2)}%</span></p>
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
      <h3 className="text-xl sm:text-2xl font-semibold mb-4 font-heading" style={{ color: 'var(--color-text-primary)' }}>Разбор вопросов:</h3>
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

          const borderColor = isCorrect ? 'var(--color-accent-primary)' : (userAnswerData ? 'var(--color-error)' : 'var(--color-text-secondary)');

          return (
            // Карточка вопроса
            <div
              key={finalQuestionData.id}
              className={`p-5 rounded-lg border-l-4 shadow-md`}
              style={{
                backgroundColor: 'var(--color-background-card)', // Используем переменную
                backgroundImage: 'var(--texture-grain)',
                backgroundSize: '4px 4px',
                backgroundRepeat: 'repeat',
                borderLeftColor: borderColor,
                borderTop: '1px solid var(--color-neutral)',
                borderRight: '1px solid var(--color-neutral)',
                borderBottom: '1px solid var(--color-neutral)',
                boxShadow: `2px 2px 0px 0px ${borderColor}`,
              }}
            >
              <p className="font-medium mb-3 text-lg sm:text-xl font-heading" style={{ color: 'var(--color-text-primary)' }}>
                Вопрос {index + 1}: {finalQuestionData.text}
                <span className={`ml-3 text-sm sm:text-base font-semibold ${
                  isCorrect ? 'text-bauhaus-accent-primary' : (userAnswerData ? 'text-bauhaus-error' : 'text-bauhaus-warning')
                }`}>
                  ({isCorrect ? 'Верно' : (userAnswerData ? 'Неверно' : 'Без ответа')})
                </span>
              </p>

              {selectedOptionText !== 'Не отвечено' && (
                <p className="text-sm sm:text-base" style={{ color: 'var(--color-text-secondary)' }}>
                  Ваш ответ: <span className={`font-normal ${isCorrect ? 'text-bauhaus-accent-primary' : 'text-bauhaus-error'}`}>{selectedOptionText}</span>
                </p>
              )}

              {finalQuestionData.type === 'multiple-choice' && correctOptionText !== 'N/A' && (
                <p className="text-sm sm:text-base" style={{ color: 'var(--color-text-secondary)' }}>
                  Правильный ответ: <span className="font-normal" style={{ color: 'var(--color-accent-secondary)' }}>{correctOptionText}</span>
                </p>
              )}
              {finalQuestionData.type === 'case-study' && (
                <p className="text-sm sm:text-base" style={{ color: 'var(--color-text-secondary)' }}>
                  Этот вопрос не предполагает выбора из вариантов.
                </p>
              )}

              {finalQuestionData.explanation && (
                <div
                  className="mt-3 p-3 rounded-md text-sm sm:text-base italic"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-text-secondary)',
                    border: '1px solid var(--color-neutral)'
                  }}
                >
                  <strong style={{ color: 'var(--color-text-primary)' }}>Объяснение:</strong> {finalQuestionData.explanation}
                </div>
              )}

              {finalQuestionData.explanationDetails && finalQuestionData.explanationDetails.length > 0 && (
                <div
                  className="mt-3 p-3 rounded-md text-sm sm:text-base italic"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-text-secondary)',
                    border: '1px solid var(--color-neutral)'
                  }}
                >
                  <strong style={{ color: 'var(--color-text-primary)' }} className="block mb-2">Детали неверных/менее подходящих вариантов:</strong>
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
                <div
                  className="mt-3 p-3 rounded-md text-sm sm:text-base"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-text-secondary)',
                    border: '1px solid var(--color-neutral)'
                  }}
                >
                  <strong style={{ color: 'var(--color-text-primary)' }} className="block mb-2">Источники:</strong>
                  <ul className="list-disc list-inside space-y-1">
                    {finalQuestionData.sources.map((source, idx) => (
                      <li key={idx}>
                        {typeof source === 'string' ? (
                            source.startsWith('http') ? (
                                <a href={source} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: 'var(--color-accent-primary)' }}>
                                    {source}
                                </a>
                            ) : (
                                source
                            )
                        ) : (
                            <>
                                {source.title}
                                {source.url && (
                                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:underline ml-1" style={{ color: 'var(--color-accent-primary)' }}>
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
                  className="mt-3 p-3 rounded-md text-sm sm:text-base italic"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-text-secondary)',
                    border: '1px solid var(--color-neutral)'
                  }}
                >
                  <strong style={{ color: 'var(--color-text-primary)' }}>Рекомендации по развитию компетенции:</strong> {finalQuestionData.developmentRecommendation}
                </div>
              )}

              {finalQuestionData.additionalResources && finalQuestionData.additionalResources.length > 0 && (
                <div
                  className="mt-3 p-3 rounded-md text-sm sm:text-base"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-text-secondary)',
                    border: '1px solid var(--color-neutral)'
                  }}
                >
                  <strong style={{ color: 'var(--color-text-primary)' }} className="block mb-2">Дополнительные ресурсы для изучения:</strong>
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
          localStorage.removeItem('currentTestState'); // Очищаем состояние теста
        }} className="button-primary-style inline-block text-lg shadow-lg hover:shadow-xl transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50">
          Вернуться к началу / Пройти тест снова
        </Link>
      </div>
    </div>
  );
};

export default ResultDetailView;

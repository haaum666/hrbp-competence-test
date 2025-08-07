// src/components/test/ResultDetailView.tsx

import React from 'react';
import { TestResult, AnswerDetail, Question, UserAnswer } from '../../types/test.d';
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
      <div className="rounded-xl shadow-2xl backdrop-blur-md p-6 sm:p-8 max-w-3xl w-full mx-auto text-center"
           style={{
             backgroundColor: 'var(--color-background-card)', // Фон как у блоков аналитики
             backgroundImage: 'var(--texture-grain)', // Текстура
             backgroundSize: '4px 4px',
             backgroundRepeat: 'repeat',
             border: '2px solid var(--color-neutral)', // Рамка
             boxShadow: '4px 4px 0px 0px var(--color-neutral)', // Тень
             color: 'var(--color-text-primary)', // Цвет текста по умолчанию
           }}>
        <p className="text-2xl font-heading">Результаты теста не найдены.</p>
        <Link to="/" className="mt-6 inline-block bg-bauhaus-blue hover:bg-blue-700 text-bauhaus-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-bauhaus-blue focus:ring-opacity-50">
          Начать новый тест
        </Link>
      </div>
    );
  }

  const { totalQuestions, correctAnswers, incorrectAnswers, unanswered, scorePercentage, answers } = testResult;

  return (
    <div
      className="rounded-xl shadow-2xl backdrop-blur-md p-6 sm:p-8 max-w-4xl w-full mx-auto text-bauhaus-white font-sans" // text-bauhaus-white font-sans сюда
      style={{
        backgroundColor: 'var(--color-background-card)', // Фон как у блоков аналитики
        backgroundImage: 'var(--texture-grain)', // Текстура
        backgroundSize: '4px 4px',
        backgroundRepeat: 'repeat',
        border: '2px solid var(--color-neutral)', // Рамка
        boxShadow: '4px 4px 0px 0px var(--color-neutral)', // Тень
      }}
    >
      <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-bauhaus-white text-center font-heading">
        Детальный Отчет по Тесту
      </h2>

      {/* Сводка результатов */}
      <div className="text-lg space-y-2 mb-8 p-4 bg-bauhaus-black bg-opacity-70 rounded-lg border border-bauhaus-dark-gray shadow-inner">
        <p className="text-bauhaus-light-gray">Всего вопросов: <span className="font-semibold text-bauhaus-white">{totalQuestions}</span></p>
        <p className="text-bauhaus-light-gray">Правильных ответов: <span className="font-semibold text-bauhaus-blue">{correctAnswers}</span></p>
        <p className="text-bauhaus-light-gray">Неправильных ответов: <span className="font-semibold text-bauhaus-red">{incorrectAnswers}</span></p>
        <p className="text-bauhaus-light-gray">Без ответа: <span className="font-semibold text-bauhaus-yellow">{unanswered}</span></p>
        <p className="text-2xl sm:text-3xl pt-4 border-t border-bauhaus-dark-gray mt-4">Итоговый балл: <span className="font-extrabold text-bauhaus-white">{scorePercentage.toFixed(2)}%</span></p>
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
      <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-bauhaus-white font-heading">Разбор вопросов:</h3>
      <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-3 scrollbar-thin scrollbar-thumb-bauhaus-dark-gray scrollbar-track-bauhaus-black">
        {answers.map((detail: AnswerDetail, index: number) => {
          // Ищем полную информацию о вопросе из пропсов 'questions'
          const questionData = questions.find(q => q.id === detail.question.id);
          // Если вопрос не найден в 'questions' (что маловероятно при корректной работе), используем данные из 'detail.question'
          const finalQuestionData: Question = questionData || detail.question;

          const userAnswerData = userAnswers.find(ua => ua.questionId === finalQuestionData.id);

          const isCorrect = userAnswerData ? userAnswerData.isCorrect : false; // Корректность берем из userAnswerData
          const selectedOptionText = userAnswerData && userAnswerData.selectedOptionId
            ? finalQuestionData.options.find(opt => opt.id === userAnswerData.selectedOptionId)?.text || 'Не выбран'
            : 'Не отвечено';
          // ИСПОЛЬЗУЕМ questionData.correctAnswer ВМЕСТО option.isCorrect
          const correctOptionText = finalQuestionData.options.find(opt => opt.id === finalQuestionData.correctAnswer)?.text || 'N/A';

          const borderColor = isCorrect ? 'border-bauhaus-blue' : (userAnswerData ? 'border-bauhaus-red' : 'border-bauhaus-yellow'); // Изменил border-bauhaus-gray на border-bauhaus-yellow для без ответа

          return (
            <div key={finalQuestionData.id} className={`bg-bauhaus-black bg-opacity-50 p-5 rounded-lg border-l-4 ${borderColor} shadow-md`}>
              <p className="font-medium text-bauhaus-white mb-3 text-lg sm:text-xl font-heading">
                Вопрос {index + 1}: {finalQuestionData.text}
                <span className={`ml-3 text-sm sm:text-base font-semibold ${
                  isCorrect ? 'text-bauhaus-blue' : (userAnswerData ? 'text-bauhaus-red' : 'text-bauhaus-yellow')
                }`}>
                  ({isCorrect ? 'Верно' : (userAnswerData ? 'Неверно' : 'Без ответа')})
                </span>
              </p>

              {selectedOptionText !== 'Не отвечено' && (
                <p className="text-sm sm:text-base text-bauhaus-light-gray mb-2">
                  Ваш ответ: <span className={`font-normal ${isCorrect ? 'text-bauhaus-blue' : 'text-bauhaus-red'}`}>{selectedOptionText}</span>
                </p>
              )}

              {/* Правильный ответ показываем всегда, если он есть */}
              {finalQuestionData.type === 'multiple-choice' && correctOptionText !== 'N/A' && (
                <p className="text-sm sm:text-base text-bauhaus-light-gray">
                  Правильный ответ: <span className="font-normal text-bauhaus-yellow">{correctOptionText}</span>
                </p>
              )}
              {/* Если это case-study, указываем, что правильного ответа для выбора нет */}
              {finalQuestionData.type === 'case-study' && (
                <p className="text-sm sm:text-base text-bauhaus-light-gray">
                  Этот вопрос не предполагает выбора из вариантов.
                </p>
              )}

              {finalQuestionData.explanation && (
                <div className="mt-3 p-3 bg-bauhaus-dark-gray bg-opacity-70 rounded-md text-sm sm:text-base text-bauhaus-light-gray italic">
                  <strong className="text-bauhaus-white">Объяснение:</strong> {finalQuestionData.explanation}
                </div>
              )}

              {/* Добавленные блоки для отображения новой информации */}
              {finalQuestionData.explanationDetails && finalQuestionData.explanationDetails.length > 0 && (
                <div className="mt-3 p-3 bg-bauhaus-dark-gray bg-opacity-70 rounded-md text-sm sm:text-base text-bauhaus-light-gray italic">
                  <strong className="text-bauhaus-white block mb-2">Детали неверных/менее подходящих вариантов:</strong>
                  <ul className="list-disc list-inside space-y-1">
                    {finalQuestionData.explanationDetails.map((detail, idx) => (
                      <li key={idx}>
                        <span className="font-semibold text-bauhaus-white">{finalQuestionData.options.find(opt => opt.id === detail.optionId)?.text || `Вариант ${detail.optionId}`}:</span> {detail.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {finalQuestionData.sources && finalQuestionData.sources.length > 0 && (
                <div className="mt-3 p-3 bg-bauhaus-dark-gray bg-opacity-70 rounded-md text-sm sm:text-base text-bauhaus-light-gray">
                  <strong className="text-bauhaus-white block mb-2">Источники:</strong>
                  <ul className="list-disc list-inside space-y-1">
                    {finalQuestionData.sources.map((source, idx) => (
                      <li key={idx}>
                        {source.startsWith('http') ? <a href={source} target="_blank" rel="noopener noreferrer" className="text-bauhaus-blue hover:underline">{source}</a> : source}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {finalQuestionData.developmentRecommendation && (
                <div className="mt-3 p-3 bg-bauhaus-dark-gray bg-opacity-70 rounded-md text-sm sm:text-base text-bauhaus-light-gray italic">
                  <strong className="text-bauhaus-white">Рекомендации по развитию компетенции:</strong> {finalQuestionData.developmentRecommendation}
                </div>
              )}

              {finalQuestionData.additionalResources && finalQuestionData.additionalResources.length > 0 && (
                <div className="mt-3 p-3 bg-bauhaus-dark-gray bg-opacity-70 rounded-md text-sm sm:text-base text-bauhaus-light-gray">
                  <strong className="text-bauhaus-white block mb-2">Дополнительные ресурсы для изучения:</strong>
                  <ul className="list-disc list-inside space-y-1">
                    {finalQuestionData.additionalResources.map((resource, idx) => (
                      <li key={idx}>
                        {resource.type && <span className="font-semibold text-bauhaus-white">[{resource.type}] </span>}
                        {resource.url ? <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-bauhaus-blue hover:underline">{resource.title}</a> : resource.title}
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
        }} className="bg-bauhaus-blue hover:bg-blue-700 text-bauhaus-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition duration-300 ease-in-out transform hover:scale-105 inline-block text-center">
          Вернуться к началу / Пройти тест снова
        </Link>
      </div>
    </div>
  );
};

export default ResultDetailView;

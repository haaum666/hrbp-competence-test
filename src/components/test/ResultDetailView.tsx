// src/components/test/ResultDetailView.tsx

import React from 'react';
import { TestResult } from '../../types/test';
import { Link } from 'react-router-dom';

interface ResultDetailViewProps {
  testResult: TestResult;
}

const ResultDetailView: React.FC<ResultDetailViewProps> = ({ testResult }) => {
  if (!testResult) {
    return (
      <div className="bg-white bg-opacity-5 rounded-xl shadow-2xl backdrop-blur-md p-8 max-w-2xl w-full mx-auto text-center border border-gray-700/50">
        <h2 className="text-3xl font-bold text-white mb-4">Результаты не найдены</h2>
        <p className="text-xl text-gray-300">Пожалуйста, пройдите тест сначала.</p>
        <Link to="/" className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 inline-block">
          Начать Тест
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl bg-white bg-opacity-5 rounded-xl shadow-2xl backdrop-blur-md p-8 border border-gray-700/50">
      <h2 className="text-4xl font-bold text-white mb-6 text-center">Детальные Результаты Теста</h2>

      <div className="text-center mb-8">
        <p className="text-xl text-gray-300 mb-2">Общий балл: <span className="font-extrabold text-white">{testResult.scorePercentage.toFixed(2)}%</span></p>
        <p className="text-lg text-gray-400">Правильных: <span className="text-green-400">{testResult.correctAnswers}</span> / Неправильных: <span className="text-red-400">{testResult.incorrectAnswers}</span> / Пропущено: <span className="text-yellow-400">{testResult.unanswered}</span></p>
      </div>

      <div className="space-y-8">
        {testResult.answers.map((item, index) => (
          <div key={item.question.id} className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-3">Вопрос {index + 1}: {item.question.text}</h3>
            <p className="text-sm text-gray-400 mb-2">Уровень: <span className="capitalize">{item.question.level}</span> | Категория: <span className="capitalize">{item.question.categoryid}</span></p>

            {/* Ответ пользователя */}
            <div className="mt-4">
              <p className="text-lg font-medium text-gray-300 mb-2">Ваш ответ:</p>
              {item.question.type === 'multiple-choice' && item.userAnswer ? (
                item.userAnswer.selectedOptionId ? (
                  <p className={`p-3 rounded-md ${item.isCorrect ? 'bg-green-700/30 text-green-300' : 'bg-red-700/30 text-red-300'}`}>
                    {item.question.options?.find(opt => opt.id === item.userAnswer?.selectedOptionId)?.text || 'Ответ не найден'}
                    {item.isCorrect ? ' (Верно)' : ' (Неверно)'}
                  </p>
                ) : (
                  <p className="p-3 rounded-md bg-yellow-700/30 text-yellow-300">
                    Вопрос пропущен
                  </p>
                )
              ) : item.question.type === 'case-study' || item.question.type === 'prioritization' ? (
                // Для кейсов и приоритизации, пока нет текстового поля для ответа, просто показываем статус
                item.userAnswer && item.userAnswer.selectedOptionId !== '' ? (
                    <p className="p-3 rounded-md bg-blue-700/30 text-blue-300">
                        Вы просмотрели этот вопрос.
                    </p>
                ) : (
                    <p className="p-3 rounded-md bg-yellow-700/30 text-yellow-300">
                        Вопрос пропущен (кейс/приоритизация)
                    </p>
                )
              ) : (
                <p className="p-3 rounded-md bg-yellow-700/30 text-yellow-300">
                  Ответ не зафиксирован или тип вопроса не поддерживается для отображения
                </p>
              )}
            </div>

            {/* Правильный ответ и объяснение (для multiple-choice) */}
            {item.question.type === 'multiple-choice' && item.question.correctAnswer && (
              <div className="mt-4">
                <p className="text-lg font-medium text-gray-300 mb-2">Правильный ответ:</p>
                <p className="p-3 rounded-md bg-green-700/30 text-green-300">
                  {item.question.options?.find(opt => opt.id === item.question.correctAnswer)?.text || 'Правильный ответ не найден'}
                </p>
              </div>
            )}

            {/* Объяснение (для всех типов вопросов) */}
            {item.question.explanation && (
              <div className="mt-4">
                <p className="text-lg font-medium text-gray-300 mb-2">Объяснение:</p>
                <p className="p-3 rounded-md bg-gray-700 text-gray-300">
                  {item.question.explanation}
                </p>
              </div>
            )}

            {item.question.sources && (
              <div className="mt-4 text-sm text-gray-500">
                Источник: {item.question.sources}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="text-center mt-8">
        <Link to="/" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 inline-block">
          Вернуться на главную
        </Link>
      </div>
    </div>
  );
};

export default ResultDetailView;

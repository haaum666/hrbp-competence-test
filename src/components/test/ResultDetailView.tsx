import React from 'react';
import { TestResult, AnswerDetail, Question, UserAnswer } from '../../types/test.d'; // Обновленный импорт
import DataExporter from './DataExporter'; // Импортируем наш новый компонент DataExporter

interface ResultDetailViewProps {
  testResult: TestResult | null; // Теперь может быть null, если результаты еще не загружены
  questions: Question[]; // Добавляем questions как пропс
  userAnswers: UserAnswer[]; // Добавляем userAnswers как пропс
}

const ResultDetailView: React.FC<ResultDetailViewProps> = ({ testResult, questions, userAnswers }) => {
  if (!testResult) {
    return (
      <div className="bg-white bg-opacity-5 rounded-xl shadow-2xl backdrop-blur-md p-8 max-w-3xl w-full mx-auto text-center border border-gray-700/50 text-white">
        <p className="text-2xl">Результаты теста не найдены.</p>
        {/* Можно добавить кнопку для перехода на главную или начала теста */}
      </div>
    );
  }

  const { totalQuestions, correctAnswers, incorrectAnswers, unanswered, scorePercentage, answers } = testResult;

  return (
    <div className="bg-white bg-opacity-5 rounded-xl shadow-2xl backdrop-blur-md p-8 max-w-4xl w-full mx-auto border border-gray-700/50 text-white">
      <h2 className="text-3xl font-bold mb-6 text-white text-center">Детальные Результаты Теста</h2>

      {/* Сводка результатов */}
      <div className="text-lg space-y-2 mb-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <p>Всего вопросов: <span className="font-semibold text-blue-400">{totalQuestions}</span></p>
        <p>Правильных ответов: <span className="font-semibold text-green-400">{correctAnswers}</span></p>
        <p>Неправильных ответов: <span className="font-semibold text-red-400">{incorrectAnswers}</span></p>
        <p>Без ответа: <span className="font-semibold text-yellow-400">{unanswered}</span></p>
        <p className="text-2xl pt-4">Итоговый балл: <span className="font-extrabold text-purple-400">{scorePercentage.toFixed(2)}%</span></p>
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
      <h3 className="text-xl font-semibold mb-4 text-gray-200">Разбор вопросов:</h3>
      <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-3">
        {answers.map((detail: AnswerDetail, index: number) => (
          <div key={index} className="bg-gray-800 p-5 rounded-lg border border-gray-700">
            <p className="font-medium text-gray-100 mb-3 text-lg">
              Вопрос {index + 1}: {detail.question.text}
              <span className={`ml-3 text-sm font-semibold ${
                detail.isCorrect ? 'text-green-400' : (detail.userAnswer ? 'text-red-400' : 'text-yellow-400')
              }`}>
                ({detail.isCorrect ? 'Верно' : (detail.userAnswer ? 'Неверно' : 'Без ответа')})
              </span>
            </p>

            {detail.userAnswer && (
              <p className="text-sm text-gray-300 mb-2">
                Ваш ответ: <span className="font-normal">
                  {detail.userAnswer.selectedOptionId
                    ? detail.question.options.find(opt => opt.id === detail.userAnswer!.selectedOptionId)?.text
                    : 'Не выбран'}
                </span>
              </p>
            )}

            {detail.question.type === 'multiple-choice' && !detail.isCorrect && (
              <p className="text-sm text-blue-400">
                Правильный ответ: <span className="font-normal">
                  {detail.question.options.find(opt => opt.id === detail.question.correctAnswer)?.text}
                </span>
              </p>
            )}

            {/* Здесь можно добавить объяснение правильного ответа, если оно есть в данных вопроса */}
            {detail.question.explanation && (
              <div className="mt-3 p-3 bg-gray-700 rounded-md text-sm text-gray-400">
                <p className="font-medium text-gray-200 mb-1">Объяснение:</p>
                <p>{detail.question.explanation}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <a href="/" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 inline-block">
          Вернуться к началу
        </a>
      </div>
    </div>
  );
};

export default ResultDetailView;

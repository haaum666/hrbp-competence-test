import React from 'react';
import { TestResult, QuestionLevel } from '../../types/test.d'; // Импортируем QuestionLevel

/**
 * @interface ResultDetailViewProps
 * @description Пропсы для компонента ResultDetailView.
 * @property {TestResult} testResult - Объект с полными результатами теста.
 */
interface ResultDetailViewProps {
  testResult: TestResult;
}

/**
 * @function getLevelColor
 * @description Возвращает класс цвета для уровня сложности вопроса.
 * @param {QuestionLevel} level - Уровень сложности ('junior', 'middle', 'senior').
 * @returns {string} Класс Tailwind CSS.
 */
const getLevelColor = (level: QuestionLevel): string => {
    switch (level) {
        case 'junior': return 'text-green-400';
        case 'middle': return 'text-yellow-400';
        case 'senior': return 'text-red-400';
        default: return 'text-gray-400';
    }
};

/**
 * @function ResultDetailView
 * @description React компонент для отображения детальных результатов теста.
 * Показывает каждый вопрос, ответ пользователя, правильный ответ и объяснение.
 * @param {ResultDetailViewProps} props - Пропсы компонента.
 * @returns {JSX.Element} Рендеринг компонента детальных результатов.
 */
const ResultDetailView: React.FC<ResultDetailViewProps> = ({ testResult }) => {
  if (!testResult) {
    return <p className="text-white text-xl">Результаты теста не найдены.</p>;
  }

  return (
    <div className="bg-white bg-opacity-5 rounded-xl shadow-2xl backdrop-blur-md p-8 max-w-4xl w-full mx-auto text-white border border-gray-700/50">
      <h2 className="text-4xl font-bold text-center mb-6">Детальные Результаты Теста</h2>

      <div className="text-center mb-8">
        <p className="text-xl">Итоговый балл: <span className="font-extrabold text-purple-400">{testResult.scorePercentage.toFixed(2)}%</span></p>
        <p className="text-lg text-gray-300">Правильных: <span className="text-green-400">{testResult.correctAnswers}</span> | Неправильных: <span className="text-red-400">{testResult.incorrectAnswers}</span> | Пропущено: <span className="text-yellow-400">{testResult.unanswered}</span></p>
      </div>

      <div className="space-y-8">
        {testResult.answers.map((detail, index) => (
          <div key={detail.question.id} className="bg-gray-800 bg-opacity-60 rounded-lg p-6 shadow-xl border border-gray-700">
            <h3 className="text-xl font-bold mb-3">
                Вопрос {index + 1}: {detail.question.text}
            </h3>
            <div className="mb-4 text-sm text-gray-400 flex justify-between">
                <span>Категория: {detail.question.categoryid}</span>
                <span className={`font-semibold ${getLevelColor(detail.question.level)}`}>
                    Уровень: {detail.question.level.charAt(0).toUpperCase() + detail.question.level.slice(1)}
                </span>
            </div>

            {detail.question.type === 'multiple-choice' && (
              <>
                <p className="mb-2">
                  <span className="font-semibold text-gray-300">Ваш ответ: </span>
                  <span className={detail.isCorrect ? 'text-green-400' : 'text-red-400'}>
                    {detail.userAnswer?.selectedOptionId
                      ? detail.question.options.find(opt => opt.id === detail.userAnswer?.selectedOptionId)?.text
                      : 'Ответ не выбран / Пропущено'}
                  </span>
                </p>
                <p className="mb-4">
                  <span className="font-semibold text-gray-300">Правильный ответ: </span>
                  <span className="text-green-400">
                    {detail.question.options.find(opt => opt.id === detail.question.correctAnswer)?.text}
                  </span>
                </p>
              </>
            )}

            {/* Для других типов вопросов (case-study, prioritization) можно выводить только объяснение */}
            {detail.question.type !== 'multiple-choice' && (
              <p className="mb-4">
                <span className="font-semibold text-gray-300">Ваш ответ (неприменимо к этому типу): </span>
                <span className="text-gray-400">
                  {detail.userAnswer?.selectedOptionId ? 'Отвечено' : 'Пропущено'}
                </span>
              </p>
            )}

            <p className="mb-4">
              <span className="font-semibold text-gray-300">Объяснение: </span>
              <span className="text-gray-200">{detail.question.explanation}</span>
            </p>

            {detail.question.sources && detail.question.sources.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                    <p className="font-semibold text-gray-300 mb-2">Источники:</p>
                    <ul className="list-disc list-inside text-sm text-gray-400">
                        {detail.question.sources.map((source, srcIndex) => (
                            <li key={srcIndex}>
                                {source.startsWith('http') ? (
                                    <a href={source} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                        {source}
                                    </a>
                                ) : (
                                    source
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultDetailView;

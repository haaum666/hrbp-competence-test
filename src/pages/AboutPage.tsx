// src/pages/AboutPage.tsx

import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 
        className="text-3xl sm:text-4xl font-extrabold mb-6"
        style={{ letterSpacing: '-0.025em' }}
      >
        <span style={{ color: 'var(--color-accent-primary)' }}>О</span>
        <span style={{ color: 'var(--color-error)' }}> </span>
        <span style={{ color: 'var(--color-error)' }}>п</span>
        <span style={{ color: 'var(--color-accent-secondary)' }}>р</span>
        <span style={{ color: 'var(--color-accent-primary)' }}>о</span>
        <span style={{ color: 'var(--color-error)' }}>е</span>
        <span style={{ color: 'var(--color-accent-secondary)' }}>к</span>
        <span style={{ color: 'var(--color-accent-primary)' }}>т</span>
        <span style={{ color: 'var(--color-error)' }}>е</span>
      </h1>
      <div className="text-lg leading-relaxed mb-8" style={{ color: 'var(--color-background-light)' }}> {/* Изменено: основной текст стал светлее */}
        <p className="mb-4">
          HRBP-Тест — это инструмент для самооценки и развития компетенций HR Business Partner, разработанный специально для российского рынка труда. Тест ориентирован на современные профессиональные стандарты и призван помочь в объективной оценке теоретических знаний и понимания практических аспектов работы HRBP.
        </p>
        <h2 className="text-2xl font-bold text-text-primary mt-6 mb-2">Панель Аналитики</h2> {/* Заголовок остался темным */}
        <p className="mb-4">
          В дополнение к основной функциональности тестирования, проект включает интерактивную панель аналитики, позволяющую пользователям:
        </p>
        <ul className="list-disc list-inside space-y-2 mb-4">
          <li>Отслеживать прогресс по баллам за каждый пройденный тест.</li>
          <li>Визуализировать средний балл за все тесты.</li>
          <li>Анализировать среднее соотношение правильных, неправильных и неотвеченных вопросов по всем попыткам.</li>
          <li>Получать общую статистику по количеству пройденных тестов и среднему времени их прохождения.</li>
        </ul>
        <p>
          Эта панель аналитики призвана обеспечить более глубокое понимание результатов и помочь в выявлении областей для дальнейшего развития.
        </p>
        <h2 className="text-2xl font-bold text-text-primary mt-6 mb-2">Основные Функциональные Возможности</h2> {/* Заголовок остался темным */}
        <ul className="list-disc list-inside space-y-2">
          <li><strong className="font-semibold">Комплексный Тест:</strong> Оценка компетенций HRBP по различным категориям и уровням сложности.</li>
          <li><strong className="font-semibold">Таймер:</strong> Ограничение времени на каждый вопрос для имитации реальных условий.</li>
          <li><strong className="font-semibold">Прогресс-бар:</strong> Визуальное отображение текущего прогресса прохождения теста.</li>
          <li><strong className="font-semibold">Автосохранение Прогресса:</strong> Автоматическое сохранение ответов и текущего вопроса в localStorage браузера. Позволяет пользователю продолжить тест с того места, где он остановился, даже если страница была закрыта или обновлена.</li>
          <li><strong className="font-semibold">Подсчет Результатов:</strong> Отображение общего балла, количества правильных, неправильных и пропущенных ответов.</li>
          <li><strong className="font-semibold">Детальный Просмотр Результатов:</strong> Возможность просмотреть каждый вопрос теста с ответом пользователя, правильным ответом (для multiple-choice) и подробным объяснением.</li>
          <li><strong className="font-semibold">Панель Аналитики:</strong> Интерактивные графики и статистика для отслеживания прогресса и средних показателей по всем пройденным тестам.</li>
        </ul>
      </div>
      
      <div className="bg-background-card rounded-lg p-6 shadow-custom mt-8">
        <h2 className="text-xl font-bold text-text-primary mb-2">Контакты и поддержка</h2> {/* Заголовок остался темным */}
        <p style={{ color: 'var(--color-background-light)' }}> {/* Изменено: текст стал светлее */}
          Если у вас есть вопросы, предложения или обратная связь, вы всегда можете связаться со мной:
        </p>
        <ul className="mt-4">
          <li className="mb-2">
            <a href="https://t.me/hr_dushnila" target="_blank" rel="noopener noreferrer" className="text-accent-primary hover:underline transition-colors duration-300">
              Telegram
            </a>
          </li>
          <li className="mb-2">
            <a href="https://www.linkedin.com/in/hr-dushnila/" target="_blank" rel="noopener noreferrer" className="text-accent-primary hover:underline transition-colors duration-300">
              LinkedIn
            </a>
          </li>
        </ul>
        <p className="mt-4" style={{ color: 'var(--color-background-light)' }}> {/* Изменено: текст стал светлее */}
          Проект создан при поддержке <a href="https://quantum-dev.ru/" target="_blank" rel="noopener noreferrer" className="text-accent-primary hover:underline transition-colors duration-300">quantum-dev.ru</a>.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;

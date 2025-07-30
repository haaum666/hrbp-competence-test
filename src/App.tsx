import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      {/* Основной контейнер с градиентным фоном и темной темой */}
      <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4
                      bg-gradient-to-br from-gray-900 via-gray-800 to-black
                      text-white font-sans overflow-hidden">
        
        {/* Абстрактные фоновые элементы (для эффекта "сложности" как на референсе) */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-bl from-red-800 to-yellow-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gradient-to-tr from-purple-800 to-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tl from-green-800 to-teal-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

        {/* Контейнер для основного содержимого (над фоновыми элементами) */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center p-8
                        bg-white bg-opacity-5 rounded-xl shadow-2xl backdrop-blur-md border border-gray-700/50
                        max-w-4xl mx-auto transform hover:scale-102 transition-transform duration-300 ease-in-out">
          
          {/* Заголовок */}
          <h1 className="text-6xl md:text-7xl font-extrabold mb-6 tracking-tight drop-shadow-lg"
              style={{ textShadow: '0 0 10px rgba(0,0,0,0.5)' }}>
            HRBP-Тест
          </h1>
          
          {/* Анонс теста (обновленный текст) */}
          <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mb-10 leading-relaxed">
          **Ребятушки, я тут совсем угорел по своей работе и начал собирать тест на HRBP**

Сейчас он на стадии валидации, параллельно собираю web-версию (на скрине)
**Исследования и аналитику уже прошел - проработал источники уровня Harvard Business Review, SHRM**
**В течение месяца планирую выпустить в прод**

**76 вопросов: кейсы, приоритизация, знания • От Junior до Senior • Персональная аналитика**
**Бесплатно и без ограничений** - я таких в открытом доступе еще не видел

**Каждый вопрос с детальными объяснениями и персональными рекомендациями по развитию**
Закрываю свою потребность - мне не хватало подобного теста, решил сделать сам

**Логи исследований, инфу про наполнение и валидацию буду публиковать по ходу разработки**

Мне очень важно ваше мнение, буду рад, если кто-нибудь захочет вступить в фокус-группу проекта
            
          </p>
          
          {/* Кнопка "Начать Тест" УДАЛЕНА */}

         

        </div>
      </div>
    </Router>
  );
}

export default App;

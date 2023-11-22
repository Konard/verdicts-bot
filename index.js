const TelegramBot = require('node-telegram-bot-api');

function start(const token) {
  const bot = new TelegramBot(token, {polling: true});

  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Добро пожаловать! Этот бот помогает оценивать вердикт по фактам дела. Введите команду /facts, чтобы ввести факты дела');
  });

  // bot.onText(/\/facts/, (msg) => {
  //   const chatId = msg.chat.id;
    
  //   // На этой стадии было бы хорошо вывести интерфейс для сбора фактов дела,
  //   // Например, с помощью inline keyboard или другого метода.
  //   // Это будет зависеть от того, как вы хотите, чтобы пользователи вводили информацию.
  // });

  // // ..остальная реализация бота...

  // bot.on('message', (msg) => {
  //   const text = msg.text;
  //   const chatId = msg.chat.id;

  //   // Здесь в тексте должны быть обработаны введенные пользователем факты.

  //   const verdict = getVerdict(facts); // Теперь вызывается функция, реализованная ранее

  //   bot.sendMessage(chatId, `Вероятный вердикт на основе представленных фактов: ${verdict}`);
  // });
}

fs.readFile('token', 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    console.log("Make sure token file exists and contains Telegram Bot token");
    return;
  }
  start(data);
});


const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

const state = {};

function start(token) {
  const bot = new TelegramBot(token, {polling: true});

  // bot.onText(/\/start/, (msg) => {
  //   const chatId = msg.chat.id;
  //   bot.sendMessage(chatId, 'Добро пожаловать! Этот бот помогает оценивать вердикт по фактам дела. Введите команду /facts, чтобы ввести факты дела');

  //   const chatId = msg.chat.id;
  //   state[chatId] = { step: `` };
  // });

  bot.onText(/\/(re)?start/, (msg) => {
    const chatId = msg.chat.id;
    state[chatId] = {
      step: "theft",
      theft: {},
      participants: {},
    };
    bot.sendMessage(
      chatId,
      "Давайте определим ожидаемый вердикт по 158 статьей УК РФ. Сначала введите ущерб от кражи числом в рублях. Например: 3000"
    );
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


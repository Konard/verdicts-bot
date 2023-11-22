const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

const state = {};

function getVerdict(facts) {
  let theft = facts.find(fact => fact.type === 'theft');
  let participants = facts.find(fact => fact.type === 'participants');
  let verdict = '';

  if (theft) {
    let damageValue = theft.damageValue;

    if (damageValue < 5000) {
      verdict = 'The suspect can be fined up to 80,000 rubles, or up to six months\' salary, or a compensatory amount of up to six months\' earnings, ' +
      'or they may be sentenced to obligatory labour for up to 360 hours, or correctional labour for up to a year, or deprivation of liberty for up to two years.';
    } else if (damageValue >= 5000 && damageValue <= 250000) {
      verdict = 'The suspect can be fined up to 200,000 rubles, or operators can be subjected to forced labor for up to 5 years, or sentenced for up to 5 years.';
    } else if (damageValue > 250000 && damageValue <= 1000000) {
      verdict = 'The suspect can be fined up to 500,000 rubles, or be subjected to a prison term of up to 6 years, with a fine of up to 80,000 rubles, or a compensatory amount for up to 6 months.' +
      ' and restriction of freedom for up to one and a half years.';
    } else if (damageValue > 1000000) {
      verdict = 'The suspect can be sentenced to up to ten years in prison, or fined up to one million rubles and restricted freedom for up to two years.';
    }
  }

  if (participants) {
    let participantCount = participants.count;
    let hasOrganizer = participants.hasOrganizer;

    if (participantCount <= 1) {
      verdict += '\nThis is an individual responsibility.';
    } else if (participantCount > 1 && !hasOrganizer) {
      verdict += '\nThis is a group responsibility.';
    } else if (participantCount > 1 && hasOrganizer) {
      verdict += '\nThis is an organized group responsibility.';
    }
  }

  return verdict;
}


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

  bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const chatState = state[chatId];
  
    if (chatState?.step === "theft") {
      let damageValue = parseInt(text);
      if (isNaN(damageValue)) {
        bot.sendMessage(chatId, "Пожалуйста, введите число. Например: 3000");
      } else {
        chatState.theft.type = "theft";
        chatState.theft.damageValue = damageValue;
        chatState.step = "participants";
        bot.sendMessage(chatId, "Пожалуйста, введите количество участников числом. Например: 1");
      }
    } else if (chatState?.step === "participants") {
      let count = parseInt(text);
      if (isNaN(count)) {
        bot.sendMessage(chatId, "Пожалуйста, введите число. Например: 1");
      } else {
        chatState.participants.count = count;
        chatState.step = "hasOrganizer";
        bot.sendMessage(
          chatId,
          "У участников есть организатор?",
          {
            reply_markup: {
              // keyboard: [['Да', 'Нет']],
              // one_time_keyboard: true,
              // resize_keyboard: true,

              inline_keyboard: [
                /* Inline buttons. 2 side-by-side */
                [ { text: "Да", callback_data: "Да" }, { text: "Нет", callback_data: "Нет" } ],
              ]
            }
          }
        );
      }
    }
  });

  bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const text = query.data;
    const chatState = state[chatId];

    if (chatState?.step === "hasOrganizer") {
      if (text == 'Да') {
        chatState.participants.hasOrganizer = true;
      } else if (text == 'Нет') {
        chatState.participants.hasOrganizer = false;
      } else {
        bot.sendMessage(chatId, "Пожалуйста, выберите ответ из предложенных: 'Да' или 'Нет'");
        return;
      }
  
      const verdict = getVerdict([chatState.theft, chatState.participants]);
      bot.sendMessage(chatId, `Вероятный вердикт на основе представленных фактов:\n${verdict}`);
    };
  });
}

fs.readFile('token', 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    console.log("Make sure token file exists and contains Telegram Bot token");
    return;
  }
  start(data);
});


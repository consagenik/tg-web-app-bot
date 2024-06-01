const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

const bot = new TelegramBot(process.env.BOT_TOKEN, {polling: true});
const app = express();

app.use(cors());
app.use(express.json());

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === '/start') {
    bot.sendMessage(chatId, 'Hi there!', {
      reply_markup: {
        keyboard: [[{text: "Fill the form", web_app: {url: process.env.WEB_APP_URL + '/form'}}]],
        resize_keyboard: true
      },
    });
    bot.sendMessage(chatId, 'Hi there!', {
      reply_markup: {
        inline_keyboard: [[{text: "Make order", web_app: {url: process.env.WEB_APP_URL}}]],
        resize_keyboard: true
      },
    });
  }

  if (msg?.web_app_data?.data) {
    try {
      const data = JSON.parse(msg?.web_app_data?.data);
      const text = `Name: ${data.name}\nSurname: ${data.surname}\nEmail: ${data.email}\nPhone: ${data.phone}\nAddress: ${data.address}\nCity: ${data.city}\nCountry: ${data.country}\nGender: ${data.gender}\nActivity: ${data.activity}`;
      bot.sendMessage(chatId, text);
    } catch (e) {
      bot.sendMessage(chatId, 'Error: ' + e);
    }
  }
});

app.post('/web-data', async (req, res) => {
  const {queryId, products, totalPrice} = req.body;

  try {
    await bot.answerWebAppQuery(queryId, {
      type: 'article',
      id: queryId,
      title: 'Your order',
      input_message_content: {
        message_text: `Congratulations! You ordered products with total price of $${totalPrice}.}`,
      },});

    res.status(200).json({message: 'OK'});
  } catch (e) {
    await bot.answerWebAppQuery(queryId, {
      type: 'article',
      id: queryId,
      title: 'Error',
      input_message_content: {
        message_text: `Error: ${e}`,
      },});

    res.status(500).json({error: e});
  }
});

app.listen(process.env.PORT || 8000, () => console.log(`Server started on port ${process.env.PORT || 8000}`));

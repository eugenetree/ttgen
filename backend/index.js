// require("./modules/video/prepare-content.cron");
// require("./modules/video/video-render.cron");
// require("./modules/upload/video-upload.cron");

const fs = require("fs");
const OpenAI = require("openai");
const API_KEY = process.env.OPENAI_API_KEY;

const client = new OpenAI({
  apiKey: API_KEY,
});

class ChatAgent {
  async chat(query) {
    const res = await client.chat.completions.create({
      messages: [{ role: "user", content: query }],
      model: "gpt-4o",
      temperature: 0,
    });

    const message = res?.choices?.[0]?.message?.content;
    if (!message) {
      throw new Error(
        `Failed to generate message from AI: ${JSON.stringify(res, null, 2)}`,
      );
    }

    return message;
  }
}

const main = async () => {
  const chatAgent = new ChatAgent();
  const words = require("./words_to_translate_to_de.json");

  for (const englishLevel in words) {
    for (const word of words[englishLevel]) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      log(`processing word: ${word}`);
      const response = await chatAgent.chat(
        `Translate word ${word} to german. In response send me only translated word, without any additional text`,
      );

      log(`response from chat: ${response}`);
      add({ enWord: word, deWord: response.toLowerCase(), level: englishLevel });
    }
  }
};

function log(text) {
  console.log(text);
  fs.writeFileSync("logs.txt", `${text}\n`, { flag: "a" }, (err) => {
    if (err) console.error(err);
  });
}

function add({ enWord, deWord, level }) {
  const words = JSON.parse(fs.readFileSync("words_prepared_de.json"));

  words[level.toLowerCase()] = {
    ...words[level.toLowerCase()],
    [enWord]: deWord,
  };

  fs.writeFileSync("words_prepared_de.json", JSON.stringify(words));
}

main();

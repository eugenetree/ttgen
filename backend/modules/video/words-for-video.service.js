const { aiService } = require("../ai/ai.service");
const { ttsForVideoService } = require("./tts-for-video.service");
const { videoRepository } = require("./video.repository");

const getQuery = ({ wordsToExclude, englishLevel }) =>
  "я делаю видос про перевод слов с английского на русский.\n" +
  `накидай мне ебать каких слов (8 штук) для уровня ${englishLevel}\n` +
  "пусть некоторые слова будут с приколом\n" +
  "обязательно выбирай слова что бы русская версия и английская были не созвучны\n" +
  "т.е. не пиши слова типо сингулярность|singlarity\n" +
  "дай ответ в формате 'русское слово|английское слово|русское слово|английское слово|' и так далее...\n" +
  "кроме слов в ответ свой ничего больше не пиши\n" +
  `и не используй эти слова, они уже раньше были: ${wordsToExclude.join(", ")}`;

const wordsForVideoService = {
  generateWords: async ({ englishLevel }) => {
    const allVideos = await videoRepository.findAll();
    const allWords = allVideos.reduce((acc, video) => {
      const words = video.words.map((word) => word.en);
      return [...acc, ...words];
    }, []);

    let msg = await aiService.chat(
      getQuery({ wordsToExclude: allWords, englishLevel }),
    );

    // it's done to avoid empty element at the end after .split("|")
    if (msg[msg.length - 1] === "|") {
      msg = msg.slice(0, -1);
    }

    const rawWords = msg.split("|");
    if (rawWords.some((word) => word.split(" ").length > 2)) {
      throw new Error(
        `Words should not contain spaces, most likely response from AI is incorrect: ${msg}`,
      );
    }

    const grouppedWords = rawWords.reduce((acc, word, index) => {
      return index % 2 === 0
        ? [...acc, { ru: word, en: rawWords[index + 1] }]
        : acc;
    }, []);

    const voicedWords = await ttsForVideoService.generateAudio({
      text: grouppedWords.map((word) => word.en),
    });

    console.log("Voiced words:", voicedWords);
    return voicedWords;
  },
};

exports.wordsForVideoService = wordsForVideoService;

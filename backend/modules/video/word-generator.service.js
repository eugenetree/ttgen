const { chatAgent } = require("../ai/chat-agent");
const { ttsForVideoService } = require("./tts-for-video.service");
const { videoRepository } = require("./video.repository");
const { getAudioDurationInSeconds } = require("get-audio-duration");

const getQuery = ({ wordsToExclude, englishLevel, amount = 8 }) =>
  // "я делаю видос про перевод слов с английского на русский.\n" +
  // `накидай мне ебать каких слов (${amount} штук) для уровня ${englishLevel}\n` +
  // "пусть некоторые слова будут с приколом\n" +
  // "обязательно выбирай слова что бы русская версия и английская были не созвучны\n" +
  // "т.е. не пиши слова типо сингулярность|singlarity\n" +
  // "дай ответ в формате 'русское слово|английское слово|русское слово|английское слово|' и так далее...\n" +
  // "кроме слов в ответ свой ничего больше не пиши\n" +
  // `и не используй эти слова, они уже раньше были: ${wordsToExclude.join(", ")}`;
  // `I need your help creating word pairs for an English-Russian translation video.
  // Please follow these specific requirements:\n
  // 1. Generate exactly ${amount} word pair${amount === 1 ? "" : "s"}\n
  // 2. Target ${englishLevel} English proficiency level\n
  // 3. Include some humorous or unusual words\n
  // 4. IMPORTANT: The Russian and English words must NOT be cognates or sound similar
  // (Example of what NOT to do: сингулярность|singularity)\n
  // 5. Format: Provide ONLY the word pairs in this exact format:
  // русское_слово|english_word|русское_слово|english_word|\n
  // 6. Exclude these words (previously used): ${wordsToExclude.join(", ")}\n
  // Response requirements:\n
  // * Provide ONLY the word pairs\n
  // * IT SHOULD BE ONLY ${amount} PAIR${amount === 1 ? "" : "s"}\n
  // * No explanations or additional text\n
  // * Maintain the exact format with | symbols\n
  // * Words should be for level ${englishLevel}!!! That's very important!\n`;
  `приведи примеры слов на английском для уровня ${englishLevel}\n` +
  `нужно ${amount + 2} слов\n` +
  `не используй слова: ${wordsToExclude.join(", ")}\n` +
  `ответь в формате 'русское слово|английское слово|русское слово|английское слово|' и так далее...\n`;

const wordsForVideoService = {
  generate: async ({ englishLevel }) => {
    const allVideos = await videoRepository.findAll();
    const allWords = allVideos.reduce((acc, video) => {
      const words = video.words.map((word) => word.en);
      return [...acc, ...words];
    }, []);

    const requestWordsAmount = 1;
    console.log(
      `Requesting ${requestWordsAmount} words for level ${englishLevel}`,
    );

    const currentResult = {
      successWords: [],
      failedWords: [],
    };

    for (i = 0; i < 5; i++) {
      const { successWords, failedWords } = await process({
        wordsToExclude: [
          allWords,
          ...currentResult.failedWords,
          ...currentResult.successWords.map((word) => word.en),
        ],
        englishLevel,
        requestWordsAmount:
          requestWordsAmount - currentResult.successWords.length,
      });

      currentResult.successWords.push(...successWords);
      currentResult.failedWords.push(...failedWords);

      if (currentResult.successWords.length >= requestWordsAmount) {
        return currentResult.successWords;
      }
    }

    // TODO: process failed case
  },
};

async function process({ wordsToExclude, englishLevel, requestWordsAmount }) {
  let msg = await chatAgent.chat(
    getQuery({
      wordsToExclude,
      englishLevel,
      amount: requestWordsAmount,
    }),
  );

  // it's done to avoid empty element at the end after .split("|")
  if (msg[msg.length - 1] === "|") {
    msg = msg.slice(0, -1);
  }

  console.log(`Received words from AI: ${msg}`);

  const rawWords = msg.split("|");
  if (rawWords.some((word) => word.split(" ").length > 2)) {
    throw new Error(
      `Words should not contain spaces, most likely response from AI is incorrect: ${msg}`,
    );
  }

  // TODO: add check if AI sent more than requested or already existing words
  // in case of more than requested - drop them, in case of existing - put into failedItems

  // [{ "en": "word", "ru": "слово" }]
  let translatedWords = rawWords.reduce((acc, _, index) => {
    if (index % 2 === 1) {
      return acc;
    }

    const ruWord = rawWords[index];
    const enWord = rawWords[index + 1];

    return [...acc, { en: enWord, ru: ruWord }];
  }, []);

  // sometimes AI ignores words to exclude
  translatedWords = translatedWords.filter(
    (word) => !wordsToExclude.includes(word.en),
  );

  // sometimes AI sends more words than requested
  translatedWords = translatedWords.slice(0, requestWordsAmount);

  if (translatedWords.length < requestWordsAmount) {
    throw new Error(
      `Failed to get enough words from AI. Requested: ${requestWordsAmount}, Received: ${translatedWords.length}`,
    );
  }

  const voicedWords = await ttsForVideoService.generateAudio({
    text: translatedWords.map((word) => word.en),
  });

  const successWords = voicedWords.successWords.map((sWord) => ({
    en: sWord.en,
    ru: translatedWords.find((tWord) => tWord.en === sWord.en).ru,
    audioPath: sWord.path,
  }));

  for (const word of successWords) {
    const duration = await getAudioDurationInSeconds(word.audioPath);
    word.audioDuration = duration;
  }

  return {
    successWords,
    failedWords: voicedWords.failedWords,
  };
}

exports.wordsForVideoService = wordsForVideoService;

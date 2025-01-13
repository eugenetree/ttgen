const { aiService } = require("../ai/ai.service");
const { ttsForVideoService } = require("./tts-for-video.service");
const { videoRepository } = require("./video.repository");

const getQuery = ({ wordsToExclude, englishLevel, amount = 8 }) =>
  // "я делаю видос про перевод слов с английского на русский.\n" +
  // `накидай мне ебать каких слов (${amount} штук) для уровня ${englishLevel}\n` +
  // "пусть некоторые слова будут с приколом\n" +
  // "обязательно выбирай слова что бы русская версия и английская были не созвучны\n" +
  // "т.е. не пиши слова типо сингулярность|singlarity\n" +
  // "дай ответ в формате 'русское слово|английское слово|русское слово|английское слово|' и так далее...\n" +
  // "кроме слов в ответ свой ничего больше не пиши\n" +
  // `и не используй эти слова, они уже раньше были: ${wordsToExclude.join(", ")}`;
  `I need your help creating word pairs for an English-Russian translation video. 
  Please follow these specific requirements:\n
  1. Generate exactly ${amount} word pair${amount === 1 ? "" : "s"}\n
  2. Target ${englishLevel} English proficiency level\n
  3. Include some humorous or unusual words\n
  4. IMPORTANT: The Russian and English words must NOT be cognates or sound similar 
  (Example of what NOT to do: сингулярность|singularity)\n
  5. Format: Provide ONLY the word pairs in this exact format: 
  русское_слово|english_word|русское_слово|english_word|\n
  6. Exclude these words (previously used): ${wordsToExclude.join(", ")}\n
  Response requirements:\n
  * Provide ONLY the word pairs\n
  * IT SHOULD BE ONLY ${amount} PAIR${amount === 1 ? '' : 's'}\n
  * No explanations or additional text\n
  * No cognates or similar-sounding words\n
  * Maintain the exact format with | symbols\n
  * Example of Expected Output Format\nлягушка|frog|подушка|pillow|небо|sky|`;

const wordsForVideoService = {
  generate: async ({ englishLevel }) => {
    const allVideos = await videoRepository.findAll();
    const allWords = allVideos.reduce((acc, video) => {
      const words = video.words.map((word) => word.en);
      return [...acc, ...words];
    }, []);

    const requestWordsAmount = 8;
    console.log(
      `Requesting ${requestWordsAmount} words for level ${englishLevel}`,
    );

    const currentResult = {
      successWords: [],
      failedWords: [],
    };

    for (i = 0; i < 5; i++) {
      console.log(
        "debug: currentResult",
        JSON.stringify(currentResult, null, 2),
      );

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
        break;
      }
    }
  },
};

async function process({ wordsToExclude, englishLevel, requestWordsAmount }) {
  let msg = await aiService.chat(
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

  // { "word": "слово" }
  const translatedWords = rawWords.reduce((acc, word, index) => {
    return index % 2 === 0
      ? { ...acc, [rawWords[index + 1]]: rawWords[index] }
      : acc;
  }, []);

  const voicedWords = await ttsForVideoService.generateAudio({
    text: Object.keys(translatedWords),
  });

  const successWords = voicedWords.successWords.map((word) => ({
    ...word,
    ru: translatedWords[word.en],
  }));

  return {
    successWords,
    failedWords: voicedWords.failedWords,
  };
}

exports.wordsForVideoService = wordsForVideoService;

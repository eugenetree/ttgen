const path = require("path");

const { videoRepository } = require("./modules/video/video.repository");

const LANGUAGES_TO_GENERATE = ["ru", "de"];

(async () => {
  for (const lang of LANGUAGES_TO_GENERATE) {
    await generateVideoDbRecords({ lang });
  }
})();

async function generateVideoDbRecords({ lang }) {
  const ruWords = require(`./words/words_prepared_${lang}.json`);

  while (true) {
    const availableLevels = [];

    for (const englishLevel in ruWords) {
      if (Object.keys(ruWords[englishLevel]).length >= 8) {
        availableLevels.push(englishLevel);
      }
    }

    if (availableLevels.length === 0) {
      return;
    }

    const randomLevel = getRandomValues(availableLevels, 1)[0];
    const randomWords = getRandomValues(Object.keys(ruWords[randomLevel]), 8);

    await videoRepository.create({
      sourceLanguage: "en",
      targetLanguage: lang,
      englishLevel: randomLevel,
      status: "READY_FOR_RENDER",
      createdAt: new Date(),
      words: randomWords.map((enWord) => ({
        sourceText: enWord,
        targetText: ruWords[randomLevel][enWord],
        audio: path.resolve(
          process.cwd(),
          `../_storage/voiced_words/${enWord}.mp3`,
        ),
      })),
    });

    randomWords.forEach((enWord) => {
      delete ruWords[randomLevel][enWord];
    });
  }
}

function getRandomValues(array, count) {
  return array.sort(() => Math.random() - 0.5).slice(0, count);
}

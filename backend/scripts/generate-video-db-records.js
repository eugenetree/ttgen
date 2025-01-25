const path = require("path");
const { videoRepository } = require("../modules/video/video.repository");
const config = require("../config.json");

(async () => {
  await generateVideoDbRecords();
})();

async function generateVideoDbRecords() {
  const targetWords = require(`../words/words_prepared.json`);
  require("fs").writeFileSync(
    path.resolve(process.cwd(), "../_storage/videos.json"),
    "[]",
  );

  while (true) {
    const availableLevels = [];

    for (const englishLevel in targetWords) {
      if (Object.keys(targetWords[englishLevel]).length >= 8) {
        availableLevels.push(englishLevel);
      }
    }

    if (availableLevels.length === 0) {
      return;
    }

    const randomLevel = getRandomValues(availableLevels, 1)[0];
    const randomWords = getRandomValues(
      Object.keys(targetWords[randomLevel]),
      8,
    );

    await videoRepository.create({
      sourceLanguage: "en",
      targetLanguage: config.lang,
      englishLevel: randomLevel,
      status: "READY_FOR_RENDER",
      createdAt: new Date(),
      words: randomWords.map((enWord) => ({
        sourceText: enWord,
        targetText: targetWords[randomLevel][enWord],
        audio: path.resolve(
          process.cwd(),
          `../_storage/voiced_words/${enWord}.mp3`,
        ),
      })),
    });

    randomWords.forEach((enWord) => {
      delete targetWords[randomLevel][enWord];
    });
  }
}

function getRandomValues(array, count) {
  return array.sort(() => Math.random() - 0.5).slice(0, count);
}

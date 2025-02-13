const { speechSynthesizer } = require("./modules/ai/speech-synthesizer");
const fs = require("fs/promises");
const path = require("path");

const ruWords = require("./words/words_prepared_ru.json");

const main = async () => {
  const wordsToVoice = [];

  for (const englishLevel in ruWords) {
    for (const enWord in ruWords[englishLevel]) {
      wordsToVoice.push(enWord);
    }
  }

  const successWords = [];
  const failedWords = [];

  for (const word of wordsToVoice) {
    console.log(`processing ${word}`);

    const pathToSave = path.resolve(
      process.cwd(),
      `../_storage/debug/${word}.mp3`,
      // `../_storage/voiced_words/${word}.mp3`,
    );

    try {
      const buffer = await speechSynthesizer.generate(word);
      if (buffer === null) {
        console.error(`voice generation failed for ${word}`);
        failedWords.push(word);
        continue;
      }
      await fs.writeFile(pathToSave, Buffer.from(buffer));
      successWords.push(word);
    } catch (error) {
      console.error(`unexpcted error for ${word}`, error);
      failedWords.push(word);
    } finally {
      await fs.writeFile(
        "voiced_words.json",
        JSON.stringify({ successWords, failedWords }),
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
};

main();

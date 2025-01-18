const fs = require("fs/promises");
const path = require("path");
const { ttsService } = require("../ai/tts.service");

const ttsForVideoService = {
  generateAudio: async ({ text }) => {
    const result = {
      successWords: [],
      failedWords: [],
    };

    if (!Array.isArray(text)) {
      throw new Error("'text' parameter should be an array of strings");
    }

    for (let i = 0; i < text.length; i++) {
      const word = text[i];
      const pathToSave = path.join(
        process.cwd(),
        `../_storage/audio/${word}.mp3`,
      );

      await ttsService
        .generate(word)
        .then(async (buffer) => {
          await fs.writeFile(pathToSave, Buffer.from(buffer));
          result.successWords.push({ en: word, path: pathToSave });
        })
        .catch((error) => {
          console.error(`Failed to generate audio for word: ${word}`, error);
          result.failedWords.push(word);
        });

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    return result;
  },
};

exports.ttsForVideoService = ttsForVideoService;

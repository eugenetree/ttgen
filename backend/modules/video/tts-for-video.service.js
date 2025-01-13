const fs = require("fs/promises");
const path = require("path");
const { ttsService } = require("../ai/tts.service");

const ttsForVideoService = {
  generateAudio: async ({ text }) => {
    const resultAudioFiles = [];

    if (!Array.isArray(text)) {
      throw new Error("'text' parameter should be an array of strings");
    }

    for (let i = 0; i < text.length; i++) {
      const word = text[i];
      const pathToSave = path.join(__dirname, `sounds/${word}.mp3`);

      await ttsService.getAudio(word).then(async (buffer) => {
        await fs.writeFile(pathToSave, Buffer.from(buffer));
        await new Promise((resolve) => setTimeout(resolve, 2000));
      });

      resultAudioFiles.push(pathToSave);
    }
  },
};

exports.ttsForVideoService = ttsForVideoService;

const cron = require("node-cron");

const {
  generateVideoService,
} = require("./modules/video/generate-video.service");
const { ttsService } = require("./modules/ai/tts.service");
const {
  wordsForVideoService,
} = require("./modules/video/words-for-video.service");

const main = async () => {
  // generateVideoService.generate();
  // ttsService.generate("carrot")
  wordsForVideoService.generate({ englishLevel: "A1" });
};

main();

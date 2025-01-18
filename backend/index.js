const cron = require("node-cron");

const {
  generateVideoService,
  prepareContentService,
} = require("./modules/video/prepare-content.service");
const { ttsService } = require("./modules/ai/tts.service");
const {
  wordsForVideoService,
} = require("./modules/video/word-generator.service");
const { videoRenderService } = require("./modules/video/video-render.service");
const { uploadService } = require("./modules/upload/upload.service");

const main = async () => {
  // generateVideoService.prepare();
  // ttsService.generate("carrot")
  // wordsForVideoService.generate({ englishLevel: "C2" });
  // videoRenderService.render();
  // prepareContentService.prepare();
  videoRenderService.render();
  // uploadService.upload();
};

main();

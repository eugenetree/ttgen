// require("./modules/video/prepare-content.cron");
// require("./modules/video/video-render.cron");
require("./modules/upload/video-upload.cron")

const {
  generateVideoService,
  prepareContentService,
} = require("./modules/video/prepare-content.service");
const {
  wordsForVideoService,
} = require("./modules/video/word-generator.service");
const { videoRenderService } = require("./modules/video/video-render.service");
const { tiktokUploader } = require("./modules/upload/tiktok-uploader");

const main = async () => {
  // generateVideoService.prepare();
  // ttsService.generate("carrot")
  // wordsForVideoService.generate({ englishLevel: "C2" });
  // videoRenderService.render();
  // prepareContentService.prepare();
  // videoRenderService.render();
  // tiktokUploader.upload({ englishLevel: "C2" });

  // prepareContentService.prepare();
  // await new Promise((resolve) => setTimeout(resolve, 1000));
  // videoRenderService.render();
};

main();

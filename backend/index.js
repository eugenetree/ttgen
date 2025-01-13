const cron = require("node-cron");

const { generateVideoService } = require("./modules/video/generate-video.service");

const main = async () => {
  generateVideoService.generate();
};

main();

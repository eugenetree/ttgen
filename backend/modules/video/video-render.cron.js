const cron = require("node-cron");
const { videoRenderService } = require("./video-render.service");
const { Logger } = require("../system/logger");

const isOddMinute = () => {
  const currentMinute = new Date().getMinutes();
  return currentMinute % 2 === 1;
};

const logger = new Logger("video-render-cron");

cron.schedule("*/5 * * * *", () => {
  logger.info("cron is triggered");
  videoRenderService.render();
});

logger.info("cron is scheduled");

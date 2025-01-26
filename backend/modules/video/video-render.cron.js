const cron = require("node-cron");
const { videoRenderService } = require("./video-render.service");
const { Logger } = require("../system/logger");

const isOddMinute = () => {
  const currentMinute = new Date().getMinutes();
  return currentMinute % 2 === 1;
};

const logger = new Logger("video-render-cron");

cron.schedule("* * * * *", () => {
  logger.info("cron is triggered");

  if (!isOddMinute()) {
    logger.info("cron is skipped as it is not an odd minute");
    return;
  }

  videoRenderService.render();
});

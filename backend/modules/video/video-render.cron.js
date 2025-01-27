const cron = require("node-cron");
const { videoRenderService } = require("./video-render.service");
const { Logger } = require("../system/logger");
const { videoRepository } = require("./video.repository");

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

  const latestUploadedVideo = videoRepository.getLatestUploadedToTiktokVideo();
  if (
    latestUploadedVideo &&
    new Date() - new Date(latestUploadedVideo.tiktokUploadDate) >
      1000 * 60 * 60 * 6
  ) {
    logger.info(
      `latest video was uploaded more than 6 hours ago, waiting for upload first`,
    );
    return;
  }

  videoRenderService.render();
});

logger.info("cron is scheduled");

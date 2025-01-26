const cron = require("node-cron");
const { tiktokUploader } = require("./tiktok-uploader");
const { videoRepository } = require("../video/video.repository");
const path = require("path");
const { Logger } = require("../system/logger");

const isEvenMinute = () => {
  const currentMinute = new Date().getMinutes();
  return currentMinute % 2 === 0;
};

const logger = new Logger("video-upload-cron");

cron.schedule("* * * * *", async () => {
  logger.info("cron is triggered");

  if (!isEvenMinute()) {
    logger.info("cron is skipped as it is not an even minute");
    return;
  }

  const allVideos = await videoRepository.findAll();
  const readyForUploadVideos = allVideos.filter(
    (video) => video.status === "RENDERED",
  );

  logger.info(`found ${readyForUploadVideos.length} videos ready for upload`);

  if (readyForUploadVideos.length === 0) {
    logger.info("no videos to upload");
    return;
  }

  const videoForUpload = readyForUploadVideos[0];

  const videoPath = path.resolve(
    process.cwd(),
    "../_storage/rendered",
    `${videoForUpload.id}.mp4`,
  );

  const previewPath = path.resolve(
    process.cwd(),
    "../_storage/screenshots",
    `${videoForUpload.id}.png`,
  );

  tiktokUploader.upload({
    englishLevel: videoForUpload.englishLevel,
    videoPath,
    previewPath,
  });
});

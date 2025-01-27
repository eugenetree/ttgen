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

  const latestUploadedVideo =
    await videoRepository.getLatestUploadedToTiktokVideo();

  logger.info(`latest uploaded video: ${latestUploadedVideo?.id}`);

  if (
    new Date() - new Date(latestUploadedVideo?.tiktokUploadDate) <
    1000 * 60 * 60 * 6
  ) {
    logger.info(`latest video was uploaded less than 6 hours ago`);
    return;
  }

  const allVideos = await videoRepository.findAll();
  const readyForUploadVideos = allVideos.filter(
    (video) => video.status === "RENDERED",
  );

  if (readyForUploadVideos.length === 0) {
    logger.info("no videos to upload");
    return;
  }

  logger.info(`found ${readyForUploadVideos.length} videos ready for upload`);

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

  await tiktokUploader.upload({
    englishLevel: videoForUpload.englishLevel,
    videoPath,
    previewPath,
    videoId: videoForUpload.id,
  });

  logger.info(`video uploaded to tiktok: ${videoForUpload.id}`);

  await videoRepository.markAsUploadedToTiktok({ id: videoForUpload.id });

  logger.info(`video marked as uploaded to tiktok: ${videoForUpload.id}`);
});

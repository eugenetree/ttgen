const cron = require("node-cron");
const { tiktokUploader } = require("./tiktok-uploader");
const { videoRepository } = require("../video/video.repository");
const path = require("path");
const { Logger } = require("../system/logger");
const { resourceOrchestrator } = require("../system/resource-orchestrator");

const shouldRun = () => {
  const currentMinute = new Date().getMinutes();
  return currentMinute % 5 !== 0;
};

const logger = new Logger("video-upload-cron");

cron.schedule("0 18,5 * * *", async () => {
  logger.info("cron is triggered");

  // if (!shouldRun()) {
  //   logger.info("cron is skipped as it is not an 5/10/15/20... minute");
  //   return;
  // }

  // if (!resourceOrchestrator.isAvailable()) {
  //   logger.info(`orchestrator is busy.`);
  //   return;
  // }

  const latestUploadedVideo =
    await videoRepository.getLatestUploadedToTiktokVideo();

  logger.info(`latest uploaded video: ${latestUploadedVideo?.id}`);

  // if (
  //   latestUploadedVideo &&
  //   new Date() - new Date(latestUploadedVideo.tiktokUploadDate) <
  //     1000 * 60 * 60 * 6
  // ) {
  //   logger.info(
  //     `latest video was uploaded less than 6 hours ago, no need to upload another one`,
  //   );

  //   return;
  // }

  const videoForUpload =
    await videoRepository.getOldestRenderedNotUploadedVideo();

  if (!videoForUpload) {
    logger.info(`no video ready for upload`);
    return;
  }

  // resourceOrchestrator.acquireLock();
  logger.info(`video #${videoForUpload.id} upload started`);

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

  try {
    await tiktokUploader.upload({
      englishLevel: videoForUpload.englishLevel,
      videoPath,
      previewPath,
      videoId: videoForUpload.id,
    });
  } catch (error) {
    logger.error(
      `upload of video ${videoForUpload.id} failed: ${error.message}`,
    );
    // await resourceOrchestrator.releaseLock();
    return;
  }

  logger.info(
    `video ${videoForUpload.id} uploaded to tiktok: ${videoForUpload.id}`,
  );

  await videoRepository.markAsUploadedToTiktok({ id: videoForUpload.id });
  // await resourceOrchestrator.releaseLock();

  logger.info(`video marked as uploaded to tiktok: ${videoForUpload.id}`);
});

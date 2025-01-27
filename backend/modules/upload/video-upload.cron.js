const cron = require("node-cron");
const { tiktokUploader } = require("./tiktok-uploader");
const { videoRepository } = require("../video/video.repository");
const path = require("path");
const { Logger } = require("../system/logger");

const shouldRun = () => {
  const currentMinute = new Date().getMinutes();
  return currentMinute % 5 !== 0;
};

const logger = new Logger("video-upload-cron");

cron.schedule("* * * * *", async () => {
  logger.info("cron is triggered");

  if (!shouldRun()) {
    logger.info("cron is skipped as it is not an 5/10/15/20... minute");
    return;
  }

  const latestUploadedVideo =
    await videoRepository.getLatestUploadedToTiktokVideo();

  logger.info(`latest uploaded video: ${latestUploadedVideo?.id}`);

  if (
    latestUploadedVideo &&
    new Date() - new Date(latestUploadedVideo.tiktokUploadDate) <
      1000 * 60 * 60 * 6
  ) {
    logger.info(
      `latest video was uploaded less than 6 hours ago, no need to upload another one`,
    );

    return;
  }

  const videoForUpload =
    await videoRepository.getOldestRenderedNotUploadedVideo();

  if (!videoForUpload) {
    logger.info(`no video ready for upload`);
    return;
  }

  logger.info(`found video ${videoForUpload.id} ready for upload`);

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

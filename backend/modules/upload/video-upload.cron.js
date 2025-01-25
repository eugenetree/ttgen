const cron = require("node-cron");
const { tiktokUploader } = require("./tiktok-uploader");
const { videoRepository } = require("../video/video.repository");
const path = require("path");

cron.schedule("* * * * *", async () => {
  console.log("video upload cron started");

  const allVideos = await videoRepository.findAll();
  const readyForUploadVideos = allVideos.filter(
    (video) => video.status === "READY_FOR_UPLOAD",
  );

  console.log(`Found ${readyForUploadVideos.length} videos ready for upload`);

  if (readyForUploadVideos.length === 0) {
    console.log("No videos to upload");
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

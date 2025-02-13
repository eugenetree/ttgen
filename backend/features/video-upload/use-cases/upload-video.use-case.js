const Logger = require("../../../shared/utils/logger");
const tiktokUploaderService = require("../infrastructure/tiktok-uploader");
const videoRepository = require("../../../shared/infrastructure/video.repository");
const resourceOrchestrator = require("../../../shared/infrastructure/resource-orchestrator");
const videoStorage = require("../../../shared/infrastructure/video-storage");
const configService = require("../../../shared/infrastructure/config.service");

class UploadVideoUseCase {
  constructor() {
    this.logger = new Logger("UploadVideoUseCase");
  }

  async execute() {
    // Check if resources are available
    if (!resourceOrchestrator.isAvailable()) {
      this.logger.info("Resources are busy");
      return;
    }

    const latestUploadedVideo =
      await videoRepository.getLatestUploadedToTiktokVideo();
    this.logger.info(`Latest uploaded video: ${latestUploadedVideo?.id}`);

    // Check upload time constraints from config
    if (latestUploadedVideo && !this.canUploadNewVideo(latestUploadedVideo)) {
      this.logger.info(
        `Too soon to upload another video. Should wait at least ${configService.get("video.minUploadGapInHours")} hours`,
      );
      return;
    }

    const videoForUpload =
      await videoRepository.getOldestRenderedNotUploadedVideo();

    if (!videoForUpload) {
      this.logger.info("No video ready for upload");
      return;
    }

    // Acquire resource lock
    await resourceOrchestrator.acquireLock();

    try {
      const videoPath = videoStorage.getVideoPath(videoForUpload.id);
      const previewPath = videoStorage.getScreenshotPath(videoForUpload.id);

      await tiktokUploaderService.upload({
        englishLevel: videoForUpload.englishLevel,
        videoPath,
        previewPath,
        videoId: videoForUpload.id,
      });

      this.logger.info(`Video ${videoForUpload.id} uploaded to TikTok`);
      await videoRepository.markVideoAsUploaded(videoForUpload.id);
      this.logger.info(
        `Video marked as uploaded to TikTok: ${videoForUpload.id}`,
      );

      return videoForUpload.id;
    } catch (error) {
      this.logger.error("Failed to upload video", error);
      throw error;
    } finally {
      await resourceOrchestrator.releaseLock();
    }
  }

  canUploadNewVideo(latestUploadedVideo) {
    const minUploadGap =
      1000 * 60 * 60 * configService.get("video.minUploadGapInHours");

    return (
      !latestUploadedVideo ||
      new Date() - new Date(latestUploadedVideo.tiktokUploadDate) >=
        minUploadGap
    );
  }
}

// Export an instance instead of the class
module.exports = new UploadVideoUseCase();

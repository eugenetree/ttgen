const Logger = require("../../../shared/utils/logger");
const resourceOrchestrator = require("../../../shared/infrastructure/resource-orchestrator");
const screenshotService = require("../infrastructure/screenshot.service");
const videoStorage = require("../../../shared/infrastructure/video-storage");
const renderingService = require("../infrastructure/rendering.service");
const videoValidationService = require("../domain/video-validation.service");
const videoRepository = require("../../../shared/infrastructure/video.repository");
const path = require("path");
const fs = require("fs/promises");

class RenderVideoUseCase {
  constructor() {
    this.logger = new Logger("RenderVideoUseCase");
  }

  async execute() {
    try {
      // Check if resources are available
      if (!resourceOrchestrator.isAvailable()) {
        this.logger.info("Resources are busy");
        return;
      }

      const [video] = await videoRepository.findPendingVideos();

      if (!video) {
        this.logger.info("No pending videos to render");
        return;
      }

      if (!videoValidationService.canBeRendered(video)) {
        this.logger.info(`Video ${video.id} cannot be rendered`);
        return;
      }

      // Acquire resource lock
      await resourceOrchestrator.acquireLock();

      try {
        // Prepare output path and composition
        const outputPath = videoStorage.getVideoPath(video.id);
        await videoStorage.ensureOutputDir(outputPath);

        // Prepare composition props
        const composition = {
          props: {
            words: video.words,
            sourceLanguage: video.sourceLanguage,
            targetLanguage: video.targetLanguage,
            englishLevel: video.englishLevel,
          },
        };

        // Copy audio files if needed
        await this.copyAudioFiles(video);

        // Render video
        await renderingService.render(composition, outputPath);

        // Generate screenshot
        await screenshotService.screenshot({
          videoPath: outputPath,
          outputPath: path.resolve(process.cwd(), "_storage/screenshots"),
          filename: `${video.id}.png`,
        });

        // Update status
        await videoRepository.markVideoAsRendered(video.id, outputPath);

        this.logger.info(`Video ${video.id} rendered successfully`);
        return { videoId: video.id, outputPath };
      } finally {
        // Always release the lock
        await resourceOrchestrator.releaseLock();
      }
    } catch (error) {
      this.logger.error("Failed to render video", error);
      throw error;
    }
  }

  async copyAudioFiles(video) {
    if (!video.words?.length) return;

    const copyPromises = video.words.map((word, index) => {
      if (!word.audio) return Promise.resolve();

      return fs.copyFile(
        word.audio,
        path.resolve(process.cwd(), `frontend/public/words/${index}.mp3`),
      );
    });

    await Promise.all(copyPromises);
  }
}

// Export an instance instead of the class
module.exports = new RenderVideoUseCase();

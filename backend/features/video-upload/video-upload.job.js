const cron = require("node-cron");
const Logger = require("../../shared/utils/logger");
const configService = require("../../shared/infrastructure/config.service");
const uploadVideoUseCase = require("./use-cases/upload-video.use-case");

class VideoUploadJob {
  constructor() {
    this.logger = new Logger("VideoUploadJob");
  }

  async init() {
    const cronSchedule = configService.get("video.uploadInterval");

    cron.schedule(cronSchedule, async () => {
      this.logger.info("Video upload job triggered");
      await this.runUseCase();
    });

    this.logger.info(
      `Video upload job initialized with schedule: ${cronSchedule}`,
    );

    // this.logger.info("Running video upload job immediately");
    // this.runUseCase();
  }

  async runUseCase() {
    try {
      const videoId = await uploadVideoUseCase.execute();
      if (videoId) {
        this.logger.info(`Successfully uploaded video ${videoId}`);
      }
    } catch (error) {
      this.logger.error("Error in video upload job:", error);
    }
  }
}

// Export an instance instead of the class
module.exports = new VideoUploadJob();

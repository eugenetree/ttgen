const cron = require("node-cron");
const Logger = require("../../shared/utils/logger");
const configService = require("../../shared/infrastructure/config.service");
const renderVideoUseCase = require("./use-cases/render-video.use-case");

class VideoGenerationJob {
  constructor() {
    this.logger = new Logger("VideoGenerationJob");
  }

  async init() {
    const cronSchedule = configService.get("video.renderInterval");

    cron.schedule(cronSchedule, async () => {
      this.logger.info("Video generation job triggered");
      await this.runUseCase();
    });

    this.logger.info(
      `Video generation job initialized with schedule: ${cronSchedule}`,
    );

    this.logger.info("Running video generation job immediately");
    this.runUseCase();
  }

  async runUseCase() {
    try {
      await renderVideoUseCase.execute();
    } catch (error) {
      this.logger.error("Error in video generation job:", error);
    }
  }
}

// Export an instance instead of the class
module.exports = new VideoGenerationJob();

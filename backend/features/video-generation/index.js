const Logger = require('../../shared/utils/logger');
const videoGenerationJob = require('./video-generation.job');
const renderVideoUseCase = require('./use-cases/render-video.use-case');

class VideoGenerationFeature {
  constructor() {
    this.logger = new Logger('VideoGenerationFeature');
  }

  async init() {
    try {
      // Initialize and start job
      await videoGenerationJob.init();

      this.logger.info('Video generation feature initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize video generation feature', error);
      throw error;
    }
  }
}

// Export an instance instead of the class
module.exports = new VideoGenerationFeature(); 
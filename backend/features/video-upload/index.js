const Logger = require('../../shared/utils/logger');
const videoUploadJob = require('./video-upload.job');

class VideoUploadFeature {
  constructor() {
    this.logger = new Logger('VideoUploadFeature');
  }

  async init() {
    try {
      // Initialize and start job
      await videoUploadJob.init();

      this.logger.info('Video upload feature initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize video upload feature', error);
      throw error;
    }
  }
}

// Export an instance instead of the class
module.exports = new VideoUploadFeature(); 
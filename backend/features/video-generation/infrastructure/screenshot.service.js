const path = require('path');
const fs = require('fs').promises;
const Logger = require('../../../shared/utils/logger');
const ffmpeg = require('fluent-ffmpeg');

class ScreenshotService {
  constructor() {
    this.logger = new Logger('ScreenshotService');
  }

  async screenshot({ videoPath, outputPath, filename }) {
    try {
      // Ensure the output directory exists
      await fs.mkdir(outputPath, { recursive: true });

      return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
          .on('end', () => {
            this.logger.info(`Screenshot saved at ${path.join(outputPath, filename)}`);
            resolve();
          })
          .on('error', (err) => {
            this.logger.error('Error capturing screenshot:', err.message);
            reject(err);
          })
          .screenshots({
            timestamps: ['3'], // Capture at 3 seconds
            filename,
            folder: outputPath,
          });
      });
    } catch (error) {
      this.logger.error('Failed to take screenshot', error);
      throw error;
    }
  }
}

// Export an instance instead of the class
module.exports = new ScreenshotService(); 
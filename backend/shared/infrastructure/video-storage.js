const fs = require("fs").promises;
const path = require("path");
const Logger = require("../utils/logger");
const configService = require("./config.service");

class VideoStorage {
  constructor() {
    this.logger = new Logger("VideoStorage");
  }

  getVideoPath(videoId) {
    if (!videoId) {
      throw new Error("VideoId is required");
    }

    const videoPath = configService.get("video.outputPath");
    return path.join(process.cwd(), videoPath, `${videoId}.mp4`);
  }

  getScreenshotPath(videoId) {
    if (!videoId) {
      throw new Error("VideoId is required");
    }

    const screenshotPath = configService.get("video.screenshotsPath");
    return path.join(process.cwd(), screenshotPath, `${videoId}.png`);
  }

  async ensureOutputDir(outputPath) {
    const dir = path.dirname(outputPath);
    await fs.mkdir(dir, { recursive: true });
  }

  async ensureScreenshotsDir() {
    const dir = path.join(process.cwd(), this.screenshotsPath);
    await fs.mkdir(dir, { recursive: true });
  }
}

// Export an instance instead of the class
module.exports = new VideoStorage();

const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const fs = require("fs");

const videoScreenshotService = {
  async screenshot({ videoPath, outputPath, filename }) {
    // Ensure the output directory exists
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    ffmpeg(videoPath)
      .on("end", () => {
        console.log(`Screenshot saved at ${outputPath}/${filename}`);
      })
      .on("error", (err) => {
        console.error("Error capturing screenshot:", err.message);
      })
      .screenshots({
        timestamps: ["3"], // Capture at 3 seconds
        filename,
        folder: outputPath,
      });
  },
};

exports.videoScreenshotService = videoScreenshotService;
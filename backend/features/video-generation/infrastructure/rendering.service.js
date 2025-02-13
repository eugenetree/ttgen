const { bundle } = require("@remotion/bundler");
const {
  getCompositions,
  renderMedia,
  selectComposition,
} = require("@remotion/renderer");
const path = require("path");
const fs = require("fs").promises;
const Logger = require("../../../shared/utils/logger");

class RenderingService {
  constructor() {
    this.logger = new Logger("RenderingService");
  }

  async render(composition, outputPath) {
    try {
      // Bundle the video with caching
      const bundleLocation = await this.getBundleLocation();

      // Select composition using the proper method
      const selectedComposition = await selectComposition({
        serveUrl: bundleLocation,
        id: "english-test",
        inputProps: composition.props,
      });

      if (!selectedComposition) {
        throw new Error("Could not find composition");
      }

      let prevProgressPercentage = 0;

      // Render the video
      await renderMedia({
        composition: selectedComposition,
        serveUrl: bundleLocation,
        codec: "h264",
        outputLocation: outputPath,
        inputProps: {
          ...composition.props,
          randomValue: Date.now(),
          bgVideoIndex: Math.floor(Math.random() * 19), // 0-18
        },
        audioCodec: "mp3",
        concurrency: 1,
        timeoutInMilliseconds: 1000 * 60 * 5,
        envVariables: {
          TARGET_LANGUAGE: process.env.TARGET_LANGUAGE,
        },
        onProgress: ({ progress }) => {
          const nextProgressPercentage = Math.floor(progress * 100);
          if (nextProgressPercentage !== prevProgressPercentage) {
            this.logger.info(
              `Video rendering progress: ${nextProgressPercentage}%`,
            );
            prevProgressPercentage = nextProgressPercentage;
          }
        },
      });

      return true;
    } catch (error) {
      this.logger.error("Failed to render video", error);
      throw error;
    }
  }

  async getBundleLocation() {
    const bundleLocationFile = path.resolve(
      process.cwd(),
      "_storage/_temp/bundleLocation",
    );

    try {
      // Try to read previous bundle location
      const previousBundleLocation = await fs.readFile(
        bundleLocationFile,
        "utf-8",
      );

      // Clean up previous bundle if exists
      if (previousBundleLocation) {
        await fs
          .rm(previousBundleLocation, { recursive: true })
          .catch((error) => {
            if (error.code === "ENOENT") {
              this.logger.info("Previous bundle not found");
            }
          });
      }
    } catch (error) {
      this.logger.info("No previous bundle location found");
    }

    // Create new bundle
    const newBundleLocation = await bundle({
      entryPoint: path.resolve(process.cwd(), "frontend/src/index.ts"),
      publicDir: path.resolve(process.cwd(), "frontend/public"),
      webpackOverride: (config) => {
        return {
          ...config,
          output: {
            ...config.output,
            publicPath: "/frontend/public/",
          },
        };
      },
    });

    // Save new bundle location
    await fs.writeFile(bundleLocationFile, newBundleLocation);

    return newBundleLocation;
  }
}

// Export an instance instead of the class
module.exports = new RenderingService();

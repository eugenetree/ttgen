const path = require("path");
const fs = require("fs/promises");

class ConfigManager {
  #config = null;

  async init() {
    this.#config = await JSON.parse(
      await fs.readFile(path.resolve(process.cwd(), "./config.json")),
    );

    if (!this.#config?.lang) {
      throw new Error("'lang' property is not specified in 'config.js'");
    }

    if (path.basename(process.cwd()) !== "backend") {
      throw new Error(
        "index.js file should be run from 'backend' folder via 'node index.js'",
      );
    }

    if (!path.resolve(process.cwd(), "../storage/cookies.json")) {
      throw new Error(
        "'cookies.json' should be provided in /_storage directory",
      );
    }

    const videosJsonPath = path.resolve(
      process.cwd(),
      "../_storage/videos.json",
    );

    let videos;
    try {
      const rawJson = await fs.readFile(videosJsonPath);
      videos = JSON.parse(rawJson);
    } catch {
      throw new Error(
        "'videos.json' should be provided in /_storage directory.\n" +
          "it can be generated using /backend/scripts/generate-video-db-records.js",
      );
    }

    if (videos[0]?.targetLanguage !== this.#config.lang) {
      throw new Error(
        "videos language in 'videos.json' doesn't match with specified lang in config",
      );
    }
  }
}

exports.configManager = new ConfigManager();

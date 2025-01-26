const path = require("path");
const fs = require("fs/promises");

class ConfigManager {
  #config = null;

  async init() {
    if (path.basename(process.cwd()) !== "backend") {
      throw new Error(
        "index.js file should be run from 'backend' folder via 'node index.js'",
      );
    }

    this.#config = await fs
      .readFile(path.resolve(process.cwd(), "./config.json"))
      .then((data) => JSON.parse(data))
      .catch(() => {
        throw new Error("config.json file is not found or invalid");
      });

    if (!this.#config?.lang) {
      throw new Error("'lang' property is not specified in 'config.js'");
    }

    await fs
      .access(path.resolve(process.cwd(), "../_storage/cookies.json"), fs.F_OK)
      .catch(() => {
        throw new Error(
          "'cookies.json' should be provided in /_storage directory",
        );
      });

    const videosJsonPath = path.resolve(
      process.cwd(),
      "../_storage/videos.json",
    );

    const videos = await fs
      .readFile(videosJsonPath)
      .then((data) => JSON.parse(data))
      .catch(() => {
        throw new Error(
          "'videos.json' should be provided in /_storage directory.\n" +
            "it can be generated using /backend/scripts/generate-video-db-records.js",
        );
      });

    if (videos?.[0]?.targetLanguage !== this.#config.lang) {
      throw new Error(
        "videos language in 'videos.json' doesn't match with specified lang in config",
      );
    }

    const remotionFiles = [
      "check",
      "level_a1",
      "level_a2",
      "level_b1",
      "level_b2",
      "level_c1",
      "level_c2",
      "outro",
    ];

    const remotionFilesCheck = remotionFiles.map((file) =>
      fs.access(path.resolve(process.cwd(), `../public/${file}.mp3`), fs.F_OK),
    );

    await Promise.all(remotionFilesCheck).catch(() => {
      throw new Error(
        `something wrong with one of these files: ${remotionFiles}`,
      );
    });

    const NEETS_API_KEY = process.env.NEETS_API_KEY;
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!NEETS_API_KEY || !OPENAI_API_KEY) {
      throw new Error("NEETS_API_KEY and OPENAI_API_KEY should be provided");
    }
  }
}

exports.configManager = new ConfigManager();

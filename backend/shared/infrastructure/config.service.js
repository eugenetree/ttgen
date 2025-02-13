const fs = require("fs").promises;
const path = require("path");
const Logger = require("../utils/logger");
const { BaseError } = require("../utils/base-error");

class ConfigError extends BaseError {
  constructor(message, details = {}) {
    super(message, "CONFIG_ERROR", details);
  }
}

class ConfigService {
  #envValuesKeys = [
    "targetLanguage",
    "proxyServer",
    "proxyUsername",
    "proxyPassword",
  ];

  constructor() {
    this.logger = new Logger("ConfigService");
    this.config = {};
  }

  async init() {
    try {
      // Load environment variables from project root
      require("dotenv").config({
        path: path.resolve(process.cwd(), ".env"),
      });

      // Validate required environment variables
      this.validateEnvironment();

      // Load config file from root directory
      const configPath = path.resolve(process.cwd(), "config.json");
      const configFile = await fs.readFile(configPath, "utf8");
      this.config = JSON.parse(configFile);

      // Validate storage paths
      await this.validateStorage();

      // Validate required files
      await this.validateRequiredFiles();

      this.logger.info("Configuration loaded successfully");
    } catch (error) {
      this.logger.error("Failed to load configuration", error);
      throw error;
    }
  }

  validateEnvironment() {
    const requiredVars = ["TARGET_LANGUAGE"];
    const missingVars = requiredVars.filter((varName) => !process.env[varName]);

    if (missingVars.length > 0) {
      throw new ConfigError("Missing required environment variables", {
        missingVars,
      });
    }
  }

  async validateStorage() {
    const storagePath = this.get("database.storagePath");
    if (!storagePath) {
      throw new ConfigError("Storage path not configured");
    }

    const fullStoragePath = path.resolve(process.cwd(), storagePath);
    await fs.mkdir(fullStoragePath, { recursive: true });

    // Ensure videos.json exists or can be created
    const videosPath = path.join(
      fullStoragePath,
      this.get("database.filename"),
    );

    try {
      await fs.access(videosPath, fs.constants.F_OK);
    } catch {
      throw new ConfigError("Missing required file: videos.json", {
        path: videosPath,
      });
    }

    // Ensure cookies.json exists
    const cookiesPath = path.join(fullStoragePath, "cookies.json");
    try {
      await fs.access(cookiesPath, fs.constants.F_OK);
    } catch (error) {
      throw new ConfigError("Missing required file: cookies.json", {
        path: cookiesPath,
      });
    }
  }

  async validateRequiredFiles() {
    const requiredFiles = [
      "check",
      "level_a1",
      "level_a2",
      "level_b1",
      "level_b2",
      "level_c1",
      "level_c2",
      "outro",
    ];

    const publicPath = path.resolve(process.cwd(), "frontend/public");

    for (const file of requiredFiles) {
      const filePath = path.join(publicPath, `${file}.mp3`);
      try {
        await fs.access(filePath, fs.constants.F_OK);
      } catch {
        throw new ConfigError("Missing required audio file", {
          file: `${file}.mp3`,
        });
      }
    }
  }

  get(key) {
    if (this.#envValuesKeys.includes(key)) {
      const envKey = key.replace(/([A-Z])/g, "_$1").toUpperCase();
      return process.env[envKey];
    }

    const value = key
      .split(".")
      .reduce((obj, part) => obj && obj[part], this.config);

    if (value === undefined) {
      throw new ConfigError(`Required configuration key not found: ${key}`);
    }

    return value;
  }

  getStoragePath(filename) {
    const storagePath = this.get("database.storagePath");
    return path.resolve(process.cwd(), storagePath, filename);
  }
}

// Export singleton instance
module.exports = new ConfigService();

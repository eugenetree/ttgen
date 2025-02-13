const fs = require("fs").promises;
const path = require("path");
const Logger = require("../utils/logger");
const { NotFoundError } = require("../utils/base-error");
const configService = require("./config.service");
const VideoSchema = require("./video.schema");

class VideoRepository {
  constructor() {
    this.logger = new Logger("VideoRepository");
    this.data = null;
    this.filePath = null;
  }

  async init() {
    try {
      this.filePath = configService.getStoragePath(
        configService.get("database.filename"),
      );

      try {
        const fileContent = await fs.readFile(this.filePath, "utf8");
        this.data = JSON.parse(fileContent);
      } catch (error) {
        if (error.code === "ENOENT") {
          this.data = [];
          await this.persist();
        } else {
          throw error;
        }
      }

      this.logger.info("Video repository initialized successfully");
    } catch (error) {
      this.logger.error("Failed to initialize video repository", error);
      throw error;
    }
  }

  async persist() {
    try {
      await fs.writeFile(this.filePath, JSON.stringify(this.data, null, 2));
    } catch (error) {
      this.logger.error("Failed to persist repository", error);
      throw error;
    }
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Core repository methods
  async findOne(filter) {
    if (!this.data) throw new Error("Repository not initialized");

    const item = this.data.find((item) =>
      Object.entries(filter).every(([key, value]) => item[key] === value),
    );

    if (!item) {
      throw new NotFoundError("Video not found", { filter });
    }

    return { ...item };
  }

  async find(filter = {}) {
    if (!this.data) throw new Error("Repository not initialized");

    const items = this.data.filter((item) =>
      Object.entries(filter).every(([key, value]) => item[key] === value),
    );

    return items.map((item) => ({ ...item }));
  }

  async create(data) {
    if (!this.data) throw new Error("Repository not initialized");

    const validation = VideoSchema.validate(data);
    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.error}`);
    }

    const newItem = {
      id: this.generateId(),
      ...data,
      createdAt: new Date().toISOString(),
    };

    this.data.push(newItem);
    await this.persist();

    return { ...newItem };
  }

  async update(id, data) {
    if (!this.data) throw new Error("Repository not initialized");

    const index = this.data.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new NotFoundError("Video not found", { id });
    }

    const updatedItem = {
      ...this.data[index],
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };

    const validation = VideoSchema.validate(updatedItem);
    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.error}`);
    }

    this.data[index] = updatedItem;
    await this.persist();

    return updatedItem;
  }

  async delete(id) {
    if (!this.data) throw new Error("Repository not initialized");

    const index = this.data.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new NotFoundError("Video not found", { id });
    }

    const deletedItem = this.data[index];
    this.data.splice(index, 1);
    await this.persist();

    return { ...deletedItem };
  }

  // Query methods for finding videos
  async findByUserId(userId) {
    return this.find({ userId });
  }

  async findByStatus(status) {
    return this.find({ status });
  }

  async findPendingVideos() {
    return this.findByStatus("READY_FOR_RENDER");
  }

  async findRenderedNotUploadedVideos() {
    return this.findByStatus("RENDERED");
  }

  // Specialized queries
  async getLatestRenderedVideo() {
    const renderedVideos = await this.findByStatus("RENDERED");
    if (renderedVideos.length === 0) return null;

    return renderedVideos.sort(
      (a, b) => new Date(b.renderedAt) - new Date(a.renderedAt),
    )[0];
  }

  async getOldestRenderedNotUploadedVideo() {
    const videos = await this.findByStatus("RENDERED");
    const notUploaded = videos.filter((video) => !video.tiktokUploadDate);

    if (notUploaded.length === 0) return null;

    return notUploaded.sort(
      (a, b) => new Date(a.renderedAt) - new Date(b.renderedAt),
    )[0];
  }

  async getLatestUploadedToTiktokVideo() {
    const latestUploadedVideo = this.data
      .filter((video) => video.tiktokUploadDate)
      .sort(
        (a, b) => new Date(b.tiktokUploadDate) - new Date(a.tiktokUploadDate),
      )[0];

    return latestUploadedVideo || null;
  }

  // Status update methods
  async markVideoAsRendered(id, filePath) {
    return this.update(id, {
      status: "RENDERED",
      renderedAt: new Date().toISOString(),
    });
  }

  async markVideoAsUploaded(id) {
    return this.update(id, {
      status: "UPLOADED",
      tiktokUploadDate: new Date().toISOString(),
    });
  }
}

module.exports = new VideoRepository();

const Logger = require("../utils/logger");

class ResourceOrchestrator {
  constructor() {
    this.logger = new Logger("ResourceOrchestrator");
    this.isLocked = false;
  }

  isAvailable() {
    return !this.isLocked;
  }

  async acquireLock() {
    if (this.isLocked) {
      throw new Error("Resource is already locked");
    }

    this.isLocked = true;
    this.logger.info("Resource lock acquired");
  }

  async releaseLock() {
    this.isLocked = false;
    this.logger.info("Resource lock released");
  }
}

// Export an instance instead of the class
module.exports = new ResourceOrchestrator();

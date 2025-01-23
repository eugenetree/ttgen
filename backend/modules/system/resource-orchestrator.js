class ResourceOrchestrator {
  #isLocked = false;

  isAvailable() {
    return !this.#isLocked;
  }

  acquireLock() {
    this.#isLocked = true;
  }

  releaseLock() {
    this.#isLocked = false;
  }
}

exports.resourceOrchestrator = new ResourceOrchestrator();
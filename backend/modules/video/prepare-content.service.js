const { resourceOrchestrator } = require("../system/resource-orchestrator");
const { videoRepository } = require("./video.repository");
const { wordsForVideoService } = require("./word-generator.service");

const ENGLISH_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

const prepareContentService = {
  prepare: async () => {
    if (!resourceOrchestrator.isAvailable()) {
      console.log(`Orchestrator is busy.`);
      return;
    }

    const allVideos = await videoRepository.findAll();
    const notUploadedVideos = allVideos.filter(
      (video) =>
        video.status === "READY_FOR_UPLOAD" ||
        video.status === "READY_FOR_RENDER",
    );

    if (notUploadedVideos.length >= 5) {
      console.log(
        `No need to generate a new video, already have ${notUploadedVideos.length} videos ready to upload or render.`,
      );

      return;
    }

    await resourceOrchestrator.acquireLock();
    console.log("Start preparing video");

    const englishLevel =
      ENGLISH_LEVELS[Math.floor(Math.random() * ENGLISH_LEVELS.length)];

    const words = await wordsForVideoService.generate({
      englishLevel,
    });

    const createdVideoRecord = await videoRepository.create({
      words,
      englishLevel,
      status: "READY_FOR_RENDER",
      bgVideoIndex: Math.floor(Math.random() * 3), // 0, 1, 2
    });

    await resourceOrchestrator.releaseLock();
    console.log(`Created video record: ${JSON.stringify(createdVideoRecord)}`);
  },
};

exports.prepareContentService = prepareContentService;

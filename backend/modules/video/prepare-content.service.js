const { resourceService } = require("../_common/resource.service");
const { videoRenderService } = require("./video-render.service");
const { videoRepository } = require("./video.repository");
const { wordsForVideoService } = require("./word-generator.service");

const ENGLISH_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

const prepareContentService = {
  prepare: async () => {
    if (resourceService.isBusy) {
      console.log(`Resource service is busy.`);
      return;
    }

    const allVideos = await videoRepository.findAll();
    const readyForUploadVideos = allVideos.filter(
      (video) => video.status === "READY_FOR_UPLOAD",
    );

    if (readyForUploadVideos.length >= 5) {
      console.log(
        `No need to generate a new video, already have ${readyForUploadVideos.length} videos ready to upload`,
      );

      return;
    }

    resourceService.isBusy = true;
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
    });

    resourceService.isBusy = false;
    console.log(`Created video record: ${JSON.stringify(createdVideoRecord)}`);
  },
};

exports.prepareContentService = prepareContentService;

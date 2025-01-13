const { aiService } = require("../ai/ai.service");
const { videoRepository } = require("./video.repository");
const { wordsForVideoService } = require("./words-for-video.service");

const generateVideoService = {
  generate: async () => {
    const allVideos = await videoRepository.findAll();
    const readyToUploadVideos = allVideos.filter(
      (video) => video.status === "readyToUpload",
    );

    if (readyToUploadVideos.length >= 5) {
      console.log(
        `No need to generate a new video, already have ${readyToUploadVideos.length} videos ready to upload`,
      );

      return;
    }

    const words = await wordsForVideoService.generate({
      englishLevel: "C2",
    });

    console.log("Generated words:", JSON.stringify(words, null, 2));
  },
};

exports.generateVideoService = generateVideoService;

const path = require("path");
const { videoRepository } = require("./video.repository");
const { bundle } = require("@remotion/bundler");
const { renderMedia, selectComposition } = require("@remotion/renderer");
const fs = require("fs/promises");
const { resourceService } = require("../_common/resource.service");

const videoRenderService = {
  render: async () => {
    if (resourceService.isBusy) {
      console.log(`Resource service is busy.`);
      return;
    }

    const allVideos = await videoRepository.findAll();
    const readyForRenderVideos = allVideos.filter(
      (video) => video.status === "READY_FOR_RENDER",
    );

    if (!readyForRenderVideos?.[0]) {
      console.log(`No videos ready for render.`);

      return;
    }

    resourceService.isBusy = true;
    console.log("Start rendering video");

    const video = readyForRenderVideos[0];

    const audioPaths = video.words.map((word) => word.audioPath);
    await Promise.all(
      audioPaths.map((audioPath, index) => {
        return fs.copyFile(
          audioPath,
          path.resolve(process.cwd(), `../public/words/${index}.mp3`),
        );
      }),
    );

    const entrypoint = path.resolve(process.cwd(), "../src/index.ts");
    const videoName = `${video.id}.mp4`;
    const inputProps = readyForRenderVideos[0];
    const videoOutPath = path.resolve(
      process.cwd(),
      "../_storage/rendered",
      videoName,
    );

    const bundleLocation = await bundle({
      entryPoint: path.resolve(entrypoint),
    });

    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: "english-test",
      inputProps,
    });

    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: "h264",
      outputLocation: videoOutPath,
      onProgress: (progress) => console.log(progress),
      inputProps,
    });

    const updatedVideoRecord = videoRepository.update(video.id, {
      status: "READY_FOR_UPLOAD",
    });

    resourceService.isBusy = false;
    console.log(
      "Video rendering completed",
      JSON.stringify(updatedVideoRecord),
    );
  },
};

exports.videoRenderService = videoRenderService;

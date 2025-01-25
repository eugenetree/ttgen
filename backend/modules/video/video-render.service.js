const path = require("path");
const { videoRepository } = require("./video.repository");
const { bundle } = require("@remotion/bundler");
const { renderMedia, selectComposition } = require("@remotion/renderer");
const fs = require("fs/promises");
const { resourceOrchestrator } = require("../system/resource-orchestrator");
const { videoScreenshotService } = require("./video-screenshot.service");

const videoRenderService = {
  render: async () => {
    if (!resourceOrchestrator.isAvailable()) {
      console.log(`orchestrator is busy.`);
      return;
    }

    const allVideos = await videoRepository.findAll();
    const readyForRenderVideos = allVideos.filter(
      (video) => video.status === "READY_FOR_RENDER",
    );

    if (!readyForRenderVideos?.[0]) {
      console.log(`no videos ready for render.`);

      return;
    }

    await resourceOrchestrator.acquireLock();
    console.log("start rendering video");

    const video = readyForRenderVideos[0];

    const audioPaths = video.words.map((word) => word.audio);
    await Promise.all(
      audioPaths.map((audioPath, index) => {
        return fs.copyFile(
          audioPath,
          path.resolve(process.cwd(), `../public/words/${index}.mp3`),
        );
      }),
    );

    const videoName = `${video.id}.mp4`;
    const inputProps = { ...readyForRenderVideos[0], bgVideoIndex: 2 };
    const videoOutPath = path.resolve(
      process.cwd(),
      "../_storage/rendered",
      videoName,
    );

    const bundleLocation = await getBundleLocation();
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
      onProgress: ({ progress }) => console.log(progress),
      audioCodec: "mp3",
      inputProps,
    });

    await videoScreenshotService.screenshot({
      videoPath: videoOutPath,
      outputPath: path.resolve(process.cwd(), "../_storage/screenshots"),
      filename: `${video.id}.png`,
    });

    const updatedVideoRecord = await videoRepository.markAsRendered({
      id: video.id,
    });

    await resourceOrchestrator.releaseLock();
    console.log(
      "video rendering completed",
      JSON.stringify(updatedVideoRecord),
    );
  },
};

async function getBundleLocation() {
  const config = JSON.parse(
    await fs.readFile(path.resolve(process.cwd(), "db/config.json"), "utf-8"),
  );

  if (config.bundleLocation) {
    await fs.rm(config.bundleLocation, { recursive: true });
  }

  const bundleLocation = await bundle({
    entryPoint: path.resolve(path.resolve(process.cwd(), "../src/index.ts")),
  });

  fs.writeFile(
    path.resolve(process.cwd(), "db/config.json"),
    JSON.stringify({ ...config, bundleLocation }),
  );

  return bundleLocation;
}

exports.videoRenderService = videoRenderService;

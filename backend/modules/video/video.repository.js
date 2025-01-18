const fs = require("fs/promises");
const path = require("path");

const readVideosJson = async () => {
  const videos = await fs.readFile(
    path.join(process.cwd(), "db/videos.json"),
    "utf8",
  );
  return JSON.parse(videos);
};

const writeVideosJson = async (videos) => {
  await fs.writeFile(
    path.join(process.cwd(), "db/videos.json"),
    JSON.stringify(videos),
  );
};

const videoRepository = {
  findById: async (id) => {
    const videos = await readVideosJson();
    return videos.find((video) => video.id === id);
  },

  findAll: async () => {
    return await readVideosJson();
  },

  // data: {
  //   words: { en: string, ru: string, path: string, duration: string }[];
  //   englishLevel: string;
  //   status: "READY_FOR_RENDER" | "RENDER_IN_PROGRESS" | "READY_FOR_UPLOAD" | "UPLOADED";
  //   outputPath: string;
  // }
  create: async (data) => {
    const videos = await readVideosJson();

    const newVideo = { id: videos.length + 1, ...data };
    videos.push(newVideo);

    await writeVideosJson(videos);
    return newVideo;
  },

  update: async (id, data) => {
    const videos = await readVideosJson();
    const currentVideo = videos.find((video) => video.id === id);

    const updatedVideo = { ...currentVideo, ...data };
    const updatedVideos = videos.map((video) =>
      video.id === id ? updatedVideo : video,
    );

    await writeVideosJson(updatedVideos);
    return updatedVideo;
  },
};

exports.videoRepository = videoRepository;

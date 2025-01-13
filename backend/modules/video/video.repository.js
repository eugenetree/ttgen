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

  create: async (data) => {
    const videos = await readVideosJson();
    const newVideo = { id: videos.length + 1, ...data };
    videos.push(newVideo);
    await writeVideosJson(videos);
    return newVideo;
  },
};

exports.videoRepository = videoRepository;

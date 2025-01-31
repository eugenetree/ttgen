const fs = require("fs/promises");
const path = require("path");
const { z } = require("zod");

const wordSchema = z.object({
  sourceText: z.string(),
  targetText: z.string(),
  audio: z.string(),
});

const videoCreateSchema = z.object({
  id: z.number().optional(),
  sourceLanguage: z.literal("en"),
  targetLanguage: z.enum(["ru", "de"]),
  englishLevel: z.enum(["a1", "a2", "b1", "b2", "c1", "c2"]),
  words: z.array(wordSchema),
  status: z.enum(["READY_FOR_RENDER", "RENDERED"]),
  createdAt: z.coerce.date(),
  renderedAt: z.coerce.date().optional(),
});

const readVideosJson = async () => {
  const videos = await fs.readFile(
    path.join(process.cwd(), "../_storage/videos.json"),
    "utf8",
  );
  return JSON.parse(videos);
};

const writeVideosJson = async (videos) => {
  await fs.writeFile(
    path.join(process.cwd(), "../_storage/videos.json"),
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
    videoCreateSchema.parse(data);
    const videos = await readVideosJson();

    const newVideo = {
      id: videos.length + 1,
      uploads: [],
      renderedAt: null,
      ...data,
    };

    videos.push(newVideo);
    await writeVideosJson(videos);
    return newVideo;
  },

  addUpload: async (params) => {
    if (!params?.id) {
      throw new Error(
        "addUpload: video id is required",
        JSON.stringify(params),
      );
    }

    if (params?.platform !== "tiktok") {
      throw new Error(
        "addUpload: platform is required",
        JSON.stringify(params),
      );
    }

    const videos = await readVideosJson();
    const video = videos.find((video) => video.id === params.id);

    if (!video) {
      throw new Error("addUpload: video not found", JSON.stringify(params));
    }

    const upload = {
      platform: params.platform,
      date: new Date(),
    };

    video.uploads.push(upload);
    writeVideosJson(videos);

    return video;
  },

  markAsRendered: async (params) => {
    if (!params?.id) {
      throw new Error(
        "markAsRendered: video id is required",
        JSON.stringify(params),
      );
    }

    const videos = await readVideosJson();
    const video = videos.find((video) => video.id === params.id);

    if (!video) {
      throw new Error(
        "markAsRendered: video not found",
        JSON.stringify(params),
      );
    }

    video.status = "RENDERED";
    video.renderedAt = new Date();
    writeVideosJson(videos);

    return video;
  },

  markAsUploadedToTiktok: async (params) => {
    if (!params?.id) {
      throw new Error(
        "markAsUploadedToTiktok: video id is required",
        JSON.stringify(params),
      );
    }

    const videos = await readVideosJson();
    const video = videos.find((video) => video.id === params.id);

    if (!video) {
      throw new Error(
        "markAsUploadedToTiktok: video not found",
        JSON.stringify(params),
      );
    }

    video.tiktokUploadDate = new Date();
    await writeVideosJson(videos);

    return video;
  },

  getLatestRenderedVideo: async () => {
    const allVideos = await readVideosJson();
    const renderedVideos = allVideos.filter(
      (video) => video.status === "RENDERED",
    );

    if (renderedVideos.length === 0) {
      return null;
    }

    return renderedVideos.sort(
      (a, b) => new Date(b.renderedAt) - new Date(a.renderedAt),
    )[0];
  },

  getOldestRenderedNotUploadedVideo: async () => {
    const allVideos = await readVideosJson();
    const filteredVideo = allVideos.filter(
      (video) => video.status === "RENDERED" && !video.tiktokUploadDate,
    );

    if (filteredVideo.length === 0) {
      return null;
    }

    return filteredVideo.sort(
      (a, b) => new Date(a.renderedAt) - new Date(b.renderedAt),
    )[0];
  },

  getLatestUploadedToTiktokVideo: async () => {
    const allVideos = await readVideosJson();
    const latestUploadedVideo = allVideos
      .filter((video) => video.tiktokUploadDate)
      .sort(
        (a, b) => new Date(b.tiktokUploadDate) - new Date(a.tiktokUploadDate),
      )[0];

    return latestUploadedVideo || null;
  },
};

exports.videoRepository = videoRepository;

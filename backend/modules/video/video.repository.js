const fs = require("fs/promises");
const path = require("path");

/*
type Word = {
  sourceText: string;
  targetText: string;
  audio: string;
}

type Upload = {
  platform: "tiktok" | "youtube";
  date: Date;
}

type Video = {
  id: number;
  sourceLanguage: "en";
  targetLanguage: "de" | "ru";
  words: Word[];
  uploads: Upload[];
  status: "READY_FOR_RENDER" | "RENDERED";
  createdAt: Date;
  renderedAt: Date;
}
*/

const wordSchema = z.object({
  sourceText: z.string(),
  targetText: z.string(),
  audio: z.string(),
});

const uploadSchema = z.object({
  platform: z.enum(["tiktok", "youtube"]),
  date: z.coerce.date(),
});

const videoSchema = z.object({
  id: z.number(),
  sourceLanguage: z.literal("en"),
  targetLanguage: z.enum(["de", "ru"]),
  words: z.array(wordSchema),
  uploads: z.array(uploadSchema),
  status: z.enum(["READY_FOR_RENDER", "RENDERED"]),
  createdAt: z.coerce.date(),
  renderedAt: z.coerce.date(),
});

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
    videoSchema.parse(data);

    const videos = await readVideosJson();
    const newVideo = { id: videos.length + 1, ...data };
    videos.push(newVideo);

    await writeVideosJson(videos);
    return newVideo;
  },

  // update: async (id, data) => {
  //   const videos = await readVideosJson();
  //   const currentVideo = videos.find((video) => video.id === id);

  //   const updatedVideo = { ...currentVideo, ...data };
  //   const updatedVideos = videos.map((video) =>
  //     video.id === id ? updatedVideo : video,
  //   );

  //   await writeVideosJson(updatedVideos);
  //   return updatedVideo;
  // },

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

  getLatestRenderedVideo: async () => {
    const allVideos = await readVideosJson();
    const renderedVideos = allVideos.filter(
      (video) => video.status === "RENDERED",
    );

    if (renderedVideos.length === 0) {
      return null;
    }

    return renderedVideos.sort((a, b) => b.renderedAt - a.renderedAt)[0];
  },

  getLatestUploadedVideoForTiktok: async () => {
    const allVideos = await readVideosJson();
    const tiktokVideos = allVideos.filter((video) =>
      video.uploads.some((upload) => upload.platform === "tiktok"),
    );

    if (tiktokVideos.length === 0) {
      return null;
    }

    return tiktokVideos.sort(
      (a, b) => b.uploads[0].date - a.uploads[0].date,
    )[0];
  },
};

exports.videoRepository = videoRepository;

import { staticFile, Video } from "remotion";
import { useTime } from "remotion-time";

export const BgVideo = () => {
  const t = useTime();

  const Video1 = (
    <Video
      startFrom={t`4s`}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }}
      src={staticFile("bg.webm")}
    />
  );

  return Video1;
};

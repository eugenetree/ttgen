import { staticFile, Video } from "remotion";
import { useTime } from "remotion-time";
import { useInputProps } from "../../hooks/use-input-props";

export const BgVideo = () => {
  const t = useTime();
  const { bgVideoIndex } = useInputProps();

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
      src={staticFile(`bg${bgVideoIndex}.mov`)}
    />
  );

  return Video1;
};

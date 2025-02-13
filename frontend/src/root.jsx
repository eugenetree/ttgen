import { Composition, getInputProps } from "remotion";
import { EnglishTest } from "./english-test";
import { useConfig } from "./english-test/config/use-config";

export const RemotionRoot = () => {
  const { fps, duration } = useConfig();

  return (
    <>
      <Composition
        id="english-test"
        component={EnglishTest}
        width={1080}
        height={1920}
        fps={fps}
        durationInFrames={duration.total * fps}
      />
    </>
  );
};

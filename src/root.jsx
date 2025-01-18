import { Composition } from "remotion";
import { EnglishTest } from "./english-test";
import { useInputProps } from "./english-test/hooks/use-input-props";
import { useConfig } from "./english-test/config/use-config";

export const RemotionRoot = () => {
  const { fps, duration } = useConfig();

  console.log("duration.introScreen", duration.introScreen);
  console.log("duration.wordsScreen", duration.wordsScreen);
  console.log("duration.total", duration.total);
  console.log("duration.total + 10 * fps", duration.total + 10 * fps);

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

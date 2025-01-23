import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";

import { BgVideo } from "./components/bg-video/bg-video";
import { IntroScreen } from "./components/intro-screen";
import { useTime } from "remotion-time";
import { WordsScreen } from "./components/words-screen/words-screen";
import { useConfig } from "./config/use-config";

export const EnglishTest = () => {
  const t = useTime();
  const { duration } = useConfig();

  return (
    <Sequence>
      <BgVideo />
      <Audio src={staticFile("bg.mp3")} volume={0.2} />
      <AbsoluteFill style={{ background: "rgba(0,0,0,0.2)" }} />

      <Sequence durationInFrames={t`${duration.introScreen}s`}>
        <IntroScreen />
      </Sequence>

      <Sequence
        from={t`${duration.introScreen}s`}
        durationInFrames={t`${duration.wordsScreen}s`}
      >
        <WordsScreen />
      </Sequence>

      <AbsoluteFill
        style={{
          fontSize: 300,
          background: "lightblue",
          wordBreak: "break-all",
        }}
      >
        {"FUCK"}
      </AbsoluteFill>
    </Sequence>
  );
};

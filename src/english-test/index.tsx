import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";

import { BgVideo } from "./components/bg-video/bg-video";
import { IntroScreen } from "./components/intro-screen";
import { useTime } from "remotion-time";
import { WordsScreen } from "./components/words-screen/words-screen";
import { useConfig } from "./config/use-config";
import { OutroScreen } from "./components/outro-screen";

export const EnglishTest = () => {
  const t = useTime();
  const { duration } = useConfig();

  return (
    <Sequence>
      <BgVideo />
      <Audio src={staticFile("bg.mp3")} volume={0.2} />
      <AbsoluteFill style={{ background: "rgba(0,0,0,0.4)" }} />

      <Sequence durationInFrames={t`${duration.introScreen}s`}>
        <IntroScreen />
      </Sequence>

      <Sequence
        from={t`${duration.introScreen}s`}
        durationInFrames={t`${duration.wordsScreen}s`}
      >
        <WordsScreen />
      </Sequence>

      <Sequence
        from={t`${duration.introScreen + duration.wordsScreen}s`}
        durationInFrames={t`${duration.outroScreen}s`}
      >
        <OutroScreen />
      </Sequence>
    </Sequence>
  );
};

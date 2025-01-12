import { AbsoluteFill, Sequence } from "remotion";

import { BgVideo } from "./bg-video/bg-video";
import { IntroScreen } from "./intro-screen";
import { useTime } from "remotion-time";
import { WordsScreen } from "./words-screen/words-screen";

export const EnglishTest = () => {
  const t = useTime();

  return (
    <>
      <BgVideo />
      <AbsoluteFill style={{ background: "rgba(0,0,0,0.2)" }} />

      <Sequence durationInFrames={t`5s`}>
        <IntroScreen />
      </Sequence>

      <Sequence from={t`5s`} durationInFrames={t`36s`}>
        <WordsScreen />
      </Sequence>
    </>
  );
};

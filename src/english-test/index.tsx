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

      <AbsoluteFill>
        <div
          style={{
            position: "absolute",
            fontSize: 40,
            color: "white",
            fontFamily: "Arial",
            fontWeight: "bold",
            textTransform: "uppercase",
            bottom: 50,
            left: "50%",
            transform: "translateX(-50%)",
            padding: 20,
            border: "5px solid rgba(255,255,255,0.5)",
            background: "rgba(0,0,,0.25)",
            borderRadius: 15,
            // background: "red",
            opacity: .5
          }}
        >
          speak.english.
          {process.env.TARGET_LANGUAGE}
        </div>
      </AbsoluteFill>
    </Sequence>
  );
};

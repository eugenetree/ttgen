import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";

import { BgVideo } from "./components/bg-video/bg-video";
import { IntroScreen } from "./components/intro-screen";
import { useTime } from "remotion-time";
import { WordsScreen } from "./components/words-screen/words-screen";
import { useConfig } from "./config/use-config";
import { OutroScreen } from "./components/outro-screen";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export const EnglishTest = () => {
  const t = useTime();
  const frame = useCurrentFrame();
  const { duration } = useConfig();

  const tl = useRef<gsap.core.Timeline | null>(null);
  const bgVideoRef = useRef(null);
  const logoRef = useRef(null);

  useGSAP(() => {
    tl.current = gsap
      .timeline()
      .pause()
      .to(bgVideoRef.current, { duration: 0, scaleY: 2, scaleX: -2 })
      .to(bgVideoRef.current, {
        scaleY: 1,
        scaleX: -1,
        duration: 1,
        ease: "power4.out",
      })
      .from(logoRef.current, { y: 200, duration: 1, ease: "power4.out" }, "<");
  });

  tl.current?.time(frame / 30);

  console.log(bgVideoRef);

  return (
    <Sequence>
      <BgVideo videoRef={bgVideoRef} />
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
          ref={logoRef}
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
            opacity: 0.5,
          }}
        >
          speak.english.
          {process.env.TARGET_LANGUAGE}
        </div>
      </AbsoluteFill>
    </Sequence>
  );
};

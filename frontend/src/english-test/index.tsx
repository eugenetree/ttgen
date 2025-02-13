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
import AnimatedBackground from "../animated-background";
import { useInputProps } from "./hooks/use-input-props";

export const EnglishTest = () => {
  const t = useTime();
  const frame = useCurrentFrame();
  const { duration } = useConfig();
  const { randomValue } = useInputProps();

  const tl = useRef<gsap.core.Timeline | null>(null);
  const bgVideoRef = useRef(null);
  const logoRef = useRef(null);
  const topTextRef = useRef(null);

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
      .from(topTextRef.current, { y: -200, duration: 1, ease: "power4.out" }, "<")
      .from(logoRef.current, { y: 200, duration: 1, ease: "power4.out" }, "<");
  });

  tl.current?.time(frame / 30);

  return (
    <Sequence>
      {/* <BgVideo videoRef={bgVideoRef} /> */}
      <Audio src={staticFile("bg.mp3")} volume={0.2} />
      <AbsoluteFill style={{ background: "rgba(0,0,0,0.1)" }} />
      {/* <AbsoluteFill style={{ background: "rgba(255,255,255,0.1)" }} /> */}

      <AnimatedBackground frameCount={frame} startTimestamp={randomValue}/>

      <AbsoluteFill>
        <div
          ref={topTextRef}
          style={{
            position: "absolute",
            top: 100,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "1.5rem 2.5rem",
            background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(15px)",
            borderRadius: 20,
            border: "2px solid rgba(255,255,255,0.3)",
            boxShadow: "0 4px 30px rgba(0,0,0,0.4)",
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: "2.2rem",
            color: "white",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontWeight: "bold",
            textShadow: "0 2px 4px rgba(0,0,0,0.3)",
          }}
        >
          English is Easy
        </div>
      </AbsoluteFill>

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
            bottom: 100,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: "0.8rem",
            padding: "1.5rem 2.5rem",
            background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(15px)",
            borderRadius: 20,
            border: "2px solid rgba(255,255,255,0.3)",
            boxShadow: "0 4px 30px rgba(0,0,0,0.4)",
          }}
        >
          <div style={{
            fontSize: "2rem",
            fontWeight: "bold",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "white",
            fontFamily: "Arial, Helvetica, sans-serif",
            textShadow: "0 2px 4px rgba(0,0,0,0.3)",
          }}>
            speak
          </div>
          <div style={{
            fontSize: "2rem",
            fontWeight: "bold",
            color: "white",
            letterSpacing: "0.1em",
            fontFamily: "Arial, Helvetica, sans-serif",
            textShadow: "0 2px 4px rgba(0,0,0,0.3)",
          }}>
            ENGLISH
          </div>
          <div style={{
            fontSize: "2rem",
            fontWeight: "bold",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "white",
            fontFamily: "Arial, Helvetica, sans-serif",
            textShadow: "0 2px 4px rgba(0,0,0,0.3)",
          }}>
            {process.env.TARGET_LANGUAGE}
          </div>
        </div>
      </AbsoluteFill>
    </Sequence>
  );
};

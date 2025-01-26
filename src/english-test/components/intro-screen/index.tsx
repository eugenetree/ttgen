import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { useTime } from "remotion-time";
import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useInputProps } from "../../hooks/use-input-props";

export const IntroScreen = () => {
  const t = useTime();
  const frame = useCurrentFrame();
  const { englishLevel } = useInputProps();

  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const flagRef = useRef<HTMLDivElement>(null);

  const tl = useRef<gsap.core.Timeline | null>(null);

  const translations = {
    ru: ["проверь свое знание английского", "уровень"],
    de: ["prüfe deine", "Englischkenntnisse", "niveau"],
  };

  useGSAP(() => {
    tl.current = gsap
      .timeline()
      .pause()
      .to(titleRef.current, { opacity: 0, scale: 3, duration: 0 })
      .to(titleRef.current, {
        opacity: 1,
        scale: 1,
        duration: 1,
        ease: "power4.out",
      })
      .from(subtitleRef.current, { opacity: 0, y: -20, delay: 1.5 })
      .from(flagRef.current, { opacity: 0, y: 20 }, "<")
      .to(containerRef.current, { opacity: 0, duration: 1, delay: 1 });
  });

  tl.current?.time(frame / 30);

  return (
    <>
      <Audio src={staticFile(`check.mp3`)} volume={1} />
      <Sequence from={t`2.5s`}>
        <Audio
          src={staticFile(`level_${englishLevel.toLowerCase()}.mp3`)}
          volume={1}
        />
      </Sequence>

      <AbsoluteFill ref={containerRef}>
        <div
          ref={titleRef}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "max-content",
            opacity: 0,
          }}
        >
          <div
            style={{
              fontFamily: "Arial",
              fontSize: 64,
              textTransform: "uppercase",
              textAlign: "center",
              background: "rgba(255, 255, 255, 0.8)",
              padding: 48,
              borderRadius: "20px",
            }}
          >
            {translations[process.env.TARGET_LANGUAGE!][0]}
            <br />
            {translations[process.env.TARGET_LANGUAGE!][1]}
          </div>

          <div
            ref={flagRef}
            style={{
              position: "absolute",
              bottom: "calc(100% - 35px)",
              left: "50%",
              transform: "translateX(-50%)",
              width: 100,
              height: 100,
            }}
          >
            <Img src={staticFile("usa.svg")} />
          </div>
          <div
            ref={subtitleRef}
            style={{
              position: "absolute",
              top: "calc(100% - 20px)",
              left: "50%",
              transform: "translateX(-50%)",
              fontFamily: "Arial",
              fontSize: 64,
              textTransform: "uppercase",
              textAlign: "center",
              color: "white",
              background: "rgba(31, 31, 31, 1)",
              padding: 32,
              whiteSpace: "nowrap",
              borderRadius: "20px",
            }}
          >
            {translations[process.env.TARGET_LANGUAGE!][2]} {englishLevel}
          </div>
        </div>
      </AbsoluteFill>
    </>
  );
};

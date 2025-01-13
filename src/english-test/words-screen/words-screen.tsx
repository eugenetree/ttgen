import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { useTime } from "remotion-time";

export const WordsScreen = () => {
  const frame = useCurrentFrame();
  const t = useTime();

  const words = [
    {
      ru: "совпадение",
      en: "coincidence",
      duration: 1.344,
    },
    {
      ru: "обвинение",
      en: "accusation",
      duration: 1.296,
    },
    {
      ru: "достоверность",
      en: "credibility",
      duration: 1.08,
    },
    {
      ru: "решимость",
      en: "determination",
      duration: 1.44,
    },
    {
      ru: "препятствие",
      en: "obstacle",
      duration: 1.176,
    },
  ];

  const wordDuration = t`7s`;
  const currentWord = (() => {
    const index = Math.floor((frame - t`.5s`) / wordDuration);

    if (index === -1) {
      return words[0];
    }

    if (index >= words.length) {
      return words[words.length - 1];
    }

    return words[index];
  })();

  const containerRef = useRef<HTMLDivElement>(null);
  const ruTextRef = useRef<HTMLDivElement>(null);
  const enTextRef = useRef<HTMLDivElement>(null);
  const countdownOuterRef = useRef<HTMLDivElement>(null);
  const countdownInnerRef = useRef<HTMLDivElement>(null);

  const tl = useRef<gsap.core.Timeline>(null);
  useGSAP(() => {
    tl.current = gsap
      .timeline()
      .pause()
      .fromTo(containerRef.current, { opacity: 0 }, { opacity: 1 });

    words.forEach(() => {
      tl.current!.to(countdownInnerRef.current, {
        opacity: 1,
        width: 0,
        duration: 0,
      }) // reset
        .to(ruTextRef.current, { opacity: 0, y: 120, duration: 0 }) // reset
        .to(enTextRef.current, { opacity: 0, y: 120, duration: 0 }) // reset
        .to(countdownInnerRef.current, {
          width: "100%",
          duration: 3,
          ease: "linear",
        })
        .to(ruTextRef.current, { opacity: 1, y: 0, duration: 0.5 }, "<")
        .to(ruTextRef.current, { opacity: 0, y: -120, duration: 0.5 })
        .to(enTextRef.current, { opacity: 1, y: 0, duration: 0.5 }, "<")
        .to(enTextRef.current, { opacity: 0, delay: 3 })
        .to(countdownInnerRef.current, { opacity: 0, duration: 0.5 }, "<");
    });
  });

  tl.current?.time(frame / 30);
  tl.current?.pause();

  return (
    <>
      {words.map((_, index) => (
        <>
          <Sequence from={t`${7 * index + 4}s`}>
            <Audio src={staticFile(`words/${index + 1}.mp3`)} />
          </Sequence>

          <Sequence from={t`${7 * index + 0.5}s`} durationInFrames={t`3s`}>
            <Audio src={staticFile(`clock.mp3`)} />
          </Sequence>
        </>
      ))}

      <AbsoluteFill
        ref={containerRef}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "80%",
            height: 200,
            textAlign: "center",
            fontSize: 100,
            fontFamily: "Arial",
            background: "white",
            padding: "20px 40px",
            borderRadius: 10,
            marginBottom: 40,
            overflow: "hidden",
          }}
        >
          <div
            ref={ruTextRef}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              opacity: 0,
            }}
          >
            {currentWord.ru}
          </div>
          <div
            ref={enTextRef}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              opacity: 0,
            }}
          >
            {currentWord.en}
          </div>
        </div>

        <div
          ref={countdownOuterRef}
          style={{
            position: "relative",
            width: "50%",
            height: 40,
            background: "rgba(255, 255, 255, 0.4)",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <div
            ref={countdownInnerRef}
            style={{
              position: "absolute",
              inset: 0,
              background: "white",
              width: 0,
            }}
          />
        </div>
      </AbsoluteFill>
    </>
  );
};

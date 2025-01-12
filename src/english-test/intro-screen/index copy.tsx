import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { useTime } from "remotion-time";
import { Animated, Fade, Move, Scale } from "remotion-animated";
import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

export const IntroScreen = () => {
  const frame = useCurrentFrame();
  const t = useTime();

  const tl = useRef<gsap.core.Timeline>(null);
  useGSAP(() => {
    tl.current = gsap
      .timeline()
      .to(".box", {
        rotate: 360
      })
      .to(".box", {
        x: 200,
      })
  });

  tl.current?.time(frame / 60);

  const ROOT_ITEM_OPACITY_IN = interpolate(frame, [0, t`2s`], [0, 1], {
    easing: Easing.bezier(0.12, 1.03, 0.74, 1),
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const ROOT_ITEM_OPACITY_OUT = interpolate(frame, [t`4.5s`, t`5s`], [1, 0], {
    easing: Easing.bezier(0.12, 1.03, 0.74, 1),
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  return (
    <>
      <Audio src={staticFile("check.mp3")} />
      <Sequence from={t`2.5s`}>
        <Audio src={staticFile("lvlc2.mp3")} />
      </Sequence>

      <AbsoluteFill>
        {/* <Animated animations={[Fade({ to: 0, start: t`4.5s` })]}> */}
        <AbsoluteFill style={{ opacity: 0 }}>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "max-content",
            }}
          >
            <Animated
              animations={[
                Fade({ to: 1, initial: 0, duration: t`1s` }),
                Scale({ by: 1, initial: 3 }),
              ]}
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
                проверь свое знание
                <br />
                английского
              </div>

              <div
                style={{
                  position: "absolute",
                  bottom: "100%",
                  left: "50%",
                  transform: "translate(-50%, 50px)",
                }}
              >
                <Animated
                  in={t`2s`}
                  animations={[
                    Fade({ to: 1, initial: 0, start: t`2s` }),
                    Move({ y: -15, start: t`2s` }),
                  ]}
                >
                  <div
                    style={{
                      width: 100,
                      height: 100,
                    }}
                  >
                    <Img src={staticFile("usa.svg")} />
                  </div>
                </Animated>
              </div>

              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: "50%",
                  transform: "translate(-50%, -40px)",
                }}
              >
                <Animated
                  in={t`2s`}
                  animations={[
                    Fade({ to: 1, initial: 0, start: t`2s` }),
                    Move({ y: 15, start: t`2s` }),
                  ]}
                >
                  <div
                    style={{
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
                    уровень С2
                  </div>
                </Animated>
              </div>
            </Animated>
          </div>
        </AbsoluteFill>
        {/* DEBUG */}
        <AbsoluteFill style={{ background: "lightblue" }} />
        <div
          className="box"
          style={{
            position: "absolute",
            width: 200,
            height: 200,
            bottom: 0,
            background: "red",
          }}
        ></div>
        {/* </Animated> */}
      </AbsoluteFill>
    </>
  );
};

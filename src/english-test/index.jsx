import { AbsoluteFill, Audio, Img, Sequence, staticFile } from "remotion";
import { useTime } from "remotion-time";
import { Animated, Fade, Move, Scale } from "remotion-animated";

import { BgVideo } from "./bg-videos/bg-video";

export const EnglishTest = () => {
  const t = useTime();

  return (
    <>
      <Audio src={staticFile("check.mp3")} />
      <Sequence from={t`2.5s`}>
        <Audio src={staticFile("lvlc2.mp3")} />
      </Sequence>

      <AbsoluteFill>
        <AbsoluteFill>
          <BgVideo />
          <AbsoluteFill style={{ background: "rgba(0,0,0,0.2)" }} />
        </AbsoluteFill>

        <AbsoluteFill>
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
                // Move({ y: -50, start: t`2s` }),
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

              {/* <div
                style={{
                  position: "absolute",
                  fontSize: 120,
                  transform: "",
                  left: "50%",
                  bottom: "100%",
                  transform: "translateX(-50%)",
                }}
              >
                🇺🇸
              </div> */}

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

        <Animated
          in={1000}
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
              padding: 20,
            }}
          >
            проверь свое знание
            <br />
            английского
          </div>
        </Animated>

        {/* <Img
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            // right: 0,
            // bottom: 0,
            objectFit: "cover",
            width: "100%",
            height: "100%",
          }}
          src={staticFile("img.jpg")}
        /> */}
        {/* The current frame is {frame}.<span>132</span> */}
        {/* <div style={{ width: 50, height: 50, background: "black" }}/> */}
        {/* <span style={{ opacity }}>123</span> */}
        {/* <div
          style={{
            width: "50%",
            height: 50,
            position: "relative",
            border: "1px solid black",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              background: "red",
              width: `${opacity * 100}%`,
            }}
          />
        </div> */}
        <div style={{ fontSize: 400 }}>🇺🇸🇺🇦</div>
      </AbsoluteFill>
    </>
  );

  // return <AbsoluteFill style={{background: "red", opacity: (frame * 100/60)  / 100}}>123</AbsoluteFill>
};

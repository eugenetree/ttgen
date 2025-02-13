import {
  AbsoluteFill,
  Audio,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Video,
} from "remotion";
import { useCallback, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

export const OutroScreen = () => {
  const frame = useCurrentFrame();

  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const flagRef = useRef<HTMLDivElement>(null);

  const tl = useRef<gsap.core.Timeline | null>(null);

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

  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const { width, height } = useVideoConfig();

  // Process a frame
  const onVideoFrame = useCallback(
    (opacity: number) => {
      if (!canvas.current || !video.current) {
        return;
      }
      const context = canvas.current.getContext("2d");

      if (!context) {
        return;
      }

      context.drawImage(video.current, 0, 0, width, height);
      const imageFrame = context.getImageData(0, 0, width, height);
      const { length } = imageFrame.data;

      // If the pixel is very green, reduce the alpha channel
      for (let i = 0; i < length; i += 4) {
        const red = imageFrame.data[i + 0];
        const green = imageFrame.data[i + 1];
        const blue = imageFrame.data[i + 2];
        // if (green > red + 50 && green > blue + 50) {
        if (green > 100 && red < 100 && blue < 100) {
          imageFrame.data[i + 3] = opacity * 255;
        }
      }
      context.putImageData(imageFrame, 0, 0);
    },
    [height, width],
  );

  useEffect(() => {
    const { current } = video;
    if (!current || !current.requestVideoFrameCallback) {
      return;
    }
    let handle = 0;
    const callback = () => {
      onVideoFrame(0);
      handle = current.requestVideoFrameCallback(callback);
    };

    callback();

    return () => {
      current.cancelVideoFrameCallback(handle);
    };
  }, [onVideoFrame]);

  return (
    <>
      <Audio src={staticFile("outro.mp3")} volume={1} />
      <AbsoluteFill
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <AbsoluteFill style={{ opacity: 0 }}>
          <Video ref={video} src={staticFile("subscribe-outro.mp4")} />
        </AbsoluteFill>

        <AbsoluteFill>
          <canvas ref={canvas} width={width} height={height} />
        </AbsoluteFill>
      </AbsoluteFill>
    </>
  );
};

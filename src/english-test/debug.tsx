import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { useTime } from "remotion-time";

export const MyVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const t = useTime();

  const interpolated = interpolate(frame, [t`2s`, t`3s`], [0, 1], {
    easing: Easing.bezier(0.12, 1.03, 0.74, 1),
    extrapolateRight: "extend",
    // extrapolateLeft: "clamp",
    // extrapolateRight: "clamp",
  });

  console.log(interpolated);

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${interpolated})`,
        backgroundColor: "red",
      }}
    />
  );
};

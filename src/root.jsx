import { Composition } from "remotion";
import { EnglishTest } from "./english-test";
import { useTimeConfig } from "remotion-time";
import {
  linearTiming,
  springTiming,
  TransitionSeries,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";

const T = () => (
  <TransitionSeries>
    <TransitionSeries.Sequence durationInFrames={200}>
      <EnglishTest />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition
      timing={linearTiming({ durationInFrames: 30 })}
      presentation={slide()}
    />
    <TransitionSeries.Sequence durationInFrames={60}>
      <EnglishTest />
    </TransitionSeries.Sequence>
  </TransitionSeries>
);

export const RemotionRoot = () => {
  const config = useTimeConfig("41s @ 30fps");

  return (
    <>
      <Composition
        {...config}
        id="english-test"
        component={EnglishTest}
        width={1080}
        height={1920}
      />
    </>
  );
};

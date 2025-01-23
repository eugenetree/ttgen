import { useInputProps } from "../hooks/use-input-props";

export const useConfig = () => {
  const { words } = useInputProps();

  const introScreen = 5;
  const wordsScreen = 0.5 + words.length * 7 + 0.5;
  const outroScreen = 6;
  const total = introScreen + wordsScreen + outroScreen;

  return {
    fps: 30,
    duration: {
      introScreen,
      wordsScreen,
      outroScreen,
      total,
    },
  };
};

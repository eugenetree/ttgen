import { getInputProps } from "remotion";

export const useInputProps = () => {
  const passedInputProps = getInputProps();
  const defaultInputProps = {
    words: [
      { ru: "делегация", en: "dicksucker" },
      { ru: "автомобиль", en: "piskadriska" },
    ],
    englishLevel: "B2",
    bgVideoIndex: 2,
  };

  const inputProps =
    Object.getOwnPropertyNames(passedInputProps).length > 0
      ? passedInputProps
      : defaultInputProps;

  return inputProps as typeof defaultInputProps; // TODO
};

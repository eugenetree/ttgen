import { getInputProps } from "remotion";

export const useInputProps = () => {
  const passedInputProps = getInputProps();
  const defaultInputProps = {
    id: 1,
    sourceLanguage: "en",
    targetLanguage: "ru",
    englishLevel: "c1",
    words: [
      { targetText: "some random ", sourceText: "car" },
      { targetText: "автомобиль", sourceText: "piskadriska random" },
    ],
    bgVideoIndex: 20,
  };

  const inputProps =
    Object.getOwnPropertyNames(passedInputProps).length > 0
      ? passedInputProps
      : defaultInputProps;

  return inputProps as typeof defaultInputProps; // TODO
};

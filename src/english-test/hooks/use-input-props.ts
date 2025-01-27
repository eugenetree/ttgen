import { getInputProps } from "remotion";

export const useInputProps = () => {
  const passedInputProps = getInputProps();
  const defaultInputProps = {
    id: 1,
    sourceLanguage: "en",
    targetLanguage: "ru",
    englishLevel: "c1",
    words: [
      { targetText: "lebensmittelgeschäft", sourceText: "car" },
      { targetText: "автомобиль", sourceText: "piskadriska random" },
    ],
    bgVideoIndex: 2,
  };

  const inputProps =
    Object.getOwnPropertyNames(passedInputProps).length > 0
      ? passedInputProps
      : defaultInputProps;

  return inputProps as typeof defaultInputProps; // TODO
};

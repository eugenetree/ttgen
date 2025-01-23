import { getInputProps } from "remotion";

export const useInputProps = () => {
  const passedInputProps = getInputProps();
  const defaultInputProps = {
    words: [
      { ru: "делегация", en: "dicksucker" },
      { ru: "автомобиль", en: "piskadriska", path: 'dadsadasdsadsadsada/dsa/dsa/ads/as/dad/a/dsads/a/d/ads/ad/asd/ads/ads/sda' },
    ],
    englishLevel: "B2",
  };

  const inputProps =
    Object.getOwnPropertyNames(passedInputProps).length > 0
      ? passedInputProps
      : defaultInputProps;

  return inputProps as typeof defaultInputProps; // TODO
};

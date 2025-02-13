import { getInputProps } from "remotion";

export const useInputProps = () => {
  const passedInputProps = getInputProps();
  const defaultInputProps = {
    id: 1,
    sourceLanguage: "en",
    targetLanguage: "ru",
    englishLevel: "c1",
    words: [
      {
        "sourceText": "wash",
        "targetText": "мыть",
        "audio": "/Users/eugene/projects/ttvidgen/gen/_storage/voiced_words/wash.mp3"
      },
      {
        "sourceText": "tape",
        "targetText": "лента",
        "audio": "/Users/eugene/projects/ttvidgen/gen/_storage/voiced_words/tape.mp3"
      },
      {
        "sourceText": "document",
        "targetText": "документ",
        "audio": "/Users/eugene/projects/ttvidgen/gen/_storage/voiced_words/document.mp3"
      },
      {
        "sourceText": "tail",
        "targetText": "хвост",
        "audio": "/Users/eugene/projects/ttvidgen/gen/_storage/voiced_words/tail.mp3"
      },
      {
        "sourceText": "stadium",
        "targetText": "стадион",
        "audio": "/Users/eugene/projects/ttvidgen/gen/_storage/voiced_words/stadium.mp3"
      },
      {
        "sourceText": "exercise",
        "targetText": "упражнение",
        "audio": "/Users/eugene/projects/ttvidgen/gen/_storage/voiced_words/exercise.mp3"
      },
      {
        "sourceText": "tear",
        "targetText": "слеза",
        "audio": "/Users/eugene/projects/ttvidgen/gen/_storage/voiced_words/tear.mp3"
      },
      {
        "sourceText": "automobile",
        "targetText": "автомобиль",
        "audio": "/Users/eugene/projects/ttvidgen/gen/_storage/voiced_words/automobile.mp3"
      }
    ],
    words2: [
      { targetText: "some random", sourceText: "car" },
      { targetText: "автомобиль", sourceText: "piskadriska random" },
    ],
    bgVideoIndex: 100,
    renderedAt: "2025-02-01T09:57:53.603Z",
    randomValue: 200,
  };

  const inputProps =
    Object.getOwnPropertyNames(passedInputProps).length > 0
      ? passedInputProps
      : defaultInputProps;

  return inputProps as typeof defaultInputProps; // TODO
};

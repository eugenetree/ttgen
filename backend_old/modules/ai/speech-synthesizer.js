const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");
const { speechTranscriber } = require("./speech-transcriber");

const NEETS_API_KEY = process.env.NEETS_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

class SpeechSynthesizer {
  async generate(text) {
    for (let i = 0; i < 5; i++) {
      const { inputText, outputText, audio } =
        await this.#generateAndTranscribe(text);

      console.log(
        `ttsService: generate iteration ${i}, inputText: ${inputText}, outputText: ${outputText}`,
      );

      const isSimilar = this.#isTextSimilar({
        text1: inputText,
        text2: outputText,
      });

      if (isSimilar) {
        return audio;
      }

      console.log(
        `ttsService: texts are not similar. Trying again. Input: ${inputText}, Output: ${outputText}`,
      );
    }

    return null;
    // throw new Error("Failed to generate audio");
  }

  #generateAndTranscribe(text) {
    return fetch("https://api.neets.ai/v1/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": NEETS_API_KEY,
      },
      body: JSON.stringify({
        text,
        voice_id: "us-female-7",
        params: {
          model: "ar-diff-50k",
          temperature: 0.01,
        },
      }),
    }).then(async (ttsResponse) => {
      const arrayBuffer = await ttsResponse.arrayBuffer();
      const tempFilePath = path.join(
        process.cwd(),
        "../_storage/_temp/temp_audio.mp3",
      );

      fs.writeFileSync(tempFilePath, Buffer.from(arrayBuffer));
      const transcription = await speechTranscriber.transcribe(
        fs.createReadStream(tempFilePath),
      );

      return {
        inputText: text,
        outputText: transcription,
        audio: Buffer.from(arrayBuffer),
      };
    });
  }

  #isTextSimilar({ text1, text2, maxDiff = 1 }) {
    // If the lengths differ by more than maxDiff, return false immediately
    if (Math.abs(text1.length - text2.length) > maxDiff) {
      return false;
    }

    let differences = 0;

    // Compare characters in the words up to the length of the shorter word
    for (let i = 0; i < Math.min(text1.length, text2.length); i++) {
      if (text1[i] !== text2[i]) {
        differences++;
        if (differences > maxDiff) {
          return false;
        }
      }
    }

    // Add the length difference to the total differences
    differences += Math.abs(text1.length - text2.length);

    return differences <= maxDiff;
  }
}

exports.speechSynthesizer = new SpeechSynthesizer();

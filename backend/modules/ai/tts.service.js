// const API_KEY = "6a66add475f54bf39ffb180c3394dd95";
const OpenAI = require("openai");

const API_KEY = "";

const client = new OpenAI({
  apiKey: API_KEY,
});

const ttsService = {
  // getAudio: async (text) => {
  //   return fetch("https://api.neets.ai/v1/tts", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //       "X-API-Key": API_KEY,
  //     },
  //     body: JSON.stringify({
  //       text: text + "...",
  //       voice_id: "us-female-7",
  //       params: {
  //         model: "ar-diff-50k",
  //         temperature: 0.01,
  //       },
  //     }),
  //   })
  //     .then((response) => response.arrayBuffer())
  //     .catch((err) => console.error(err));
  // },
  getAudio: async (text) => {
    return client.audio.speech
      .create({
        model: "tts-1",
        voice: "coral",
        input: "..." + text + "...",
      })
      .then((response) => response.arrayBuffer());
  },
};

exports.ttsService = ttsService;

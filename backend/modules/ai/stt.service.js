const { OpenAI } = require("openai");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const client = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const sttService = {
  transcribe: async (audio) => {
    const transcription = await client.audio.transcriptions.create({
      file: audio,
      model: "whisper-1",
    });

    // trim '.' and the end
    return transcription?.text.slice(0, -1).toLowerCase();
  },
};

exports.sttService = sttService;

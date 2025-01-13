const { OpenAI } = require("openai");

const OPENAI_API_KEY =
  "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";

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

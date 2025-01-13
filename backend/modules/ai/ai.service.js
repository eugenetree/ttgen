const OpenAI = require("openai");

const API_KEY =
  "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";

const client = new OpenAI({
  apiKey: API_KEY,
});

const aiService = {
  chat: async (query) => {
    if (!query) {
      throw new Error("Message is required");
    }

    console.log(`Requesting AI with query: ${query}`);
    const res = await client.chat.completions.create({
      messages: [{ role: "user", content: query }],
      model: "gpt-4o",
      temperature: 0,
    });

    const message = res?.choices?.[0]?.message?.content;
    if (!message) {
      throw new Error(
        `Failed to generate message from AI: ${JSON.stringify(res, null, 2)}`,
      );
    }

    return message;
  },
};

exports.aiService = aiService;

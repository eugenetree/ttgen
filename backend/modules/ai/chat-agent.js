const OpenAI = require("openai");

const API_KEY = process.env.OPENAI_API_KEY;

const client = new OpenAI({
  apiKey: API_KEY,
});

class ChatAgent {
  async chat(query) {
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
  }
}

exports.chatAgent = new ChatAgent();

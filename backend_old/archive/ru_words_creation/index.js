// require("./modules/video/prepare-content.cron");
// require("./modules/video/video-render.cron");
// require("./modules/upload/video-upload.cron");

const fs = require("fs");
const OpenAI = require("openai");
const API_KEY = process.env.OPENAI_API_KEY;

const client = new OpenAI({
  apiKey: API_KEY,
});

class ChatAgent {
  async chat(query) {
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

const main = async () => {
  const chatAgent = new ChatAgent();
  const query1 = `приведи примеры слов на английском для уровня b1.
  нужно 5 слов.
  не используй слова: cat,dog,apple,table,chair,window,door,mother,horse,pen,milk,water,car,house,child,ball,candy,school,money,city,street,family,friend,tree,sun,river,bird,flower,music,kitten,sea,park, book, desk, clock, ball, kitten, milk, fish, moon.
  .ответь в формате 'русское слово|английское слово|русское слово|английское слово|' и так далее...`;

  // const query2 = `provide 8 examples of words in English for level A1. they should go with translations in Russian in format |english_word|russian_word|english_word|russian_word| and so on... Before writing your answer, check the following list of words and make sure for 100% you avoid them in your response: ${words.join(", ")}.`;
  const query3 =
    "give any random word in english and say what level it belongs to. (A1, A2, B1, B2, C1, C2)";
  const query4 =
    'word - "thorndike" - what level of english does it belong to? (A1, A2, B1, B2, C1, C2). ' +
    'if it\'s a name of something/somebody - just response with "null". ' +
    "if it's not - give me just level in your response. " +
    'if word is a plural, give me a singular form after level of word in format "level|singular_form". ' +
    'if word is an adjective derived from a noun, give me a response like "level|noun_form". ';

  const query5 =
    `I'm making a quiz where people have translate words from russian to english. ` +
    `But at first I want to find english words. ` +
    `I have word "posted". what level of english does it belong to? (A1, A2, B1, B2, C1, C2). ` +
    `level of english will be $level in your response` +
    `word "posted" is a $word` +
    `if word is suitable for quiz - respond with in format "$level|$word". ` +
    `if it's not - respond with "$level|$word". ` +
    `if it\'s a name of something/somebody - "$level|false". `;

  const getQuery = (word) => `
  I'm preparing words for quiz (russian to english words translation).
  I need to check if english word is suitable for the quiz.

  I have word "${word}".

If it's a name of something or somebody or related to name of something/somebody: return 'false|reason|word'
For plural nouns: return 'true#plural|level|plural-form|singular-form|russian-translation-of-singular-form'
If provided word is derived from its more popular version (like heaven - heavenly, addressed - address): return 'true#derived|level|less-popular-form|more-popular-form|russian-translation-of-more-popular-form'
For words requiring no changes: return 'true#raw|level|word|russian-translation'

Example responses:

Input: 'cats' → 'true|a1|singular-to-plural|cats|cat'
Input: 'American' → 'false|name of country|American'
Input: 'book' → 'true|a2|word'

Be very careful with word difficulty levels.(A1-C2) It's very important that they are correct.
respond with just the formatted string, no explanations.`;

  const words = require("./words.json").slice(5000);
  for (const word of words) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const response = await chatAgent.chat(getQuery(word));

    console.log(response);
    fs.writeFileSync("logs.txt", `${response}\n`, { flag: "a" }, (err) => {
      if (err) console.error(err);
    });

    const parsed = response.split("|");

    if (parsed.length < 3 || parsed.length > 5) {
      continue;
    }

    if (parsed[0] === "false") {
      continue;
    }

    if (parsed[0] === "true#plural") {
      add({
        level: parsed[1],
        enWord: parsed[3],
        ruWord: parsed[4],
      });

      continue;
    }

    if (parsed[0] === "true#derived") {
      add({
        level: parsed[1],
        enWord: parsed[3],
        ruWord: parsed[4],
      });

      continue;
    }

    if (parsed[0] === "true#raw") {
      add({
        level: parsed[1],
        enWord: parsed[2],
        ruWord: parsed[3],
      });

      continue;
    }
  }
};

main();

function add({ enWord, ruWord, level }) {
  if (ruWord.length < 3) {
    return;
  }

  const words = JSON.parse(fs.readFileSync("words-filtered.json"));

  if (words[level]?.[enWord]) {
    console.log(`Word ${enWord} already exists in level ${level}`);
    fs.writeFileSync(
      "logs.txt",
      `Word ${enWord} already exists in level ${level}\n`,
      { flag: "a" },
      (err) => {
        if (err) console.error(err);
      },
    );

    return;
  }

  words[level.toLowerCase()] = {
    ...words[level.toLowerCase()],
    [enWord]: ruWord,
  };
  fs.writeFileSync("words-filtered.json", JSON.stringify(words));
}

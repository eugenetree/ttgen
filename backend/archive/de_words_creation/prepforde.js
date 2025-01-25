const initital = require("./words_prepared_ru.json");

const output = {};

for (const englishLevel in initital) {
  output[englishLevel] = Object.keys(initital[englishLevel]);
}

require("fs").writeFileSync(
  "words_to_translate_to_de.json",
  JSON.stringify(output, null, 2),
);

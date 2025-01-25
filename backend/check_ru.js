const words = require("./words_prepared_ru.json");

const check = {};

for (const englishLevel in words) {
  for (const ruWord of Object.values(words[englishLevel])) {
    if (!check[ruWord]) {
      check[ruWord] = 0;
    }

    check[ruWord]++;
  }
}

// console.log(JSON.stringify(check, null, 2));
console.log(Object.entries(check).filter(([key, value]) => value > 1));

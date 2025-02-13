const words = require("./words_prepared_ru.json");

// { "обмен": [ { level: "c1", word: "exchange" } ]}
const check = {};

for (const englishLevel in words) {
  for (const [enWord, ruWord] of Object.entries(words[englishLevel])) {
    if (!check[ruWord]) {
      check[ruWord] = [{ level: englishLevel, word: enWord }];
      continue;
    }

    check[ruWord].push({ level: englishLevel, word: enWord });
  }
}

// console.log(JSON.stringify(check, null, 2));
// console.log(Object.entries(check).filter(([key, value]) => value > 1));

// console.log(Object.entries(check).filter(([key, value]) => value.length > 1));

const levels = {
  a1: 0,
  a2: 1,
  b1: 2,
  b2: 3,
  c1: 4,
  c2: 5,
};

const filteredWords = structuredClone(words);
for (const [ruWord, matches] of Object.entries(check)) {
  if (matches.length === 1) {
    continue;
  }

  const sortedMatches = matches.sort((a, b) => {
    return levels[a.level] - levels[b.level];
  });

  const itemsToDelete = sortedMatches.slice(1);
  for (const itemToDelete of itemsToDelete) {
    delete filteredWords[itemToDelete.level][itemToDelete.word];
  }

  require("fs").writeFileSync(
    "words_prepared_ru.json",
    JSON.stringify(filteredWords, null, 2),
  );
}

// const test = [
//   { x: 1, level: "c1" },
//   { x: 2, level: "a1" },
//   { x: 3, level: "b2" },
// ];

// console.log(
//   test.sort((a, b) => {
//     console.log(a, b, levels[a.level], levels[b.level]);
//     return levels[a.level] - levels[b.level];
//   }),
// );

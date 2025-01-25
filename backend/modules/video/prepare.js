const fs = require("fs");

function prepare() {
  const data = JSON.parse(fs.readFileSync("file.json"));

  const levels = Object.keys(data);

  // Find levels with enough unused words
  const validLevels = levels.filter((level) => {
    const unusedWords = Object.entries(data[level]).filter(
      ([_, info]) => !info.used,
    );
    return unusedWords.length >= 8;
  });

  if (validLevels.length === 0) {
    console.log("No valid levels found");
    return getRandomWords(data);
  }

  // Pick random level from valid ones
  const randomLevel =
    validLevels[Math.floor(Math.random() * validLevels.length)];

  const unusedWords = data[random]

  const unusedWords = Object.entries(data[randomLevel])
    .filter(([_, info]) => !info.used)
    .map(([word, info]) => ({
      word,
      level: randomLevel,
      ...info,
    }));

  // Select 8 random words
  const selectedWords = [];
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * unusedWords.length);
    selectedWords.push(unusedWords[randomIndex]);
    data[randomLevel][unusedWords[randomIndex].word].used = true;
    unusedWords.splice(randomIndex, 1);
  }

  return selectedWords;
}

prepare();

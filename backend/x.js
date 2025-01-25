const fs = require('fs');

const data = JSON.parse(fs.readFileSync('file.json'));

for (const level in data) {
 for (const word in data[level]) {
   data[level][word] = {
     ru: data[level][word],
     used: false
   };
 }
}

fs.writeFileSync('file.json', JSON.stringify(data, null, 2));
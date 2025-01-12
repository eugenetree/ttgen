const { getAudioDurationInSeconds } = require("get-audio-duration");

const f = async () => {
  for (const i of [1, 2, 3, 4, 5]) {
    await getAudioDurationInSeconds(`public/words/${i}.mp3`).then(
      (duration) => {
        console.log(duration);
      },
    );
  }
};

f();
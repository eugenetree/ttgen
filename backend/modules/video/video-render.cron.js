const cron = require("node-cron");
const { videoRenderService } = require("./video-render.service");

const isOddMinute = () => {
  const currentMinute = new Date().getMinutes();
  return currentMinute % 2 === 1;
};

cron.schedule("* * * * *", () => {
  if (isOddMinute()) {
    return;
  }

  videoRenderService.render();
});

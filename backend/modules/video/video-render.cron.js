const cron = require("node-cron");
const { videoRenderService } = require("./video-render.service");

videoRenderService.render();

cron.schedule("* * * * *", () => {
  // videoRenderService.render();
});

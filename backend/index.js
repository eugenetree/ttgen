// require("./modules/upload/video-upload.cron");
// require("./modules/video/video-render.cron");

const { configManager } = require("./modules/config/config-manager");

(async () => {
  await configManager.init();
})();

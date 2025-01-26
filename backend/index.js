const path = require("path");
require("dotenv").config({ path: path.resolve(process.cwd(), "../.env") });

const { configManager } = require("./modules/config/config-manager");

(async () => {
  await configManager.init();
  require("./modules/video/video-render.cron");
  require("./modules/upload/video-upload.cron");
})();

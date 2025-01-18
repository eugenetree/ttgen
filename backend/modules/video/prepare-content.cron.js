const cron = require("node-cron");
const { prepareContentService } = require("./prepare-content.service");

cron.schedule("* * * * *", () => {
  prepareContentService.prepare();
});
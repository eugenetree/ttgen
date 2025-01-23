const cron = require("node-cron");
const { prepareContentService } = require("./prepare-content.service");

const isEvenMinute = () => {
  const currentMinute = new Date().getMinutes();
  return currentMinute % 2 === 0;
};

cron.schedule("* * * * *", () => {
  if (isEvenMinute()) {
    return;
  }

  prepareContentService.prepare();
});
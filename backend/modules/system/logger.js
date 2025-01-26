const pino = require("pino");
const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});

class Logger {
  constructor({ context = "" }) {
    this.context = context;
  }

  info(message) {
    logger.info(message);
  }
}

exports.Logger = Logger;

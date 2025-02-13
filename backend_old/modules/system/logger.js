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
  constructor(context = "default-context") {
    this.context = context;
  }

  info(message) {
    logger.info(`${this.context}: ${message}`);
  }
}

exports.Logger = Logger;

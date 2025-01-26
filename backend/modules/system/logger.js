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

  info(message, data) {
    logger.info(`${this.context}: ${message}`, data);
  }
}

exports.Logger = Logger;

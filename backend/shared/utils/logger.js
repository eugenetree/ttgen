class Logger {
  constructor(context) {
    this.context = context;
  }

  formatMessage(message) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${this.context}] ${message}`;
  }

  info(message) {
    console.log(this.formatMessage(message));
  }

  error(message, error) {
    console.error(this.formatMessage(message));
    if (error) {
      console.error(error);
    }
  }

  warn(message) {
    console.warn(this.formatMessage(message));
  }

  debug(message) {
    if (process.env.DEBUG) {
      console.debug(this.formatMessage(message));
    }
  }
}

module.exports = Logger; 
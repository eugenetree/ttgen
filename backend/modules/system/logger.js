class Logger {
  constructor({ context = "" }) {
    this.context = context;
  }

  info(message) {
    this.log(message);
  }

  #log(message) {
    console.log(`[LOG] ${this.context} : ${message}`);
  }
}

exports.Logger = Logger;

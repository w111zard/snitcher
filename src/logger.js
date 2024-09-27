const chalk = require('chalk');

class Logger {
  success(message) {
    console.log(chalk.green('[SUCCESS]:'), message);
  }

  info(message) {
    console.log(chalk.blue('[INFO]:'), message);
  }

  warn(message) {
    console.log(chalk.yellow('[WARN]:'), message);
  }

  error(message) {
    console.log(chalk.red('[ERROR]:'), message);
  }
}

module.exports = Logger;
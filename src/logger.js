const chalk = require('chalk');

class Logger {
  success() {
    console.log(chalk.green('[SUCCESS]:'), ...arguments);
  }

  info() {
    console.log(chalk.blue('[INFO]:'), ...arguments);
  }

  warn() {
    console.log(chalk.yellow('[WARN]:'), ...arguments);
  }

  error() {
    console.log(chalk.red('[ERROR]:'), ...arguments);
  }
}

module.exports = Logger;
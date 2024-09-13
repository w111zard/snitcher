const chalk = require('chalk');

class Logger {
  success(message) {
    console.log(`${chalk.bgGreen.black('SUCCESS')}: ${message}`)
  }

  error(message) {
    console.log(`${chalk.bgRed.black('ERROR')}: ${message}`)
  }

  warn(message) {
    console.log(`${chalk.bgYellow.black('WARN')}: ${message}`)
  }

  info(message) {
    console.log(`${chalk.bgBlue.black('INFO')}: ${message}`)
  }
}

module.exports = Logger
const snitcher = require('./snitcher');

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv)).argv;

snitcher(argv, (err) => {
  if (err) {
    return console.log(err.message);
  }
  console.log('Done!');
});
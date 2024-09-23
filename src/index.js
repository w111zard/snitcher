#!/usr/bin/env node
const snitcher = require('./snitcher');

function readArguments() {
  const yargs = require('yargs/yargs');
  const { hideBin } = require('yargs/helpers');
  const argv = yargs(hideBin(process.argv)).argv;

  const options = {};

  const file = argv?._[0];
  if (!file) {
    console.log('File was not provided!');
    process.exit(1);
  }
  options.file = file;

  const mode = argv.m || argv.mode;
  if (mode) {
    options.mode = mode;
  }

  const concurrency = argv.concurrency;
  if (concurrency) {
    options.concurrency = concurrency;
  }

  return options;
}

snitcher(readArguments(), (err) => {
  if (err) {
    return console.log(err.message);
  }
  console.log('Done!');
});
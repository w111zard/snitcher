#!/usr/bin/env node

const Snitcher = require('./snitcher');
const { getArgs, getLinks , resolveFilePath } = require('./utils/common');

function start() {
  const { file, mode, concurrency, help } = getArgs();

  if (help) {
    console.log('Usage: snitcher [options] <file>');
    console.log(`  -m, --mode\tAsync execution mode
    (s - sequential, p - parallel, lp - limited parallel, tq - task queue)\n`);
    console.log('  -c, --concurrency Maximum number of parallel async operations');
    return process.exit(0);
  }

  if (!file) {
    console.log('Please, provide file containing links!');
    return process.exit(1);
  }

  if (mode && !Snitcher.getModes()[mode]) {
    console.log('Invalid mode');
    return process.exit(1);
  }

  if (concurrency && concurrency < 1) {
    console.log('Concurrency must be greater than 0');
    return process.exit(1);
  }

  getLinks(resolveFilePath(file), (err, links) => {
    if (err) {
      console.log(err.message);
      process.exit(1);
    }

    const snitcher = new Snitcher({ mode, concurrency });
    snitcher.process(links, (err) => {
      if (err) {
        console.log('Error:');
        console.log(err);
      }
      else {
        console.log('Done!');
      }
    });
  });
}

start();
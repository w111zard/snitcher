#!/usr/bin/env node

const Snitcher = require('./snitcher');
const { getArgs, getLinks , resolveFilePath } = require('./utils/common');
const fs = require('fs');

function start() {
  const { file, mode, concurrency, destination, help } = getArgs();

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

  if (destination) {
    try {
      fs.accessSync(destination);
    } catch {
      console.log('Invalid destination');
      return process.exit(1);
    }
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

    const snitcher = new Snitcher({
      mode,
      concurrency,
      destination
    });

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

// start();

const Logger = require('./logger');
const logger = new Logger();
logger.info('My message');
logger.success('My message');
logger.warn('My message');
logger.error('My message');

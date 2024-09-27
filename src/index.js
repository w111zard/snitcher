#!/usr/bin/env node

const Snitcher = require('./snitcher');
const Logger = require('./logger');
const { getArgs, getLinks , resolveFilePath } = require('./utils/common');
const fs = require('fs');
const emoji = require('node-emoji');

function start() {
  const { file, mode, concurrency, destination, help } = getArgs();

  const log = new Logger();

  if (help) {
    log.info('Usage: snitcher [options] <file>');
    log.info(`  -m, --mode\tAsync execution mode
    (s - sequential, p - parallel, lp - limited parallel, tq - task queue)\n`);
    log.info('  -c, --concurrency Maximum number of parallel async operations');
    log.info('  -d, --destination Destination for result files');
    return process.exit(0);
  }

  if (!file) {
    log.error('Please, provide file containing links!');
    return process.exit(1);
  }

  if (destination) {
    try {
      fs.accessSync(destination);
    } catch {
      log.error('Invalid destination');
      return process.exit(1);
    }
  }

  if (mode && !Snitcher.getModes()[mode]) {
    log.error('Invalid mode');
    return process.exit(1);
  }

  if (concurrency && concurrency < 1) {
    log.error('Concurrency must be greater than 0');
    return process.exit(1);
  }

  getLinks(resolveFilePath(file), (err, links) => {
    if (err) {
      log.error(err.message);
      process.exit(1);
    }

    const snitcher = new Snitcher({
      mode,
      concurrency,
      destination,
      logger: log,
    });

    snitcher.process(links, (err) => {
      if (err) {
        log.error(err);
      }
      else {
        log.success(emoji.get('checkered_flag'), 'Done!');
      }
    });
  });
}

start();
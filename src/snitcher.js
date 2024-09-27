const { executeSequentially, executeParallel, executeLimitedParallel} = require('./utils/async');
const TaskQueue = require('./utils/task-queue');
const Utils = require('./utils/common');
const path = require('path');
const fs = require('fs');
const emoji = require('node-emoji');

const SEQUENTIAL_MODE = 's';
const PARALLEL_MODE = 'p';
const LIMITED_PARALLEL_MODE = 'lp';
const TASK_QUEUE_MODE = 'tq';
const DEFAULT_CONCURRENCY = 4;

class Snitcher {
  constructor(options) {
    this.mode = options?.mode || SEQUENTIAL_MODE;
    this.concurrency = options?.concurrency || DEFAULT_CONCURRENCY;
    this.destination = options?.destination || path.resolve(process.cwd());
    this.logger = options?.logger || console;
    this.links = [];
  }

  process(links, callback) {
    // Remember Zalgo?
    if (!links || !links.length) return process.nextTick(() => callback());

    this.links = links;
    this.handleLinks(callback);
  }

  handleLinks(callback) {
    switch (this.mode) {
      case SEQUENTIAL_MODE:
        this.logger.info(emoji.get('rocket'), 'Started using sequential iteration pattern');
        return executeSequentially(this.links, this.handleLink.bind(this), callback);

      case PARALLEL_MODE:
        this.logger.info(emoji.get('rocket'), 'Started using parallel execution pattern');
        return executeParallel(this.links, this.handleLink.bind(this), callback);

      case LIMITED_PARALLEL_MODE:
        this.logger.info(emoji.get('rocket'), 'Started using limited parallel execution ' +
          'pattern with concurrency of', this.concurrency);
        return executeLimitedParallel(this.links, this.concurrency, this.handleLink.bind(this), callback);

        case TASK_QUEUE_MODE:
          return this.handleUsingTaskQueue.call(this, callback);
    }
  }

  getStatistics(link, callback) {
    Utils.download(link, (err, html) => {
      const text = Utils.getTextFromHTML(html);
      const words = Utils.getWordsFromText(text);
      const occurrence = Utils.calculateOccurrence(words);

      callback(null, occurrence);
    });
  }

  saveStatistics(link, stats, callback) {
    const data = {
      resource: link,
      statistics: stats,
    };

    const file = String(Date.now()) + '.json';
    const filePath = path.resolve(this.destination, file);

    fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
      if (err) return callback(err);

      this.logger.success(`${emoji.get('white_check_mark')} ${link.slice(0, 80)}`);
      callback(null, data);
    });
  }

  handleLink(link, callback) {
    this.logger.info(`${emoji.get('hammer_and_wrench')} Processing: ${link.slice(0, 80)}...`);

    this.getStatistics(link, (err, stats) => {
      if (err) {
        this.logger.error(`${emoji.get('cross_mark')} ${link.slice(0, 80)}...`);
        return callback(err);
      }

      this.saveStatistics(link, stats, callback);
    });
  }

  handleUsingTaskQueue(callback) {
    const q = new TaskQueue(this.concurrency);
    this.links.forEach(link => q.push(this.handleLink.bind(this), link));
    q.on('error', (err) => {
      console.log(err);
    });
    q.on('complete', () => {
      callback();
    });
  }

  static getModes() {
    return {
      [SEQUENTIAL_MODE]: 'sequential',
      [PARALLEL_MODE]: 'parallel',
      [LIMITED_PARALLEL_MODE]: 'limited parallel',
      [TASK_QUEUE_MODE]: 'using task queue',
    };
  }
}

module.exports = Snitcher;
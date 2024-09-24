const { executeSequentially, executeParallel, executeLimitedParallel} = require('./utils/async');
const Utils = require('./utils/common');
const path = require('path');
const fs = require('fs');

const SEQUENTIAL_MODE = 's';
const PARALLEL_MODE = 'p';
const LIMITED_PARALLEL_MODE = 'lp';
const TASK_QUEUE_MODE = 'tq';
const DEFAULT_CONCURRENCY = 2;

class Snitcher {
  constructor(options) {
    this.mode = options?.mode || PARALLEL_MODE;
    this.concurrency = options?.concurrency || DEFAULT_CONCURRENCY;
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
        return executeSequentially(this.links, this.handleLink.bind(this), callback);

      case PARALLEL_MODE:
        return executeParallel(this.links, this.handleLink.bind(this), callback);

      case LIMITED_PARALLEL_MODE:
        return executeLimitedParallel(this.links, this.concurrency, this.handleLink.bind(this), callback);
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
    const filePath = path.join(process.cwd(), file);

    fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
      if (err) return callback(err);

      console.log(`Finished: ${link.slice(0, 80)}`);
      callback(null, data);
    });
  }

  handleLink(link, callback) {
    console.log(`Processing: ${link.slice(0, 80)}`);

    this.getStatistics(link, (err, stats) => {
      if (err) {
        console.log(`Error: ${link.slice(0, 80)}`);
        return callback(err);
      }

      this.saveStatistics(link, stats, callback);
    });
  }
}

module.exports = Snitcher;
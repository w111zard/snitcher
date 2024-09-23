const path = require('path');
const fs = require('fs');
const Utils = require('./common');
const TaskQueue = require('./task-queue');

const SEQUENTIAL = 's';
const PARALLEL = 'p';
const LIMITED = 'lp';
const TASK_QUEUE = 'tq';
const DEFAULT_CONCURRENCY = 2;

function getLinks(file, callback) {
  const filePath = path.join(process.cwd(), file);

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return callback(new Error('Can not read file'));

    const linksFromFile = data
      .split('\n')
      .map(l=> l.trim())
      .filter(l => l.length);

    if (!linksFromFile.length) return callback(new Error('Links were not found'));

    const links = Utils.removeDuplicates(linksFromFile);

    for (const link of links) {
      if (!Utils.isURL(link)) return callback(new Error(`Invalid URL: '${link}'`));
    }

    callback(null, links);
  });
}

function getStatistics(link, callback) {
  Utils.download(link, (err, html) => {
    const text = Utils.getTextFromHTML(html);
    const words = Utils.getWordsFromText(text);
    const occurrence = Utils.calculateOccurrence(words);

    callback(null, occurrence);
  });
}

function saveStatistics(link, stats, callback) {
  const data = {
    resource: link,
    statistics: stats,
  };

  const file = String(Date.now()) + '.json';
  const filePath = path.join(process.cwd(), file);

  fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
    if (err) return callback(err);

    callback(null, data);
  });
}

function handleLink(link, callback) {
  getStatistics(link, (err, stats) => {
    if (err) return callback(err);

    saveStatistics(link, stats, callback);
  });
}

function handleLinksSequentially(links, callback) {
  function iterate() {
    const currentLink = links.shift();
    if (!currentLink) return callback();

    handleLink(currentLink, (err) => {
      if (err) {
        console.log(`Error while processing: ${currentLink}`);
      }
      else {
        console.log(`Processed: ${currentLink}`);
      }
      iterate();
    });
  }

  iterate();
}

function handleLinksParallel(links, callback) {
  let completed = 0;

  function done(err, result) {
    if (err) {
      console.log(err);
    }
    else {
      console.log(`Completed: ${result.resource}`);
    }

    if (++completed === links.length) {
      return callback();
    }
  }

  links.forEach(link => handleLink(link, done));
}

function handleLinksLimitedParallel(links, options, callback) {
  let completed = 0;
  let index = 0;
  let running = 0;
  const concurrency = options.concurrency || DEFAULT_CONCURRENCY;

  function next() {
    if (running < concurrency && index < links.length) {
      const currentLink = links[index++];

      handleLink(currentLink, () => {
        running--;

        if (++completed === links.length) {
          return callback();
        }

        next();
      });

      running++;
    }
  }

  next();
}

function handleLinksByTaskQueue(links, options, callback) {
  const queue = new TaskQueue(options.concurrency);
  links.forEach(link => queue.push(handleLink, link));
  queue.on('error', () => {
    console.log('got err');
  });
  queue.on('complete', () => {
    callback();
  });
}

function handleLinks(links, options, callback) {
  const mode = options.mode || SEQUENTIAL;

  switch (mode) {
    case SEQUENTIAL: return handleLinksSequentially(links, callback);
    case PARALLEL: return handleLinksParallel(links, callback);
    case LIMITED: return handleLinksLimitedParallel(links, callback);
    case TASK_QUEUE: return handleLinksByTaskQueue(links, callback);

    // Remember Zalgo?
    default: return process.nextTick(() => callback(new Error('Unsupported mode')));
  }
}

module.exports = {
  getLinks,
  handleLinks,
};
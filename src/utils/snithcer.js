const path = require('path');
const fs = require('fs');
const Utils = require('./common');
const TaskQueue = require('./task-queue');


/*
  Sequentially Iteration Pattern
 */
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

/*
  Parallel Execution Pattern
 */
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

/*
  Limited Parallel Execution Pattern
 */
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

/*
  Limited Parallel Execution Pattern but using special class
 */
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

module.exports = {
  handleLink,
};
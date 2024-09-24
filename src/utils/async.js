function executeSequentially(collection, iteratorCallback, finalCallback) {
  // Remember Zalgo?
  if (!collection.length) return process.nextTick(finalCallback);

  function iterate() {
    const current = collection.shift();

    if (!current) return finalCallback();

    iteratorCallback(current, (err) => {
      if (err) return finalCallback(err);

      iterate();
    });
  }

  iterate();
}

function executeParallel(collection, iteratorCallback, finalCallback) {
  let completed = 0;

  function done() {
    if (++completed === collection.length) {
      return finalCallback();
    }
  }

  collection.forEach(elem => iteratorCallback(elem, done));
}

function executeLimitedParallel(collection, concurrency, iteratorCallback, finalCallback) {
  let completed = 0;
  let running = 0;
  let index = 0;

  function next() {
    while (running < concurrency && index < collection.length) {
      iteratorCallback(collection[index++], () => {
        if (++completed === collection.length) {
          return finalCallback();
        }
        running--;
        next();
      });
      running++;
    }
  }

  next();
}

module.exports = {
  executeSequentially,
  executeParallel,
  executeLimitedParallel,
};
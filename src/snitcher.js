const Utils = require('./utils');

function snitcher(file, callback) {
  if (!file) {
    // Remember Zalgo?
    return process.nextTick(() => callback(new Error('File was not provided')));
  }

  Utils.getLinks(file, (err, links) => {
    if (err) return callback(err);

    Utils.handleLinks(links, callback);
  });
}

module.exports = snitcher;
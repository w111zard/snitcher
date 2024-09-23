const { getLinks, handleLinks } = require('./utils/snithcer');

function snitcher(file, callback) {
  if (!file) {
    // Remember Zalgo?
    return process.nextTick(() => callback(new Error('File was not provided')));
  }

  getLinks(file, (err, links) => {
    if (err) return callback(err);

    handleLinks(links, callback);
  });
}

module.exports = snitcher;
const { getLinks, handleLinks } = require('./utils/snithcer');

function snitcher(options, callback) {
  if (!options.file) {
    // Remember Zalgo?
    return process.nextTick(() => callback(new Error('File was not provided')));
  }

  getLinks(options.file, (err, links) => {
    if (err) return callback(err);

    handleLinks(links, options, callback);
  });
}

module.exports = snitcher;
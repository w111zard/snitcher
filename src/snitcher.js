const { getLinks, handleLinks } = require('./utils/snithcer');

function snitcher(options, callback) {
  getLinks(options.file, (err, links) => {
    if (err) return callback(err);

    handleLinks(links, options, callback);
  });
}

module.exports = snitcher;
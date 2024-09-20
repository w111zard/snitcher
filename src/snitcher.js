const Utils = require('./utils');

function snitcher(file, callback) {
  if (!file) return callback(new Error('File was not provided'));

  Utils.getLinks(file, (err, links) => {
    if (err) return callback(err);

    console.log(links);
    callback();
  });
}

module.exports = snitcher;
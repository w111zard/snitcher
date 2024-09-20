const fs = require('fs');
const path = require('path');

function getLinks(file, callback) {
  const filePath = path.join(process.cwd(), file);

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return callback(new Error('Can not read file'));

    callback(null, data.split('\n'));
  });
}

function snitcher(file, callback) {
  if (!file) callback(new Error('File was not provided'));
}

module.exports = snitcher;
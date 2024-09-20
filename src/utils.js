const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const superagent = require('superagent');

function removeDuplicates(data) {
  const duplicates = {};
  data.forEach(item => duplicates[item] = true);
  return Object.keys(duplicates);
}

function isURL(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

function getLinks(file, callback) {
  const filePath = path.join(process.cwd(), file);

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return callback(new Error('Can not read file'));

    const linksFromFile = data
      .split('\n')
      .map(l=> l.trim())
      .filter(l => l.length);

    if (!linksFromFile.length) return callback(new Error('Links were not found'));

    const links = removeDuplicates(linksFromFile);

    for (const link of links) {
      if (!isURL(link)) return callback(new Error(`Invalid URL: '${link}'`));
    }

    callback(null, links);
  });
}

module.exports = {
  getLinks
};
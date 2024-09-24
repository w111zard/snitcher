#!/usr/bin/env node

const Snitcher = require('./snitcher');
const path = require('path');
const fs = require('fs');
const Utils = require('./utils/common');

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

getLinks(process.argv[2], (err, links) => {
  if (err) {
    console.log(err.message);
    process.exit(1);
  }

  const snitcher = new Snitcher();
  snitcher.process(links, (err) => {
    console.log(err);
    console.log('Done!');
  });
});
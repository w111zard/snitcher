const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const superagent = require('superagent');
const { convert } = require('html-to-text');
const {singular} = require('pluralize');

const SEQUENTIAL = 'sequential';
const PARALLEL = 'parallel';

function calculateOccurrence(items) {
  const count = {};

  items.forEach(item => count[item] ?
    count[item]++ : count[item] = 1);

  const result = Object.entries(count).map(e => ({
    [e[0]]: e[1]
  }));


  result.sort((a, b) => Object.values(b) - Object.values(a));

  return result;
}

function isWord(str) {
  if (str.length < 2) return false;

  for (const letter of str.split('')) {
    if (letter < 'a' || letter > 'z') return false;
  }
  return true;
}

function getWordsFromText(text) {
  const parts = text.split(' ');
  const words = [];

  for (const part of parts) {
    const clear = part.trim();
    if (!clear) continue;

    const word = clear.toLowerCase();
    if (!isWord(word)) continue;

    const wordSingular = singular(word);
    words.push(wordSingular);
  }

  return words;
}

function getTextFromHTML(html) {
  return convert(html);
}

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

function download(link, callback) {
  superagent.get(link).end((err, data) => {
    if (err) return callback(new Error(`Can not download: '${link}'`));

    callback(null, data.text);
  });
}

function getStatistics(link, callback) {
  download(link, (err, html) => {
    const text = getTextFromHTML(html);
    const words = getWordsFromText(text);
    const occurrence = calculateOccurrence(words);

    callback(null, occurrence);
  });
}

function saveStatistics(link, stats, callback) {
  const data = {
    resource: link,
    statistics: stats,
  };

  const file = String(Date.now()) + '.json';
  const filePath = path.join(process.cwd(), file);

  fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
    if (err) return callback(err);

    callback(null, data);
  });
}

function handleLink(link, callback) {
  getStatistics(link, (err, stats) => {
    if (err) return callback(err);

    saveStatistics(link, stats, callback);
  });
}

function handleLinksSequentially(links, callback) {
  if (!links || !links.length) {
    // Remember Zalgo?
    return process.nextTick(() => callback(new Error('Links were not provided')));
  }

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

function handleLinksParallel(links, callback) {
  if (!links || !links.length) {
    // Remember Zalgo?
    return process.nextTick(() => callback(new Error('Links were not provided')));
  }

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

function handleLinks(links, callback, mode = PARALLEL) {
  switch (mode) {
    case SEQUENTIAL: return handleLinksSequentially(links, callback);
    case PARALLEL: return handleLinksParallel(links, callback);

    // Remember Zalgo?
    default: return process.nextTick(() => callback(new Error('Unsupported mode')));
  }
}

module.exports = {
  getLinks,
  handleLinks,
};
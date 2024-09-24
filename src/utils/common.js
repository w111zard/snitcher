const { URL } = require('url');
const superagent = require('superagent');
const { convert } = require('html-to-text');
const {singular} = require('pluralize');
const path = require('path');
const fs = require('fs');

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

function download(link, callback) {
  superagent.get(link).end((err, data) => {
    if (err) return callback(new Error(`Can not download: '${link}'`));

    callback(null, data.text);
  });
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

function getArgs() {
  const yargs = require('yargs/yargs');
  const { hideBin } = require('yargs/helpers');
  const argv = yargs(hideBin(process.argv)).argv;

  return {
    file: argv?._[0],
    mode: argv?.mode || argv?.m,
    concurrency: argv?.concurrency || argv?.c,
    help: argv?.h || argv?.help,
  };
}
module.exports = {
  calculateOccurrence,
  isWord,
  getWordsFromText,
  getTextFromHTML,
  removeDuplicates,
  isURL,
  download,
  getLinks,
  getArgs,
};

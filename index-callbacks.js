const fs = require('fs');
const path = require('path');
const superagent = require('superagent');
const { convert } = require('html-to-text');
const { singular } = require('pluralize')
const { iterateSeries, parallelSeries } = require('@w111zard/async')

const SEQUENTIAL = 'sequential';
const PARALLEL = 'parallel';

const MODE = PARALLEL;

function download(link, callback) {
  superagent.get(link).end((err, data) => {
    if (err) return callback(new Error(`Error while downloading ${link}`));

    callback(null, data)
  })
}

function isWord(str) {
  if (str.length < 2) return false;

  for (const letter of str.split('')) {
    if (letter < 'a' || letter > 'z') return false;
  }
  return true;
}

function textToWords(text) {
  const parts = text.split(' ');
  const words = []

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

function getWordsFromLink(link, callback) {
  download(link, (err, data) => {
    if (err) return callback(null, []);

    const text = convert(data.text)
    const words = textToWords(text);

    callback(null, words);
  })
}

let id = 0;

function calculateAndSaveStatistics(link, callback) {
  getWordsFromLink(link, (err, words) => {
    if (err) return callback(err);

    const statistics = calculateWordsCount(words)
    const statisticsText = arrayToText(statistics)

    const filePath = path.join(process.cwd(), `result:${id++}.txt`)
    fs.writeFile(filePath, statisticsText, (err) => {
      if (err) return callback(err);

      console.log(`Finished: ${link}`)
      callback(null, link)
    });
  })
}

function calculateWordsCount(words) {
  const count = {}

  words.forEach(word => count[word] ?
    count[word]++ : count[word] = 1);

  const result = Object.entries(count).map(e => ({
    [e[0]]: e[1]
  }))

  result.sort((a, b) => Object.values(b) - Object.values(a))

  return result;
}

function arrayToText(arr) {
  let text = '';

  for (const elem of arr) {
    if (typeof elem === 'object') {
      text += `${Object.keys(elem)}: ${Object.values(elem)}\n`;
    }
  }

  return text;
}

function saveStatistics(links, callback, mode = SEQUENTIAL) {
  if (mode === SEQUENTIAL) {
    console.log('seq')
    iterateSeries(links, calculateAndSaveStatistics, callback);
  }
  else if (mode === PARALLEL) {
    console.log('pl')
    parallelSeries(links, calculateAndSaveStatistics, callback);
  }
}

function getLinks(file, callback) {
  const filePath = path.join(process.cwd(), file)

  fs.access(filePath, (err) => {
    if (err) return callback(new Error('File was not found'));

    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) return callback(new Error('Error while reading file'));

      const links = data.split('\n')

      callback(null, links)
    })
  })
}

function start(file, callback) {
  if (!file) return callback(new Error('File was not provided'))

  getLinks(file, (err, links) => {
    if (err) return callback(err);

    console.time()
    saveStatistics(links, callback, MODE);
  })
}

start(process.argv[2], (err) => {
  if (err) {
    console.log(`Error: ${err.message}`);
    process.exit(1);
  }
  console.log('Done!')
  console.timeEnd();
});
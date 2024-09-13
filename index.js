const fs = require('fs');
const path = require('path');
const superagent = require('superagent');
const { JSDOM } = require('jsdom');
const Logger = require('./logger');

const log = new Logger();

function isLinkValid(link) {
  try {
    new URL(link);
    return true;
  } catch {
    return false;
  }
}

function getTextFromChildren(parentNode) {
  const text = []

  function getText(node) {
    if (node.nodeType === 3) {
      text.push(node.textContent);
      return
    }

    for (const elem of node.childNodes) {
      getText(elem);
    }
  }

  getText(parentNode);

  return text.join(' ');
}

function getText(url, callback) {
  superagent.get(url).end((err, res) => {
    if (err) return callback(err);

    const { body } = (new JSDOM(res.text)).window.document;
    const text = getTextFromChildren(body);

    callback(null, text)
  })
}

function cleanWord(word) {
  function isLetter(char) {
    return (char >= 'a' && char <= 'z') || (char >= 'а' && char <= 'я');
  }

  let result = ''
  for (const char of word.split('')) {
    if (isLetter(char)) result += char
  }
  return result
}

function getWordsFromText(text) {
  const dirtyWords = text.split(' ')
  const cleanWords = []

  for (let word of dirtyWords) {
    if (!word.length) continue;
    if (word.length > 20) continue;

    word = word.toLowerCase()
    word = cleanWord(word)

    if (!word) continue

    cleanWords.push(word)
  }

  return cleanWords
}

function getWordsRate(words) {
  const rates = {}

  words.forEach(word => rates[word] ? rates[word]++ : rates[word] = 1)

  const result = Object.entries(rates).map(o => ({[o[0]]: o[1]}))
  result.sort((a, b) => Object.values(b) - Object.values(a))

  return result
}

function getWords(url, callback) {
  if (!isLinkValid(url)) return callback(new Error(`Invalid URL: ${url}`))

  getText(url, (err, text) => {
    if (err) return callback(new Error(`Can not load URL: ${url}`))

    const words = getWordsFromText(text);

    callback(null, words)
  })
}

function getWordsFromAllSeq(links, callback) {
  const words = []

  function iterate() {
    const link = links.pop()

    if (!link) {
      return callback(null, words)
    }

    getWords(link, (err, data) => {
      if (err) {
        log.error(link)
      }
      else {
        log.success(link)
        words.push(...data)
      }
      iterate()
    })
  }

  iterate()
}

function getLinks(file, callback) {
  if (!file) return callback(new Error('File must be specified'))

  const filePath = path.join(process.cwd(), file);

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return callback(new Error('Error while reading file with links'));

    const links = data.split('\n')

    callback(null, links)
  });
}

function saveStats(stats, callback) {
  let fileData = ''

  for (const item of stats) {
    const [key, value] = Object.entries(item)[0]
    fileData += `${key}: ${value}\n`
  }

  fs.writeFile('stats.txt', fileData, (err) => {
    if (err) return callback(err);

    callback(null)
  })
}

function start(file, callback) {
  if (!file) return callback(new Error('File must be specified'))

  getLinks(file, (err, links) => {
    if (err) return callback(err)

    getWordsFromAllSeq(links, (err, words) => {
      if (err) return callback(err)

      const stats = getWordsRate(words)
      saveStats(stats, callback)
    })
  })
}

start(process.argv[2], (err, stats) => {
  if (err) {
    log.error(err.message)
  }
  else {
    log.info(stats)
  }
})
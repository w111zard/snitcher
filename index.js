const fs = require('fs/promises');
const path = require('path');
const superagent = require('superagent');
const { convert } = require('html-to-text');
const {singular} = require("pluralize");

function isWord(str) {
  if (str.length < 2) return false;

  for (const letter of str.split('')) {
    if (letter < 'a' || letter > 'z') return false;
  }
  return true;
}

function getWords(text) {
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

function getCount(words) {
  const count = {}

  words.forEach(word => count[word] ?
    count[word]++ : count[word] = 1);

  const result = Object.entries(count).map(e => ({
    [e[0]]: e[1]
  }))

  result.sort((a, b) => Object.values(b) - Object.values(a))

  return result;
}

function objectsToString(objs) {
  return objs.reduce((acc, obj) => acc + `${Object.keys(obj)}: ${Object.values(obj)}\n`, '').slice(0, -1);
}

async function getLinks(file) {
  const data = await fs.readFile(file, 'utf8');
  return data.split('\n');
}

async function download(link) {
  return (await superagent.get(link)).text;
}

async function saveStatistics(link, data) {
  try {
    const str = `${link}\n` + objectsToString(data);
    const file = String(Date.now()) + '.txt'
    await fs.writeFile(path.join(process.cwd(), 'statistics', file), str);
  } catch (e) {
    console.log(e)
  }
}

async function getStatistics(link) {
    const html = await download(link);
    const text = convert(html);
    const words = getWords(text);
    return getCount(words);
}

async function getAndSaveStatistic(link) {
  const statistics = await getStatistics(link);
  await saveStatistics(link, statistics);
}

async function start(file) {
  if (!file) throw new Error('File was not provided')

  const links = await getLinks(file);

  const promises = links.map(link => getAndSaveStatistic(link))
  await Promise.allSettled(promises);
}

start('links.txt').catch(e => console.log(e))
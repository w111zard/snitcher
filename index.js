const fs = require('fs/promises');
const superagent = require('superagent');
const { convert } = require('html-to-text');

function readLinks(file) {
  return fs.readFile(file, 'utf-8')
    .then(data => data.split('\n'))
}

function download(url) {
  return superagent.get(url);
}

function getStatistics(url) {
  download(url)
    .then(data => {
      const text =
    })
    .catch(() => [])
}

function start(file) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('File was not provided'));

    readLinks(file)
      .then(links => {
        calculateStatistics(links[0]).then(data => console.log(data))
      })
  })
}

start(process.argv[2])
.then(() => console.log('Done!'))
.catch(e => console.log(e.message))
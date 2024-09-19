function start() {
  return new Promise((resolve, reject) => {
    resolve()
  })
}

start(process.argv[2])
  .then(() => {
    console.log('Done!')
  })
  .catch(err => {
    console.log(err)
  })
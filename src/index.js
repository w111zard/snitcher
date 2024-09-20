const snitcher = require('./snitcher');

snitcher(process.argv[2], (err) => {
  if (err) {
    return console.log(err.message);
  }
  console.log('Done!');
});
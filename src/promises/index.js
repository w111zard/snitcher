function wait(delay) {
  return new Promise(resolve => {
    setTimeout(resolve, delay);
  });
}

wait(3000).then(() => console.log('hi'));
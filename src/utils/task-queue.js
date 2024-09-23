const EventEmitter = require('events').EventEmitter;

class TaskQueue extends EventEmitter {
  constructor(concurrency = 2) {
    super();
    this.concurrency = concurrency;
    this.tasks = [];
    this.running = 0;
  }

  push() {
    const [handler, ...args] = Object.values(arguments);
    this.tasks.push({ handler, args });
    this.next();
  }

  next() {
    if (this.running === 0 && !this.tasks.length) {
      this.emit('complete');
    }

    while (this.running < this.concurrency && this.tasks.length) {
      const { handler, args } = this.tasks.shift();
      handler(...args, (err) => {
        if (err) {
          this.emit('error', err);
        }

        this.running--;
        this.next();
      });
      this.running++;
    }
  }
}

module.exports = TaskQueue;
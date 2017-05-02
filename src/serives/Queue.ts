
export default class Queue {

  running: number;
  queue: Function[];
  concurrency: number;

  constructor() {
    this.concurrency = 1;
    this.running = 0;
    this.queue = [];
  }

  set(args) {
    return Object.assign(this, args);
  }

  run(task) {
    this.queue.push(task);
    this.next();
    return this;
  }

  next() {
    while (this.running < this.concurrency && this.queue.length) {
      let task = this.queue.shift();
      if (task) {
        task(this, () => {
          this.running--;
          this.next();
        });
        this.running++;
      }
    }
  }
}

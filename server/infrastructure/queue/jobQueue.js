class JobQueue {
  async enqueue() {
    throw new Error('enqueue must be implemented by a queue adapter');
  }

  async process() {
    throw new Error('process must be implemented by a queue adapter');
  }
}

module.exports = JobQueue;

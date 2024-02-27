const express = require('express');
const cluster = require('cluster');
const os = require('node:os');
const app = express();
// cluster.schedulingPolicy = cluster.SCHED_RR; // only windows

function delay(duration) {
  const startTime = Date.now();
  while (Date.now() - startTime < duration) {
    // event loop is blocked .....
  }
}

app.get('/', (req, res) => {
  res.send(`Performance example: ${process.pid}`);
});

app.get('/timer', (req, res) => {
  delay(9000);
  res.send(`Ding ding ding ${process.pid}`);
});
console.log('Running server.js...');
if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);
  const NUM_WORKERS = os.cpus().length;
  // Fork workers.
  for (let i = 0; i < NUM_WORKERS; i++) {
    const worker = cluster.fork();
    worker.on('exit', (code, signal) => {
      if (signal) {
        console.log(`worker was killed by signal: ${signal}`);
      } else if (code !== 0) {
        console.log(`worker exited with error code: ${code}`);
      } else {
        console.log('worker success!');
      }
    });
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  console.log('Worker process started');
  app.listen(3000, () => {
    console.log(`Server starting and Worker ${process.pid} started`);
  });
}

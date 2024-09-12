'use strict';

/* eslint-disable no-console */
const { Server } = require('http');
const fs = require('fs');

function createServer() {
  const server = new Server();

  server.on('request', (req, res) => {
    if (req.url === '/' && req.method === 'GET') {
      const fileStream = fs.createReadStream('./public/index.html');

      res.setHeader('Content-Type', 'text/html');

      fileStream.pipe(res);

      fileStream.on('error', () => {
        res.statusCode = 500;
        res.end('Server Error');
      });

      // fileStream.on('end', () => {
      //   console.log(process.memoryUsage().external);
      // });

      return;
    }

    if (req.url === '/add-expense' && req.method === 'POST') {
      const dataStream = fs.createWriteStream('./db/expense.json');
      const fileStream = fs.createReadStream('./db/expense.json');

      const chunks = [];

      req.on('data', (chunk) => {
        chunks.push(chunk);
      });

      req.on('end', () => {
        const chunksData = Buffer.concat(chunks).toString();
        const parseData = JSON.parse(chunksData);

        if (!parseData.date || !parseData.title || !parseData.amount) {
          res.statusCode = 400;
          res.end('Missing required fields');
          dataStream.write(JSON.stringify({}, null, 2));

          return;
        }

        dataStream.write(JSON.stringify(parseData, null, 2));

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        fileStream.pipe(res);

        fileStream.on('error', () => {
          res.statusCode = 404;
          res.end('Not Found');
        });

        dataStream.on('error', () => {
          res.statusCode = 404;
          res.end('Not Found');
        });
      });

      req.on('close', () => {
        dataStream.end();
        fileStream.destroy();
      });

      return;
    }

    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Invalid url');
  });

  server.on('error', (err) => {
    console.log('error', err);
  });

  return server;
}

module.exports = {
  createServer,
};

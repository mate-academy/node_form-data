'use strict';

/* eslint-disable no-console */
const { Server } = require('http');
const fs = require('fs');
const querystring = require('querystring');

function createServer() {
  const server = new Server();

  server.on('request', (req, res) => {
    if (req.url === '/' && req.method === 'GET') {
      const fileStream = fs.createReadStream('./public/index.html');

      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');

      fileStream.pipe(res);

      fileStream.on('error', () => {
        res.statusCode = 500;
        res.end('Server Error');
      });

      return;
    }

    if (req.url === '/add-expense' && req.method === 'POST') {
      let chunks = '';

      req.on('data', (chunk) => {
        chunks += chunk.toString();
      });

      req.on('end', () => {
        const parsedData = querystring.parse(chunks);
        let jsonData;

        try {
          jsonData = JSON.parse(chunks);
        } catch (error) {
          jsonData = parsedData;
        }

        const date = parsedData.date || jsonData.date;
        const title = parsedData.title || jsonData.title;
        const amount = parsedData.amount || jsonData.amount;

        if (!date || !title || !amount) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'text/plain');
          res.end('Missing required fields');

          return;
        }

        fs.writeFile(
          './db/expense.json',
          JSON.stringify({ date, title, amount }, null, 2),
          (error) => {
            if (error) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'text/plain');
              res.end('Server Error');

              return;
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ date, title, amount }, null, 2));
          },
        );
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

/* eslint-disable no-console */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const FILE_PATH = path.resolve('db/expense.json');
const DATE = 'date';
const TITLE = 'title';
const AMOUNT = 'amount';

function createServer() {
  const server = new http.Server();

  server.on('request', (req, res) => {
    if (req.url !== '/add-expense') {
      res.setHeader('Content-type', 'text/plain');
      res.statusCode = 404;
      res.end('Wrong request url');

      return;
    }

    const chunks = [];

    req.on('data', (chunk) => {
      chunks.push(chunk);
    });

    req.on('end', () => {
      const text = Buffer.concat(chunks).toString();
      const data = JSON.parse(text);

      if (!data[DATE] || !data[TITLE] || !data[AMOUNT]) {
        res.statusCode = 400;
        res.end('Not full data');

        return;
      }

      const writeStream = fs.createWriteStream(FILE_PATH);

      writeStream.end(text);

      writeStream.on('finish', () => {
        res.setHeader('Content-type', 'application/json');
        res.statusCode = 200;
        res.end(text);
      });
    });

    req.on('error', (err) => {
      res.statusCode = 400;
      res.end(`Request error: ${err}`);
    });
  });

  server.on('error', () => {});

  return server;
}

module.exports = {
  createServer,
};

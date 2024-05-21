'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

function createServer() {
  const server = new http.Server();

  server.on('request', (req, res) => {
    if (req.url !== '/add-expense') {
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

      if (!data['date'] || !data['title'] || !data['amount']) {
        res.statusCode = 400;
        res.end('Please provide full data');

        return;
      }

      const filePath = path.resolve('db/expense.json');

      const writeStream = fs.createWriteStream(filePath);

      writeStream.end(text);

      writeStream.on('finish', () => {
        res.setHeader('Content-type', 'application/json');
        res.statusCode = 200;
        res.end(text);
      });
    });

    req.on('error', (err) => {
      res.statusCode = 400;
      res.end('Error:', err);
    });
  });

  server.on('error', () => {});

  return server;
}

module.exports = {
  createServer,
};

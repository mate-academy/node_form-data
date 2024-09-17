'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

function createServer() {
  const server = new http.Server();

  server.on('request', (req, res) => {
    if (req.url !== '/add-expense') {
      res.statusCode = 404;
      res.end('Invalid url');

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
        res.end('No all the params');

        return;
      }

      const writeStream = fs.createWriteStream(path.resolve('db/expense.json'));

      res.setHeader('Content-type', 'application/json');
      writeStream.write(JSON.stringify(data));
      writeStream.end();

      writeStream.on('finish', () => {
        res.end(JSON.stringify(data));
      });
    });
  });

  server.on('error', () => {});

  return server;
}

module.exports = {
  createServer,
};

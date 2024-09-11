'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

function createServer() {
  const server = new http.Server();

  server.on('request', (req, res) => {
    if (req.url !== '/add-expense') {
      res.statusCode = 404;

      return res.end('Wrong request URL');
    }

    const filePath = path.resolve('db/expense.json');
    const chunks = [];

    req.on('data', (chunk) => chunks.push(chunk));

    req.on('end', () => {
      const rawData = Buffer.concat(chunks).toString();

      try {
        const { date, title, amount } = JSON.parse(rawData);

        if (!date || !title || !amount) {
          res.statusCode = 400;

          return res.end('Data incomplete');
        }
      } catch (err) {
        res.statusCode = 400;

        return res.end('Invalid JSON');
      }

      const writeStream = fs.createWriteStream(filePath);

      writeStream.write(rawData);
      writeStream.end();

      writeStream.on('finish', () => {
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        res.end(rawData);
      });

      writeStream.on('error', () => {
        res.statusCode = 500;
        res.end('Error saving data');
      });
    });

    req.on('error', (err) => {
      res.statusCode = 400;
      res.end(`Request error: ${err.message}`);
    });
  });

  // eslint-disable-next-line no-console
  server.on('error', (err) => console.error(err));

  return server;
}

module.exports = {
  createServer,
};

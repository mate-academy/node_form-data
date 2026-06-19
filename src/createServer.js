'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

function createServer() {
  return http.createServer((req, res) => {
    if (req.url !== '/add-expense') {
      res.statusCode = 404;

      return res.end('Wrong request URL');
    } else if (req.url === '/add-expense' && req.method === 'POST') {
      const filePath = path.resolve('db/expense.json');

      const chunks = [];

      req.on('data', (chunk) => chunks.push(chunk));

      req.on('end', () => {
        const concatedData = Buffer.concat(chunks).toString();

        try {
          const { date, title, amount } = JSON.parse(concatedData);

          if (!date || !title || !amount) {
            res.statusCode = 400;

            return res.end('Data incomplete');
          }
        } catch (err) {
          res.statusCode = 400;

          return res.end('Invalid JSON');
        }

        const writeStream = fs.createWriteStream(filePath);

        writeStream.write(concatedData);
        writeStream.end();

        writeStream.on('finish', () => {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(concatedData);
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
    }
  });
}

module.exports = {
  createServer,
};

/* eslint-disable no-console */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

function createServer() {
  const server = http.createServer((req, res) => {
    if (req.url !== '/add-expense') {
      res.statusCode = 404;

      return res.end('Wrong request URL');
    }

    const chunks = [];

    req.on('data', (chunk) => chunks.push(chunk));

    req.on('end', () => {
      const text = Buffer.concat(chunks).toString();
      let data;

      try {
        data = JSON.parse(text);
      } catch (err) {
        res.statusCode = 400;

        return res.end('Invalid JSON');
      }

      if (!data.date || !data.title || !data.amount) {
        res.statusCode = 400;

        return res.end('Please provide full data');
      }

      const filePath = path.resolve('db/expense.json');

      fs.writeFile(filePath, text, (err) => {
        if (err) {
          res.statusCode = 500;

          return res.end('Error saving data');
        }

        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        res.end(text);
      });
    });

    req.on('error', (err) => {
      res.statusCode = 400;
      res.end(`Request error: ${err.message}`);
    });
  });

  server.on('error', (err) => {
    console.error('Server error:', err);
  });

  return server;
}

module.exports = {
  createServer,
};

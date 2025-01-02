'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

function createServer() {
  const server = new http.Server();

  server.on('request', (req, res) => {
    if (req.url !== '/add-expense') {
      res.statusCode = 404;

      return res.end('There some mistake in requested URL');
    }

    const chunks = [];

    req.on('data', (chunk) => chunks.push(chunk));

    req.on('end', () => {
      const text = Buffer.concat(chunks).toString();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        res.statusCode = 400;
        res.end('Not possible to create JSON');

        return;
      }

      if (!data.date || !data.title || !data.amount) {
        res.statusCode = 400;
        res.end('There missing some info. Please provide all data');

        return;
      }

      const filePath = path.resolve('db/expense.json');

      fs.writeFile(filePath, text, (err) => {
        if (err) {
          res.statusCode = 500;
          res.end('Error saving data');

          return;
        }

        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        res.end(text);
      });
    });
  });

  server.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.error('Server error:', err);
  });

  return server;
}

module.exports = {
  createServer,
};

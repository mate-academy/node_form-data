'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');

function createServer() {
  const server = new http.Server();

  server.on('request', (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === 'POST' && url.pathname === '/add-expense') {
      const chunks = [];

      req.on('data', (chunk) => chunks.push(chunk));

      req.on('end', () => {
        const text = Buffer.concat(chunks).toString();
        let data;

        try {
          data = JSON.parse(text);
        } catch (err) {
          res.statusCode = 400;
          res.end('Invalid JSON');

          return;
        }

        if (!data.date || !data.title || !data.amount) {
          res.statusCode = 400;

          return res.end('Please provide full data');
        }

        const filePath = path.resolve('db/expense.json');

        fs.writeFile(filePath, text, (err) => {
          if (err) {
            res.statusCode = 500;
            res.end('Server saving data');

            return;
          }

          res.writeHead(200, { 'content-type': 'application/json' });
          res.end(text);
        });
      });

      return;
    }

    res.statusCode = 404;
    res.end('Invalid url');
  });

  server.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.error(err);
  });

  return server;
}

module.exports = {
  createServer,
};

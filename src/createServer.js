'use strict';

const http = require('http');
const path = require('path');
const fs = require('fs');

function createServer() {
  return http.createServer((req, res) => {
    if (req.url === '/') {
      res.statusCode = 302;
      res.setHeader('Location', '/add-expense');
      res.end();

      return;
    }

    if (req.method === 'GET' && req.url === '/add-expense') {
      fs.readFile(path.resolve(__dirname, 'add-expense.html'), (err, data) => {
        if (err) {
          res.writeHead(500);
          res.end('Error loading add-expense.html');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(data);
        }
      });

      return;
    }

    // '/add-expense' only for tests
    if (
      req.method === 'POST' &&
      (req.url === '/submit-expense' || req.url === '/add-expense')
    ) {
      const chunks = [];

      req.on('data', (chunk) => {
        chunks.push(chunk);
      });

      req.on('end', () => {
        let data;

        const contentType = req.headers['content-type'];

        if (contentType === 'application/json') {
          data = JSON.parse(Buffer.concat(chunks).toString());
        } else if (contentType === 'application/x-www-form-urlencoded') {
          data = Object.fromEntries(
            Buffer.concat(chunks)
              .toString()
              .split('&')
              .map((item) => item.split('=')),
          );
        } else {
          res.statusCode = 400;
          res.end('Invalid content type');

          return;
        }

        if (!data.date || !data.title || !data.amount) {
          res.statusCode = 400;
          res.end('Not full data');

          return;
        }

        try {
          const writeStream = fs.createWriteStream(
            path.resolve(__dirname, '../db/expense.json'),
          );

          writeStream.end(JSON.stringify(data));

          writeStream.on('finish', () => {
            res.statusCode = 200;

            // for tests
            if (contentType === 'application/json') {
              res.setHeader('Content-type', 'application/json');
              res.end(JSON.stringify(data));
            } else {
              res.setHeader('Content-type', 'text/html');

              res.end(
                `<!DOCTYPE html>
                <html lang="en">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Expense added</title>
                </head>
                <body>
                <h1>Expense added</h1>
                <pre>${JSON.stringify(data, null, 2)}</pre>
                </body>
                </html>`,
              );
            }
          });
        } catch (err) {
          res.statusCode = 400;
          res.end('Invalid request');
        }
      });

      return;
    }

    res.statusCode = 404;
    res.end('Not found');
  });
}

module.exports = {
  createServer,
};

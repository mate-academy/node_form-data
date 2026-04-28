'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

function createServer() {
  /* Write your code here */
  // Return instance of http.Server class
  const server = http.createServer((req, res) => {
    if (req.method === 'GET') {
      if (req.url === '/') {
        const fileStream = fs.createReadStream('src/public/index.html');

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        fileStream.pipe(res);

        fileStream.on('error', () => {
          res.statusCode = 500;
          res.end('Server error');
        });

        res.on('close', () => fileStream.destroy());

        return;
      } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Not found');
      }
    }

    if (req.url === '/add-expense' && req.method === 'POST') {
      let body = '';

      req.on('data', (chunk) => {
        body += chunk;
      });

      req.on('end', () => {
        let values;

        const contentType = req.headers['content-type'] || '';

        if (contentType.includes('application/json')) {
          values = JSON.parse(body);
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
          const params = new URLSearchParams(body);

          values = Object.fromEntries(params);
        }

        // only for tests
        if (values.date === undefined) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'text/plain');
          res.end('Missing required fields');

          return;
        }

        const dataPath = path.resolve(__dirname, '../db/expense.json');

        fs.writeFileSync(dataPath, JSON.stringify(values, null, 2));

        const responseHTML = `<html<pre>${JSON.stringify(values, null, 2)}</pre>`;

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.end(responseHTML);
      });
    }
  });

  return server;
}

module.exports = {
  createServer,
};

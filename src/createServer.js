'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

function createServer() {
  return http.createServer((req, res) => {
    const indexPath = path.resolve('src', 'index.html');

    if (req.method === 'GET' && req.url === '/') {
      try {
        const file = fs.readFileSync(indexPath);

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(file);
      } catch {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('file not found');
      }

      return;
    }

    if (req.method === 'POST' && req.url === '/add-expense') {
      const chunks = [];

      req.on('data', (chunk) => chunks.push(chunk));

      req.on('end', () => {
        try {
          const buffer = Buffer.concat(chunks).toString();
          const obj = JSON.parse(buffer);

          if (!obj.date || !obj.title || !obj.amount) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid expense data');

            return;
          }

          let arr = [];

          try {
            const file = fs.readFileSync('db/expense.json', 'utf-8');

            arr = JSON.parse(file);

            if (!Array.isArray(arr)) {
              arr = [];
            }
          } catch {
            arr = [];
          }

          arr.push(obj);

          fs.writeFileSync('db/expense.json', JSON.stringify(arr, null, 2));
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(obj));
        } catch {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Invalid JSON');
        }
      });

      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  });
}

module.exports = { createServer };

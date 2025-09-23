'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.resolve('db', 'expense.json');

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


          fs.writeFileSync(DATA_PATH, JSON.stringify(obj, null, 2));

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(obj));
        } catch {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Invalid JSON');
        }
      });

      return;
    }
    if (req.method === 'GET' && req.url === '/expenses') {
      try {
        const data = fs.existsSync(DATA_PATH)
          ? fs.readFileSync(DATA_PATH, 'utf-8')
          : '';
        const obj = data ? JSON.parse(data) : {};

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(obj));
      } catch {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Failed to read expense');
      }

      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  });
}

module.exports = { createServer };

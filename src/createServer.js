'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

function createServer() {
  return http.createServer((req, res) => {
    const { method, url } = req;

    if (method === 'GET' && url === '/') {
      const filePath = path.resolve(__dirname, 'index.html');

      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.end('Internal Server Error');

          return;
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(data);
      });

      return;
    }

    if (method === 'POST' && url === '/add-expense') {
      let body = '';

      req.on('data', (chunk) => {
        body += chunk.toString();
      });

      req.on('end', () => {
        const contentType = (req.headers['content-type'] || '').toLowerCase();
        let parsed = {};

        try {
          if (contentType.includes('application/json')) {
            parsed = body ? JSON.parse(body) : {};
          } else if (
            contentType.includes('application/x-www-form-urlencoded')
          ) {
            parsed = querystring.parse(body);
          } else {
            // try to guess
            if (body.includes('=')) {
              parsed = querystring.parse(body);
            } else {
              parsed = body ? JSON.parse(body) : {};
            }
          }
        } catch (err) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.end('Invalid payload');

          return;
        }

        const { date, title, amount } = parsed;

        if (!date || !title || !amount) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.end('Missing required fields');

          return;
        }

        const dataPath = path.resolve(__dirname, '../db/expense.json');

        try {
          fs.writeFileSync(dataPath, JSON.stringify({ date, title, amount }));
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.end('Failed to save data');

          return;
        }

        const formatted = JSON.stringify({ date, title, amount }, null, 2);
        const html = `<!doctype html><html><head><meta charset="utf-8"><title>Saved</title></head><body><pre>${formatted}</pre></body></html>`;

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(html);
      });

      return;
    }

    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Not Found');
  });
}

module.exports = {
  createServer,
};

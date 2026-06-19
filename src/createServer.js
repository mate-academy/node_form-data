'use strict';

const http = require('http');
const path = require('path');
const fs = require('fs');

function createServer() {
  const server = new http.Server((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
      const filePath = path.join(__dirname, 'index.html');

      fs.readFile(filePath, (err, content) => {
        if (err) {
          res.writeHead(400);
          res.end('Server error');

          return;
        }

        res.setHeader('Content-Type', 'text/html');
        res.end(content);
      });

      return;
    }

    if (req.method === 'POST' && req.url === '/add-expense') {
      let body = '';

      req.on('data', (chunk) => {
        body += chunk.toString();
      });

      req.on('end', () => {
        let fields;

        try {
          fields = JSON.parse(body);
        } catch (err) {
          res.statusCode = 400;

          return res.end('Invalid JSON');
        }

        const expensePath = path.join(__dirname, '..', 'db', 'expense.json');

        if (!fields.date || !fields.title || !fields.amount) {
          res.statusCode = 400;

          return res.end('Missing required fields');
        }

        const expense = {
          amount: Number(fields.amount),
          date: fields.date,
          title: fields.title,
        };

        fs.writeFile(expensePath, JSON.stringify(expense, null, 2), (err) => {
          if (err) {
            res.statusCode = 500;

            return res.end('Failed to save');
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });

          res.end(JSON.stringify(expense));
        });
      });

      return;
    }

    res.statusCode = 404;
    res.end('Not found');
  });

  return server;
}

module.exports = {
  createServer,
};

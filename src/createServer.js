'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');

const requestHandler = (req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    const filePath = path.join(__dirname, 'index.html');

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.end('Internal Server Error');

        return;
      }

      res.setHeader('Content-Type', 'text/html');
      res.end(data);
    });

    return;
  }

  if (req.method === 'POST' && req.url === '/add-expense') {
    const filePath = path.join(__dirname, '../db/expense.json');
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      let expense;

      try {
        const contentType = req.headers['content-type'];

        if (contentType.includes('application/json')) {
          expense = JSON.parse(body);
        } else {
          const parsed = new URLSearchParams(body);

          expense = Object.fromEntries(parsed.entries());
        }
      } catch {
        res.statusCode = 400;
        res.end('Invalid JSON');

        return;
      }

      if (!expense.date || !expense.title || !expense.amount) {
        res.statusCode = 400;
        res.end('Missing required fields');

        return;
      }

      fs.writeFileSync(filePath, JSON.stringify(expense, null, 2));

      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(expense));
    });

    return;
  }

  res.statusCode = 404;
  res.end('Not found');
};

function createServer() {
  return http.createServer(requestHandler);
}

module.exports = {
  createServer,
};

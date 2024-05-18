/* eslint-disable no-console */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

function createServer() {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    if (pathname === '/' && req.method === 'GET') {
      const filePath = path.resolve(__dirname, '..', 'public', 'index.html');

      fs.readFile(filePath, (err, content) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');

          return;
        }

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content);
      });

      return;
    }

    if (req.url !== '/add-expense' || req.method !== 'POST') {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Invalid URL!');
    }

    let chunks = '';

    req.on('data', (chunk) => {
      chunks += chunk.toString();
    });

    req.on('end', () => {
      const data = querystring.parse(chunks);

      if (!data.date || !data.title || !data.amount) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('All params are required!');

        return;
      }

      const expense = {
        date: data.date,
        title: data.title,
        amount: data.amount,
      };

      const filePath = path.resolve('db/expense.json');
      const formattedExpense = JSON.stringify(expense, null, 2);

      fs.writeFile(filePath, formattedExpense, (err) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
        }

        res.writeHead(200, { 'Content-type': 'application/json' });
        res.end(JSON.stringify(expense));
      });

      const htmlResponse = `
        <html>
          <head>
            <title>Expense Details</title>
          </head>

          <body>
            <h1>Expense Details</h1>

            <pre>${formattedExpense}</pre>
          </body>
        </html>
      `;

      res.writeHead(200, { 'Content-type': 'text/html' });
      res.end(htmlResponse);
    });
  });

  server.on('error', () => {});

  return server;
}

module.exports = {
  createServer,
};

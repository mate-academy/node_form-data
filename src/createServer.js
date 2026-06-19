'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const dataPath = path.resolve(__dirname, '../db/expense.json');

function createServer() {
  const server = new http.Server();

  server.on('request', (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname === '/' && req.method === 'GET') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');

      res.end(`
        <h1>Submit Expense</h1>
        <form action="/add-expense" method="POST" enctype="application/json">
          <label>Date: <input name="date" type="date" required /></label><br>
          <label>Title: <input name="title" type="text" required /></label><br>
          <label>Amount: <input name="amount" type="number" required /></label><br>
          <button type="submit">Submit</button>
        </form>
      `);

      return;
    }

    if (url.pathname === '/add-expense' && req.method === 'POST') {
      let body = '';

      req.on('data', (chunk) => {
        body += chunk;
      });

      req.on('end', () => {
        try {
          const expense = JSON.parse(body);

          if (!expense.date || !expense.title || !expense.amount) {
            res.statusCode = 400;
            res.end('Invalid data.');

            return;
          }

          fs.writeFileSync(dataPath, JSON.stringify(expense));

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(expense));
        } catch (err) {
          res.statusCode = 400;
          res.end('Invalid JSON format.');
        }
      });

      return;
    }

    res.statusCode = 404;
    res.end('Not Found');
  });

  return server;
}

module.exports = {
  createServer,
};

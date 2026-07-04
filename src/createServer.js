'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
const dataPath = path.resolve(__dirname, '../db/expense.json');

function createServer() {
  return http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html' });

      res.end(`
        <html>
          <body>
            <form method="POST" action="/add-expense">
              <input name="date" type="date">
              <input name="title" type="text">
              <input name="amount" type="number">
              <button type="submit">Add expense</button>
            </form>
          </body>
        </html>
      `);

      return;
    }

    if (req.method === 'POST' && req.url === '/add-expense') {
      let body = '';

      req.on('data', (chunk) => {
        body += chunk;
      });

      req.on('end', () => {
        let expense;

        if (req.headers['content-type']?.includes('application/json')) {
          expense = JSON.parse(body);
        } else {
          expense = querystring.parse(body);
        }

        if (!expense.date || !expense.title || !expense.amount) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('All fields are required');

          return;
        }

        fs.writeFileSync(dataPath, JSON.stringify(expense));

        res.writeHead(200, { 'Content-Type': 'text/html' });

        res.end(`
          <html>
            <body>
               <pre>${JSON.stringify(expense, null, 2)}</pre>
            </body>
          </html>
        `);
      });

      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  });
}

module.exports = {
  createServer,
};

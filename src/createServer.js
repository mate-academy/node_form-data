'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const html = `<form action="/add-expense" method="POST">
<input type="date" name="date">date
<input type="text" name="title">title
<input type="number" name="amount">amount
<button type="submit">Submit</button>
</form>`;

const dataPath = path.resolve(__dirname, '../db/expense.json');

function createServer() {
  return http.createServer((req, res) => {
    if (req.url === '/' && req.method === 'GET') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      res.end(html);

      return;
    }

    if (req.url === '/add-expense' && req.method === 'POST') {
      let body = '';

      req.on('data', (chunk) => {
        body += chunk;
      });

      req.on('end', () => {
        const contentType = req.headers['content-type'];

        let expense;

        if (contentType.includes('application/json')) {
          expense = JSON.parse(body);
        } else {
          expense = Object.fromEntries(new URLSearchParams(body));
        }

        const { date, title, amount } = expense;

        if (!date || !title || !amount) {
          res.statusCode = 400;
          res.end('Missing required fields');

          return;
        }

        const json = JSON.stringify(expense, null, 2);

        fs.writeFileSync(dataPath, json);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');

        res.end(`
          <html>
          <pre>${json}</pre>
          </html>
          `);
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

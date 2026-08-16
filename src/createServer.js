'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

const dataPath = path.resolve(__dirname, '../db/expense.json');

const formHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Expense Form</title>
</head>
<body>
  <form method="POST" action="/add-expense">
    <label>
      Date:
      <input type="date" name="date">
    </label>

    <label>
      Title:
      <input type="text" name="title">
    </label>

    <label>
      Amount:
      <input type="number" name="amount">
    </label>

    <button type="submit">Add Expense</button>
  </form>
</body>
</html>
`;

function createServer() {
  return http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      res.end(formHtml);

      return;
    }

    if (req.method === 'POST' && req.url === '/add-expense') {
      const chunks = [];

      req.on('data', (chunk) => {
        chunks.push(chunk);
      });

      req.on('end', () => {
        const body = Buffer.concat(chunks).toString();
        const contentType = req.headers['content-type'];

        let expense;

        if (contentType && contentType.includes('application/json')) {
          expense = JSON.parse(body);
        } else {
          expense = querystring.parse(body);
        }

        if (!expense.date || !expense.title || !expense.amount) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'text/plain');
          res.end('Invalid expense data');

          return;
        }

        fs.writeFileSync(dataPath, JSON.stringify(expense));

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');

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

    res.statusCode = 404;
    res.end();
  });
}

module.exports = {
  createServer,
};

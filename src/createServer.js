'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

const DB_PATH = path.resolve(__dirname, '../db/expense.json');

const FORM_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Add Expense</title>
</head>
<body>
  <h1>Add Expense</h1>
  <form method="POST" action="/add-expense">
    <label>
      Date:
      <input type="date" name="date" required>
    </label>
    <br>
    <label>
      Title:
      <input type="text" name="title" required>
    </label>
    <br>
    <label>
      Amount:
      <input type="number" name="amount" required>
    </label>
    <br>
    <button type="submit">Save Expense</button>
  </form>
</body>
</html>`;

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      resolve(body);
    });

    req.on('error', reject);
  });
}

function parseExpense(body, contentType) {
  if (contentType.includes('application/x-www-form-urlencoded')) {
    return querystring.parse(body);
  }

  return JSON.parse(body);
}

function createServer() {
  return http.createServer(async (req, res) => {
    const { method, url } = req;

    if (method === 'GET' && url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(FORM_HTML);

      return;
    }

    if (method === 'POST' && url === '/add-expense') {
      const body = await parseBody(req);
      const contentType = req.headers['content-type'] || '';
      const expense = parseExpense(body, contentType);

      const { date, title, amount } = expense;

      if (!date || !title || !amount) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });

        res.end(
          'Bad Request: "date", "title" and "amount" are required fields.',
        );

        return;
      }

      const data = { date, title, amount };

      fs.writeFileSync(DB_PATH, JSON.stringify(data));

      const formatted = JSON.stringify(data, null, 2);
      const responseHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Expense Saved</title>
</head>
<body>
  <h1>Expense Saved</h1>
  <pre>${formatted}</pre>
</body>
</html>`;

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(responseHtml);

      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  });
}

module.exports = {
  createServer,
};

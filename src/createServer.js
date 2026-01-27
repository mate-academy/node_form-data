'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const dataPath = path.resolve(__dirname, '../db/expense.json');

function readBody(req) {
  return new Promise((resolve) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => resolve(body));
  });
}

function parseBody(rawBody, contentType = '') {
  if (!rawBody) {
    return {};
  }

  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(rawBody);
    } catch {
      return null;
    }
  }

  if (contentType.includes('application/x-www-form-urlencoded')) {
    const params = new URLSearchParams(rawBody);
    const obj = {};

    for (const [key, value] of params.entries()) {
      obj[key] = value;
    }

    return obj;
  }

  return null;
}

function isValidExpense(expense) {
  return (
    expense &&
    typeof expense === 'object' &&
    typeof expense.date === 'string' &&
    expense.date.length > 0 &&
    typeof expense.title === 'string' &&
    expense.title.length > 0 &&
    typeof expense.amount === 'string' &&
    expense.amount.length > 0
  );
}

function createServer() {
  return http.createServer(async (req, res) => {
    const { url, method } = req;

    if (method === 'GET' && url === '/') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');

      res.end(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Add expense</title>
</head>
<body>
  <h1>Add expense</h1>
  <form action="/add-expense" method="POST">
    <label>
      Date
      <input type="date" name="date" required />
    </label>
    <br />
    <label>
      Title
      <input type="text" name="title" required />
    </label>
    <br />
    <label>
      Amount
      <input type="text" name="amount" required />
    </label>
    <br />
    <button type="submit">Save</button>
  </form>
</body>
</html>`);

      return;
    }

    if (method === 'POST' && url === '/add-expense') {
      const rawBody = await readBody(req);
      const contentType = String(req.headers['content-type'] || '');
      const parsed = parseBody(rawBody, contentType);

      if (!isValidExpense(parsed)) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Invalid expense data');

        return;
      }

      fs.writeFileSync(dataPath, JSON.stringify(parsed, null, 2));

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(parsed));

      return;
    }

    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Not found');
  });
}

module.exports = {
  createServer,
};

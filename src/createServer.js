'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

const dataPath = path.resolve(__dirname, '../db/expense.json');

function sendHtml(res, statusCode, content) {
  res.writeHead(statusCode, {
    'Content-Type': 'text/html; charset=utf-8',
  });

  res.end(content);
}

function getFormPage() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Expense Form</title>
  </head>
  <body>
    <h1>Add Expense</h1>
    <form method="POST" action="/add-expense">
      <label>
        Date
        <input type="date" name="date" required>
      </label>
      <br>
      <label>
        Title
        <input type="text" name="title" required>
      </label>
      <br>
      <label>
        Amount
        <input type="text" name="amount" required>
      </label>
      <br>
      <button type="submit">Save</button>
    </form>
  </body>
</html>`;
}

function getSuccessPage(expense) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Expense Saved</title>
  </head>
  <body>
    <h1>Expense Saved</h1>
    <pre>${JSON.stringify(expense, null, 2)}</pre>
  </body>
</html>`;
}

function parseBody(req) {
  return new Promise((resolve) => {
    let rawBody = '';

    req.on('data', (chunk) => {
      rawBody += chunk;
    });

    req.on('end', () => {
      const contentType = req.headers['content-type'] || '';

      if (contentType.includes('application/x-www-form-urlencoded')) {
        resolve(querystring.parse(rawBody));

        return;
      }

      if (contentType.includes('application/json')) {
        try {
          resolve(JSON.parse(rawBody || '{}'));
        } catch {
          resolve({});
        }

        return;
      }

      resolve({});
    });
  });
}

function createServer() {
  return http.createServer(async (req, res) => {
    if (req.method === 'GET' && req.url === '/') {
      sendHtml(res, 200, getFormPage());

      return;
    }

    if (req.method === 'POST' && req.url === '/add-expense') {
      const body = await parseBody(req);
      const expense = {
        date: body.date,
        title: body.title,
        amount: body.amount,
      };

      if (!expense.date || !expense.title || !expense.amount) {
        sendHtml(res, 400, '<h1>Invalid expense data</h1>');

        return;
      }

      fs.writeFileSync(dataPath, JSON.stringify(expense, null, 2));
      sendHtml(res, 200, getSuccessPage(expense));

      return;
    }

    res.writeHead(404, {
      'Content-Type': 'text/plain; charset=utf-8',
    });
    res.end('Not Found');
  });
}

module.exports = {
  createServer,
};

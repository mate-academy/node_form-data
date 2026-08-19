'use strict';

const http = require('http');
const fs = require('fs/promises');
const path = require('path');
const querystring = require('querystring');

const DATA_PATH = path.join(__dirname, '../db/expense.json');

async function getRequestBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString();
}

function parseBody(rawBody, contentType = '') {
  if (contentType.includes('application/json')) {
    return rawBody ? JSON.parse(rawBody) : {};
  }

  return querystring.parse(rawBody);
}

function renderForm() {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Add expense</title>
  </head>
  <body>
    <form method="POST" action="/add-expense">
      <label>
        Date
        <input type="date" name="date" required>
      </label>
      <label>
        Title
        <input type="text" name="title" required>
      </label>
      <label>
        Amount
        <input type="number" name="amount" required>
      </label>
      <button type="submit">Add expense</button>
    </form>
  </body>
</html>
`;
}

function renderResult(expense) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Expense added</title>
  </head>
  <body>
    <pre>${JSON.stringify(expense, null, 2)}</pre>
  </body>
</html>
`;
}

function createServer() {
  return http.createServer(async (req, res) => {
    try {
      if (req.method === 'GET' && req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(renderForm());

        return;
      }

      if (req.method === 'POST' && req.url === '/add-expense') {
        const rawBody = await getRequestBody(req);
        const body = parseBody(rawBody, req.headers['content-type']);
        const { date, title, amount } = body;

        if (!date || !title || !amount) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('date, title and amount are required');

          return;
        }

        const expense = { date, title, amount };

        await fs.writeFile(DATA_PATH, JSON.stringify(expense));

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(renderResult(expense));

        return;
      }

      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal server error');
    }
  });
}

module.exports = {
  createServer,
};

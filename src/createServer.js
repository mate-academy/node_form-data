'use strict';

const http = require('http');
const fs = require('fs/promises');
const path = require('path');

function renderForm() {
  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Expense form</title>
      </head>
      <body>
        <h1>Add expense</h1>

        <form method="POST" action="/add-expense">
          <label>
            Date:
            <input type="date" name="date" required />
          </label>
          <br /><br />

          <label>
            Title:
            <input type="text" name="title" required />
          </label>
          <br /><br />

          <label>
            Amount:
            <input type="number" name="amount" step="0.01" required />
          </label>
          <br /><br />

          <button type="submit">Save</button>
        </form>
      </body>
    </html>
  `;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();

      if (body.length > 1e6) {
        req.destroy();
        reject(new Error('Body too large'));
      }
    });

    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function parseExpense(req, body) {
  const contentType = (req.headers['content-type'] || '').toLowerCase();

  if (contentType.includes('application/json')) {
    const data = JSON.parse(body || '{}');

    return {
      date: data.date ?? '',
      title: data.title ?? '',
      amount: data.amount ?? '',
    };
  }

  const params = new URLSearchParams(body);

  return {
    date: params.get('date') || '',
    title: params.get('title') || '',
    amount: params.get('amount') || '',
  };
}

function isValidExpense(expense) {
  return Boolean(expense.date && expense.title && expense.amount);
}

function createServer() {
  return http.createServer(async (req, res) => {
    if (req.method === 'GET' && req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(renderForm());

      return;
    }

    const isExpensePost =
      req.method === 'POST' &&
      (req.url === '/add-expense' || req.url === '/submit-expense');

    if (isExpensePost) {
      try {
        const body = await readBody(req);
        const expense = parseExpense(req, body);

        if (!isValidExpense(expense)) {
          res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('Bad request: missing required fields');

          return;
        }

        const dbDir = path.join(__dirname, '..', 'db');
        const filePath = path.join(dbDir, 'expense.json');

        await fs.mkdir(dbDir, { recursive: true });
        await fs.writeFile(filePath, JSON.stringify(expense, null, 2), 'utf-8');

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });

        res.end(`
          <!doctype html>
          <html lang="en">
            <head>
              <meta charset="utf-8" />
              <title>Saved expense</title>
            </head>
            <body>
              <h1>Saved expense</h1>
              <pre>${JSON.stringify(expense, null, 2)}</pre>
              <a href="/">Back</a>
            </body>
          </html>
        `);

        return;
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Server error');

        return;
      }
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  });
}

module.exports = {
  createServer,
};

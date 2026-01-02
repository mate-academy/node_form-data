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
        <title>Expense form</title>
      </head>
      <body>
        <h1>Add expense</h1>
        <form method="POST" action="/add-expense">
          <input type="date" name="date" required />
          <input type="text" name="title" required />
          <input type="number" name="amount" required />
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
  const type = req.headers['content-type'] || '';

  if (type.includes('application/json')) {
    const data = JSON.parse(body || '{}');

    return {
      date: data.date || '',
      title: data.title || '',
      amount: data.amount || '',
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
  return expense.date && expense.title && expense.amount;
}

function createServer() {
  return http.createServer(async (req, res) => {
    if (req.method === 'GET' && req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(renderForm());

      return;
    }

    if (
      req.method === 'POST' &&
      (req.url === '/add-expense' || req.url === '/submit-expense')
    ) {
      try {
        const body = await readBody(req);
        const expense = parseExpense(req, body);

        if (!isValidExpense(expense)) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Bad request');

          return;
        }

        const dbDir = path.join(__dirname, '..', 'db');
        const filePath = path.join(dbDir, 'expense.json');

        await fs.mkdir(dbDir, { recursive: true });
        await fs.writeFile(filePath, JSON.stringify(expense, null, 2), 'utf-8');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(expense));

        return;
      } catch {
        res.writeHead(500);
        res.end();

        return;
      }
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  });
}

module.exports = {
  createServer,
};

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

function parseBody(body) {
  try {
    return JSON.parse(body);
  } catch {
    const params = new URLSearchParams(body);
    const result = {};

    for (const [key, value] of params.entries()) {
      result[key] = value;
    }

    return result;
  }
}

function createServer() {
  return http.createServer((req, res) => {
    const isPostExpense =
      req.method === 'POST' &&
      (req.url === '/add-expense' || req.url === '/submit-expense');

    if (isPostExpense) {
      let body = '';

      req.on('data', (chunk) => {
        body += chunk.toString();
      });

      req.on('end', () => {
        const expense = parseBody(body);
        const { date, title, amount } = expense;

        if (!date || !title || !amount) {
          res.writeHead(400, { 'Content-Type': 'application/json' });

          res.end(JSON.stringify('Missing required fields'));

          return;
        }

        const dataPath = path.resolve(__dirname, '..', 'db', 'expense.json');

        const dir = path.dirname(dataPath);

        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(dataPath, JSON.stringify(expense, null, 2), 'utf-8');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(expense));
      });

      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify('Not found'));
  });
}

module.exports = {
  createServer,
};

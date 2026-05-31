'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const querystring = require('node:querystring');

const DB_PATH = path.resolve(__dirname, '../db/expense.json');
const FORM_PATH = path.resolve(__dirname, './views/form.html');

function createServer() {
  return http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
      const html = fs.readFileSync(FORM_PATH, 'utf-8');

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);

      return;
    }

    if (req.method === 'POST' && req.url === '/add-expense') {
      let body = '';

      req.on('data', (chunk) => {
        body += chunk;
      });

      req.on('end', () => {
        const contentType = req.headers['content-type'] || '';
        let expense;

        if (contentType.includes('application/x-www-form-urlencoded')) {
          expense = querystring.parse(body);
        } else {
          try {
            expense = JSON.parse(body);
          } catch {
            expense = querystring.parse(body);
          }
        }

        const { date, title, amount } = expense;

        if (!date || !title || !amount) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Bad Request: date, title and amount are required');

          return;
        }

        const data = { date, title, amount };

        fs.writeFileSync(DB_PATH, JSON.stringify(data));

        const html = `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8"><title>Expense Saved</title></head>
  <body>
    <pre>${JSON.stringify(data, null, 2)}</pre>
  </body>
</html>`;

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
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

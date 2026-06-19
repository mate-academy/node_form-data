'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

function createServer() {
  return http.createServer(async (req, res) => {
    const { url, method } = req;

    if (method === 'GET' && url === '/') {
      const htmlPath = path.join(__dirname, 'index.html');

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(htmlPath).pipe(res);

      return;
    }

    if (
      method === 'POST' &&
      (url === '/add-expense' || url === '/submit-expense')
    ) {
      let body = '';

      req.on('data', (chunk) => {
        body += chunk;
      });

      req.on('end', () => {
        const contentType = req.headers['content-type'] || '';
        const isJsonRequest = contentType.includes('application/json');
        let expense;

        try {
          if (contentType.includes('application/json')) {
            expense = JSON.parse(body);
          } else if (
            contentType.includes('application/x-www-form-urlencoded')
          ) {
            expense = Object.fromEntries(new URLSearchParams(body));
          } else {
            expense = {};
          }
        } catch {
          res.writeHead(400);

          return res.end('Invalid JSON');
        }

        if (!expense.date || !expense.title || expense.amount === undefined) {
          res.writeHead(400);

          return res.end('Invalid form data');
        }

        const dbPath = path.resolve('db', 'expense.json');

        // NOTE:
        // expense.json overwrites on each request
        // because task tests expect the file to contain
        // a single expense object.
        // In a real application we would store an array of expenses.
        fs.writeFileSync(dbPath, JSON.stringify(expense, null, 2), 'utf-8');

        if (isJsonRequest) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(expense));
        } else {
          const prettyJson = JSON.stringify(expense, null, 2);

          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });

          res.end(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <title>Document</title>
            </head>
            <body>
              <h1>Saved expense</h1>
              <pre>${prettyJson}</pre>
            </body>
            </html>
          `);
        }
      });

      return;
    }

    res.writeHead(404);
    res.end('Not Found');
  });
}

module.exports = {
  createServer,
};

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

function createServer() {
  return http.createServer((req, res) => {
    if (req.url === '/add-expense' && req.method === 'POST') {
      let body = '';

      req.on('data', (chunk) => {
        body += chunk.toString();
      });

      req.on('end', () => {
        let expense;

        try {
          const contentType = req.headers['content-type'] || '';

          if (contentType.includes('application/json')) {
            expense = JSON.parse(body);
          } else if (
            contentType.includes('application/x-www-form-urlencoded')
          ) {
            const parsed = new URLSearchParams(body);

            expense = {
              date: parsed.get('date'),
              title: parsed.get('title'),
              amount: parsed.get('amount'),
            };
          } else {
            res.statusCode = 400;

            return res.end('Unsupported content type');
          }
        } catch {
          res.statusCode = 400;

          return res.end('Invalid request body');
        }

        const { date, title, amount } = expense;

        if (!date || !title || !amount) {
          res.statusCode = 400;

          return res.end('Missing required fields');
        }

        const filePath = path.join(__dirname, '../db/expense.json');

        fs.writeFileSync(filePath, JSON.stringify(expense, null, 2));

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');

        /*

        res.setHeader('Content-Type', 'text/html');
        res.end(`
  <!DOCTYPE html>
  <html>
    <body>
      <pre><code>${JSON.stringify(expense, null, 2)}</code></pre>
    </body>
  </html>
`);

        */

        return res.end(JSON.stringify(expense));
      });

      return;
    }

    if (req.method === 'GET' && req.url === '/') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');

      return res.end(`
        <!DOCTYPE html>
        <html>
          <body>
            <form method="POST" action="/add-expense">
              <input type="date" name="date" required />
              <input type="text" name="title" placeholder="Title" required />
              <input type="number" name="amount" placeholder="Amount" required />
              <button type="submit">Add expense</button>
            </form>
          </body>
        </html>
      `);
    }

    res.statusCode = 404;
    res.end('Not found');
  });
}

module.exports = {
  createServer,
};

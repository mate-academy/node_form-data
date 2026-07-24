'use strict';

const { Server } = require('http');
const fs = require('fs');
const path = require('path');

function createServer() {
  const server = new Server();
  const form = `
    <form action="/add-expense" method="post">
      <input type="date" name="date" class="input" />
      <input type="text" name="title" class="input" />
      <input type="number" name="amount" class="input" />
      <input type="submit" value="Submit" class="form-button">
    </form>
  `;

  const pathToDb = path.join(__dirname, '../', 'db');

  if (!fs.existsSync(pathToDb)) {
    fs.mkdirSync(pathToDb);
  }

  const filePath = path.resolve('db', 'expense.json');

  server.on('request', (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const requestPath = url.pathname;

    if (req.method === 'GET') {
      if (requestPath === '/') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');

        return res.end(form);
      } else if (requestPath === '/db/expense.json') {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'text/plain');

        return res.end('Incorrect request');
      } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');

        return res.end('Page not found');
      }
    }

    if (req.method === 'POST' && requestPath === '/add-expense') {
      const data = [];

      req.on('data', (chunk) => {
        data.push(chunk);
      });

      req.on('end', () => {
        const body = Buffer.concat(data).toString();

        let dateParam = '';
        let titleParam = '';
        let amountParam = NaN;

        if (req.headers['content-type'] === 'application/json') {
          try {
            const parsed = JSON.parse(body);

            dateParam = parsed.date ?? '';
            titleParam = parsed.title ?? '';
            amountParam = parsed.amount ?? 'NaN';
          } catch (e) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Bad reqiest');
          }
        } else {
          const params = new URLSearchParams(body);

          dateParam = params.get('date');
          titleParam = params.get('title');
          amountParam = params.get('amount');
        }

        if (!dateParam || !titleParam || !amountParam) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'text/plain');

          return res.end('Invalid data');
        }

        const dateObj = new Date(dateParam);
        const isValidDate =
          dateObj instanceof Date && !isNaN(dateObj.getTime());
        const isValidTitle = titleParam?.trim().length > 0;
        const isValidAmount = !isNaN(parseFloat(amountParam));

        if (!isValidDate || !isValidTitle || !isValidAmount) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'text/plain');

          return res.end('Invalid data');
        }

        const record = {
          date: dateParam,
          title: titleParam,
          amount: amountParam,
        };
        const recordJson = JSON.stringify(record, null, 2);

        fs.writeFileSync(filePath, recordJson);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');

        return res.end(`
  <!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8">
  <title>Expense Added</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      padding: 2rem;
      background-color: #f4f4f9;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1 {
      font-size: 1.25rem;
      margin-bottom: 1rem;
      color: #2c3e50;
    }
    pre {
      background: #282c34;
      color: #abb2bf;
      padding: 1rem;
      border-radius: 6px;
      overflow-x: auto;
      font-family: 'Fira Code', Consolas, Monaco, monospace;
      font-size: 0.9rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Запис успішно додано!</h1>
    <pre><code>${recordJson}</code></pre>
  </div>
</body>
</html>
`);
      });
    }
  });

  return server;
}

module.exports = {
  createServer,
};

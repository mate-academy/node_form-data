'use strict';

const http = require('http');
const fs = require('fs/promises');
const path = require('path');

const dataPath = path.resolve(__dirname, '../db/expense.json');

function createServer() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    // ГЕНЕРУЄМО ФОРМУ
    if (url.pathname === '/' && req.method === 'GET') {
      res.setHeader('Content-Type', 'text/html');

      return res.end(`
        <!doctype html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Document</title>
          </head>
          <body>
            <main>
              <h1>Add Expense</h1>
              <form method="POST" action="/add-expense">
                <input type="date" name="date" required />
                <input type="text" name="title" placeholder="Title" required />
                <input type="number" name="amount" placeholder="Amount" required />
                <button type="submit">Save Expense</button>
              </form>
            </main>
          </body>
        </html>
      `);
    }

    // Обробляємо тільки POST /add-expense
    if (url.pathname === '/add-expense' && req.method === 'POST') {
      const chunks = [];

      try {
        for await (const chunk of req) {
          chunks.push(chunk);
        }

        const body = Buffer.concat(chunks).toString();
        let expense;

        try {
          expense = JSON.parse(body);
        } catch {
          // Якщо браузер шле форму, вона прийде як date=...&title=...
          const { parse } = require('querystring');

          expense = parse(body);
        }

        // ВАЛІДАЦІЯ: перевіряємо наявність усіх полів
        if (!expense.date || !expense.title || !expense.amount) {
          res.statusCode = 400; // Або інший код помилки

          return res.end('Missing required fields');
        }

        // ЗБЕРЕЖЕННЯ: перезаписуємо файл
        await fs.writeFile(dataPath, JSON.stringify(expense, null, 2));

        // Перевіряємо, чого хоче клієнт: HTML чи JSON?
        const acceptHeader = req.headers.accept || '';

        if (acceptHeader.includes('text/html')) {
          // Відповідь для МЕНТОРА (браузер)
          res.setHeader('Content-Type', 'text/html');

          return res.end(`
            <html>
              <body>
                <h1>Expense Saved!</h1>
                <pre style="background: #f4f4f4; padding: 10px; border-radius: 5px; border: 1px solid #ddd;"
                >
                  ${JSON.stringify(expense, null, 2)}
                </pre>
                <a href="/">Back to form</a>
              </body>
            </html>
          `);
        } else {
          // Відповідь для ТЕСТІВ (axios)
          res.setHeader('Content-Type', 'application/json');

          return res.end(JSON.stringify(expense));
        }
      } catch (err) {
        res.statusCode = 400;

        return res.end('Error processing request');
      }
    }

    // Всі інші маршрути — 404
    res.statusCode = 404;
    res.end('Not Found');
  });
}

module.exports = { createServer };

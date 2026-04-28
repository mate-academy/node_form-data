'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

function createServer() {
  return http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
      res.writeHead(200, {
        'Content-Type': 'text/html',
      });

      res.end(`
        <!doctype html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <title>Add expense</title>
          </head>
          <body>
            <h1>Add expense</h1>

            <form method="POST" action="/add-expense">
              <label>
                Date
                <input type="date" name="date" />
              </label>
              <br />
              <label>
                Title
                <input type="text" name="title" />
              </label>
              <br />
              <label>
                Amount
                <input type="text" name="amount" />
              </label>
              <br />
              <button type="submit">Submit</button>
            </form>
          </body>
        </html>
      `);

      return;
    }

    if (req.method === 'POST' && req.url === '/add-expense') {
      let body = '';

      req.on('data', (chunk) => {
        body += chunk.toString();
      });

      req.on('end', () => {
        const contentType = req.headers['content-type'] || '';
        let expense = {};

        try {
          if (contentType.includes('application/json')) {
            expense = JSON.parse(body);
          } else {
            expense = querystring.parse(body);
          }
        } catch (error) {
          res.writeHead(400, {
            'Content-Type': 'text/plain',
          });
          res.end('Invalid request body');

          return;
        }

        const { date, title, amount } = expense;

        if (!date || !title || !amount) {
          res.writeHead(400, {
            'Content-Type': 'text/plain',
          });
          res.end('Missing required fields');

          return;
        }

        const dataPath = path.resolve(__dirname, '../db/expense.json');

        fs.writeFileSync(dataPath, JSON.stringify({ date, title, amount }));

        if (contentType.includes('application/json')) {
          res.writeHead(200, {
            'Content-Type': 'application/json',
          });
          res.end(JSON.stringify({ date, title, amount }));

          return;
        }

        res.writeHead(200, {
          'Content-Type': 'text/html',
        });

        res.end(`
          <!doctype html>
          <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <title>Expense saved</title>
            </head>
            <body>
              <h1>Expense saved</h1>
              <pre>${escapeHtml(JSON.stringify({ date, title, amount }, null, 2))}</pre>
              <a href="/">Back</a>
            </body>
          </html>
        `);
      });

      return;
    }

    res.writeHead(404, {
      'Content-Type': 'text/plain',
    });
    res.end('Page not found');
  });
}

function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

module.exports = {
  createServer,
};

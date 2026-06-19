'use strict';

const http = require('http');
const querystring = require('querystring');

function createServer() {
  return http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
      const html = `<!doctype html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Expense Form</title>
          </head>
          <body>
            <h1>Submit expense</h1>
            <form method="POST" action="/add-expense">
              <label>
                Date
                <input type="date" name="date" required />
              </label>
              <label>
                Title
                <input type="text" name="title" required />
              </label>
              <label>
                Amount
                <input type="number" name="amount" required />
              </label>
              <button type="submit">Submit</button>
            </form>
          </body>
        </html>`;

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);

      return;
    }

    if (req.method === 'POST' && req.url === '/add-expense') {
      let body = '';
      const contentType = req.headers['content-type'] || '';

      req.on('data', (chunk) => {
        body += chunk.toString();
      });

      req.on('end', () => {
        let expense;

        try {
          if (contentType.includes('application/x-www-form-urlencoded')) {
            expense = querystring.parse(body);
          } else {
            expense = JSON.parse(body);
          }
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(['Invalid request payload']));

          return;
        }

        if (expense.date && expense.title && expense.amount) {
          const fs = require('fs');
          const path = require('path');
          const dataPath = path.resolve(__dirname, '../db/expense.json');

          fs.writeFileSync(dataPath, JSON.stringify(expense, null, 2));
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(expense));
        } else {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(['Missing required fields']));
        }
      });
    } else {
      const notFoundHtml = `<!doctype html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Not Found</title>
          </head>
          <body>
            <h1>404 - Not Found</h1>
            <p>Sorry, the page you are looking for does not exist.</p>
          </body>
        </html>`;

      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(notFoundHtml);
    }
  });
}

module.exports = {
  createServer,
};

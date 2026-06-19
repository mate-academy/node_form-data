'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

function createServer() {
  /* Write your code here */
  // Return instance of http.Server class
  return http.createServer((req, res) => {
    if (req.url === '/' && req.method === 'GET') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');

      res.end(`
        <html>
          <head>
            <title>Expense Form</title>
          </head>
          <body>
            <h2>Add Expense</h2>
            <form method="POST" action="/submit-expense">
              <label>Date:</label>
              <input type="date" name="date" required />

              <label>Title:</label>
              <input type="text" name="title" placeholder="Title" required />

              <label>Amount:</label>
              <input type="number" name="amount" placeholder="Amount" required />

              <button type="submit">Submit</button>
            </form>
          </body>
        </html>
      `);
    } else if (
      (req.url === '/submit-expense' || req.url === '/add-expense') &&
      req.method === 'POST'
    ) {
      const chunks = [];

      req.on('data', (chunk) => {
        chunks.push(chunk);
      });

      req.on('end', () => {
        try {
          const body = Buffer.concat(chunks).toString();

          if (!body) {
            res.statusCode = 400;
            res.end('Empty body');

            return;
          }

          const contentType = req.headers['content-type'] || '';
          let bodyParsed;

          if (contentType.includes('application/json')) {
            bodyParsed = JSON.parse(body);
          } else {
            bodyParsed = querystring.parse(body);
          }

          const { date, title, amount } = bodyParsed;

          if (
            !date ||
            !title ||
            !amount ||
            date.trim() === '' ||
            title.trim() === '' ||
            amount.toString().trim() === ''
          ) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'text/plain');

            res.end(
              'Missing required fields: date, title and amount are required',
            );

            return;
          }

          const dbDir = path.join(__dirname, '..', 'db');

          if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir);
          }

          const filePath = path.join(dbDir, 'expense.json');

          fs.writeFileSync(filePath, JSON.stringify(bodyParsed, null, 2));
          res.statusCode = 200;

          if (req.url === '/add-expense') {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(bodyParsed));
          } else {
            res.setHeader('Content-Type', 'text/html');

            res.end(`
              <html>
                <body>
                  <pre>${JSON.stringify(bodyParsed, null, 2)}</pre>
                </body>
              </html>
            `);
          }
        } catch (err) {
          res.statusCode = 500;
          res.end('Server error: ' + err.message);
        }
      });
    } else {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');
      res.end(`Invalid url: ${req.url}`);
    }
  });
}

module.exports = {
  createServer,
};

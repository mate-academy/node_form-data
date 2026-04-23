'use strict';

const http = require('http');
const fs = require('fs');

function createServer() {
  /* Write your code here */
  // Return instance of http.Server class
  return http.createServer(async (req, res) => {
    if (req.method === 'POST' && req.url === '/add-expense') {
      try {
        let body = '';

        req.on('data', (chunk) => {
          body += chunk.toString();
        });

        req.on('end', () => {
          let expense;

          const contentType = req.headers['content-type'];

          try {
            if (contentType.includes('application/json')) {
              expense = JSON.parse(body);
            } else if (
              contentType.includes('application/x-www-form-urlencoded')
            ) {
              const parsed = new URLSearchParams(body);

              expense = Object.fromEntries(parsed.entries());
            } else {
              res.writeHead(415);

              return res.end('Unsupported Content-Type');
            }
          } catch (err) {
            res.writeHead(400);

            return res.end('Invalid body');
          }

          const { date, title, amount } = expense;

          if (!date || !title || !amount) {
            res.writeHead(400);

            return res.end('Missing required fields');
          }

          fs.writeFileSync('db/expense.json', JSON.stringify(expense));

          res.writeHead(200, { 'Content-Type': 'application/json' });

          res.end(JSON.stringify(expense));

          // res.end(`<h1>Date: ${date}</h1>
          //   <h1>Title: ${title}</h1>
          //   <h1>Amount: ${amount}</h1>`);
        });
      } catch (err) {
        res.writeHead(500);
        res.end('Error parsing form');
      }
    } else if (req.method === 'GET' && req.url === '/') {
      res.statusCode = 200;
      res.setHeader('Content-type', 'text/html');

      res.end(`<h1>Input data</h1>
        <form method="POST" action="/add-expense">
        <input name="date" type="date" required>
        <input name="title" type="text" required>
        <input name="amount" type="number" required>

        <button type="submit">Submit</button>
      </form>`);
    } else {
      res.statusCode = 404;
      res.end('Page not found');
    }
  });
}

module.exports = {
  createServer,
};

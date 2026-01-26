'use strict';

const http = require('http');
const fs = require('fs');

const HTML =
  '<form method="post">' +
  '<input type="text" name="title" />' +
  '<input type="date" name="date" />' +
  '<input type="number" name="amount" />' +
  '<button type="submit" name="amount">submit</button>' +
  '</form>';

function createServer() {
  return http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    if (pathname !== '/submit-expense' && pathname !== '/') {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');
      res.end('404 Not Found');

      return;
    }

    if (pathname === '/submit-expense' && req.method === 'POST') {
      if (req.method === 'POST') {
        const chunks = [];

        req.on('data', (chunk) => {
          chunks.push(chunk);
        });

        req.on('end', () => {
          const body = Buffer.concat(chunks).toString();
          const data = JSON.parse(body);

          if (!data) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Invalid Request');

            return;
          }

          const { date, title, amount } = data;

          if (!date || !title || !amount) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Invalid Request');

            return;
          }

          fs.writeFileSync('db/expense.json', body);

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        });

        return;
      }
    }

    res.setHeader('Content-Type', 'text/html');
    res.end(HTML);
  });
}

module.exports = {
  createServer,
};

'use strict';

const http = require('http');
const fs = require('fs');
const querystring = require('querystring');
const path = require('path');

function createServer() {
  const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
      res.setHeader('Content-Type', 'text/html');

      const html =
        // eslint-disable-next-line max-len
        '<!DOCTYPE html><html><body><form method="POST" action="/add-expense"><input name="date" /><input name="title" /><input name="amount" /><button type="submit">Submit</button></form></body></html>';

      res.end(html);
    } else if (req.method === 'POST' && req.url === '/add-expense') {
      let body = '';

      req.on('data', (chunk) => (body += chunk));

      res.setHeader('Content-Type', 'text/html');

      req.on('end', () => {
        if (req.headers['content-type']) {
          let expense = {};

          if (
            req.headers['content-type'].includes(
              'application/x-www-form-urlencoded',
            )
          ) {
            expense = querystring.parse(body);
          } else {
            expense = JSON.parse(body);
          }

          if (
            expense.date === undefined ||
            expense.title === undefined ||
            expense.amount === undefined
          ) {
            res.statusCode = 400;
            res.end('Bad request');
          } else {
            fs.writeFileSync(
              path.resolve(__dirname, '../db/expense.json'),
              JSON.stringify(expense),
            );
            res.statusCode = 200;

            const html =
              // eslint-disable-next-line max-len
              `<!DOCTYPE html><html><body><pre>${JSON.stringify(expense, null, 2)}</pre></body></html>`;

            res.end(html);

            return;
          }
        }
        res.statusCode = 400;
        res.end();
      });
    } else {
      res.statusCode = 404;
      res.end('Bad request');
    }
  });

  return server;
}

module.exports = {
  createServer,
};

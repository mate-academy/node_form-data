'use strict';

const http = require('http');
const fs = require('fs');
const { pipeline } = require('stream');
const path = require('path');

function createServer() {
  return http.createServer((request, response) => {
    const { method, url } = request;

    if (method === 'GET' && url === '/') {
      response.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
      });

      pipeline(
        fs.createReadStream(path.join(__dirname, 'index.html')),
        response,
        (err) => {
          if (err) {
            response.writeHead(500, {
              'Content-Type': 'text/plain; charset=utf-8',
            });
            response.end(err.message);
          }
        },
      );

      return;
    }

    if (method === 'POST' && url === '/add-expense') {
      let body = '';

      request.on('data', (chunk) => {
        body += chunk;
      });

      request.on('end', () => {
        let expense;

        try {
          expense = JSON.parse(body);
        } catch {
          const urlParams = new URLSearchParams(body);

          expense = Object.fromEntries(urlParams);
        }

        if (
          !Object.hasOwn(expense, 'date') ||
          !Object.hasOwn(expense, 'title') ||
          !Object.hasOwn(expense, 'amount')
        ) {
          response.writeHead(400, {
            'Content-Type': 'text/plain; charset=utf-8',
          });

          response.end('bad request');

          return;
        }

        fs.writeFile(
          path.join(__dirname, '../db', 'expense.json'),
          JSON.stringify(expense),
          (err) => {
            if (err) {
              response.writeHead(500, {
                'Content-Type': 'text/plain; charset=utf-8',
              });

              response.end(err.message);

              return;
            }

            response.writeHead(200, {
              'Content-Type': 'text/html',
            });

            const formatted = JSON.stringify(expense, null, 2);

            const responseHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Expense Saved</title>
</head>
<body>
  <h1>Expense Saved</h1>
  <pre>${formatted}</pre>
</body>
</html>`;

            response.end(responseHtml);
          },
        );
      });

      return;
    }

    response.writeHead(404, { 'Content-Type': 'text/plain' });
    response.end('Not fount');
  });
}

module.exports = {
  createServer,
};

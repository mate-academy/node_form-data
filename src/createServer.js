/* eslint-disable no-console */
/* eslint-disable no-useless-return */
'use strict';

const http = require('http');
const fs = require('fs');
const querystring = require('querystring');

function createServer() {
  const server = http.createServer((req, res) => {
    const fullData = [];

    if (req.method === 'POST' && req.url === '/add-expense') {
      req.on('data', (chunk) => {
        fullData.push(chunk);
      });

      req.on('end', () => {
        const body = Buffer.concat(fullData);
        let expenseData = '';

        if (req.headers['content-type'] === 'application/json') {
          expenseData = JSON.parse(body.toString());
        } else {
          expenseData = querystring.parse(body.toString());
        }

        if (!expenseData.date || !expenseData.title || !expenseData.amount) {
          res.writeHead(400, { 'Content-type': 'text/plain' });
          res.end('Not all parameters are specified');

          return;
        }

        fs.writeFileSync(
          'db/expense.json',
          JSON.stringify(expenseData, null, 2),
        );
        res.writeHead(200, { 'Content-type': 'text/html' });

        res.end(
          `<html>
          <pre>${JSON.stringify(expenseData, null, 2)}
          </pre>
          </html>
          `,
        );
      });
    } else if (req.method === 'GET' && req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html' });

      res.end(
        `<form action="/add-expense" method="POST">
          <input name="date">
          <input name="title">
          <input name="amount">
          <button>Submit</button>
        </form>`,
      );
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    }
  });

  return server;
}

module.exports = {
  createServer,
};

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

function parseExpense(body, contentType = '') {
  // It's for tests, because axios sends JSON instead of x-www-form-urlencoded.
  if (contentType.includes('application/json')) {
    return JSON.parse(body);
  }

  return Object.fromEntries(new URLSearchParams(body).entries());
}

function isValidExpense(expense) {
  return Boolean(expense.date && expense.title && expense.amount);
}

function createServer() {
  const server = http.createServer((req, res) => {
    if (req.url === '/') {
      fs.readFile(
        path.resolve(__dirname, '../public/index.html'),
        'utf8',
        (err, data) => {
          if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Bad Request');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
          }
        },
      );
    } else if (req.url === '/add-expense' && req.method === 'POST') {
      const body = [];

      req.on('data', (chunk) => {
        body.push(chunk);
      });

      req.on('end', () => {
        let parsedData;

        try {
          parsedData = parseExpense(
            Buffer.concat(body).toString(),
            req.headers['content-type'],
          );
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Invalid request body');

          return;
        }

        if (!isValidExpense(parsedData)) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Missing required fields');

          return;
        }

        fs.writeFile(
          path.resolve(__dirname, '../db/expense.json'),
          JSON.stringify(parsedData, null, 2),
          (err) => {
            if (err) {
              res.writeHead(500, { 'Content-Type': 'text/plain' });
              res.end('Error saving data');
            } else {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(parsedData));
            }
          },
        );
      });
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  });

  return server;
}

module.exports = {
  createServer,
};

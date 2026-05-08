'use strict';

const http = require('http');

const fs = require('fs');

const querystring = require('querystring');

function createServer() {
  return http.createServer((req, res) => {
    if (req.url === '/' && req.method === 'GET') {
      fs.readFile('./src/index.html', (err, date) => {
        if (err) {
          res.statusCode = 500;
          res.end();

          return;
        }
        res.setHeader('Content-Type', 'text/html');
        res.statusCode = 200;
        res.end(date);
      });
    } else if (req.url === '/add-expense' && req.method === 'POST') {
      // обробити дані
      let body = '';

      req.on('data', (chunk) => {
        body += chunk;
      });

      req.on('end', () => {
        const contentType = req.headers['content-type'];
        let parsed;

        if (contentType.includes('application/json')) {
          parsed = JSON.parse(body);
        } else {
          parsed = querystring.parse(body);
        }

        if (!parsed.date || !parsed.title || !parsed.amount) {
          res.statusCode = 400;
          res.end('Bad request');

          return;
        }

        const data = JSON.stringify(parsed, null, 2);

        fs.writeFile('./db/expense.json', data, (error) => {
          if (error) {
            res.statusCode = 500;
            res.end();

            return;
          }

          res.setHeader('Content-Type', 'text/html');
          res.statusCode = 200;
          res.end(`<html><body><pre>${data}</pre></body></html>`);
        });
      });
    } else {
      res.statusCode = 404;
      res.end();
    }
  });
}

module.exports = {
  createServer,
};

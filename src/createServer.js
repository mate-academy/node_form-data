'use strict';

const http = require('http');
const fs = require('fs');

function createServer() {
  return new http.Server((req, res) => {
    if (req.url === '/' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(fs.readFileSync('public/index.html'));
    } else if (req.url === '/add-expense' && req.method === 'POST') {
      let data = '';

      req.on('data', (chunk) => {
        data += chunk;
      });

      req.on('end', () => {
        const params = new URLSearchParams(data);

        if (!params.get('date')
          || !params.get('title')
          || !params.get('amount')) {
          fs.writeFileSync('db/expense.json', JSON.stringify({}));
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Invalid form data');

          return;
        }

        const obj = {
          date: params.get('date'),
          title: params.get('title'),
          amount: params.get('amount'),
        };

        const str = JSON.stringify(obj);

        fs.writeFileSync('db/expense.json', str);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(str);
      });
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Page not found');
    }
  });
}

module.exports = {
  createServer,
};

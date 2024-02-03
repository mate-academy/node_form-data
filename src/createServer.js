'use strict';

const http = require('http');
const fs = require('fs');
const formidable = require('formidable');

function createServer() {
  return new http.Server((req, res) => {
    if (req.url === '/' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(fs.readFileSync('public/index.html'));
    } else if (req.url === '/add-expense' && req.method === 'POST') {
      const form = new formidable.IncomingForm();

      form.parse(req)
        .then(([fields]) => {
          if (!fields.date
            || !fields.title
            || !fields.amount) {
            fs.writeFileSync('db/expense.json', JSON.stringify({}));
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid form data');

            return;
          }

          const obj = {
            date: fields.date,
            title: fields.title,
            amount: fields.amount,
          };

          const str = JSON.stringify(obj);

          fs.writeFileSync('db/expense.json', str);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.write(str);
        }).catch(() => {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.write('Server error');
        }).finally(() => {
          res.end('');
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

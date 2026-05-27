'use strict';

const http = require('http');
const fs = require('fs');

function createServer() {
  return http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
      const fileStream = fs.createReadStream('src/index.html');

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      fileStream.pipe(res);

      fileStream.on('error', () => {
        res.statusCode = 500;

        res.end('Server error');
      });

      return;
    }

    if (req.method === 'POST' && req.url === '/add-expense') {
      let body = '';

      req.on('data', (chunck) => (body += chunck));

      req.on('end', () => {
        const data = JSON.parse(body);

        // eslint-disable-next-line
        console.log(body);
        // eslint-disable-next-line
        console.log(data);

        if (!data.date || !data.title || !data.amount) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Missing some fields');

          return;
        }

        const expense = {
          date: data.date,
          title: data.title,
          amount: data.amount,
        };

        fs.writeFileSync('db/expense.json', JSON.stringify(expense));

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(expense));
      });

      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  });
}

module.exports = {
  createServer,
};

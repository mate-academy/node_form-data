/* eslint-disable no-console */
'use strict';

const http = require('http');
const fs = require('fs');
const { pageWithData } = require('./pageWithData');

const PORT = process.env.PORT || 3000;
const server = new http.Server();

server.on('request', (req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream('./public/index.html').pipe(res);
  } else if (req.method === 'POST' && req.url === '/submit') {
    let data = '';

    req.on('data', (chunk) => {
      data += chunk;
    });

    req.on('end', () => {
      const formData = new URLSearchParams(data);

      const date = formData.get('date');
      const title = formData.get('title');
      const amount = formData.get('amount');

      const expense = {
        date,
        title,
        amount: +amount,
      };

      fs.readFile('./src/expenses.json', 'utf8', (err, existingData) => {
        if (err && err.code !== 'ENOENT') {
          console.error(err);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Server Error');
        } else {
          const expenses = existingData ? JSON.parse(existingData) : [];

          expenses.push(expense);

          fs.writeFile(
            './src/expenses.json',
            JSON.stringify(expenses, null, 2),
            (error) => {
              if (error) {
                console.error(error);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Server Error');
              } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(pageWithData(expense));
              }
            },
          );
        }
      });
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.on('error', (error) => console.log(error));

server.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`),
);

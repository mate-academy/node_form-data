'use strict';

const http = require('http');
const fs = require('fs');

const form = `
  <form method="POST" action="/add-expense">
    <input
      type="date"
      name="date"
      required
    >
    <input
      type="text"
      name="title"
      placeholder="Enter title"
      required
    >
    <input
      type="number"
      name="amount"
      placeholder="Enter amount"
      required
    >
    <button type="submit">Send</button>
  </form>
`;

function createServer() {
  return http.createServer((req, res) => {
    if (req.method === 'GET') {
      if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(form);
      } else if (req.url === '/add-expense') {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Incorrect request');
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Page not found');
      }

      return;
    }

    if (req.method === 'POST') {
      if (req.url === '/add-expense') {
        let body = '';

        req.on('data', (chunk) => (body += chunk));

        req.on('end', () => {
          let expenseData;

          if (req.headers['content-type'] === 'application/json') {
            expenseData = JSON.parse(body);
          } else {
            const params = new URLSearchParams(body);

            expenseData = Object.fromEntries(params);
          }

          const dateObj = new Date(expenseData.date);
          const isValidDate = dateObj instanceof Date && !isNaN(dateObj);

          const isValidTitle =
            expenseData.title && expenseData.title.trim().length > 0;

          const amount = parseFloat(expenseData.amount);
          const isValidAmount = !isNaN(amount) && amount > 0;

          if (!isValidDate || !isValidTitle || !isValidAmount) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid data');
          } else {
            const filePath = 'db/expense.json';

            if (!fs.existsSync('db')) {
              fs.mkdirSync('db');
            }

            if (!fs.existsSync(filePath)) {
              fs.writeFileSync(filePath, JSON.stringify({}));
            }

            // const raw = fs.readFileSync(filePath, 'utf8');
            // const arr = JSON.parse(raw);
            const record = {
              date: expenseData.date,
              title: expenseData.title,
              amount: expenseData.amount,
            };

            // arr.push(record);

            fs.writeFileSync(filePath, JSON.stringify(record, null, 2));

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(expenseData));
          }
        });
      }
    }
  });
}

module.exports = {
  createServer,
};

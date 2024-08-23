'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');

function createServer() {
  return http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const form = new formidable.IncomingForm();
    let expenses = [];

    if (
      url.pathname === '/submit-expense' &&
      req.method.toLocaleLowerCase() === 'post'
    ) {
      form.parse(req, (err, { date, title, amount }) => {
        const expense = { title, date, amount };
        const filePath = path.resolve('db', 'expense.json');

        if (err || !date || !title || !amount) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });

          return res.end('invalid form data');
        }

        if (fs.existsSync(filePath)) {
          const data = fs.readFileSync(filePath, 'utf-8');

          expenses = JSON.parse(data);
        }

        let maxId = 0;

        const keys = Object.keys(expenses);

        for (const key of keys) {
          if (expenses[key].id > maxId) {
            maxId = expenses[key].id;
          }
        }

        const newExpense = {
          ...expense,
          id: +maxId + 1,
        };

        expenses = [...expenses, { ...newExpense }];
        fs.writeFileSync(filePath, JSON.stringify(expenses, null, 2), 'utf-8');

        res.writeHead(200, { 'Content-Type': 'application/json' });

        res.end(JSON.stringify(expenses, null, 2));
      });

      return;
    }

    if (url.pathname === '/') {
      const html = fs.createReadStream(path.resolve('src', 'index.html'));

      res.setHeader('Content-Type', 'text/html');

      return html.pipe(res);
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  });
}

module.exports = {
  createServer,
};

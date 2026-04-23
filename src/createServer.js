/* eslint-disable no-console */
'use strict';

const http = require('http');
const fs = require('fs');

function createServer() {
  /* Write your code here */
  // Return instance of http.Server class

  const server = new http.Server();

  server.on('request', (req, res) => {
    if (req.method === 'POST' && req.url === '/add-expense') {
      let body = '';

      req.on('data', (chunk) => {
        body += chunk.toString();
      });

      req.on('end', () => {
        let fields;

        try {
          fields = JSON.parse(body);
        } catch (err) {
          res.statusCode = 400;

          return res.end('Invalid JSON');
        }

        if (!fields.amount || !fields.date || !fields.title) {
          res.statusCode = 400;

          return res.end('Missing required fields');
        }

        const filePath = 'db/expense.json';

        const newData = {
          amount: fields.amount,
          date: fields.date,
          title: fields.title,
        };

        fs.writeFileSync(filePath, JSON.stringify(newData));

        const file = fs.readFileSync(filePath);

        res.setHeader('Content-Type', 'application/json');
        res.end(file);
      });

      return;
    }

    if (req.url !== '/' && req.url !== '/add-expense') {
      res.statusCode = 404;

      return res.end('Invalid Url');
    }

    res.setHeader('Content-type', 'text/html');

    res.end(
      `<form method="POST" action="/add-expense">
        <input name="date" type="date">
        <input name="title" type="text">
        <input name="amount" type="number">
        <button type="submit">Submit</button>
      </form>`,
    );
  });

  return server;
}

module.exports = {
  createServer,
};

/* eslint-disable no-console */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

function createServer() {
  const server = new http.Server();

  server.on('request', (req, res) => {
    if (req.url === '/' && req.method === 'GET') {
      res.setHeader('Content-Type', 'text/html');
      res.statusCode = 200;

      res.end(`
        <div style="display: flex; flex-direction: column; align-items: center;">
          <h1>Form Data</h1>

          <form method="POST" action="/add-expense">
            <input type="text" name="date" placeholder="Date" />
            <br />
            <br />
            <input type="text" name="title" placeholder="Title" />
            <br />
            <br />
            <input type="text" name="amount" placeholder="Amount" />
            <br />
            <br />
            <button type="submit">Submit</button>
          </form>
        </div>
      `);

      return;
    }

    if (req.url === '/add-expense' && req.method === 'POST') {
      const chunks = [];

      req.on('data', (chunk) => {
        chunks.push(chunk);
      });

      req.on('end', () => {
        const formData = Buffer.concat(chunks).toString();
        const { date, title, amount } = JSON.parse(formData);

        if (!date || !title || !amount) {
          res.statusCode = 400;

          res.end(
            'Please ensure all fields (date, title, amount) are filled out.',
          );

          return;
        }

        const responseData = {
          date,
          title,
          amount,
        };

        const jsonData = JSON.stringify(responseData);
        const filePath = path.resolve(__dirname, '../db/expense.json');

        fs.writeFileSync(filePath, jsonData);

        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        res.end(jsonData);
      });

      return;
    }

    res.statusCode = 404;
    res.end('Page not found.');
  });

  server.on('error', (err) => console.log(err));

  return server;
}

module.exports = {
  createServer,
};

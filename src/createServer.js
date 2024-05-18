/* eslint-disable no-console */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

function createServer() {
  const server = new http.Server();

  server.on('request', async (req, res) => {
    const url = new URL(req.url, `http:${req.headers.host}`);

    if (url.pathname === '/' && req.method === 'GET') {
      const filePath = path.resolve(__dirname, '..', 'public', 'index.html');

      fs.readFile(filePath, (err, content) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');

          return;
        }

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content);
      });
    } else if (url.pathname === '/add-expense' && req.method === 'POST') {
      const chunks = [];

      for await (const chunk of req) {
        chunks.push(chunk);
      }

      const fileContent = Buffer.concat(chunks).toString();
      let data;

      try {
        if (req.headers['content-type'] === 'application/json') {
          data = JSON.parse(fileContent);
        } else if (
          req.headers['content-type'] === 'application/x-www-form-urlencoded'
        ) {
          data = querystring.parse(fileContent);
        } else {
          res.statusCode = 400;

          return res.end('Invalid Content-Type');
        }
      } catch (error) {
        res.statusCode = 400;

        return res.end('Invalid JSON');
      }

      const { date, title, amount } = data;

      if (!date || !title || !amount) {
        res.statusCode = 400;

        return res.end('Invalid form');
      }

      const filePath = path.resolve(__dirname, '../db/expense.json');
      const formattedExpense = JSON.stringify(data, null, 2);

      fs.writeFile(filePath, formattedExpense, (err) => {
        if (err) {
          res.statusCode = 500;

          return res.end(String(err));
        }

        res.statusCode = 200;

        const acceptHeader = req.headers['accept'];

        if (acceptHeader && acceptHeader.includes('text/html')) {
          res.setHeader('Content-Type', 'text/html');

          const htmlResponse = `
            <!DOCTYPE html>
            <html>
            <head>
              <title>Expense Added</title>
            </head>
            <body>
              <h1>Expense Added Successfully</h1>
              <p>Date: ${data.date}</p>
              <p>Title: ${data.title}</p>
              <p>Amount: ${data.amount}</p>
            </body>
            </html>
          `;

          res.end(htmlResponse);
        } else {
          res.setHeader('Content-Type', 'application/json');
          res.end(formattedExpense);
        }
      });
    } else {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Not found');
    }
  });

  server.on('error', (error) => {
    console.error('Server error:', error);
  });

  return server;
}

module.exports = {
  createServer,
};

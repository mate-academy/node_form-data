/* eslint-disable no-console */
'use strict';

const http = require('http');
const fs = require('fs');
const querystring = require('node:querystring');

function createServer() {
  const server = new http.Server();

  server.on('request', async (req, res) => {
    const { pathname } = new URL(req.url || '', `http://${req.headers.host}`);

    if (pathname !== '/add-expense' && pathname !== '/') {
      res.statusCode = 404;
      res.end('Non-existent endpoint');

      return;
    }

    if (req.method === 'GET' && pathname === '/') {
      res.statusCode = 200;
      res.setHeader('Content-type', 'text/html');

      fs.readFile('./public/index.html', (err, data) => {
        if (err) {
          res.statusCode = 404;
          res.end('Not found');

          return;
        }

        res.end(data);
      });

      return;
    }

    if (req.method === 'GET' && pathname === '/add-expense') {
      res.statusCode = 400;
      res.end('Not Found');

      return;
    }

    if (req.method === 'POST' && pathname === '/add-expense') {
      const chunks = [];

      req.on('data', (chunk) => chunks.push(chunk));

      req.on('end', () => {
        const body = Buffer.concat(chunks).toString();

        let data;

        if (req.headers['content-type'] === 'application/json') {
          data = JSON.parse(body);
        } else {
          data = querystring.parse(body);
        }

        const { date, title, amount } = data;

        if (!date || !title || !amount) {
          res.statusCode = 400;
          res.end('All fields are required');

          return;
        }

        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;

        const fileStream = fs.createWriteStream('./db/expense.json');

        fileStream.write(JSON.stringify(data));
        fileStream.end();

        fileStream.on('finish', () => {
          res.end(JSON.stringify(data));
        });
      });
    }
  });

  server.on('error', (err) => {
    console.error('Server error: ', err.message);
  });

  return server;
}

module.exports = {
  createServer,
};

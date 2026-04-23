'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const { serverError } = require('./errors');

function createServer() {
  const server = new http.Server();

  server.on('request', async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === 'POST' && url.pathname === '/add-expense') {
      try {
        const chunks = [];

        for await (const chunk of req) {
          chunks.push(chunk);
        }

        const text = Buffer.concat(chunks).toString();
        const data = JSON.parse(text);
        const { date, title, amount } = data;

        if (!date || !title || !amount) {
          res.statusCode = 400;

          return res.end('All fields must be filled');
        }

        fs.writeFile(
          path.join(__dirname, '../db/expense.json'),
          text,
          (err) => {
            if (err) {
              return serverError(res, err);
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');

            return res.end(text);
          },
        );
      } catch (err) {
        return serverError(res, err);
      }
    } else {
      res.statusCode = 404;
      res.end('Not Found');
    }
  });

  return server;
}

module.exports = {
  createServer,
};

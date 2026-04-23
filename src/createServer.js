'use strict';

const { Server } = require('http');
const fs = require('fs');
const path = require('path');

const ALLOWED_ENDPOINTS = {
  addExpense: {
    route: '/add-expense',
    methods: ['POST'],
  },
};

function createServer() {
  const server = new Server();

  server.on('request', (req, res) => {
    const baseUrl = `http://${req.headers.host}`;
    const url = new URL(req.url, baseUrl);

    if (
      url.pathname !== ALLOWED_ENDPOINTS.addExpense.route ||
      !ALLOWED_ENDPOINTS.addExpense.methods.includes(req.method)
    ) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');

      res.end('Invalid url');

      return;
    }

    const bodyChunks = [];

    req.on('data', (chunk) => {
      bodyChunks.push(chunk);
    });

    req.on('end', () => {
      const json = Buffer.concat(bodyChunks);
      const expense = JSON.parse(json);

      if (!expense?.date || !expense?.title || !expense?.amount) {
        res.statusCode = 400;
        res.end('Bad user input');

        return;
      }

      const fileStream = fs.createWriteStream(
        path.normalize(path.join(__dirname, '../db/expense.json')),
      );

      fileStream.on('error', (error) => {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        /* eslint-disable-next-line no-console */
        console.error(error);
        res.end('Server error');
      });

      fileStream.on('finish', () => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(expense, null, 2));
      });

      fileStream.end(json);
    });
  });

  return server;
}

module.exports = {
  createServer,
};

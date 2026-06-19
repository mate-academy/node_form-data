'use strict';

const fs = require('fs');
const http = require('http');
const path = require('path');
const formidable = require('formidable');

function createServer() {
  const server = new http.Server();

  server.on('request', (req, res) => {
    if (req.url === '/' && req.method === 'GET') {
      const filePath = path.resolve(__dirname, 'index.html');
      const stream = fs.createReadStream(filePath);

      stream.on('error', () => {
        res.statusCode = 500;

        return res.end('Cannot read index.html');
      });

      res.writeHead(200, { 'Content-Type': 'text/html' });

      return stream.pipe(res);
    }

    if (req.method === 'POST' && req.url.startsWith('/add-expense')) {
      const form = new formidable.IncomingForm({ multiples: false });

      form.parse(req, (err, fields, files) => {
        if (err) {
          res.statusCode = 500;

          return res.end('Error parsing the form');
        }

        const { date, title, amount } = fields || {};

        if (!date || !title || !amount) {
          res.statusCode = 400;

          return res.end('Missing fields');
        }

        const filePath = path.resolve(__dirname, '../db/expense.json');
        let expenses = [];

        try {
          const content = fs.readFileSync(filePath, 'utf-8').trim();

          if (content) {
            const parsed = JSON.parse(content);

            if (Array.isArray(parsed)) {
              expenses = parsed;
            } else {
              expenses = [];
            }
          }
        } catch (e) {
          expenses = [];
        }

        expenses.push({ date, title, amount });

        fs.writeFileSync(filePath, JSON.stringify(expenses, null, 2));

        res.writeHead(200, { 'Content-Type': 'text/html' });

        return res.end(`<pre>${JSON.stringify(expenses)}</pre>`);
      });

      return;
    }

    res.statusCode = 404;
    res.end('Not Found');
  });

  return server;
}

module.exports = {
  createServer,
};

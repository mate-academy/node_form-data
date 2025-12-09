'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

function createServer() {
  const server = new http.Server();

  server.on('request', (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    const normalizedPath =
      url.pathname.endsWith('/') && url.pathname.length > 1
        ? url.pathname.slice(0, -1)
        : url.pathname;

    const postPaths = new Set(['/expense', '/add-expense', '/submit-expense']);

    if (postPaths.has(normalizedPath) && req.method === 'POST') {
      let body = '';

      req.on('data', (chunk) => (body += chunk));

      req.on('end', () => {
        let fields;

        try {
          fields = JSON.parse(body);
        } catch (e) {
          res.statusCode = 400;
          res.end('Invalid JSON');

          return;
        }

        const { date, title, amount } = fields;

        if (!date || !title || !amount) {
          res.statusCode = 400;
          res.end('Missing date or title or amount');

          return;
        }

        const newExpense = { date, title, amount };
        const dbPath = path.resolve('db', 'expense.json');

        const dbDir = path.dirname(dbPath);

        if (!fs.existsSync(dbDir)) {
          fs.mkdirSync(dbDir, { recursive: true });
        }

        processExpense(newExpense, dbPath, res);
      });

      return;
    }

    const fileName = url.pathname.slice(1) || 'index.html';
    const filePath = path.resolve('src', fileName);

    if (!fs.existsSync(filePath)) {
      res.statusCode = 404;
      res.end('File not found');

      return;
    }

    const fStream = fs.createReadStream(filePath);

    fStream.pipe(res);

    fStream.on('error', () => {
      res.statusCode = 500;
      res.end('Server error');
    });

    res.on('close', () => fStream.destroy());
  });

  server.on('error', () => {});

  return server;
}

function processExpense(newItem, dbPath, res) {
  const jsonString = JSON.stringify(newItem, null, 2);

  const writeStream = fs.createWriteStream(dbPath);

  writeStream.write(jsonString);
  writeStream.end();

  writeStream.on('finish', () => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(newItem));
  });

  writeStream.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    res.statusCode = 500;
    res.end('Database write error');
  });
}

module.exports = {
  createServer,
};

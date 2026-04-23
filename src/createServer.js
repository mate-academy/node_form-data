/* eslint-disable no-console */
'use strict';

const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs');

function createServer() {
  const server = new http.Server();

  server.on('request', (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method.toLowerCase() === 'get') {
      const requestedPath = url.pathname.slice(1) || 'index.html';
      const realPath = path.join('src', requestedPath);

      if (!fs.existsSync(realPath)) {
        res.statusCode = 404;
        res.setHeader('Content-type', 'text/plain');
        res.end('Not found');

        return;
      }

      const fileStream = fs.createReadStream(realPath);

      fileStream.pipe(res);

      fileStream.on('error', (err) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
        }
      });

      res.on('close', () => {
        fileStream.destroy();
      });
    }

    if (
      url.pathname === '/add-expense' &&
      req.method.toLowerCase() === 'post'
    ) {
      const body = [];

      req.on('data', (chunk) => {
        body.push(chunk);
      });

      req.on('end', () => {
        try {
          const formData = Buffer.concat(body).toString();
          const expense = JSON.parse(formData);
          const fileToWriteData = path.join('db', 'expense.json');

          if (!expense.date || !expense.title || !expense.amount) {
            res.statusCode = 400;
            res.end('Invalid data.');

            return;
          }

          fs.mkdirSync(path.dirname(fileToWriteData), { recursive: true });
          fs.writeFileSync(fileToWriteData, JSON.stringify(expense, null, 2));

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(expense));
        } catch (err) {
          console.log(err);
          res.statusCode = 400;
          res.end('Invalid JSON format.');
        }
      });
    }
  });

  server.on('error', (error) => {
    console.log('Server error:', error.message);
  });

  return server;
}

module.exports = {
  createServer,
};

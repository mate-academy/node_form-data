'use strict';

const http = require('http');
const path = require('path');
const fs = require('fs');

function createServer() {
  /* Write your code here */
  // Return instance of http.Server class
  const server = http.Server();

  return server.on('request', (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname.slice(1) || 'index.html';
    const filePath = path.join('public', pathname);
    const expensePath = path.join('db', 'expense.json');

    if (req.method === 'POST' && pathname === 'add-expense') {
      const chunks = [];

      req.on('data', (chunk) => {
        chunks.push(chunk);
      });

      req.on('end', () => {
        const body = Buffer.concat(chunks).toString();
        const result = {};

        body.split('&').forEach((pair) => {
          const [key, value] = pair.split('=');

          if (!value) {
            res.statusCode = 400;
            res.end('Bad Request');
          }
          result[key] = value;
        });

        if (!result.date || !result.title || !result.amount) {
          res.statusCode = 400;
          res.end('Bad Request');

          return;
        }

        const updatedExpenses = JSON.stringify(result);

        const writeStream = fs.createWriteStream(expensePath);

        writeStream.write(updatedExpenses);
        writeStream.end();

        writeStream.on('finish', () => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html');

          res.end(`<html><pre>${JSON.stringify(result, null, 2)}</pre></html>`);
        });
      });
    } else {
      if (!fs.existsSync(filePath)) {
        res.statusCode = 404;
        res.end('File not found');

        return;
      }

      const fileStream = fs.createReadStream(filePath);

      fileStream.pipe(res).on('error', () => {
        res.statusCode = 500;
        res.end('Internal Server Error');
      });

      res.setHeader('Content-Type', 'text/html');
      res.statusCode = 200;
    }
  });
}

module.exports = {
  createServer,
};

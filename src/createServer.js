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
        const contentType = req.headers['content-type']
          ? req.headers['content-type'].split(';')[0].trim()
          : '';

        let result = null;

        if (contentType === 'application/json') {
          try {
            result = JSON.parse(body);
          } catch (err) {
            res.statusCode = 400;
            res.end('Bad Request');

            return;
          }
        } else if (contentType === 'application/x-www-form-urlencoded') {
          result = {};

          body.split('&').forEach((pair) => {
            const [key, value] = pair.split('=');

            if (!key || value === undefined) {
              result = null;

              res.statusCode = 400;
              res.end('Bad Request');

              return;
            }
            result[key] = decodeURIComponent(value.replace(/\+/g, ' '));
          });
        } else {
          try {
            result = JSON.parse(body);
          } catch (err) {
            result = null;

            res.statusCode = 400;
            res.end('Bad Request');
          }
        }

        const requiredFields = ['date', 'title', 'amount'];

        if (
          !result ||
          typeof result !== 'object' ||
          !requiredFields.every((key) => key in result)
        ) {
          res.statusCode = 400;
          res.end('Bad Request');

          return;
        }

        if (!fs.existsSync(path.dirname(expensePath))) {
          fs.mkdirSync(path.dirname(expensePath), { recursive: true });
        }

        fs.writeFileSync(expensePath, JSON.stringify(result));

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.end(`<html><pre>${JSON.stringify(result, null, 2)}</pre></html>`);
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

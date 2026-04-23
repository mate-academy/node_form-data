'use strict';

const { Server } = require('node:http');
const path = require('node:path');
const { pipeline } = require('node:stream');
const { createReadStream } = require('node:fs');
const fs = require('fs');

function createServer() {
  const server = new Server();

  server.on('request', async (req, res) => {
    const { pathname } = new URL(req.url, `http://${req.headers.host}`);

    if (pathname === '/' || pathname === '/index.html') {
      const indexPath = path.resolve(__dirname, 'index.html');
      const readStream = createReadStream(indexPath);

      pipeline(readStream, res, (err) => {
        if (err) {
          sendResponse(res, 500, 'Error reading index.html');
        }
      });

      return;
    }

    if (pathname === '/add-expense') {
      if (req.method === 'GET') {
        return sendResponse(
          res,
          400,
          'GET requests are not allowed on /submit-expense',
        );
      }

      let body = '';

      req.on('data', (chunk) => {
        body += chunk.toString();
      });

      req.on('end', () => {
        let fields;

        try {
          fields = JSON.parse(body);
        } catch (err) {
          return sendResponse(res, 400, 'Invalid JSON');
        }

        const { date, title, amount } = fields;

        if (!date || !title || !amount) {
          return sendResponse(res, 400, 'Missing required fields');
        }

        const jsonPath = path.resolve(__dirname, '..', 'db', 'expense.json');

        try {
          fs.writeFileSync(jsonPath, JSON.stringify(fields, null, 2));
          res.writeHead(200, { 'content-type': 'application/json' });
          res.end(JSON.stringify(fields));
        } catch (err) {
          sendResponse(res, 500, 'Error saving expense');
        }
      });

      return;
    }
    sendResponse(res, 404, 'Not Found');
  });

  return server;
}

function sendResponse(res, statusCode, message) {
  res.writeHead(statusCode, { 'content-type': 'text/plain' });
  res.end(message);
}

module.exports = {
  createServer,
};

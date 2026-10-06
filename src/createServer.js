'use strict';

const http = require('node:http');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');

function createServer() {
  return http.createServer((request, response) => {
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (url.pathname === '/' && request.method === 'GET') {
      response.statusCode = 200;
      response.setHeader('content-type', 'text/html');

      fs.createReadStream(path.join(__dirname, 'public/index.html')).pipe(
        response,
      );

      return;
    }

    if (url.pathname === '/add-expense' && request.method === 'POST') {
      const buffer = [];

      request.on('data', (chunk) => buffer.push(chunk));

      request.on('end', async () => {
        const body = Buffer.concat(buffer);

        let data = null;

        if (request.headers['content-type'] === 'application/json') {
          data = JSON.parse(body);
        } else {
          const params = new URLSearchParams(body.toString('utf-8'));

          data = Object.fromEntries(params.entries());
        }

        const requiredKeys = ['date', 'title', 'amount'];

        for (const key of requiredKeys) {
          if (!(key in data)) {
            response.statusCode = 400;
            response.end('Bad Request, missing params');

            return;
          }
        }

        const savedData = JSON.stringify(data, null, 2);

        try {
          await fsp.writeFile(
            path.join(__dirname, '../db/expense.json'),
            savedData,
          );

          response.statusCode = 200;
          response.setHeader('content-type', 'text/html');
          response.end(`<html><body><pre>${savedData}</pre></body></html>`);
        } catch {
          response.statusCode = 500;
          response.end();
        }
      });

      return;
    }

    response.statusCode = 404;
    response.end();
  });
}

module.exports = {
  createServer,
};

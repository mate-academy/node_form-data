'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

function createServer() {
  return http.createServer((request, response) => {
    if (request.url === '/' && request.method === 'GET') {
      const htmlPath = path.resolve(__dirname, 'index.html');

      fs.readFile(htmlPath, 'utf-8', (error, data) => {
        if (error) {
          response.statusCode = 500;
          response.end('Internal Server Error');

          return;
        }

        response.statusCode = 200;
        response.setHeader('Content-Type', 'text/html');
        response.end(data);
      });
    } else if (request.url === '/add-expense' && request.method === 'POST') {
      const chunks = [];

      request.on('data', (chunk) => {
        chunks.push(chunk);
      });

      request.on('end', () => {
        try {
          const bodyStr = Buffer.concat(chunks).toString();
          let parsedData;

          const contentType = request.headers['content-type'] || '';

          if (contentType === 'application/json') {
            parsedData = JSON.parse(bodyStr);
          } else {
            const params = new URLSearchParams(bodyStr);

            parsedData = Object.fromEntries(params);
          }

          if (!parsedData.amount || !parsedData.title || !parsedData.date) {
            response.statusCode = 400;
            response.end('Invalid data');

            return;
          }

          const dbPath = path.join(__dirname, '../db/expense.json');

          fs.writeFile(dbPath, JSON.stringify(parsedData, null, 2), (error) => {
            if (error) {
              response.statusCode = 500;
              response.end('Internal Server Error');

              return;
            }

            const accept = request.headers.accept || '';

            if (accept.includes('text/html')) {
              response.statusCode = 200;
              response.setHeader('Content-Type', 'text/html');

              response.end(`
                <pre>${JSON.stringify(parsedData, null, 2)}</pre>
              `);
            } else {
              response.statusCode = 200;
              response.setHeader('Content-Type', 'application/json');
              response.end(JSON.stringify(parsedData));
            }
          });
        } catch (error) {
          response.statusCode = 400;
          response.end('Invalid data');
        }
      });
    } else {
      response.statusCode = 404;
      response.end('Not Found');
    }
  });
}

module.exports = {
  createServer,
};

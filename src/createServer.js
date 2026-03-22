'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

function createServer() {
  return http.createServer((request, response) => {
    if (request.url === '/add-expense' && request.method === 'POST') {
      const chunks = [];

      request.on('data', (chunk) => {
        chunks.push(chunk);
      });

      request.on('end', () => {
        try {
          const parsedData = JSON.parse(Buffer.concat(chunks).toString());

          if (!parsedData.amount || !parsedData.title || !parsedData.date) {
            response.statusCode = 400;
            response.end('Invalid data');

            return;
          }

          const db = path.join(__dirname, '../db/expense.json');
          const stringifiedData = JSON.stringify(parsedData);

          fs.writeFileSync(db, stringifiedData);

          response.statusCode = 200;
          response.setHeader('Content-Type', 'application/json');
          response.end(JSON.stringify(parsedData));
        } catch {
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

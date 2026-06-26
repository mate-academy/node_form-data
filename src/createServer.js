'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

function createServer() {
  /* Write your code here */
  // Return instance of http.Server class
  const server = http.createServer((request, response) => {
    const chunks = [];

    if (request.method !== 'POST') {
      if (request.method === 'GET' && request.url === '/') {
        response.statusCode = 200;
        response.setHeader('content-type', 'text/html');

        response.end(`<form ...>
  <input name="date"/>
  <input name="title" />
  <input name="amount"/>
</form>`);

        return;
      } else {
        response.statusCode = 404;

        return response.end('not found');
      }
    }

    if (request.method === 'POST' && request.url === '/add-expense') {
      const caminho = path.resolve(__dirname, '../db/expense.json');

      request.on('data', (chunk) => {
        chunks.push(chunk);
      });

      request.on('end', () => {
        const text = Buffer.concat(chunks).toString();

        try {
          const payload = JSON.parse(text);
          const { date, title, amount } = payload;

          const obj = {
            date,
            title,
            amount,
          };

          if (!obj.date || !obj.title || !obj.amount) {
            response.statusCode = 400;
            response.end('esperava 3 argumentos');

            return;
          }

          const str = JSON.stringify(obj, null, 2);

          fs.writeFileSync(caminho, str);

          response.setHeader('content-type', 'text/html');
          response.statusCode = 200;

          return response.end(`<html><pre>${str}</pre></html>`);
        } catch {
          const dd = new URLSearchParams(text);
          const data = dd.get('date');
          const title = dd.get('title');
          const amount = dd.get('amount');

          const obj = {
            date: data,
            title,
            amount,
          };

          if (!obj.date || !obj.title || !obj.amount) {
            response.statusCode = 400;
            response.end('esperava 3 argumentos');

            return;
          }

          const str = JSON.stringify(obj, null, 2);

          fs.writeFileSync(caminho, str);

          response.setHeader('content-type', 'text/html');
          response.statusCode = 200;

          return response.end(`<html><pre>${str}</pre></html>`);
        }
      });
    }
  });

  return server;
}

module.exports = {
  createServer,
};

'use strict';
/* eslint-disable no-console */

const { Server } = require('node:http');
const fs = require('node:fs');

function createServer() {
  const server = new Server();

  server.on('request', async (req, res) => {
    const url = req.url;
    const method = req.method;

    const template = fs.readFileSync('public/index.html', 'utf-8');
    const dbData = fs.readFileSync('db/expense.json', 'utf-8');

    if (method === 'GET' && url === '/') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');

      const formattedJson = JSON.stringify(JSON.parse(dbData), null, 2);
      const html = template.replace('{{jsonData}}', formattedJson);

      return res.end(html);
    } else if (method === 'POST' && url === '/add-expense') {
      let body = '';

      req.on('data', (chunk) => {
        body += chunk;
      });

      req.on('end', () => {
        const contentType = req.headers['content-type'];
        let expense;

        if (contentType === 'application/json') {
          expense = JSON.parse(body);
        } else {
          const params = new URLSearchParams(body);

          expense = {
            date: params.get('date'),
            title: params.get('title'),
            amount: params.get('amount'),
          };
        }

        if (!expense.date || !expense.title || !expense.amount) {
          res.statusCode = 400;

          return res.end('Missing parameters');
        }

        const jsonData = JSON.stringify(expense, null, 2);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');

        fs.writeFileSync('db/expense.json', jsonData);

        const newHtml = template.replace('{{jsonData}}', jsonData);

        res.end(newHtml);
      });
    } else {
      res.statusCode = 404;
      res.end();
    }
  });

  return server;
}

module.exports = {
  createServer,
};

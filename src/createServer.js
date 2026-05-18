'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

function createServer() {
  const server = new http.Server();

  server.on('request', (req, res) => {
    const publicFolder = path.join(__dirname, '../public');
    const dbFolder = path.join(__dirname, '../db');

    if (req.method === 'GET' && req.url === '/') {
      res.statusCode = 200;
      fs.createReadStream(path.join(publicFolder, 'index.html')).pipe(res);
    } else if (req.method === 'POST' && req.url === '/add-expense') {
      let body = '';

      req.on('data', (chunk) => {
        body += chunk.toString();
      });

      req.on('end', () => {
        const parsedBody = querystring.parse(body);
        let jsonBody;

        try {
          jsonBody = JSON.parse(body);
        } catch (error) {
          jsonBody = [];
        }

        const title = parsedBody.title || jsonBody.title;
        const amount = parsedBody.amount || jsonBody.amount;
        const date = parsedBody.date || jsonBody.date;

        if (!title || !amount || !date) {
          res.statusCode = 404;
          res.end('wrong params');

          return;
        }

        fs.writeFile(
          path.join(dbFolder, 'expense.json'),
          JSON.stringify({ date, title, amount }, null, 2),
          (e) => {
            if (e) {
              res.writeHead(500, { 'Content-Type': 'text/plain' });
              res.end('Internal Server Error');

              return;
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ date, title, amount }));
          },
        );
      });
    } else {
      res.statusCode = 404;
      res.end('page not found');
    }
  });

  return server;
  // Return instance of http.Server class
}

module.exports = {
  createServer,
};

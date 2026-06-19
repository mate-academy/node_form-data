'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

function createServer() {
  /* Write your code here */
  // Return instance of http.Server class
  const server = new http.Server();

  server.on('request', (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname === '/' && req.method === 'GET') {
      fs.createReadStream(path.resolve('public', 'index.html')).pipe(res);

      return;
    }

    if (url.pathname === '/add-expense' && req.method === 'POST') {
      const chunks = [];

      req.on('data', (chunk) => {
        chunks.push(chunk);
      });

      req.on('end', () => {
        if (url.pathname !== '/add-expense') {
          req.end('Page not found');
        }

        const dataPath = path.resolve(__dirname, '..', 'db/expense.json');
        const data = Buffer.concat(chunks).toString();

        if (Object.keys(JSON.parse(data)).length !== 3) {
          res.statusCode = 400;
          res.setHeader('Content-type', 'text/plain');
          res.end('All params must be completed');

          return;
        }

        try {
          JSON.parse(data);
        } catch (error) {
          res.statusCode = 400;
          res.setHeader('Content-type', 'text/plain');
          res.end('All params must be completed');
        }

        fs.writeFile(dataPath, data, (err) => {
          if (err) {
            res.statusCode = 500;

            return res.end('Error saving data');
          }
          // fs.writeFileSync(dataPath, data);
          res.statusCode = 200;
          res.setHeader('Content-type', 'application/json');
          res.end(data);
        });
      });

      return;
    }

    res.statusCode = 404;
    res.end('Page not found');
  });

  return server;
}

module.exports = {
  createServer,
};

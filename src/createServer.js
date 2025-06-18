/* eslint-disable no-console */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

function createServer() {
  const server = new http.Server();

  server.on('request', (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === 'GET' && url.pathname === '/') {
      const indexPath = path.resolve('public', 'index.html');

      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      fs.createReadStream(indexPath).pipe(res);

      return;
    }

    if (req.method === 'GET' && url.pathname === '/add-expense') {
      res.statusCode = 400;

      return res.end('Only POST method allowed');
    }

    if (req.method === 'POST' && url.pathname === '/add-expense') {
      let body = '';

      req.on('data', (chunk) => {
        body += chunk.toString();
      });

      req.on('end', () => {
        let dataObject;

        try {
          const appJson =
            req.headers['content-type'].includes('application/json');
          const urlEncoded = req.headers['content-type'].includes(
            'application/x-www-form-urlencoded',
          );

          if (appJson) {
            dataObject = JSON.parse(body);
          } else if (urlEncoded) {
            const parsed = new URLSearchParams(body);

            dataObject = Object.fromEntries(parsed.entries());
          } else {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Unsupported content');

            return;
          }

          const { date, title, amount } = dataObject;

          if (!date || !title || !amount) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Error: date, amount or title is empty.');

            return;
          }

          const expensePath = path.resolve('db', 'expense.json');

          fs.readFile(expensePath, (err, fileData) => {
            let parsedData = [];

            if (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'text/plain');
              res.end(`Server error: ${err}`);
            } else {
              parsedData = JSON.parse(fileData);

              if (typeof parsedData === 'object') {
                if (Object.keys(parsedData).length) {
                  parsedData = [parsedData];

                  parsedData.push(dataObject);
                } else if (!Object.keys(parsedData).length) {
                  parsedData = dataObject;
                } else if (Array.isArray(parsedData)) {
                  parsedData.push(dataObject);
                }
              }

              const newData = JSON.stringify(parsedData, null, 2);

              fs.writeFile(expensePath, newData, (error) => {
                if (error) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'text/plain');
                  res.end(`Server error: ${error}`);

                  return;
                }
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(newData);
              });
            }
          });
        } catch (err) {
          res.statusCode = 400;
          res.hasHeader('Content-Type', 'application/json');
          res.end(`Invalid JSON: ${err.message}`);
        }
      });
    } else {
      res.statusCode = 404;
      res.end('Not found');
    }
  });

  return server;
}

module.exports = {
  createServer,
};

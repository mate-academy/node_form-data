/* eslint-disable no-console */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('node:querystring');

function createServer() {
  const server = new http.Server();

  server.on('request', (req, res) => {
    const { pathname } = new URL(req.url, `http://${req.headers.host}`);
    const fileName = pathname.slice(1) || 'index.html';

    const paths = ['/', '/add-expense'];

    if (!paths.includes(pathname)) {
      res.statusCode = 404;
      res.end('non-existent endpoint');
    }

    switch (req.method) {
      case 'GET':
        if (req.url === '/') {
          res.statusCode = 200;
          res.setHeader('Content-type', 'text/html');

          fs.readFile(`./public/${fileName}`, (err, data) => {
            if (err) {
              res.statusCode = 404;
              console.log(`${fileName} loading error: ${err} / page not found`);
            }

            res.end(data);
          });
        }

        if (req.url === '/add-expense') {
          res.statusCode = 400;
          res.end('Bad request');
        }

        return;

      case 'POST':
        if (req.url !== '/add-expense') {
          res.setHeader('Content-type', 'text/plain');
          res.statusCode = 404;
          res.end('Wrong request url');

          return;
        }

        if (req.url === '/add-expense') {
          const chunks = [];

          req.on('data', (chunk) => {
            chunks.push(chunk);
          });

          req.on('end', () => {
            const text = Buffer.concat(chunks).toString();
            let data;

            if (req.headers['content-type'] === 'application/json') {
              data = JSON.parse(text);
            } else {
              data = querystring.parse(text);
            }

            if (!data['date'] || !data['title'] || !data['amount']) {
              res.statusCode = 400;
              res.end('Not full data');

              return;
            }

            const writeStream = fs.createWriteStream(
              path.resolve('db/expense.json'),
            );

            writeStream.end(text);

            writeStream.on('finish', () => {
              res.setHeader('Content-type', 'application/json');
              res.statusCode = 200;
              res.end(text);
            });
          });

          req.on('error', (reqError) => {
            res.statusCode = 400;

            res.end('Request error: ', reqError);
          });
        }

        return;

      default:
        res.statusCode = 500;

        return res.end('Internal server error');
    }
  });

  server.on('error', (serverError) => {
    console.log('Server error:', serverError);
  });

  return server;
}

module.exports = {
  createServer,
};

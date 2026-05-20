'use strict';

const http = require('http');
const fs = require('fs');
const querystring = require('querystring');

function createServer() {
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathName = url.pathname;
    const method = req.method.toLowerCase();

    if (pathName === '/') {
      if (method !== 'get') {
        res.statusCode = 405;
        res.end('Method Not Allowed');

        return;
      }

      res.statusCode = 200;
      res.setHeader('Content-type', 'text/html');

      const homeStream = fs.createReadStream('public/index.html');

      homeStream
        .on('error', (err) => {
          res.statusCode = 500;
          res.end('Internal Server Error: failed to read index.html', err);
        })
        .pipe(res)
        .on('error', (err) => {
          res.statusCode = 500;
          res.end('Internal Server Error: failed to show index.html', err);
        });

      res.on('close', () => {
        homeStream.destroy();
      });

      return;
    }

    if (pathName === '/add-expense') {
      if (method !== 'post') {
        res.statusCode = 405;

        res.end(
          'Method Not Allowed: ',
          'Try to make request with POST method on /add-expense',
        );

        return;
      }

      const chunks = [];

      for await (const chunk of req) {
        chunks.push(chunk);
      }

      const body = Buffer.concat(chunks).toString();
      let data;

      if (req.headers['content-type'] === 'application/json') {
        data = JSON.parse(body);
      } else {
        data = querystring.parse(body);
      }

      const { amount, title, date } = data;

      if (!amount || !title || !date) {
        res.statusCode = 400;
        res.end('Bad Request: amount, description, and date are required');

        return;
      }

      const jsonData = JSON.stringify(data, null, 2);

      fs.writeFile('./db/expense.json', jsonData, (err) => {
        if (err) {
          res.statusCode = 500;
          res.end('Internal Server Error: failed to save expense');

          return;
        }

        res.statusCode = 200;
        res.setHeader('Content-type', 'application/json');
        res.end(jsonData);
      });

      return;
    }

    res.statusCode = 404;
    res.end('Not Found');
  });

  return server;
}

module.exports = {
  createServer,
};

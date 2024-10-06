'use strict';
const http = require('http');
const fs = require('fs');
const querystring = require('querystring');

function createServer() {
  const server = http.createServer(async (req, res) => {
    if (req.url === '/') {
      if (req.method === 'GET') {
        res.setHeader('Content-type', 'text/html');
        const file = fs.createReadStream('public/index.html');

        file
          .on('error', () => {
            res.statusCode = 500;
            res.end('Failed to read index html');
          })
          .pipe(res);

        res.on('close', () => {
          file.destroy();
        });

        return;
      }

      res.statusCode = 405;
      res.end('Method not allowed');
      return;
    }

    if (req.url === '/add-expense') {
      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.end('Method not allowed!');
        return;
      }
      const chunks = [];

      for await (const chunk of req) {
        chunks.push(chunk);
      }

      const rawData = Buffer.concat(chunks).toString();
      let data;

      if (req.headers['content-type'] === 'application/json') {
        data = JSON.parse(rawData);
      } else {
        data = querystring.parse(rawData);
      }

      const jsonData = JSON.stringify(data);
      const { title, amount, date } = data;

      if (!title || !amount || !date) {
        res.statusCode = 404;
        res.end('Not valid form!');
        return;
      }

      fs.writeFileSync('db/expense.json', jsonData, () => {
        res.statusCode = 500;
        res.end('Failed to write expense.json');
        return;
      });

      res.setHeader('Content-type', 'application/json');
      res.end(jsonData);
      return;
    }

    res.statusCode = 404;
    res.end('Not found');
    return;
  });

  return server;
}

module.exports = {
  createServer,
};

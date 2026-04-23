'use strict';

const http = require('http');
const fs = require('fs');
const querystring = require('querystring');
const path = require('path');

function createServer() {
  const server = http.createServer(async (req, res) => {
    if (req.url === '/') {
      if (req.method === 'GET' && req.url === '') {
        res.setHeader('Content-type', 'text/html');

        const filePath = path.join(__dirname, 'form.html');
        const file = fs.createReadStream(filePath);

        file
          .on('error', () => {
            res.statusCode = 500;
            res.end('Failed to read index html');
          })
          .pipe(res);

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
        res.statusCode = 400;

        res.end('Not valid form!');

        return;
      }

      const dbPath = path.join(__dirname, 'db', 'expense.json');

      const writeStream = fs.createWriteStream(dbPath);

      writeStream.write(jsonData);

      fs.writeFileSync('db/expense.json', jsonData, (e) => {
        res.statusCode = 500;
        res.end(e);
      });

      res.setHeader('Content-type', 'application/json');
      res.end(jsonData);

      return;
    }

    res.statusCode = 404;
    res.end('Not found');
  });

  return server;
}

module.exports = {
  createServer,
};

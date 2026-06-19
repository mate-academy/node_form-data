/* eslint-disable no-console */
'use strict';

const http = require('http');
const fs = require('fs');
const formidable = require('formidable');
const path = require('path');

function createServer() {
  const server = new http.Server();

  server.on('request', (req, res) => {
    if (req.url === '/') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      fs.createReadStream('./public/index.html').pipe(res);

      return;
    }

    if (req.url === '/add-expense' && req.method === 'POST') {
      const form = new formidable.IncomingForm();

      form.parse(req, (err, { date, title, amount }) => {
        if (err) {
          res.statusCode = 400;
          res.end('Form error');

          return;
        }

        if (!date || !title || !amount) {
          res.statusCode = 400;
          res.setHeader('Content-type', 'text/plain');
          res.end('All params must be completed');

          return;
        }

        const data = {
          date: date,
          title: title,
          amount: amount,
        };
        const dataPath = path.resolve(__dirname, '../db/expense.json');

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');

        const writeStream = fs.createWriteStream(dataPath);

        writeStream.write(JSON.stringify(data), (error) => {
          if (error) {
            res.statusCode = 500;
            res.end('Error saving data');
          }
        });

        writeStream.on('finish', () => {
          fs.createReadStream(dataPath).pipe(res);
        });
        writeStream.end();
      });

      return;
    }

    res.statusCode = 404;
    res.end('invalid url.');
  });

  return server;
}

module.exports = {
  createServer,
};

'use strict';

const http = require('http');
const fs = require('fs');
const { pipeline } = require('stream');
const formidable = require('formidable');
const path = require('path');

function createServer() {
  const server = new http.Server();

  server.on('request', async (req, res) => {
    const url = new URL(req.url, `http:${req.headers.host}`);

    res.setHeader('Content-Type', 'text/plaint');

    if (url.pathname === '/') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');

      const homeFile = fs.createReadStream('public/index.html');

      pipeline(homeFile, res, (err) => {
        res.statusCode = 500;

        return res.end(String(err));
      });
    } else if (url.pathname !== '/add-expense') {
      res.statusCode = 404;

      return res.end('Not found');
    } else {
      const form = new formidable.IncomingForm();

      try {
        const [fields] = await form.parse(req);

        const { date, title, amount } = fields;

        if (!date || !title || !amount) {
          res.statusCode = 400;

          return res.end('Invalid form');
        }

        const fileContent = JSON.stringify({
          date,
          title,
          amount,
        });

        const filePath = path.resolve(__dirname, '../db/expense.json');
        const fileStream = fs.createWriteStream(filePath);

        fileStream.write(fileContent, (err) => {
          if (err) {
            res.statusCode = 500;
            res.end(String(err));
          }
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(fileContent);
        });

        fileStream.end();
      } catch (err) {
        res.statusCode = err?.httpCode || 400;

        return res.end(String(err));
      }
    }
  });

  server.on('error', () => {});

  return server;
}

module.exports = {
  createServer,
};

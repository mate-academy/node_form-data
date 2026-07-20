'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const formidable = require('formidable');

function createServer() {
  const server = new http.Server();

  server.on('request', (req, res) => {
    const serverErrorHandler = () => {
      res.statusCode = 500;
      res.end('Server error');
    };

    if (req.method === 'GET' && req.url === '/') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');

      const htmlPath = path.join(__dirname, 'index.html');

      fs.createReadStream(htmlPath).pipe(res);

      return;
    }

    if (req.method === 'POST' && req.url === '/add-expense') {
      const form = formidable({});

      form.parse(req, (err, fields) => {
        if (err) {
          serverErrorHandler();

          return;
        }

        const date = fields.date || '';
        const title = fields.title || '';
        const amount = fields.amount || '';

        if (!date || !title || !amount) {
          res.statusCode = 400;
          res.end('Should include all params');

          return;
        }

        const content = JSON.stringify({
          date: date,
          title: title,
          amount: amount,
        });

        const filePath = `db/expense.json`;

        fs.writeFile(filePath, content, (fileErr) => {
          if (fileErr) {
            serverErrorHandler();

            return;
          }

          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(`<pre>${content}</pre>`);
        });
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

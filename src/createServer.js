'use strict';

const formidable = require('formidable');
const http = require('http');
const fs = require('fs');

function createServer() {
  const server = new http.Server();

  server.on('request', async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathName = url.pathname;

    if (
      (pathName === '/' || pathName === '/index.html') &&
      req.method === 'GET'
    ) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');

      fs.createReadStream('public/index.html').pipe(res);

      return;
    }

    if (pathName !== '/add-expense') {
      res.setHeader('Content-type', 'plain/text');
      res.statusCode = 404;
      res.end('URL is invalid');

      return;
    }

    const form = new formidable.IncomingForm();

    try {
      const formData = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields) => {
          if (err) {
            reject(err);

            return;
          }
          resolve({ fields });
        });
      });

      res.setHeader('Content-type', 'text/plain');

      const {
        date: dateArr,
        title: titleArr,
        amount: amountArr,
      } = formData.fields;

      if (!dateArr || !titleArr || !amountArr) {
        res.statusCode = 400;
        res.end('All params are required');

        return;
      }

      const expenseData = {
        date: Array.isArray(dateArr) ? dateArr[0] : dateArr,
        title: Array.isArray(titleArr) ? titleArr[0] : titleArr,
        amount: Array.isArray(amountArr) ? amountArr[0] : amountArr,
      };

      fs.writeFile(
        './db/expense.json',
        JSON.stringify(expenseData, null, 2),
        (error) => {
          if (error) {
            res.statusCode = 500;
            res.end('Error writing to file');

            return;
          }

          res.statusCode = 200;
          res.setHeader('content-type', 'application/json');

          res.end(JSON.stringify(expenseData));
        },
      );
    } catch (err) {
      res.statusCode = 500;
      res.end('Formidable error');
    }
  });

  server.on('error', () => {});

  return server;
}

module.exports = {
  createServer,
};

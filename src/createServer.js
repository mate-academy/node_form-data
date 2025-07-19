/* eslint-disable no-console */
'use strict';

const http = require('http');
const path = require('path');
const fs = require('fs');
const { IncomingForm } = require('formidable');

function createServer() {
  const server = new http.Server();

  server.on('request', (req, res) => {
    if (req.method === 'GET' && req.url === '/') {
      const clientPath = path.join(__dirname, './index.html');

      fs.createReadStream(clientPath).pipe(res);

      return;
    }

    if (req.url !== '/add-expense') {
      res.writeHead(404);
      res.end();

      return;
    }

    const form = new IncomingForm({ multiples: false });

    form.parse(req, (err, fields, files) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Something went wrong!');

        return;
      }

      function getFieldValue(field) {
        if (!field) {
          return null;
        }

        if (Array.isArray(field)) {
          return field.length > 0 ? field[0] : null;
        }

        return field;
      }

      const titleValue = getFieldValue(fields.title);
      const amountValue = getFieldValue(fields.amount);
      const dateValue = getFieldValue(fields.date);

      if (
        !titleValue ||
        !amountValue ||
        !dateValue ||
        titleValue === '' ||
        amountValue === '' ||
        dateValue === ''
      ) {
        res.statusCode = 400;
        res.end('Not full data');

        return;
      }

      const expense = {
        title: titleValue,
        amount: amountValue,
        date: dateValue,
      };

      const dbPath = path.join(__dirname, '../', './db/expense.json');

      fs.writeFileSync(dbPath, JSON.stringify(expense));

      res.writeHead(200, { 'Content-Type': 'application/json' });

      res.end(JSON.stringify(expense));
    });
  });

  server.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.error(err);
  });

  return server;
}

module.exports = {
  createServer,
};

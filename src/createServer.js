'use strict';

const http = require('http');
const fs = require('fs');
const formidable = require('formidable');
const path = require('path');

function createServer() {
  return http.createServer(async (req, res) => {
    if (req.url === '/add-expense' && req.method === 'POST') {
      const form = new formidable.Formidable({});
      let fields;

      try {
        [fields] = await form.parse(req);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error({ catch: err });
        res.writeHead(err.httpCode || 400, { 'Content-Type': 'text/plain' });
        res.end(String(err));

        return;
      }

      if (!fields.date || !fields.title || !fields.amount) {
        res.statusCode = 400;
        // res.setHeader('Content-Type', 'application/json');
        res.end('wrong data');

        return;
      }

      const pathToJSON = path.join(__dirname, '..', 'db', 'expense.json');

      const writeStream = fs.createWriteStream(pathToJSON);

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');

      writeStream.write(JSON.stringify(fields));
      writeStream.end();

      writeStream.on('finish', () => {
        res.end(JSON.stringify(fields));
      });
    } else {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');
      res.end('invalid url');
    }
  });
}

module.exports = {
  createServer,
};

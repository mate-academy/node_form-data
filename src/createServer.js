'use strict';

const http = require('http');
const fs = require('fs');
const formidable = require('formidable');
const path = require('path');
const { methods } = require('./constants/methods');
const { pathUrl } = require('./constants/path');
const { response } = require('./constants/response');

function createServer() {
  return http.createServer(async (req, res) => {
    if (req.url === pathUrl.add && req.method === methods.post) {
      const form = new formidable.Formidable({});
      let fields;

      try {
        [fields] = await form.parse(req);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error({ catch: err });

        res.writeHead(err.httpCode || response[400].statusCode, {
          'Content-Type': 'text/plain',
        });
        res.end(String(err));

        return;
      }

      if (!fields.date || !fields.title || !fields.amount) {
        res.statusCode = response[400].statusCode;
        // res.setHeader('Content-Type', 'application/json');
        res.end(response[400].messages.data);

        return;
      }

      const pathToJSON = path.join(__dirname, '..', 'db', 'expense.json');

      const writeStream = fs.createWriteStream(pathToJSON);

      res.statusCode = response[200].statusCode;
      res.setHeader('Content-Type', 'application/json');

      writeStream.write(JSON.stringify(fields));
      writeStream.end();

      writeStream.on('finish', () => {
        res.end(JSON.stringify(fields));
      });
    } else {
      res.statusCode = response[404].statusCode;
      res.setHeader('Content-Type', 'text/plain');
      res.end(response[404].messages.notFound);
    }
  });
}

module.exports = {
  createServer,
};

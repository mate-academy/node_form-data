'use strict';

const http = require('http');
const fs = require('fs');

const { fromDataParser } = require('./modules/formDataParser');
const { updateJSON } = require('./modules/updateJSON');

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/expenses') {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const dataFromForm = fromDataParser(body);

      try {
        const updatedJSON = updateJSON(dataFromForm);

        res.end(updatedJSON);
      } catch (error) {
        res.statusCode = 404;
        res.end();
      }
    });
  } else {
    try {
      const expensePage = fs.readFileSync('src/public/index.html');

      res.end(expensePage);
    } catch (error) {
      res.statusCode = 404;
      res.end();
    }
  }
});

server.listen(5700);

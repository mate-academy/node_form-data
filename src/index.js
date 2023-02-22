'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const { addForm } = require('./addForm');
const { resultJson } = require('./resultJson');

const server = http.createServer((req, res) => {
  switch (req.url) {
    case '/':
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.write(addForm);
      res.end();
      break;
    case '/expenses':
      const form = new formidable.IncomingForm();

      form.parse(req, (err, fields, files) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.write('An error occurred while parsing the form data.', err);
          res.end();

          return;
        }

        const expensesFilePath = path.join(__dirname, 'expenses.json');

        fs.writeFileSync(expensesFilePath, JSON.stringify(fields));

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(resultJson(fields));
        res.end();
      });
      break;
    default:
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.write('Not found');
      res.end();
  }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`App listening on http://localhost:${PORT}`);
});

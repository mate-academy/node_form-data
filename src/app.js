'use strict';

const http = require('http');
const fs = require('fs');
const formidable = require('formidable');

const JSONFile = './src/expenses.json';

const server = new http.Server();

server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathName = url.pathname.slice(1) || 'index.html';

  if (pathName === 'index.html') {
    res.setHeader('Content-type', 'text/html');

    const file = fs.createReadStream(`./src/${pathName}`);

    file.on('error', () => {
      res.statusCode = '404';
      res.end();
    });

    file.pipe(res);

    res.on('close', () => {
      file.destroy();
    });

    return;
  }

  if (pathName === 'format') {
    const form = new formidable.IncomingForm();

    form.parse(req, (error, fields) => {
      if (error) {
        res.statusCode = '500';
        res.end();
      }

      const { date, title, amount } = fields;

      const jsonFields = JSON.stringify(fields);

      fs.writeFileSync(JSONFile, jsonFields);

      const file = fs.createReadStream(JSONFile);

      file.pipe(res);

      res.setHeader('Content-Type', 'text/html');

      file.on('error', () => {
        res.statusCode = '500';
        res.end();
      });

      res.on('close', () => {
        file.destroy();
      });

      const markup = `
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${title}</td>
              <td>${amount}</td>
              <td>${date}</td>
            </tr>
          </tbody>
        </table>
      `;

      res.end(markup);
    });

    return;
  }

  res.statusCode = 404;
  res.end('File does not exist');
});

server.listen(3000);

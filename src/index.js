'use strict';

const http = require('http');
const fs = require('fs');
const formidable = require('formidable');

const PORT = process.env.PORT || 3000;
const jsonFile = './src/expence.json';

const server = new http.Server();

server.on('request', (req, res) => {
  const normilizedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathName = normilizedUrl.pathname.slice(1) || 'index.html';

  if (pathName === 'index.html') {
    res.setHeader('Content-Type', 'text/html');

    const readData = fs.createReadStream(`./src/${pathName}`);

    readData.on('error', () => {
      res.statusCode = '400';
      res.end();
    });

    readData.pipe(res);

    res.on('close', () => {
      readData.destroy();
    });

    return;
  }

  if (pathName === 'expense') {
    const form = new formidable.IncomingForm();

    form.parse(req, (error, fields) => {
      if (error) {
        res.statusCode = '500';
        res.end();
      }

      const { date, title, amount } = fields;

      const jsonFields = JSON.stringify(fields);

      fs.writeFileSync(jsonFile, jsonFields);

      const readData = fs.createReadStream(jsonFile);

      readData.pipe(res);

      res.setHeader('Content-Type', 'text/html');

      readData.on('error', () => {
        res.statusCode = '500';
        res.end('Error Occurred');
      });

      res.on('close', () => {
        readData.destroy();
      });

      const markup = `
        <style>
          table.GeneratedTable {
            width: 100%;
            background-color: #ffffff;
            border-collapse: collapse;
            border-width: 2px;
            border-color: #ffcc00;
            border-style: solid;
            color: #000000;
          }

          table.GeneratedTable td,
          table.GeneratedTable th {
            border-width: 2px;
            border-color: #ffcc00;
            border-style: solid;
            padding: 3px;
          }

          table.GeneratedTable thead {
            background-color: #ffcc00;
          }
        </style>

        <table class="GeneratedTable">
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
              <td>${date}</td>
              <td>${amount}</td>
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

server.listen(PORT, () => {
  /* eslint-disable no-console */
  console.log(`Server is running on http://localhost:${PORT}`);
});

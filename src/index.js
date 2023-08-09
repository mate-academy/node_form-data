'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const server = new http.Server();

const PATHS = {
  index: 'GET /',
  convert: 'POST /convert',
};

// left here for simplicity(may be moved into .html if needed)
const BASE_HTML = `
  <h1>Expence</h1>

  <form action="/convert" method="post" enctype="application/json">
    <label for="date">Date:</label>
    <input type="date" name="date" id="date" required /><br />

    <label for="text">Title:</label>
    <input type="text" name="title" id="text" required /><br />

    <label for="number">Amount:</label>
    <input type="number" name="amount" id="number" required />

    <input type="submit" />
  </form>
`;

server.on('request', (req, res) => {
  switch (req.method + ' ' + req.url) {
    case PATHS.index:
      res.writeHeader(200, { 'Content-Type': 'text/html' });

      res.end(BASE_HTML);
      break;

    case PATHS.convert:
      const chunks = [];

      req.on('data', (chunk) => {
        chunks.push(chunk);
      });

      req.on('end', () => {
        const dataString = Buffer.concat(chunks).toString().split('&');
        const data = {};

        dataString.forEach((item) => {
          const [key, value] = item.split('=');

          data[key] = value;
        });

        const JSONdata = JSON.stringify(data, null, 2);

        res.writeHeader(200, {
          'Content-Type': 'text/html',
        });

        fs.writeFile(path.join(__dirname, 'data.json'), JSONdata, (err) => {
          if (err) {
            res.writeHeader(500, { 'Content-Type': 'text/plain' });
            res.end('Internal server error');
          }
        });

        const formatedHtmlJson = `
          <h1>Expence</h1>

          <p>
            ${JSONdata.replace(/\n/g, '<br />')}
          </p>
        `;

        res.end(formatedHtmlJson);
      });
      break;

    default:
      res.writeHeader(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
  }
});

// eslint-disable-next-line no-console
server.on('error', () => console.log('Server error'));

// eslint-disable-next-line no-console
server.listen(3000, () => console.log('Server started on port 3000'));

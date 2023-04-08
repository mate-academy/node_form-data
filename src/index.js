'use strict';

const http = require('http');
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');

const { formWithData } = require('./formWithData.js');

const server = new http.Server();

const PORT = process.env.PORT || 3000;

server.on('request', (req, res) => {
  res.setHeader('Content-Type', 'text/html');

  if (req.url === '/expense' && req.method === 'POST') {
    const form = new formidable.IncomingForm();

    form.parse(req, (err, fields) => {
      if (err) {
        res.statusCode = 400;
        res.end(String(err));

        return;
      }

      const filePath = path.join(__dirname, 'data.json');

      fs.writeFileSync(filePath, JSON.stringify(fields, null, 2));

      res.writeHead(200, { 'Content-Type': 'text/html' });

      res.write(`
        <html>
          <body>
            <h1>Your data:</h1>

            <pre>${JSON.stringify(fields, null, 2)}</pre>
          </body>
        </html>
      `);
      res.end();
    });
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(formWithData);
    res.end();
  }
});

server.on('error', () => {});
server.listen(PORT);

/* eslint-disable no-console */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

const server = new http.Server();

const PORT = process.env.PORT || 3000;

server.on('request', (req, res) => {
  if (req.method === 'GET') {
    const fileName = path.join(__dirname, 'index.html');
    const file = fs.ReadStream(fileName);

    file.on('error', () => {
      res.statusCode = 404;
      res.end('File not found');
    });

    file.pipe(res);
  } else if (req.method === 'POST') {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const formData = querystring.parse(body);
      const date = formData.date;
      const title = formData.title;
      const amount = formData.amount;

      const formDataObject = {
        date,
        title,
        amount,
      };

      const jsonData = JSON.stringify(formDataObject);

      fs.writeFileSync('formData.json', jsonData);
      res.setHeader('Content-Type', 'text/html');
      res.statusCode = 200;
      res.end(jsonData);
    });
  } else {
    res.statusCode = 405;
    res.end('Method not allowed');
  }
});

server.on('error', (err) => console.log(err));

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${PORT}/`);
});

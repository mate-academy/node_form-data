/* eslint-disable no-console */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { parse } = require('querystring');

const server = new http.Server();

server.on('request', (req, res) => {
  if (req.method === 'GET') {
    const fileName = path.resolve(__dirname, 'index.html');
    const file = fs.ReadStream(fileName);

    file.on('error', () => {
      res.statusCode = 404;
      res.end('no such file');
    });

    file.pipe(res);
  } else if (req.method === 'POST') {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const formData = parse(body);
      const date = formData.date;
      const title = formData.title;
      const amount = formData.amount;

      const formDataObject = {
        date,
        title,
        amount,
      };

      const jsonData = JSON.stringify(formDataObject, null, 2);

      fs.writeFileSync('formData.json', jsonData);
      res.setHeader('Content-Type', 'text/html');
      res.statusCode = 200;
      res.end(`<pre>${jsonData}</pre>`);
    });
  } else {
    res.statusCode = 405;
    res.end('Method not allowed');
  }
});

server.on('error', (err) => console.log(err));
server.listen(3006);

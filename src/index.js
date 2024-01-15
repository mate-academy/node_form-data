/* eslint-disable no-console */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');

const PORT = process.env.PORT || '3006';
const publicFolderPath = path.join(__dirname, '..', 'public');

const server = http.createServer();

server.on('request', (req, res) => {
  if (req.url === '/data' && req.method === 'POST') {
    const form = new formidable.IncomingForm();

    form.parse(req, (err, fields, files) => {
      if (err) {
        res.statusCode = 400;

        return;
      }

      const filePath = path.join(__dirname, 'data.json');

      fs.writeFile(filePath, JSON.stringify(fields), 'utf-8', (error) => {
        if (error) {
          console.log(error);
        } else {
          res.setHeader('Content-Type', 'text/html; charset=UTF-8');

          const data = `
          <div>
            <div>Date is: ${fields.date}</div>
            <br/>
            <div>Title is: ${fields.title}</div>
            <br/>
            <div>Amount is: ${fields.amount}</div>
          </div>
        `;

          res.end(data);
        }
      });
    });
  } else if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html' });

    const htmlFilePath = path.join(publicFolderPath, 'form.html');
    const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');

    res.end(htmlContent);
  }
});

server.on('error', (err) => {
  console.error('Server error:', err.message);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

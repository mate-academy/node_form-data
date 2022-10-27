/* eslint-disable no-console */
'use strict';

const http = require('http');
const { writeFile } = require('fs');
const formidable = require('formidable');
const PORT = process.env.PORT || 3000;

const server = new http.Server();

server.on('request', (req, res) => {
  if (req.url === '/postinfo') {
    if (req.method.toLowerCase() !== 'post') {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Server accepts only POST requests');
    }

    parseFormData(req, res);
  } else {
    res.setHeader('Content-Type', 'text/html');

    res.write(
      `<form
        action="postinfo"
        method="post"
        enctype="multipart/form-data"
      >
        <input name="date" type="date">
        <input name="text" type="text" placeholder="Title">
        <input name="amount" type="number" placeholder="Amount">
        <button type="submit">Submit</button>
      </form>`
    );

    res.end();
  }
});

server.listen(PORT, () => {
  console.log(`Running on http://localhost:${PORT}/`);
});

const parseFormData = (req, res) => {
  const form = formidable({});

  form.parse(req, (err, fields) => {
    if (err) {
      res.writeHead(err.httpCode || 400, { 'Content-Type': 'text/plain' });
      res.end('Parsing error');

      return;
    }

    writeFile('./expense.json', JSON.stringify(fields), (writeErr) => {
      if (writeErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('JSON writing error');

        return;
      }

      res.writeHead(200, { 'Content-Type': 'text/html' });

      res.write(
        `
          <h1>Date: ${fields.date}</h1>
          <h1>Title: ${fields.text}</h1>
          <h1>Amount: ${fields.amount}</h1>
        `
      );
      res.end();
    });
  });
};

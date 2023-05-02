'use strict';

const fs = require('fs');
const http = require('http');

const server = new http.Server();

const filename = './expences.json'

server.on('request', (req, res) => {
  if (req.url === '/info') {
    const chunks = [];

    req.on('data', (chunk) => {
      chunks.push(chunk)
    })

    req.on('end', () => {
      const rawData = Buffer.concat(chunks).toString()
      const searchParams = new URLSearchParams(rawData);
      const date = new Date();

      const newEntry = {
        title: searchParams.get('title'),
        amount: searchParams.get('amount'),
        date,
      }

      const file = fs.existsSync(filename)
        ? fs.readFileSync(filename)
        : '[]';

      const expences = JSON.parse(file)

      expences.push(newEntry);

      const fileData = JSON.stringify(expences)

      res.setHeader('Content-type', 'application/json');

      res.end(fileData)

      fs.writeFileSync(filename, fileData)
    })

    return;
  }

  res.setHeader('Content-type', 'text/html');

  res.end(`
    <form
      action="http://localhost:3000/info"
      method="post"
    >
      <input type='text' name="title">
      <input type='number' name="amount">

      <button type="submit">Upload</button>
    <form>
  `);
});

server.listen(3000);

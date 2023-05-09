'use strict';

const http = require('http');
const fs = require('fs');
const formidable = require('formidable');

const handleIndex = (req, res) => {
  const fileStream = fs.createReadStream('./public/index.html');

  fileStream.pipe(res);

  fileStream.on('end', () => {
    // eslint-disable-next-line no-console
    console.log('Completed');
  });

  fileStream.on('error', () => {
    res.statusCode = 500;
    res.end('Server error');
  });
};

const handleUpload = (req, res) => {
  const form = formidable({ string: 'utf-8' });

  form.parse(req, (err, fields) => {
    if (err) {
      res.writeHead(err.httpCode || 400, { 'Content-Type': 'text/plain' });
      res.end(String(err));

      return;
    }

    const writeStream = fs.createWriteStream('./src/result.json');

    writeStream.write(JSON.stringify(fields));

    writeStream.on('error', () => {
      res.statusCode = 500;
      res.end('Server error');
    });

    res.end(`
      <main>
        <h3>Date - ${fields.date}</h3>
        <h3>Title - ${fields.title}</h3>
        <h3>Amount - ${fields.amount}</h3>
      </main>
  `);
  });
};

const server = http.createServer((req, res) => {
  res.setHeader('Content-type', 'text/html');

  if (req.url === '/getJSON' && req.method === 'POST') {
    handleUpload(req, res);
  } else {
    handleIndex(req, res);
  }
});

server.on('error', () => {});

server.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log('Server started! 🚀');
});

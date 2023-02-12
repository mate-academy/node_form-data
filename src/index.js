'use strict';

const http = require('http');
const fs = require('fs');
const formidable = require('formidable');

const PORT = process.env.PORT || 3000;

const server = new http.Server();

server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathName = url.pathname.slice(1) || 'index.html';

  if (pathName === 'index.html') {
    res.setHeader('Content-Type', 'text/html');

    const file = fs.createReadStream(`./public/${pathName}`);

    file.on('error', () => {
      res.statusCode = 404;
      res.end();
    });

    file.pipe(res);

    res.on('close', () => {
      file.destroy();
    });

    return;
  }

  if (pathName === 'expense' && req.method.toLowerCase() === 'post') {
    const form = new formidable.IncomingForm();

    form.parse(req, (err, fields) => {
      if (err) {
        res.statusCode = 400;
        res.end();
      }

      const { date, title, amount } = fields;

      fs.writeFileSync('./src/expense.json', JSON.stringify(fields));

      const stream = fs.createReadStream('./src/expense.json');

      stream.pipe(res);

      res.setHeader('Content-Type', 'text/html');

      stream.on('error', () => {
        res.statusCode = 500;
        res.end('Unable to read file');
      });

      res.on('close', () => {
        stream.destroy();
      });

      res.end(`
        <h1>My expense:</h1>
        <h2>Date: ${date}</h2>
        <h2>Title: ${title}</h2>
        <h2>Amount: ${amount}</h2>
      `);
    });

    return;
  }

  res.statusCode = 404;
  res.end('File does not exist');
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on http://localhost:${PORT}`);
});

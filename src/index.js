'use strict';

const http = require('http');
const fs = require('fs');
const formidable = require('formidable');

const server = new http.Server();
const PORT = process.env.PORT || 3000;

server.on('request', (req, res) => {
  if (req.url === '/expense' && req.method.toLowerCase() === 'post') {
    const form = new formidable.IncomingForm();

    form.parse(req, (err, fields) => {
      if (err) {
        res.statusCode = 404;
        res.end(err);
      }

      fs.writeFileSync('./src/expense.json', JSON.stringify(fields));

      const file = fs.createReadStream('./src/expense.json');

      file.pipe(res);

      file.on('error', (error) => {
        if (error) {
          res.statusCode = 404;
          res.end(error);
        }
      });

      res.setHeader('Content-Type', 'text/html');

      res.end(`
        <h1>${fields.date}</h1>
        <h1>${fields.title}</h1>
        <h1>${fields.amount}</h1>
      `);
    });
  } else {
    res.setHeader('Content-Type', 'text/html');

    res.end(`
    <form action="/expense", method="post">
      <input type="date" name="date"><br>
      <input type="text" name="title"><br>
      <input type="number" name="amount"><br>

      <input type='submit'>
    </form>
  `);
  }
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`The server is running on port ${PORT}`);
});

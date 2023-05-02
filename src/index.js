'use strict';

const http = require('http');
const formidable = require('formidable');
const path = require('path');
const { form } = require('./form');
const { TransformToHTML } = require('./transformToHTML');
const fs = require('fs');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/date') {
    const formData = new formidable.IncomingForm();

    formData.parse(req, function(err, fields) {
      if (err) {
        // eslint-disable-next-line no-console
        console.error(err);
      }

      const filePath = path.join(__dirname, 'amount.json');

      fs.writeFile(filePath, JSON.stringify(fields), (error) => {
        if (error) {
          // eslint-disable-next-line no-console
          console.error(err);
        } else {
          const amount = fs.createReadStream(filePath);

          const transformJSON = new TransformToHTML();

          res.setHeader('Content-type', 'text/html');
          amount.pipe(transformJSON).pipe(res);
        }
      });
    });
  } else {
    res.setHeader('Content-type', 'text/html');
    res.write(form);
    res.end();
  }
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`server started on PORT:${PORT}`);
});

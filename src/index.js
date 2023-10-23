'use strict';

const http = require('http');
const fs = require('fs');
const server = new http.Server();

server.on('request', async(req, res) => {
  if (req.url === '/') {
    res.setHeader('Content-type', 'text/html');

    const fileStream = fs.createReadStream('src/pages/form.html');

    fileStream.on('error', () => {
      console.log('form file not found try again');
    }).pipe(res); // <---- here is all okay
  }

  if (req.url === '/upload') {
    res.setHeader('Content-type', 'text/html');

    const chunks = [];
    let formData;

    req.on('data', (chunk) => {
      chunks.push(chunk);
    });

    req.on('end', () => {
      formData = JSON.stringify(Buffer.concat(chunks).toString());

      fs.writeFileSync('src/pages/result.json', formData);

      const fileStream = fs.createReadStream('src/pages/result.json');

      res.setHeader('Content-type', 'text/html');

      fileStream.on('error', () => {
        console.log('form file not found try again');
      }).pipe(res); // how render this result (in task I need to return a new page
    });
  }
});

server.on('error', (error) => {
  // eslint-disable-next-line
  console.log('server error', error);
});

server.listen(3000, () => {
  // eslint-disable-next-line
  console.log('server running...');
});

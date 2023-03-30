/* eslint-disable no-console */
import http from 'http';
import fs from 'fs';
import querystring from 'querystring';
import path from 'path';

const server = http.Server();

server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  if (pathname === '/formSubmit' && req.method === 'POST') {
    const chunks = [];

    req.on('data', (chunk) => {
      chunks.push(chunk);

      const data = Buffer.concat(chunks).toString();
      const file = querystring.parse(data);

      fs.createWriteStream(path.resolve('data', `${file.title}.json`)).write(
        JSON.stringify(file)
      );

      res.end(JSON.stringify(file));
    });
  } else {
    res.end(fs.readFileSync('public/index.html'));
  }
});

server.listen(3000, () => {
  console.log(`Server listening on http://localhost:3000`);
});

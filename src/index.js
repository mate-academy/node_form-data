/* eslint-disable no-console */
'use strict';

import http from 'http';
import formidable from 'formidable';

const server = http.createServer(async(req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.url === '/date' && req.method.toLowerCase() === 'post') {
    const form = formidable({});
    let fields;

    try {
      [fields] = await form.parse(req);
    } catch (err) {
      console.error(err);
      res.writeHead(err.httpCode || 400, { 'Content-Type': 'text/plain' });
      res.end(String(err));

      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify( fields , null, 2));
  }

  res.writeHead(200, { 'Content-Type': 'text/html' });

  res.end(`
    <h1>Form data</h1>

    <form action="/date" method="POST">
      <label for="date"><p>Add date:</p>
        <input type="date" name="date" id="date" required>
      </label>
      <label for="title"><p>Add title:</p>
        <input type="title" name="title" id="title" required>
      </label>
      <label for="amount"><p>Add amount:</p>
        <input type="number" name="amount" id="amount" required>
      </label>
      <br>
      <br>
      <button type="submit"><strong>Submit</strong></button>
    </form>
  `);
});

server.listen(8080, () => {
  console.log('Server listening on http://localhost:8080/ ...');
});

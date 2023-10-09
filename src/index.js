/* eslint-disable no-console */
'use strict';

const http = require('http');
const { dataForm } = require('./dataForm');
const PORT = process.env.PORT || 3005;

const server = new http.Server();

server.on('request', (req, res) => {
  if (req.url === '/upload') {
    dataForm(req, res);
  } else {
    res.setHeader('Content-Type', 'text/html');

    res.write(
      `<form
          action="upload"
          method="POST"
          enctype="multipart/form-data"
        >
        <label
          for="date"
          style="display: block;
          margin-bottom: 10px;
          font-weight: bold"
        >
           Select date:
          <input name="date" type="date">
        </label>
        <label
          for="text"
          style="display: block;
          margin-bottom: 10px;
          font-weight: bold"
        >
          Select text:
          <input name="text" type="text">
        </label>
        <label
          for="number"
          style="display: block;
          margin-bottom: 10px;
          font-weight: bold"
        >
          Select amount:
          <input name="amount" type="number">
        </label>
          <button type="submit">Upload</button>
        </form>`
    );

    res.end();
  }
}
);

server.on('error', () => { });

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

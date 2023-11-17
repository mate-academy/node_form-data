'use strict';

const path = require('path');
const express = require('express');
const fs = require('fs');
const app = express();

app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));

app.post('/api', (req, res) => {
  res.setHeader('Content-Type', 'text/html');

  const stream = fs.createWriteStream(path.resolve('public', 'form.json'));

  stream.write(JSON.stringify(req.body));

  res.end(`<pre>${JSON.stringify(req.body)}</pre>`);
});

app.listen(3005, () => {
  // eslint-disable-next-line
  console.log('Server is running');
});

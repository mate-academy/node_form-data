'use strict';

const express = require('express');
const { readFileSync } = require('fs');
const app = express();

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.end(readFileSync('src/index.html'));
});

app.post('/format', (req, res) => {
  res.end(JSON.stringify(req.body)
    .replace(/["{}]/g, '')
    .replace(/,/g, '\n')
    .replace(/:/g, ': ')
  );
});

app.listen(3000);

'use strict';

const express = require('express');
const { readFileSync } = require('fs');
const app = express();

// allow reading form data from the req.body object
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.end(readFileSync('src/index.html'));
});

app.post('/format', (req, res) => {
  res.end(JSON.stringify(req.body)
    // remove unnecessary chars
    .replace(/["{}]/g, '')
    // separate props with new line
    .replace(/,/g, '\n')
    // add space between key-value pairs
    .replace(/:/g, ': ')
  );

  // or as JSON
  // res.json(req.body);
});

app.listen(3000);

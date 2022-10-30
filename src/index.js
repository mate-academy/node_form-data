'use strict';

/* eslint-disable no-console */
const express = require('express');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

app.post('/api', (req, res) => {
  console.log(req.body);
  res.write(JSON.stringify(req.body));

  fs.writeFile('data.json', JSON.stringify(req.body), () => {
    res.end('Error');
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

/* eslint-disable no-console */
'use strict';

const formidable = require('formidable');
const path = require('path');
const fs = require('fs');
const { pipeline } = require('stream');
const { jsonToHtmlStream } = require('./jsonToHtmlTableStream');
const handleUpload = (req, res) => {
  const formData = new formidable.IncomingForm();

  formData.parse(req, (err, fields) => {
    if (err) {
      console.log(err);
    }

    const filePath = path.join(__dirname, 'amount.json');

    fs.writeFile(filePath, JSON.stringify(fields), (error) => {
      if (error) {
        console.log(error);
      } else {
        const amount = fs.createReadStream(filePath);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');

        pipeline(amount, jsonToHtmlStream, res, (e) => {
          if (e) {
            console.log(e);
          }
        });
      }
    });
  });
};

module.exports = { handleUpload };

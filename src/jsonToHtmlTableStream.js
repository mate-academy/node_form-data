'use strict';

const through2 = require('through2');

// JSON to HTML transform function
function jsonToHtml(chunk, enc, callback) {
  try {
    const jsonObj = JSON.parse(chunk.toString());
    const html = `
      <html>
        <head>
          <title>JSON to HTML</title>
          <style>
            table {
              width: 50%;
              border-collapse: collapse;
              font-family: Arial, sans-serif;
            }
            th, td {
              padding: 8px;
              text-align: left;
              border-bottom: 1px solid #ddd;
            }
            th {
              background-color: #f2f2f2;
            }
          </style>
        </head>
        <body>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${jsonObj.date}</td>
                <td>${jsonObj.title}</td>
                <td>${jsonObj.amount}</td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `;

    this.push(html);
    callback();
  } catch (err) {
    callback(err);
  }
}

const jsonToHtmlStream = through2(jsonToHtml);

module.exports = { jsonToHtmlStream };

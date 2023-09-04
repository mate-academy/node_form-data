'use strict';

const tableWithData = ({ title, amount, date }) => (
  `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css"
        >
      </head>
      <body>
        <div class='container'>
          <table class='table is-bordered is-striped is-hoverable'>
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${date}</td>
                <td>${title}</td>
                <td>${amount}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </body>
    </html>`
);

module.exports = { tableWithData };

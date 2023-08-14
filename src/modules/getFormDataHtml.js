'use strict';

const getFormDataHtml = ({ date, title, amount }) => (`
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css">
      <title>Form data</title>
    </head>
    <body>
    <div class="container box is-max-desktop">
        <h1 class="title">Form data</h1>

        <table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
          <thead>
            <tr>
              <th>Date</th>
              <th>Title</th>
              <th>Date</th>
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

module.exports = { getFormDataHtml };

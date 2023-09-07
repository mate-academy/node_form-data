'use strict';

const pageWithData = ({ date, title, amount }) =>
  `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Expense info</title>
    </head>
    <body>
      <h1>Info about your expense</h1>

      <div>
        <div>
          <b>Date:</b>
          <span>${date}</span>
        </div>

        <div>
          <b>Title:</b>
          <span>${title}</span>
        </div>

        <div>
          <b>Amount:</b>
          <span>${amount}</span>
        </div>
      </div>
    </body>
  </html>
`;

module.exports = { pageWithData };

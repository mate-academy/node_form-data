'use strict';

const getHtmlResponseTemplate = (data) => {
  const parsedData = JSON.parse(data);

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Form Data</title>
      </head>
      <body>
        <h2>Your data:</h2>
        <pre>${data}</pre>
        <hr />
        <div>Date: ${parsedData.date}</div>
        <div>Title: ${parsedData.title}</div>
        <div>Amount: ${parsedData.amount}</div>
      </body>
    </html>
  `;
};

module.exports = { getHtmlResponseTemplate };

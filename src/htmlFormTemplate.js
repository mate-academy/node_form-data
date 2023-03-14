'use strict';

const htmlFormTemplate = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Form Data</title>
    </head>
    <body>
      <h2>Fill out the form, please:</h2>
      <form action="/data" enctype="multipart/form-data" method="post">
        <label>Date: <input type="date" name="date" required /></label>
        <label>Title: <input type="text" name="title" required /></label>
        <label>Amount: <input type="number" name="amount" required /></label>
        <div><input type="submit" value="Submit" /></div>
        </form>
    </body>
  </html>
`;

module.exports = { htmlFormTemplate };

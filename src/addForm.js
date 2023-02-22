'use strict';

const addForm = `
  <html>
    <head>
      <title>Expense Form</title>
    </head>
    <body>
      <h1>Add an Expense</h1>
      <form method="post" action="/expenses" enctype="multipart/form-data">
        <label>Date:</label>
        <input type="date" name="date" required><br>
        <label>Title:</label>
        <input type="text" name="title" required><br>
        <label>Amount:</label>
        <input type="number" name="amount" required><br>
        <button type="submit">Add Expense</button>
      </form>
    </body>
  </html>
`;

module.exports = {
  addForm,
};

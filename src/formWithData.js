'use strict';

const formWithData = `
  <form action="/expense" enctype="multipart/form-data" method="POST">
    <input type="date" name="date">
    <input type="text" name="title" placeholder="Title">
    <input type="number" name="amount" placeholder="Amount">

    <button type="submit">Submit</button>
  </form>
`;

module.exports = { formWithData };

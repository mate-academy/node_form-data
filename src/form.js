'use strict';

const form = `<form action="/date" enctype="multipart/form-data" method="POST">
  <label>
    <span>Date</span>
    <input type="date" name="date"/>
  </label>
  <label>
    <span>Title</span>
    <input type="text" name="title"/>
  </label>
  <label>
    <span>Amount</span>
    <input type="number" name="amount"/>
  </label>
  <button type="submit">Submit</button>
</form>`;

module.exports = { form };

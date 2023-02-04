'use strict';

const form = `
  <div
    style="
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem"
    >
    <form
      action="http://localhost:3000/upload"
      method="POST"
      style="
        display: flex;
        flex-direction: column;
        gap: 1rem;
        font-family: sans-serif;
      "
    >
      <label>
        Date:
        <input type="date" name="date" id="date" required>
      </label>

      <label>
        Title:
        <input type="text" name="title" required/>
      </label>

      <label>
        Amount:
        <input type="number" name="amount" required>
      </label>

      <button type="submit">Submit form</button>
    </form>
  </div>
  `;

module.exports = { form };

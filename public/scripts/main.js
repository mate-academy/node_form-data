
import { enableAddCategory } from './modules/addCategory.js';
import { addExpense } from './modules/addExpense.js';
import { setCategories } from './modules/setCategories.js';
import { setExpenses } from './modules/setExpenses.js';

const form = document.getElementById('expense-form');

setExpenses();
setCategories();
enableAddCategory();

let nowUpdating = false;

/* eslint-disable-next-line */
form.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (nowUpdating) {
    return;
  }

  nowUpdating = true;
  await addExpense();
  nowUpdating = false;
});

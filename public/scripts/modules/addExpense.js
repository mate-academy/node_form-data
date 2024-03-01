import { request } from '../helpers/request.js';
import { setExpenses } from './setExpenses.js';

export async function addExpense() {
  const titleElement = document.getElementById('title');
  const amountElement = document.getElementById('amount');
  const categoryElement = document.getElementById('category');
  const dateElement = document.getElementById('date');

  const expense = {
    title: titleElement.value,
    amount: Number(amountElement.value),
    category: categoryElement.value,
    date: dateElement.value,
  };

  try {
    const response = await request.post('add-expense', expense);

    if (response === 'OK') {
      titleElement.value = '';
      amountElement.value = '';
      dateElement.value = '';
      categoryElement.value = 'food';
    }

    await setExpenses();
  } catch (err) {
    if (err.code === 400) {
      alert(err.message);
    } else {
      alert('Some error, please try again later');
    }
  }
}

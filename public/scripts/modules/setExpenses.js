import { request } from '../helpers/request.js';

const expenseList = document.getElementById('expense-list');

export async function setExpenses() {
  try {
    const expenses = await request.get('get-expenses');

    if (expenseList.firstChild) {
      expenseList.removeChild(expenseList.firstChild);
    }

    expenses.toReversed().forEach(expense => {
      const tr = document.createElement('tr');
      const tdTitle = document.createElement('th');
      const tdAmount = document.createElement('th');
      const tdCategory = document.createElement('th');
      const tdDate = document.createElement('th');

      tdTitle.textContent = expense.title;
      tdAmount.textContent = `$${expense.amount}`;
      tdCategory.textContent = expense.category;
      tdDate.textContent = expense.date;
      tr.appendChild(tdTitle);
      tr.appendChild(tdAmount);
      tr.appendChild(tdCategory);
      tr.appendChild(tdDate);
      expenseList.appendChild(tr);
    });
  } catch (err) {
    alert(`Some error, please try again later`);
  }
}

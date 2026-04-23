async function request() {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      date: '2024-01-25',
      title: 'Test Expense',
      amount: '100',
    }),
  };

  try {
    const response = await fetch('http://localhost:5701/add-expense', options);

    if (!response.ok) {
      return;
    }

    const data = await response.json(); // обробка відповіді як JSON

    return data;
  } catch (err) {
    throw new Error(`catch error request: ${err}`);
  }
}

request();

module.exports = { request };

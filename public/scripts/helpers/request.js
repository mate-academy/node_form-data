const BASE_URL = '.';

async function get(url) {
  const response = await fetch(`${BASE_URL}/${url}`);

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

async function post(url, data) {
  const response = await fetch(`${BASE_URL}/${url}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = new Error(await response.text());

    err.code = response.status;
    throw err;
  }

  const text = await response.text();

  return text;
}

export const request = {
  get,
  post,
};

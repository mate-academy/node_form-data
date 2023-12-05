'use strict';

const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    // Display the HTML form
    res.writeHead(200, { 'Content-Type': 'text/html' });

    res.end(`
            <html>
                <body>
                    <form method="post" action="/expense">
                        <label>Date:</label>
                        <input type="text" name="date" required><br>
                        <label>Title:</label>
                        <input type="text" name="title" required><br>
                        <label>Amount:</label>
                        <input type="number" name="amount" required><br>
                        <input type="submit" value="Submit">
                    </form>
                </body>
            </html>
        `);
  } else if (req.method === 'POST' && req.url === '/expense') {
    let postData = '';

    req.on('data', chunk => {
      postData += chunk;
    });

    req.on('end', () => {
      const formData = postData.toString();
      const formDataPairs = formData.split('&');
      const formDataObject = {};

      formDataPairs.forEach((pair) => {
        const [key, value] = pair.split('=');

        formDataObject[key] = value;
      });

      res.setHeader('Content-type', 'application/json');

      res.writeHead(200, { 'Content-Type': 'text/html' });

      res.end(`
                        <html>
                            <body>
                                <h1>Expense Saved</h1>
                                <pre>
                                  ${JSON.stringify(formDataObject, null, 2)}
                                </pre>
                            </body>
                        </html>
                    `);

      fs.writeFile('expenses.json', JSON.stringify(formDataObject),
        (error) => {
          if (error) {
            // eslint-disable-next-line no-console
            console.log(error);

            // eslint-disable-next-line no-useless-return
            return;
          }
        });
    });
  } else {
    // Handle other routes
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

const PORT = 3050;

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running at http://localhost:${PORT}/`);
});

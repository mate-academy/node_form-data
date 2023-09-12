'use strict';

const http = require('http');
const fs = require('fs');
const formidable = require('formidable');

const PORT = process.env.PORT || 3000;

const server = new http.Server();

server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathName = url.pathname.slice(1) || 'index.html';

  if (pathName === 'index.html') {
    res.setHeader('Content-Type', 'text/html');

    const file = fs.createReadStream(`./public/${pathName}`);

    file.on('error', () => {
      res.statusCode = 404;
      res.end();
    });

    file.pipe(res);

    res.on('close', () => {
      file.destroy();
    });

    return;
  }

  if (pathName === 'expense' && req.method.toLowerCase() === 'post') {
    const form = new formidable.IncomingForm();

    form.parse(req, (err, fields) => {
      if (err) {
        res.statusCode = 400;
        res.end();
      }

      const { date, title, amount } = fields;

      fs.writeFileSync('expense.json', JSON.stringify(fields));

      const stream = fs.createReadStream('./src/expense.json');

      stream.pipe(res);

      res.setHeader('Content-Type', 'text/html');

      stream.on('error', () => {
        res.statusCode = 500;
        res.end('Unable to read file');
      });

      res.on('close', () => {
        stream.destroy();
      });

      res.end(`
        <h1>My expense:</h1>
        <h2>Date: ${date}</h2>
        <h2>Title: ${title}</h2>
        <h2>Amount: ${amount}</h2>
      `);
    });

    return;
  }

  res.statusCode = 404;
  res.end('File does not exist');
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on http://localhost:${PORT}`);
});

// 'use strict';

// /* eslint-disable no-console */
// const http = require('http');
// const fs = require('fs');
// const { createGzip } = require('zlib');
// const formidable = require('formidable');
// const path = require('path');

// const PORT = process.env.PORT || 3000;

// const server = http.Server();

// server.on('request', (req, res) => {
//   const url = new URL(req.url, `http://${req.headers.host}`);
//   const pathName = url.pathname;

//   if (
//     (pathname === '/' || pathname === '/index.html')
//     && req.method.toLowerCase() === 'get'
//   ) {
//     res.writeHead(200, {
//       'Content-Type': 'text/html',
//       'Content-Encoding': 'gzip',
//     });

//     const file = path.resolve('public', 'index.html');

//     const gzip = createGzip();

//     fs.createReadStream(file).pipe(gzip).pipe(res);

//     res.on('error', (err) => {
//       console.error('An error occurred:', err);
//     });
//   } else if (req.url === '/submit' && req.method.toLowerCase() === 'post') {
//     const form = formidable({ multiples: true });

//     form.parse(req, (err, fields) => {
//       if (err) {
//         console.error('An error occurred:', err);

//         res.writeHead(500, {
//           'Content-Type': 'text/plain',
//         });

//         res.end('Server error');

//         return;
//       }

//       const { amount, title, date } = fields;

//       const expense = {
//         amount,
//         title,
//         date,
//       };

//       fs.createWriteStream('./expense.json').write(
//         JSON.stringify(expense)
//       );

//       res.writeHead(200, {
//         'Content-Type': 'application/json',
//       });

//       res.end(JSON.stringify(expense));
//     });

//     req.on('error', (err) => {
//       console.error('An error occurred:', err);
//     });
//   } else {
//     res.writeHead(404, {
//       'Content-Type': 'text/plain',
//     });

//     res.end('Not found');
//   }
// });

// server.on('error', (err) => {
//   console.error('An error occurred:', err);
// });

// server.listen(PORT, () => {
//   console.log(`Server is listening on http://localhost:${PORT}`);
// });

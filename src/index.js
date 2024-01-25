/* eslint-disable no-console */
'use strict';

const http = require('http');
const formidable = require('formidable');

const server = new http.Server();

server.on('request', (req, res) => {
  console.log(req.method);

  if (req.method === 'POST') {
    const form = new formidable.IncomingForm();
    let data;
    console.log('hi');

    form.parse(req, (err, fields) => {
      if (err) {
        console.log('hi again');
        res.statusCode = 500;
        res.end(err.message);

        return;
      }

      data = fields;
      console.log(data);

      res.write(JSON.stringify(data));
    });

    // res.write(JSON.stringify(data));

    res.end();

    //   res.on('finish', () => {
    //     res.end(`
    //     <html>
    //         <body>
    //             <h1>Expense Saved</h1>
    //             <pre>
    //               ${JSON.stringify(data)}
    //             </pre>
    //         </body>
    //     </html>
    // `);
    //   });

    // res.end();
  }
});

server.on('error', (err) => console.log(err.message));

server.listen(3000, () => {
  console.log('server run');
});

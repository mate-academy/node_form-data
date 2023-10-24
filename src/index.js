import formidable from 'formidable';
import fs from 'fs';
import http from 'http';

const server = new http.Server();

server.on('request', async(req, res) => {
  if (req.url === '/') {
    res.setHeader('Content-type', 'text/html');

    const fileStream = fs.createReadStream('src/pages/form.html');

    fileStream.on('error', () => {
      // eslint-disable-next-line
      console.log('form file not found try again');
    }).pipe(res);
  }

  if (req.url === '/upload') {
    res.setHeader('Content-type', 'text/html');

    const buff = {};
    const form = formidable({});
    const [fields] = await form.parse(req);

    for (const key in fields) {
      buff[key] = fields[key][0];
    }

    fs.writeFileSync('src/pages/result.json',
      `{<br>
              &ensp;<b>date</b>: ${fields.date},<br>
              &ensp;<b>title</b>: ${fields.title},<br>
              &ensp;<b>amount</b>: ${fields.amount},<br>
            }`);

    const fileStream = fs.createReadStream('src/pages/result.json');

    res.setHeader('Content-type', 'text/html');

    fileStream.on('error', () => {
      // eslint-disable-next-line
      console.log('form file not found try again');
    }).pipe(res);
  }
});

server.on('error', (error) => {
  // eslint-disable-next-line
  console.log('server error', error);
});

server.listen(3000, () => {
  // eslint-disable-next-line
  console.log('server running...');
});

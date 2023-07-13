const { WebSocketServer } = require('ws');
const { parse } = require('url');
const { createServer } = require('http');

const server = createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.writeHead(200);
  res.end(`<html lang="en-US"><body><h1>This is HTML</h1></body></html>`);
});
server.listen(3000, 'localhost', () => {
  console.log('simple web server started; press Ctrl+C to exit');
});

const wss = new WebSocketServer({
  noServer: true
});

wss.on('connection', ws => {
  console.log('connection opened');
  ws.on('message', msg => {
    console.log('received %s', msg);
    ws.send('got your message!');
  });
  ws.on('error', console.error);
});

server.on('upgrade', (request, socket, head) => {
  const { pathname } = parse(request.url);
  if (pathname === '/api') {
    console.log('ws upgrade');
    wss.handleUpgrade(request, socket, head, ws => {
      wss.emit('connection', ws, request);
    });
  }
  else {
    socket.destroy();
  }
});

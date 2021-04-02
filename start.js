const WebSocket = require('ws');
const https = require('https');
const fs = require('fs');

const server = https.createServer({
  cert: fs.readFileSync('cert.pem'),
  key: fs.readFileSync('key.pem')
}, function listener(req, res) {
  const msg = req.method + ' ' + req.url;
  console.log('http: ' + msg);
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write(msg);
  res.end();
});
server.on('listening', function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ? '|' + addr : ':' + addr.port;
  const address = typeof addr === 'string' ? addr : addr.address;
  console.log('Listening on ' + address + bind);
});

const wss = new WebSocket.Server({ server });
wss.on('connection', function connection(ws) {
  console.log('wss: Connection opened');
  ws.on('open', function open() {
    console.log('ws: open');
  });
  ws.on('close', function close() {
    console.log('ws: close');
  });
  ws.on('message', function incoming(message) {
    console.log('ws: ' + message);
    ws.send(message);
  });
  ws.send('connected');
});

server.listen(8080);

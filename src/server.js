const http = require('http');
const socketio = require('socket.io');
const nodeStatic = require('node-static');
// instantiates the node-static object to allow for file serving
const fileServer = new nodeStatic.Server(`${__dirname}/../client`, {
  cache: false,
  gzip: true,
});

const PORT = process.env.PORT || process.env.NODE_PORT || 3000;

const onRequest = (request, response) => {
  fileServer.serve(request, response, err => {
    if (err) {
      response.writeHead(404, { 'Content-Type': 'application.json' });
      response.write('test', {
        message: 'The page you are looking for was not found.',
        id: 'notFound',
      });
      response.end();
    }
  });
};

const app = http.createServer(onRequest).listen(PORT);
const io = socketio(app);

console.log(`Listening on localhost:${PORT}`);

const users = {};

const onJoined = sock => {
  const socket = sock;

  socket.on('join', data => {
    socket.join('room1');
    socket.name = data.user;
    users[data.user] = {width: data.width, height: data.height, x: data.x, y: data.y};
    socket.emit('sendUsers', users);
    socket.broadcast.emit('playerJoined', data);
  });
};

const onUserJump = sock => {
  const socket = sock;

  socket.on('jump')
};

const onDisconnect = sock => {
  const socket = sock;

  socket.on('disconnect', () => {
    socket.leave('room1');
    delete users[socket.name];
  });
};

io.sockets.on('connection', socket => {
  console.log('started');

  onJoined(socket);
  onDisconnect(socket);
});

console.log('Websockets server started');

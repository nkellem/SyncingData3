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
    users[data.user] = {width: data.width, height: data.height, x: data.x, y: data.y, destX: data.destX, destY: data.destY, jumping: data.jumping};
    socket.emit('sendUsers', users);
    socket.broadcast.emit('playerJoined', data);
  });
};

const onUserJump = sock => {
  const socket = sock;

  socket.on('jump')
};

const onUpdateUserServer = sock => {
  const socket = sock;

  socket.on('updateUserServer', data => {
    users[socket.name].x = data.x;
    users[socket.name].y = data.y;
    users[socket.name].destX = data.destX;
    users[socket.name].destY = data.destY;
    socket.broadcast.emit('updateUserClient', {user: socket.name, x: data.x, y: data.y, destX: data.destX, destY: data.destY});
  });
}

const onDisconnect = sock => {
  const socket = sock;

  socket.on('disconnect', () => {
    socket.leave('room1');
    socket.broadcast.emit('userLeft', socket.name);
    delete users[socket.name];
  });
};

io.sockets.on('connection', socket => {
  console.log('started');

  onJoined(socket);
  onUpdateUserServer(socket);
  onDisconnect(socket);
});

setInterval(() => {
  io.sockets.in('room1').emit('gravity', {gravity: 50});
}, 1000/30);

console.log('Websockets server started');

let canvas, ctx, user, users = {}, lastRender = 0;

const draw = () => {
  ctx.clearRect(0,0,1000,700);

  Object.keys(users).forEach(square => {
    ctx.fillStyle = 'black';

    if (square === user) {
      ctx.fillStyle = 'red';
    }

    ctx.fillRect(users[square].x, users[square].y, users[square].width, users[square].height);
  });
};

const handleCollisions = () => {
  if (users[user].x < 0) {
    users[user].x = 0;
  }

  if (users[user].x > 900) {
    users[user].x = 900;
  }

  if (users[user].y > 600) {
    users[user].y = 600;
  }
};

const handleInput = (socket) => {
  const sock = socket;
  window.addEventListener('keydown', e => {
    if (e.keyCode === 37) {
      users[user].x -= 5;
      socket.emit('updateUserServer', {x: users[user].x, y: users[user].y});
    }

    if (e.keyCode === 39) {
      users[user].x += 5;
      socket.emit('updateUserServer', {x: users[user].x, y: users[user].y});
    }
  });
};

const init = () => {
  const socket = io.connect();
  canvas = document.querySelector('#canvas');
  ctx = canvas.getContext('2d');

  user = `user${Math.floor(Math.random() * 1000)}`;

  users[user] = {
    width: 100,
    height: 100,
    x: 450,
    y: 0,
  };

  let squareData = {user, width: 100, height: 100, x: 450, y: 0};

  socket.on('connect', () => {
    socket.emit('join', squareData);
  });

  socket.on('sendUsers', data => {
    users = data;
  });

  socket.on('playerJoined', data => {
    users[data.user] = {width: data.width, height: data.height, x: data.x, y: data.y};
  });

  socket.on('updateUserClient', data => {
    users[data.user].x = data.x;
    users[data.user].y = data.y;
  });

  socket.on('userLeft', data => {
    delete users[data];
  });

  handleInput(socket);
  setInterval(() => {
    handleCollisions();
    draw();
  }, (1000/30));
}

window.onload = init;

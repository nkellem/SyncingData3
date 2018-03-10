let canvas,
    ctx,
    user,
    users = {};

const draw = () => {
  ctx.clearRect(0, 0, 1000, 700);

  Object.keys(users).forEach(square => {
    ctx.fillStyle = 'black';

    if (square === user) {
      ctx.fillStyle = 'red';
    }

    if (users[square].destX) {
      users[square].x = lerp(users[square].x, users[square].destX, 0.05);
    }

    if (users[square].destY) {
      if (users[square].y === 600 && !users[square].jumping) {
        users[square].y = 600;
      } else {
        users[square].y = lerp(users[square].y, users[square].destY, 0.05);
      }
    }
    ctx.fillRect(users[square].x, users[square].y, users[square].width, users[square].height);
  });
};

const lerp = (v0, v1, alpha) => {
  return (1 - alpha) * v0 + alpha * v1;
};

const handleCollisions = () => {
  if (users[user].destX < 1) {
    users[user].destX = 1;
  }

  if (users[user].x < 1) {
    users[user].x = 1;
  }

  if (users[user].x > 900) {
    users[user].x = 900;
  }

  if (users[user].destX > 900) {
    users[user].destX = 900;
  }

  if (users[user].y > 600) {
    users[user].y = 600;
  }
};

const handleInput = socket => {
  const sock = socket;
  window.addEventListener('keydown', e => {
    if (e.keyCode === 37) {
      users[user].destX = users[user].x - 50;
      socket.emit('updateUserServer', { x: users[user].x, y: users[user].y, destX: users[user].destX, destY: users[user].destY });
    }

    if (e.keyCode === 39) {
      users[user].destX = users[user].x + 50;
      socket.emit('updateUserServer', { x: users[user].x, y: users[user].y, destX: users[user].destX, destY: users[user].destY });
    }

    if (e.keyCode === 32) {
      users[user].jumping = true;
    }
  });
};

const userJumping = socket => {
  if (users[user].jumping) {
    users[user].destY = users[user].y - 60;
    socket.emit('updateUserServer', { x: users[user].x, y: users[user].y, destX: users[user].destX, destY: users[user].destY });

    if (users[user].y < 450) {
      users[user].jumping = false;
    }
  }
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
    destX: 450,
    destY: 0,
    jumping: false
  };

  let squareData = { user, width: 100, height: 100, x: 450, y: 0, destX: 450, destY: 0 };

  socket.on('connect', () => {
    socket.emit('join', squareData);
  });

  socket.on('sendUsers', data => {
    users = data;
  });

  socket.on('playerJoined', data => {
    users[data.user] = { width: data.width, height: data.height, x: data.x, y: data.y, destX: data.destX, destY: data.destY, jumping: data.jumping };
  });

  socket.on('updateUserClient', data => {
    if (users[data.user]) {
      users[data.user].x = data.x;
      users[data.user].y = data.y;
      users[data.user].destX = data.destX;
      users[data.user].destY = data.destY;
    }
  });

  socket.on('gravity', data => {
    if (!users[user].jumping) {
      users[user].destY = users[user].y + data.gravity;
      socket.emit('updateUserServer', { x: users[user].x, y: users[user].y, destX: users[user].destX, destY: users[user].destY });
    }
  });

  socket.on('userLeft', data => {
    delete users[data];
  });

  handleInput(socket);
  setInterval(() => {
    userJumping(socket);
    handleCollisions();
    draw();
  }, 1000 / 30);
};

window.onload = init;

let canvas,
    ctx,
    user,
    users = {},
    lastRender = 0;

const draw = () => {
  ctx.clearRect(0, 0, 1000, 700);

  Object.keys(users).forEach(square => {
    ctx.fillStyle = 'black';

    if (square === user) {
      ctx.fillStyle = 'red';
    }

    ctx.fillRect(users[square].x, users[square].y, users[square].width, users[square].height);
  });
};

const handleInput = () => {
  canvas.addEventListener('keydown', e => {
    if (e.keyCode === 37) {
      users[user].x -= 1;
      draw();
    }

    if (e.keyCode === 39) {
      users[user].x += 1;
      draw();
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
    y: 0
  };

  let squareData = { user, width: 100, height: 100, x: 450, y: 0 };

  socket.on('connect', () => {
    socket.emit('join', squareData);
  });

  socket.on('sendUsers', data => {
    users = data;
  });

  handleInput();
  draw();
};

window.onload = init;

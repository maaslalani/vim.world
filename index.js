import express from 'express';
import http from 'http';
import socket from 'socket.io';
import ot from './public/ot';

const app = express();
const server = http.createServer(app);
const io = socket(server);

const port = process.env.PORT || 3000;

app.use('/public', express.static('public'));

app.get('/', (request, response) => {
  response.sendFile(__dirname + '/public/index.html');
});

app.get('/lobby', (request, response) => {
  response.sendFile(__dirname + '/public/lobby.html');
});

let state = {}

function broadcast(room) {
  if (state[room].revision < state[room].docState.ops.length) {
    io.in(room).emit('update', state[room].docState.ops.slice(state[room].revision));
    state[room].revision = state[room].docState.ops.length;
  }
}

io.on('connection', (socket) => {
  let peer = new ot.Peer();

  socket.on('room', (room) => {
    socket.join(room);

    if (!state[room]) {
      state[room] = {
        docState: new ot.DocState(),
        revision: 0,
      }
    }

    socket.emit('update', state[room].docState.ops);
  })

  socket.on('update', ({ops, room}) => {
    for (let i = 0; i < ops.length; i++) {
      peer.merge_op(state[room].docState, ops[i]);
    }
    broadcast(room);
  });
});

server.listen(port);

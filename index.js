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

let state = new ot.DocState(); 
let revision = 0;

function broadcast() {
  if (revision < state.ops.length) {
    io.emit('update', state.ops.slice(revision));
    revision = state.ops.length;
  }
}

io.on('connection', (socket) => {
  let peer = new ot.Peer();

  socket.on('update', (ops) => {
    for (let i = 0; i < ops.length; i++) {
      peer.merge_op(state, ops[i]);
    }
    broadcast();
  });

  socket.emit('update', state.ops);
});

server.listen(port);

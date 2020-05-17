import express from 'express';
import http from 'http';
import socket from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = socket(server);

app.get('/', (request, response) => {
  response.sendFile(__dirname + '/index.html');
});

let state = {};

io.on('connection', (socket) => {
  console.log('connected');

  socket.on('room', (room) => {
    socket.join(room);
    io.in(room).emit('change', state[room] || '');
  });

  socket.on('disconnect', () => {
    console.log('disconnected');
  });

  socket.on('change', ({room, text}) => {
    state[room] = text;
    io.in(room).emit('change', text);
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});

import express from 'express';
import http from 'http';
import socket from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = socket(server);

const port = process.env.PORT || 3000;

app.use('/public', express.static('public'));

app.get('/', (request, response) => {
  response.sendFile(__dirname + '/public/index.html');
});

let state = {};

io.on('connection', (socket) => {
  socket.on('room', (room) => {
    socket.join(room);
    io.in(room).emit('change', state[room]);
  });

  socket.on('change', ({room, text}) => {
    state[room] = text;
    io.in(room).emit('change', text);
  });
});

server.listen(port);

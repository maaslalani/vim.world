const socket = io();
const room = new URLSearchParams(location.search).get('room');
document.querySelector('textarea').addEventListener('keyup', (event) => {
  socket.emit('change', { room, text: event.target.value });
});
socket.on('connect', () => {
  socket.emit('room', room);
});
socket.on('change', (text) => {
  document.querySelector('textarea').value = text;
});

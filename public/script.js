const room = new URLSearchParams(location.search).get('room');
let pri = Math.floor(Math.random() * 0x1000000);
let ser = 0;

function getid() {
  return (pri * 0x100000) + ser++;
}

function diffToOps(diff, state) {
  let start = diff[0];
  let end = diff[1];
  let newstr = diff[2];
  let result = [];
  for (let i = start; i < end; i++) {
    result.push({pri, ty: 'del', ix: state.xform_ix(i), id: getid()});
  }
  let ix = state.xform_ix(end);
  for (let i = 0; i < newstr.length; i++) {
    result.push({pri, ty: 'ins', ix: ix + i, id: getid(), ch: newstr.charAt(i)});
  }
  return result;
}

function getDiff(oldText, newText, cursor) {
  let delta = newText.length - oldText.length;
  let limit = Math.max(0, cursor - delta);
  let end = oldText.length;
  while (end > limit && oldText.charAt(end - 1) == newText.charAt(end + delta - 1)) {
    end -= 1;
  }
  let start = 0;
  let startLimit = cursor - Math.max(0, delta);
  while (start < startLimit && oldText.charAt(start) == newText.charAt(start)) {
    start += 1;
  }
  return [start, end, newText.slice(start, end + delta)];
}

let textElement = document.querySelector('textarea');
let oldText = '';
let socket = io();
let state = new DocState();
let peer = new Peer();

textElement.addEventListener('input', function(event) {
  let diff = getDiff(oldText, textElement.value, textElement.selectionEnd);
  let ops = diffToOps(diff, state);
  for (let i = 0; i < ops.length; i++) {
    state.add(ops[i]);
  }
  socket.emit('update', {room, ops});
  oldText = textElement.value;
});

socket.on('connect', function() {
  socket.emit('room', room);
});

socket.on('update', function(ops) {
  state.points = [textElement.selectionStart, textElement.selectionEnd];

  let rev = state.ops.length;

  for (let i = 0; i < ops.length; i++) {
    peer.merge_op(state, ops[i]);
  }

  if (rev < state.ops.length) {
    socket.emit('update', {room, ops: state.ops.slice(rev)});
  }

  textElement.value = state.get_str();
  oldText = textElement.value;
  textElement.selectionStart = state.points[0];
  textElement.selectionEnd = state.points[1];
});

const COLORS = {
  NORMAL: '#81A2BE',
  INSERT: '#B294BB',
  VISUAL: '#B5BD68',
}

const vim = new VIM();
const footer = document.querySelector('footer div')

vim.attach_to(textElement);
textElement.focus();

textElement.addEventListener('keyup', (event) => {
  footer.innerText = vim.m_mode;
  footer.style.backgroundColor = COLORS[vim.m_mode];
})

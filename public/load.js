const COLORS = {
  NORMAL: '#81A2BE',
  INSERT: '#B294BB',
  VISUAL: '#B5BD68',
}

const search = new URLSearchParams(location.search);
if (!search.get('room')) {
  location.href = '/lobby';
}

window.onload = function() {
  const vim = new VIM();
  const textarea = document.querySelector('textarea');
  const footer = document.querySelector('footer div')

  if (textarea !== null) {
    vim.attach_to(textarea);
    textarea.focus();
  }

  textarea.addEventListener('keyup', (event) => {
    footer.innerText = vim.m_mode;
    footer.style.backgroundColor = COLORS[vim.m_mode];
  })
}

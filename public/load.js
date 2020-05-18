window.onload = function() {
  const vim = new VIM();
  const textarea = document.querySelector('textarea');

  if (textarea !== null) {
    vim.attach_to(textarea);
    textarea.focus();
  }
}

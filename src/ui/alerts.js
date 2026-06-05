function showInlineAlert(element, message, isError = false) {
  if (!element) return;
  element.classList.remove('hidden');
  element.textContent = message;
  element.style.background = isError ? 'rgba(215, 0, 21, 0.08)' : 'rgba(19, 115, 51, 0.10)';
}

function setConnectionBadge(text, warning = false) {
  state.connectionStatusText = text;
  state.isConnectionWarning = warning;
}

function showLoginMessage(message, isError = true) {
  elements.loginAlert.classList.remove('hidden');
  elements.loginAlert.textContent = message;
  elements.loginAlert.style.background = isError ? 'rgba(215, 0, 21, 0.08)' : 'rgba(19, 115, 51, 0.10)';
  elements.loginAlert.style.borderColor = isError ? 'rgba(215, 0, 21, 0.18)' : 'rgba(19, 115, 51, 0.18)';
  elements.loginAlert.style.color = isError ? '#7f111c' : '#137333';
}

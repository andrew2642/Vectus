(function () {
  'use strict';

  let container = null;

  function createContainer() {
    if (container) return container;
    container = document.createElement('div');
    container.className = 'toast-container';
    container.setAttribute('role', 'region');
    container.setAttribute('aria-label', 'Notifications');
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
    return container;
  }

  function createIcon(type) {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    const icon = document.createElement('span');
    icon.className = 'toast-icon';
    icon.textContent = icons[type] || icons.info;
    return icon;
  }

  function showToast(message, options = {}) {
    const { type = 'info', duration = 4000, onClose } = options;
    const containerEl = createContainer();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');

    const icon = createIcon(type);
    const messageEl = document.createElement('span');
    messageEl.className = 'toast-message';
    messageEl.textContent = message;
    const closeBtn = document.createElement('button');
    closeBtn.className = 'toast-close';
    closeBtn.setAttribute('aria-label', 'Dismiss');
    closeBtn.innerHTML = '×';

    const remove = () => {
      toast.classList.add('hidden');
      toast.addEventListener('animationend', () => {
        toast.remove();
        if (onClose) onClose();
        if (containerEl.children.length === 0) {
          containerEl.remove();
          container = null;
        }
      }, { once: true });
    };

    closeBtn.addEventListener('click', remove);

    toast.append(icon, messageEl, closeBtn);
    containerEl.appendChild(toast);

    if (duration > 0) {
      setTimeout(remove, duration);
    }

    return { remove };
  }

  window.toast = {
    success: (msg, opts) => showToast(msg, { ...opts, type: 'success' }),
    error: (msg, opts) => showToast(msg, { ...opts, type: 'error' }),
    warning: (msg, opts) => showToast(msg, { ...opts, type: 'warning' }),
    info: (msg, opts) => showToast(msg, { ...opts, type: 'info' })
  };
})();
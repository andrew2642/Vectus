'use strict';

(() => {
  const STORAGE_KEY = 'vectus-theme';
  const root = document.documentElement;

  function getSavedTheme() {
    try {
      const savedTheme = localStorage.getItem(STORAGE_KEY);

      if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
        return savedTheme;
      }
    } catch (error) {
      console.warn('Theme preference could not be read.', error);
    }

    return 'dark';
  }

  function getEffectiveTheme(savedTheme) {
    if (savedTheme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return savedTheme;
  }

  function applyTheme(theme) {
    const effectiveTheme = getEffectiveTheme(theme);

    root.dataset.theme = effectiveTheme;

    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      const isLight = effectiveTheme === 'light';
      const icon = button.querySelector('.theme-icon');
      const label = button.querySelector('.theme-label');

      button.setAttribute(
        'aria-label',
        `Switch to ${isLight ? 'dark' : 'light'} mode`
      );

      button.setAttribute('aria-pressed', String(isLight));

      if (icon) {
        icon.textContent = isLight ? '☀' : '☾';
      }

      if (label) {
        label.textContent = isLight ? 'Light mode' : 'Dark mode';
      }
    });
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      console.warn('Theme preference could not be saved.', error);
    }
  }

  function initializeTheme() {
    const savedTheme = getSavedTheme();
    applyTheme(savedTheme);

    // Listen for system theme changes
    if (savedTheme === 'system') {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        applyTheme('system');
      });
    }

    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      button.addEventListener('click', () => {
        const currentTheme = root.dataset.theme;
        const savedTheme = getSavedTheme();

        // Cycle through: dark -> light -> system -> dark
        let nextTheme;
        if (savedTheme === 'dark') nextTheme = 'light';
        else if (savedTheme === 'light') nextTheme = 'system';
        else nextTheme = 'dark';

        applyTheme(nextTheme);
        saveTheme(nextTheme);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTheme);
  } else {
    initializeTheme();
  }
})();
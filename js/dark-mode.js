/**
 * Dark mode toggle with localStorage persistence.
 *
 * Uses class-based dark mode (Tailwind darkMode: 'class').
 * Stores preference in localStorage under 'kh-theme'.
 * Defaults to dark mode when no preference is set.
 *
 * Usage:
 *   import { initDarkMode } from '/js/dark-mode.js';
 *   initDarkMode();
 */

var STORAGE_KEY = 'kh-theme';

/**
 * Get the current theme from localStorage.
 * @returns {'dark' | 'light' | null}
 */
function getStoredTheme() {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
}

/**
 * Persist the theme to localStorage.
 * @param {'dark' | 'light'} theme
 */
function setStoredTheme(theme) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, theme);
}

/**
 * Apply the given theme to the document.
 * @param {'dark' | 'light'} theme
 */
function applyTheme(theme) {
  if (typeof document === 'undefined') return;
  var html = document.documentElement;
  if (theme === 'dark') {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
}

/**
 * Get the current effective theme based on the <html> class.
 * @returns {'dark' | 'light'}
 */
function getCurrentTheme() {
  if (typeof document === 'undefined') return 'dark';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

/**
 * Toggle between dark and light mode.
 * @returns {'dark' | 'light'} The new theme
 */
function toggleTheme() {
  var newTheme = getCurrentTheme() === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
  setStoredTheme(newTheme);
  updateToggleButton(newTheme);
  return newTheme;
}

/**
 * Update the toggle button's aria-pressed attribute.
 * @param {'dark' | 'light'} theme
 */
function updateToggleButton(theme) {
  if (typeof document === 'undefined') return;
  var toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  }
}

/**
 * Initialize dark mode: read localStorage, apply theme, bind toggle button.
 * @param {string} [toggleId='themeToggle'] - ID of the toggle button
 */
function initDarkMode(toggleId) {
  var stored = getStoredTheme();
  if (stored === 'light') {
    applyTheme('light');
  } else {
    applyTheme('dark');
    setStoredTheme('dark');
  }

  if (typeof document === 'undefined') return;
  var toggle = document.getElementById(toggleId || 'themeToggle');
  if (toggle) {
    toggle.addEventListener('click', toggleTheme);
    updateToggleButton(stored === 'light' ? 'light' : 'dark');
  }
}

// Export for both module and test environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    STORAGE_KEY,
    getStoredTheme,
    setStoredTheme,
    applyTheme,
    getCurrentTheme,
    toggleTheme,
    initDarkMode,
  };
}

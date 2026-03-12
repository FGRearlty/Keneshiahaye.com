/**
 * Unit tests for js/dark-mode.js
 *
 * Tests theme persistence, class toggling, and initialization.
 *
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';

const {
  STORAGE_KEY,
  getStoredTheme,
  setStoredTheme,
  applyTheme,
  getCurrentTheme,
  toggleTheme,
  initDarkMode,
} = require('../../js/dark-mode.js');

describe('STORAGE_KEY', () => {
  it('is "kh-theme"', () => {
    expect(STORAGE_KEY).toBe('kh-theme');
  });
});

describe('getStoredTheme / setStoredTheme', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns null when no theme is stored', () => {
    expect(getStoredTheme()).toBeNull();
  });

  it('stores and retrieves "dark"', () => {
    setStoredTheme('dark');
    expect(getStoredTheme()).toBe('dark');
  });

  it('stores and retrieves "light"', () => {
    setStoredTheme('light');
    expect(getStoredTheme()).toBe('light');
  });
});

describe('applyTheme', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark');
  });

  it('adds "dark" class for dark theme', () => {
    applyTheme('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('removes "dark" class for light theme', () => {
    document.documentElement.classList.add('dark');
    applyTheme('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});

describe('getCurrentTheme', () => {
  it('returns "dark" when dark class is present', () => {
    document.documentElement.classList.add('dark');
    expect(getCurrentTheme()).toBe('dark');
  });

  it('returns "light" when dark class is absent', () => {
    document.documentElement.classList.remove('dark');
    expect(getCurrentTheme()).toBe('light');
  });
});

describe('toggleTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('switches from light to dark', () => {
    const result = toggleTheme();
    expect(result).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
  });

  it('switches from dark to light', () => {
    document.documentElement.classList.add('dark');
    const result = toggleTheme();
    expect(result).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem(STORAGE_KEY)).toBe('light');
  });
});

describe('initDarkMode', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    document.body.innerHTML = '';
  });

  it('defaults to dark mode when no stored preference', () => {
    initDarkMode();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
  });

  it('applies light mode when stored preference is light', () => {
    localStorage.setItem(STORAGE_KEY, 'light');
    initDarkMode();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('applies dark mode when stored preference is dark', () => {
    localStorage.setItem(STORAGE_KEY, 'dark');
    initDarkMode();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('binds toggle button when it exists', () => {
    document.body.innerHTML = '<button id="themeToggle">Toggle</button>';
    initDarkMode();

    // Should be dark initially
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Click should toggle to light
    document.getElementById('themeToggle').click();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem(STORAGE_KEY)).toBe('light');

    // Click again should toggle back to dark
    document.getElementById('themeToggle').click();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
  });

  it('accepts a custom toggle ID', () => {
    document.body.innerHTML = '<button id="myToggle">Toggle</button>';
    initDarkMode('myToggle');

    document.getElementById('myToggle').click();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});

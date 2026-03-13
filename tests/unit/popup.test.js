/**
 * Unit tests for js/popup.js
 *
 * Tests popup visibility logic, localStorage cooldown,
 * scroll percentage calculation, and show/hide behavior.
 *
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

const {
  SEVEN_DAYS,
  shouldShowPopup,
  markPopupShown,
  getScrollPercent,
  showOverlay,
  hideOverlay,
  initPopup,
} = require('../../js/popup.js');

describe('SEVEN_DAYS constant', () => {
  it('equals 604800000 ms (7 days)', () => {
    expect(SEVEN_DAYS).toBe(7 * 24 * 60 * 60 * 1000);
  });
});

describe('shouldShowPopup', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns true when no previous display recorded', () => {
    expect(shouldShowPopup('test_popup', SEVEN_DAYS)).toBe(true);
  });

  it('returns false within cooldown period', () => {
    localStorage.setItem('test_popup', Date.now().toString());
    expect(shouldShowPopup('test_popup', SEVEN_DAYS)).toBe(false);
  });

  it('returns true after cooldown has elapsed', () => {
    const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
    localStorage.setItem('test_popup', eightDaysAgo.toString());
    expect(shouldShowPopup('test_popup', SEVEN_DAYS)).toBe(true);
  });

  it('returns true at exactly the cooldown boundary', () => {
    const exactlySevenDaysAgo = Date.now() - SEVEN_DAYS;
    localStorage.setItem('test_popup', exactlySevenDaysAgo.toString());
    expect(shouldShowPopup('test_popup', SEVEN_DAYS)).toBe(true);
  });

  it('uses independent keys per popup', () => {
    localStorage.setItem('popup_a', Date.now().toString());
    expect(shouldShowPopup('popup_a', SEVEN_DAYS)).toBe(false);
    expect(shouldShowPopup('popup_b', SEVEN_DAYS)).toBe(true);
  });
});

describe('markPopupShown', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stores current timestamp', () => {
    const before = Date.now();
    markPopupShown('test_popup');
    const stored = parseInt(localStorage.getItem('test_popup'), 10);
    const after = Date.now();
    expect(stored).toBeGreaterThanOrEqual(before);
    expect(stored).toBeLessThanOrEqual(after);
  });

  it('prevents shouldShowPopup from returning true', () => {
    markPopupShown('test_popup');
    expect(shouldShowPopup('test_popup', SEVEN_DAYS)).toBe(false);
  });
});

describe('showOverlay / hideOverlay', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="overlay" style="display: none;"></div>';
  });

  it('showOverlay sets display to flex', () => {
    const overlay = document.getElementById('overlay');
    showOverlay(overlay);
    expect(overlay.style.display).toBe('flex');
  });

  it('hideOverlay sets display to none', () => {
    const overlay = document.getElementById('overlay');
    overlay.style.display = 'flex';
    hideOverlay(overlay);
    expect(overlay.style.display).toBe('none');
  });

  it('showOverlay handles null gracefully', () => {
    expect(() => showOverlay(null)).not.toThrow();
  });

  it('hideOverlay handles null gracefully', () => {
    expect(() => hideOverlay(null)).not.toThrow();
  });
});

describe('getScrollPercent', () => {
  it('returns 0 when page is not scrolled', () => {
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });
    expect(getScrollPercent()).toBe(0);
  });

  it('returns 1 when scrolled to the bottom', () => {
    Object.defineProperty(window, 'scrollY', { value: 1200, writable: true });
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });
    expect(getScrollPercent()).toBe(1);
  });

  it('returns 0.5 when scrolled halfway', () => {
    Object.defineProperty(window, 'scrollY', { value: 600, writable: true });
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });
    expect(getScrollPercent()).toBe(0.5);
  });

  it('returns 0 when document height equals window height (no scroll possible)', () => {
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 800, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });
    expect(getScrollPercent()).toBe(0);
  });
});

describe('initPopup', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    document.body.innerHTML = `
      <div id="testOverlay" style="display: none;"></div>
      <button id="testClose"></button>
    `;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows overlay after timer delay', () => {
    initPopup({
      overlayId: 'testOverlay',
      closeBtnId: 'testClose',
      storageKey: 'test_init_popup',
      delayMs: 5000,
      cooldownMs: 0,
    });

    const overlay = document.getElementById('testOverlay');
    expect(overlay.style.display).toBe('none');

    vi.advanceTimersByTime(5000);
    expect(overlay.style.display).toBe('flex');
  });

  it('does not show if cooldown has not elapsed', () => {
    localStorage.setItem('test_init_popup_cd', Date.now().toString());

    initPopup({
      overlayId: 'testOverlay',
      closeBtnId: 'testClose',
      storageKey: 'test_init_popup_cd',
      delayMs: 1000,
      cooldownMs: SEVEN_DAYS,
    });

    vi.advanceTimersByTime(2000);
    const overlay = document.getElementById('testOverlay');
    expect(overlay.style.display).toBe('none');
  });

  it('close button hides overlay and records shown timestamp', () => {
    initPopup({
      overlayId: 'testOverlay',
      closeBtnId: 'testClose',
      storageKey: 'test_init_close',
      delayMs: 1000,
      cooldownMs: 0,
    });

    vi.advanceTimersByTime(1000);
    const overlay = document.getElementById('testOverlay');
    expect(overlay.style.display).toBe('flex');

    document.getElementById('testClose').click();
    expect(overlay.style.display).toBe('none');
    expect(localStorage.getItem('test_init_close')).toBeTruthy();
  });

  it('clicking overlay background closes it', () => {
    initPopup({
      overlayId: 'testOverlay',
      closeBtnId: 'testClose',
      storageKey: 'test_init_bg',
      delayMs: 1000,
      cooldownMs: 0,
    });

    vi.advanceTimersByTime(1000);
    const overlay = document.getElementById('testOverlay');
    expect(overlay.style.display).toBe('flex');

    // Simulate click on overlay itself (not a child)
    overlay.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(overlay.style.display).toBe('none');
  });

  it('Escape key closes the overlay', () => {
    initPopup({
      overlayId: 'testOverlay',
      closeBtnId: 'testClose',
      storageKey: 'test_init_esc',
      delayMs: 1000,
      cooldownMs: 0,
    });

    vi.advanceTimersByTime(1000);
    const overlay = document.getElementById('testOverlay');
    expect(overlay.style.display).toBe('flex');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(overlay.style.display).toBe('none');
  });

  it('does not show twice (shown flag prevents double-show)', () => {
    initPopup({
      overlayId: 'testOverlay',
      closeBtnId: 'testClose',
      storageKey: 'test_init_double',
      delayMs: 1000,
      cooldownMs: 0,
    });

    vi.advanceTimersByTime(1000);
    const overlay = document.getElementById('testOverlay');
    expect(overlay.style.display).toBe('flex');

    // Close it
    document.getElementById('testClose').click();
    expect(overlay.style.display).toBe('none');

    // Advance timer again — should not reappear
    vi.advanceTimersByTime(5000);
    expect(overlay.style.display).toBe('none');
  });

  it('returns early if overlay element does not exist', () => {
    expect(() => {
      initPopup({
        overlayId: 'nonexistent',
        closeBtnId: 'testClose',
        storageKey: 'test_init_nooverlay',
        delayMs: 1000,
        cooldownMs: 0,
      });
    }).not.toThrow();
  });

  it('works without a close button', () => {
    document.body.innerHTML = '<div id="testOverlay" style="display: none;"></div>';

    initPopup({
      overlayId: 'testOverlay',
      closeBtnId: 'nonexistentBtn',
      storageKey: 'test_init_nobtn',
      delayMs: 1000,
      cooldownMs: 0,
    });

    vi.advanceTimersByTime(1000);
    const overlay = document.getElementById('testOverlay');
    expect(overlay.style.display).toBe('flex');
  });
});

/**
 * Unit tests for js/popup.js
 *
 * Tests popup visibility logic, localStorage cooldown,
 * scroll percentage calculation, and show/hide behavior.
 *
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';

const {
  SEVEN_DAYS,
  shouldShowPopup,
  markPopupShown,
  showOverlay,
  hideOverlay,
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

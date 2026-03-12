/**
 * Popup/modal controller with scroll and timer triggers.
 *
 * Shows a lead-capture popup after a delay or when the user scrolls
 * past a threshold. Uses localStorage to suppress repeat displays
 * for a configurable cooldown period.
 *
 * Usage:
 *   import { initPopup } from '/js/popup.js';
 *   initPopup({
 *     overlayId: 'guidePopupOverlay',
 *     closeBtnId: 'closePopup',
 *     storageKey: 'kh_popup_shown',
 *     delayMs: 15000,
 *     scrollPercent: 0.5,
 *     cooldownMs: 7 * 24 * 60 * 60 * 1000,
 *   });
 */

var SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

/**
 * Check if the popup should be shown based on localStorage cooldown.
 * @param {string} storageKey
 * @param {number} cooldownMs
 * @returns {boolean}
 */
function shouldShowPopup(storageKey, cooldownMs) {
  if (typeof localStorage === 'undefined') return true;
  var lastShown = localStorage.getItem(storageKey);
  if (!lastShown) return true;
  var elapsed = Date.now() - parseInt(lastShown, 10);
  return elapsed >= cooldownMs;
}

/**
 * Record that the popup was shown.
 * @param {string} storageKey
 */
function markPopupShown(storageKey) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(storageKey, Date.now().toString());
}

/**
 * Calculate scroll percentage (0..1).
 * @returns {number}
 */
function getScrollPercent() {
  if (typeof window === 'undefined') return 0;
  var scrollTop = window.scrollY || document.documentElement.scrollTop;
  var docHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (docHeight <= 0) return 0;
  return scrollTop / docHeight;
}

/**
 * Show the popup overlay element.
 * @param {HTMLElement} overlay
 */
function showOverlay(overlay) {
  if (!overlay) return;
  overlay.style.display = 'flex';
}

/**
 * Hide the popup overlay element.
 * @param {HTMLElement} overlay
 */
function hideOverlay(overlay) {
  if (!overlay) return;
  overlay.style.display = 'none';
}

/**
 * Initialize popup with timer and scroll triggers.
 * @param {object} options
 * @param {string} options.overlayId - ID of the overlay element
 * @param {string} options.closeBtnId - ID of the close button
 * @param {string} [options.storageKey='kh_popup_shown'] - localStorage key
 * @param {number} [options.delayMs=15000] - Timer delay in ms
 * @param {number} [options.scrollPercent=0.5] - Scroll threshold (0..1)
 * @param {number} [options.cooldownMs=SEVEN_DAYS] - Cooldown between displays
 */
function initPopup(options) {
  var storageKey = options.storageKey || 'kh_popup_shown';
  var delayMs = options.delayMs || 15000;
  var scrollThreshold = options.scrollPercent || 0.5;
  var cooldownMs =
    options.cooldownMs !== undefined ? options.cooldownMs : SEVEN_DAYS;

  if (!shouldShowPopup(storageKey, cooldownMs)) return;

  if (typeof document === 'undefined') return;

  var overlay = document.getElementById(options.overlayId);
  var closeBtn = document.getElementById(options.closeBtnId);
  if (!overlay) return;

  var shown = false;

  function show() {
    if (shown) return;
    shown = true;
    showOverlay(overlay);
  }

  function close() {
    hideOverlay(overlay);
    markPopupShown(storageKey);
  }

  // Timer trigger
  var timer = setTimeout(show, delayMs);

  // Scroll trigger
  function onScroll() {
    if (getScrollPercent() >= scrollThreshold) {
      show();
      window.removeEventListener('scroll', onScroll);
      clearTimeout(timer);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // Close handlers
  if (closeBtn) {
    closeBtn.addEventListener('click', close);
  }
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) close();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.style.display === 'flex') close();
  });
}

// Export for both module and test environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SEVEN_DAYS,
    shouldShowPopup,
    markPopupShown,
    getScrollPercent,
    showOverlay,
    hideOverlay,
    initPopup,
  };
}

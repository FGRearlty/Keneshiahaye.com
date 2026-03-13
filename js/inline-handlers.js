/**
 * Event delegation for interactive elements.
 *
 * Replaces all inline onclick/onsubmit handlers with properly
 * attached event listeners for CSP compliance and accessibility.
 */

(function () {
  'use strict';

  /**
   * Search chip buttons — set search input value and submit form.
   * Selector: [data-search-chip]
   */
  document.addEventListener('click', function (e) {
    var chip = e.target.closest('[data-search-chip]');
    if (!chip) return;
    var form = document.getElementById('heroSearchForm');
    var input = document.getElementById('heroSearchInput');
    if (form && input) {
      input.value = chip.dataset.q;
      form.submit();
    }
  });

  /**
   * FAQ accordion buttons — toggle open/close state.
   * Selector: [data-faq-toggle]
   */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-faq-toggle]');
    if (!btn) return;
    var item = btn.parentElement;
    if (item) {
      item.classList.toggle('faq-open');
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    }
  });

  /**
   * Newsletter forms — validate and submit via form-handler.
   * Selector: form[data-newsletter]
   */
  document.addEventListener('submit', function (e) {
    var form = e.target.closest('form[data-newsletter]');
    if (!form) return;
    e.preventDefault();
    var emailInput = form.querySelector('input[type="email"]');
    var btn = form.querySelector('button[type="submit"]');
    if (!emailInput || !emailInput.value) return;

    if (typeof submitForm === 'function') {
      submitForm(form, {
        formSource: form.dataset.formSource || 'footer-newsletter',
        successEl: form.parentElement
          ? form.parentElement.querySelector('[data-success]')
          : null,
        submitBtn: btn,
        submitLabel: btn ? btn.textContent : '',
        loadingLabel: 'Sending…',
      });
    }
  });

  /**
   * Generic form submit handlers — for forms with data-form-source.
   * Selector: form[data-form-source]:not([data-newsletter])
   */
  document.addEventListener('submit', function (e) {
    var form = e.target.closest(
      'form[data-form-source]:not([data-newsletter])',
    );
    if (!form) return;
    e.preventDefault();
    var btn = form.querySelector('button[type="submit"]');

    if (typeof submitForm === 'function') {
      submitForm(form, {
        formSource: form.dataset.formSource,
        successEl: form.parentElement
          ? form.parentElement.querySelector('[data-success]')
          : null,
        submitBtn: btn,
        submitLabel: btn ? btn.textContent : '',
        loadingLabel: 'Sending…',
      });
    }
  });
})();

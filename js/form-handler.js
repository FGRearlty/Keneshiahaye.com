/**
 * Shared form submission handler.
 *
 * Collects all named inputs from a form, adds a formSource field,
 * POSTs JSON to the GHL Cloudflare Worker, and manages success/error UI.
 *
 * Usage (inline in HTML):
 *   import { submitForm } from '/js/form-handler.js';
 *   form.addEventListener('submit', (e) => {
 *     e.preventDefault();
 *     submitForm(form, { formSource: 'contact-page' });
 *   });
 */

var DEFAULT_ENDPOINT =
  'https://keneshia-haye-form-handler.jutsuxx.workers.dev';

/**
 * Collect all named input/select/textarea values from a form element.
 * @param {HTMLFormElement} form
 * @returns {Record<string, string>}
 */
function collectFormData(form) {
  var formData = {};
  var inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach(function (input) {
    if (input.name) formData[input.name] = input.value;
  });
  return formData;
}

/**
 * Validate that a phone string has at least 10 digit characters.
 * Matches the HTML5 pattern: [0-9 ()+-.]{10,}
 * @param {string} phone
 * @returns {boolean}
 */
function validatePhone(phone) {
  if (!phone) return false;
  var digits = phone.replace(/[^0-9]/g, '');
  return digits.length >= 10;
}

/**
 * Validate an email address format.
 * @param {string} email
 * @returns {boolean}
 */
function validateEmail(email) {
  if (!email) return false;
  var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Create or show an error div inside a container element.
 * Uses textContent for plain messages or builds safe DOM nodes
 * for the default error (avoids innerHTML to prevent XSS).
 * @param {HTMLElement} container
 * @param {string} message - Plain text error message
 * @returns {HTMLElement}
 */
function showFormError(container, message) {
  var errDiv = container.querySelector('#formError');
  if (!errDiv) {
    errDiv = document.createElement('div');
    errDiv.id = 'formError';
    errDiv.setAttribute('role', 'alert');
    errDiv.setAttribute('aria-live', 'polite');
    errDiv.className =
      'mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-300';
    container.appendChild(errDiv);
  }
  errDiv.textContent = '';
  if (message === DEFAULT_ERROR_MESSAGE) {
    errDiv.appendChild(document.createTextNode('Something went wrong. Please try again or call '));
    var link = document.createElement('a');
    link.href = 'tel:+12544495299';
    link.className = 'underline font-semibold';
    link.textContent = '(254) 449-5299';
    errDiv.appendChild(link);
    errDiv.appendChild(document.createTextNode('.'));
  } else {
    errDiv.textContent = message;
  }
  errDiv.classList.remove('hidden');
  return errDiv;
}

/**
 * Default error message sentinel — used to trigger the safe DOM-built
 * phone fallback in showFormError. Not rendered directly.
 */
var DEFAULT_ERROR_MESSAGE = '__DEFAULT_ERROR__';

var DEFAULT_ERROR_HTML = DEFAULT_ERROR_MESSAGE;

/**
 * Submit form data to the GHL Cloudflare Worker.
 *
 * @param {HTMLFormElement} form - The form element
 * @param {object} options
 * @param {string} options.formSource - The form source identifier
 * @param {string} [options.endpoint] - Override the worker URL
 * @param {HTMLElement} [options.successEl] - Element to show on success
 * @param {HTMLElement} [options.submitBtn] - Button to disable during submission
 * @param {string} [options.submitLabel] - Original button text to restore on error
 * @param {string} [options.loadingLabel] - Button text during submission
 * @param {Record<string, string>} [options.extraData] - Additional fields to include
 * @returns {Promise<object>} The parsed JSON response
 */
function submitForm(form, options) {
  var endpoint =
    (typeof window !== 'undefined' && window.GHL_FORM_ENDPOINT) ||
    options.endpoint ||
    DEFAULT_ENDPOINT;
  var formData = collectFormData(form);
  formData.formSource = options.formSource;

  // Enforce phone validation if a phone field exists and has a value
  if (formData.phone && !validatePhone(formData.phone)) {
    showFormError(
      form,
      'Please enter a valid phone number with at least 10 digits.',
    );
    return Promise.reject(new Error('Invalid phone number'));
  }

  // Enforce email validation if an email field exists and has a value
  if (formData.email && !validateEmail(formData.email)) {
    showFormError(form, 'Please enter a valid email address.');
    return Promise.reject(new Error('Invalid email'));
  }

  if (options.extraData) {
    Object.keys(options.extraData).forEach(function (key) {
      formData[key] = options.extraData[key];
    });
  }

  // Disable submit button
  if (options.submitBtn) {
    options.submitBtn.disabled = true;
    if (options.loadingLabel) {
      options.submitBtn.textContent = options.loadingLabel;
    }
  }

  return fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  })
    .then(function (response) {
      if (!response.ok) throw new Error('Server error: ' + response.status);
      return response.json();
    })
    .then(function (data) {
      // Show success state
      if (options.successEl) {
        form.style.display = 'none';
        options.successEl.classList.remove('hidden');
        if (options.successEl.scrollIntoView) {
          options.successEl.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }
      }
      return data;
    })
    .catch(function (err) {
      // Restore button
      if (options.submitBtn) {
        options.submitBtn.disabled = false;
        if (options.submitLabel) {
          options.submitBtn.textContent = options.submitLabel;
        }
      }
      showFormError(form, DEFAULT_ERROR_HTML);
      throw err;
    });
}

// Export for both module and test environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    collectFormData,
    validatePhone,
    validateEmail,
    showFormError,
    submitForm,
    DEFAULT_ENDPOINT,
    DEFAULT_ERROR_HTML,
  };
}

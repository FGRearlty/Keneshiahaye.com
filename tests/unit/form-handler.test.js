/**
 * Unit tests for js/form-handler.js
 *
 * Tests form data collection, phone validation, error display,
 * and the submitForm function with mocked fetch.
 *
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Use require since the module uses CommonJS exports
const {
  collectFormData,
  validatePhone,
  showFormError,
  submitForm,
  DEFAULT_ENDPOINT,
  DEFAULT_ERROR_HTML,
} = require('../../js/form-handler.js');

describe('collectFormData', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('collects all named input values', () => {
    document.body.innerHTML = `
      <form id="testForm">
        <input name="name" value="Jane Doe">
        <input name="email" value="jane@test.com">
        <input name="phone" value="9045551234">
      </form>
    `;
    const form = document.getElementById('testForm');
    const data = collectFormData(form);
    expect(data).toEqual({
      name: 'Jane Doe',
      email: 'jane@test.com',
      phone: '9045551234',
    });
  });

  it('collects select and textarea values', () => {
    document.body.innerHTML = `
      <form id="testForm">
        <select name="timeline"><option value="3-months" selected>3 months</option></select>
        <textarea name="message">Hello world</textarea>
      </form>
    `;
    const form = document.getElementById('testForm');
    const data = collectFormData(form);
    expect(data.timeline).toBe('3-months');
    expect(data.message).toBe('Hello world');
  });

  it('skips inputs without a name attribute', () => {
    document.body.innerHTML = `
      <form id="testForm">
        <input name="email" value="a@b.com">
        <input value="no-name">
      </form>
    `;
    const form = document.getElementById('testForm');
    const data = collectFormData(form);
    expect(Object.keys(data)).toEqual(['email']);
  });

  it('collects hidden inputs', () => {
    document.body.innerHTML = `
      <form id="testForm">
        <input type="hidden" name="formSource" value="contact-page">
      </form>
    `;
    const form = document.getElementById('testForm');
    const data = collectFormData(form);
    expect(data.formSource).toBe('contact-page');
  });

  it('returns empty object for form with no named inputs', () => {
    document.body.innerHTML = '<form id="testForm"></form>';
    const form = document.getElementById('testForm');
    expect(collectFormData(form)).toEqual({});
  });
});

describe('validatePhone', () => {
  it('accepts 10-digit phone number', () => {
    expect(validatePhone('9045551234')).toBe(true);
  });

  it('accepts formatted phone number', () => {
    expect(validatePhone('(904) 555-1234')).toBe(true);
  });

  it('accepts phone with country code', () => {
    expect(validatePhone('+1 904 555 1234')).toBe(true);
  });

  it('rejects phone with fewer than 10 digits', () => {
    expect(validatePhone('555-1234')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(validatePhone('')).toBe(false);
  });

  it('rejects null/undefined', () => {
    expect(validatePhone(null)).toBe(false);
    expect(validatePhone(undefined)).toBe(false);
  });

  it('accepts phone with dots as separators', () => {
    expect(validatePhone('904.555.1234')).toBe(true);
  });
});

describe('showFormError', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('creates an error div if none exists', () => {
    document.body.innerHTML = '<form id="testForm"></form>';
    const form = document.getElementById('testForm');
    const errDiv = showFormError(form, 'Test error');
    expect(errDiv.id).toBe('formError');
    expect(errDiv.innerHTML).toBe('Test error');
    expect(errDiv.getAttribute('role')).toBe('alert');
  });

  it('reuses existing error div', () => {
    document.body.innerHTML = `
      <form id="testForm">
        <div id="formError" class="hidden">Old error</div>
      </form>
    `;
    const form = document.getElementById('testForm');
    const errDiv = showFormError(form, 'New error');
    expect(errDiv.innerHTML).toBe('New error');
    expect(errDiv.classList.contains('hidden')).toBe(false);
    // Should still be only one #formError
    expect(form.querySelectorAll('#formError').length).toBe(1);
  });
});

describe('submitForm', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('POSTs JSON to the endpoint with formSource', async () => {
    document.body.innerHTML = `
      <form id="testForm">
        <input name="name" value="Jane">
        <input name="email" value="jane@test.com">
      </form>
    `;
    const form = document.getElementById('testForm');

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    await submitForm(form, {
      formSource: 'contact-page',
      endpoint: 'https://test.worker.dev',
    });

    expect(fetch).toHaveBeenCalledWith('https://test.worker.dev', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jane',
        email: 'jane@test.com',
        formSource: 'contact-page',
      }),
    });
  });

  it('includes extraData in the payload', async () => {
    document.body.innerHTML = `
      <form id="testForm">
        <input name="email" value="a@b.com">
      </form>
    `;
    const form = document.getElementById('testForm');

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    await submitForm(form, {
      formSource: 'test',
      endpoint: 'https://test.worker.dev',
      extraData: { source: 'popup' },
    });

    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body.source).toBe('popup');
    expect(body.formSource).toBe('test');
  });

  it('disables submit button during submission', async () => {
    document.body.innerHTML = `
      <form id="testForm">
        <input name="email" value="a@b.com">
        <button id="btn" type="submit">Send</button>
      </form>
    `;
    const form = document.getElementById('testForm');
    const btn = document.getElementById('btn');

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    await submitForm(form, {
      formSource: 'test',
      endpoint: 'https://test.worker.dev',
      submitBtn: btn,
      loadingLabel: 'Sending...',
    });

    // After success, button stays disabled (form is hidden)
    expect(btn.disabled).toBe(true);
  });

  it('shows success element and hides form on success', async () => {
    document.body.innerHTML = `
      <form id="testForm"><input name="email" value="a@b.com"></form>
      <div id="success" class="hidden">Thanks!</div>
    `;
    const form = document.getElementById('testForm');
    const successEl = document.getElementById('success');

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    await submitForm(form, {
      formSource: 'test',
      endpoint: 'https://test.worker.dev',
      successEl,
    });

    expect(form.style.display).toBe('none');
    expect(successEl.classList.contains('hidden')).toBe(false);
  });

  it('shows error and re-enables button on server error', async () => {
    document.body.innerHTML = `
      <form id="testForm"><input name="email" value="a@b.com">
        <button id="btn" type="submit">Send</button>
      </form>
    `;
    const form = document.getElementById('testForm');
    const btn = document.getElementById('btn');

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    await expect(
      submitForm(form, {
        formSource: 'test',
        endpoint: 'https://test.worker.dev',
        submitBtn: btn,
        submitLabel: 'Send',
      }),
    ).rejects.toThrow();

    expect(btn.disabled).toBe(false);
    expect(btn.innerHTML).toBe('Send');
    expect(form.querySelector('#formError')).toBeTruthy();
  });

  it('shows error on network failure', async () => {
    document.body.innerHTML = `
      <form id="testForm"><input name="email" value="a@b.com"></form>
    `;
    const form = document.getElementById('testForm');

    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    await expect(
      submitForm(form, {
        formSource: 'test',
        endpoint: 'https://test.worker.dev',
      }),
    ).rejects.toThrow('Network error');

    expect(form.querySelector('#formError').innerHTML).toBe(DEFAULT_ERROR_HTML);
  });

  it('uses DEFAULT_ENDPOINT when no endpoint specified', async () => {
    document.body.innerHTML = '<form id="testForm"></form>';
    const form = document.getElementById('testForm');

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    await submitForm(form, { formSource: 'test' });
    expect(fetch.mock.calls[0][0]).toBe(DEFAULT_ENDPOINT);
  });
});

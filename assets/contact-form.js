/*
 * BlixToys project enquiry form.
 * After deploying the Cloudflare Worker, replace WORKER_URL below with its URL.
 */
(() => {
  const form = document.querySelector('#project-enquiry-form');
  if (!form) return;

  const submitButton = form.querySelector('button[type="submit"]');
  const message = form.querySelector('#form-message');
  const originalButtonHTML = submitButton.innerHTML;

  function showMessage(text, type) {
    message.textContent = text;
    message.dataset.state = type;
    message.style.marginTop = '12px';
    message.style.fontWeight = '600';
    message.style.color = type === 'success' ? '#287548' : '#b42318';
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const endpoint = form.dataset.workerUrl;
    if (!endpoint || endpoint.includes('YOUR-WORKER-NAME')) {
      showMessage('The enquiry form is not configured yet. Please contact the website administrator.', 'error');
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    data.consent = form.querySelector('[name="consent"]').checked;

    submitButton.disabled = true;
    submitButton.setAttribute('aria-busy', 'true');
    submitButton.textContent = 'Sending enquiry…';
    message.textContent = '';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'We could not submit your enquiry. Please try again.');
      }

      form.reset();
      showMessage('Thank you — your enquiry has been submitted successfully. We will be in touch.', 'success');
    } catch (error) {
      showMessage(error.message || 'Network error. Please try again in a moment.', 'error');
    } finally {
      submitButton.disabled = false;
      submitButton.removeAttribute('aria-busy');
      submitButton.innerHTML = originalButtonHTML;
    }
  });
})();

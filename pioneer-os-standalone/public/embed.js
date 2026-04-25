/**
 * Branding Pioneers Form Embed Loader
 *
 * Usage:
 * <div id="bp-form-container"></div>
 * <script
 *   src="https://app.brandingpioneers.in/embed.js"
 *   data-form="rfp"
 *   data-theme="dark"
 *   data-color="indigo"
 *   data-source="homepage"
 * ></script>
 *
 * Available data attributes:
 * - data-form: Form ID (required) - rfp, client-onboarding, support, bug-report, careers
 * - data-theme: Theme (optional) - dark, light
 * - data-color: Accent color (optional) - indigo, purple, blue, emerald, orange
 * - data-source: Source tracking (optional) - any string
 * - data-whitelabel: White label mode (optional) - true
 * - data-redirect: Redirect URL after submission (optional) - full URL
 * - data-container: Container ID (optional) - defaults to "bp-form-container"
 * - data-height: Minimum height (optional) - defaults to form-specific height
 */

(function () {
  'use strict';

  // Form configurations with default heights
  var FORMS = {
    rfp: { path: '/embed/rfp', height: 700 },
    'client-onboarding': { path: '/embed/client-onboarding', height: 800 },
    support: { path: '/embed/support', height: 600 },
    'bug-report': { path: '/embed/bug-report', height: 700 },
    careers: { path: '/embed/careers', height: 800 },
  };

  // Find the current script tag
  var currentScript =
    document.currentScript ||
    (function () {
      var scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();

  // Get configuration from data attributes
  var formId = currentScript.getAttribute('data-form');
  var theme = currentScript.getAttribute('data-theme') || 'dark';
  var color = currentScript.getAttribute('data-color') || 'indigo';
  var source = currentScript.getAttribute('data-source') || 'website';
  var whiteLabel = currentScript.getAttribute('data-whitelabel') === 'true';
  var redirectUrl = currentScript.getAttribute('data-redirect') || '';
  var containerId = currentScript.getAttribute('data-container') || 'bp-form-container';
  var customHeight = currentScript.getAttribute('data-height');

  // Validate form ID
  if (!formId || !FORMS[formId]) {
    console.error('[BP Embed] Invalid or missing data-form attribute. Available forms:', Object.keys(FORMS).join(', '));
    return;
  }

  var formConfig = FORMS[formId];
  var minHeight = customHeight ? parseInt(customHeight, 10) : formConfig.height;

  // Build embed URL
  var baseUrl = currentScript.src.replace('/embed.js', '');
  var embedUrl = baseUrl + formConfig.path;

  // Add query parameters
  var params = [];
  params.push('theme=' + encodeURIComponent(theme));
  params.push('color=' + encodeURIComponent(color));
  if (source) params.push('source=' + encodeURIComponent(source));
  if (whiteLabel) params.push('whitelabel=true');
  if (redirectUrl) params.push('redirect=' + encodeURIComponent(redirectUrl));

  embedUrl += '?' + params.join('&');

  // Find or create container
  var container = document.getElementById(containerId);
  if (!container) {
    console.error('[BP Embed] Container not found: #' + containerId);
    return;
  }

  // Create iframe
  var iframe = document.createElement('iframe');
  iframe.src = embedUrl;
  iframe.style.cssText = [
    'width: 100%',
    'border: none',
    'border-radius: 16px',
    'min-height: ' + minHeight + 'px',
    'display: block',
    'background: transparent',
  ].join(';');
  iframe.setAttribute('allow', 'clipboard-write');
  iframe.setAttribute('loading', 'lazy');
  iframe.id = 'bp-embed-' + formId;

  // Append to container
  container.innerHTML = '';
  container.appendChild(iframe);

  // Handle messages from iframe
  window.addEventListener('message', function (event) {
    // Verify origin (should be same as baseUrl)
    if (!event.origin.includes(new URL(baseUrl).hostname)) {
      return;
    }

    var data = event.data;

    // Handle resize
    if (data.type === 'EMBED_RESIZE' && event.source === iframe.contentWindow) {
      iframe.style.height = data.height + 'px';
    }

    // Handle form submission
    if (data.type === 'FORM_SUBMITTED') {
      console.log('[BP Embed] Form submitted:', data);

      // Dispatch custom event for external handling
      var customEvent = new CustomEvent('bp:form:submitted', {
        detail: {
          formId: formId,
          data: data.data,
        },
      });
      document.dispatchEvent(customEvent);

      // Handle redirect if specified
      if (redirectUrl) {
        setTimeout(function () {
          window.location.href = redirectUrl;
        }, 1500); // Small delay for user to see success
      }
    }
  });

  // Expose API for programmatic control
  window.BPEmbed = window.BPEmbed || {};
  window.BPEmbed[formId] = {
    iframe: iframe,
    container: container,
    reload: function () {
      iframe.src = embedUrl;
    },
    setTheme: function (newTheme) {
      embedUrl = embedUrl.replace(/theme=[^&]+/, 'theme=' + newTheme);
      iframe.src = embedUrl;
    },
    destroy: function () {
      container.innerHTML = '';
      delete window.BPEmbed[formId];
    },
  };

  console.log('[BP Embed] Form loaded:', formId);
})();

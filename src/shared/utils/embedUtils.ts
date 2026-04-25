/**
 * Embed Utilities Library
 *
 * Utilities for generating embed codes and shareable links for all embeddable forms.
 *
 * Usage:
 * import { EMBEDDABLE_FORMS, generateIframeCode, generateShareableLink } from '@/shared/utils/embedUtils'
 */

export interface EmbedOptions {
  theme?: 'dark' | 'light'
  color?: 'indigo' | 'purple' | 'blue' | 'emerald' | 'orange'
  source?: string
  whiteLabel?: boolean
  redirectUrl?: string
  width?: string
  height?: string
  clientId?: string
  projectId?: string
}

export interface EmbeddableForm {
  id: string
  name: string
  description: string
  icon: string
  embedPath: string
  standalonePath: string | null
  category: 'lead' | 'client' | 'support' | 'hr'
  defaultHeight: number
}

/**
 * Registry of all embeddable forms
 */
export const EMBEDDABLE_FORMS: Record<string, EmbeddableForm> = {
  rfp: {
    id: 'rfp',
    name: 'RFP Form',
    description: 'Request for proposal form for leads',
    icon: '📋',
    embedPath: '/embed/rfp',
    standalonePath: '/rfp',
    category: 'lead',
    defaultHeight: 700,
  },
  clientOnboarding: {
    id: 'client-onboarding',
    name: 'Client Onboarding',
    description: 'Comprehensive client intake form',
    icon: '👤',
    embedPath: '/embed/client-onboarding',
    standalonePath: '/client-onboarding/v3',
    category: 'client',
    defaultHeight: 800,
  },
  support: {
    id: 'support',
    name: 'Support Request',
    description: 'Client support ticket submission',
    icon: '🎫',
    embedPath: '/embed/support',
    standalonePath: null,
    category: 'support',
    defaultHeight: 600,
  },
  bugReport: {
    id: 'bug-report',
    name: 'Bug Report',
    description: 'Technical bug reporting form',
    icon: '🐛',
    embedPath: '/embed/bug-report',
    standalonePath: null,
    category: 'support',
    defaultHeight: 700,
  },
  careers: {
    id: 'careers',
    name: 'Careers Application',
    description: 'Job application form',
    icon: '💼',
    embedPath: '/embed/careers',
    standalonePath: '/careers',
    category: 'hr',
    defaultHeight: 800,
  },
}

/**
 * Get the base URL for embeds
 */
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return process.env.NEXT_PUBLIC_APP_URL || 'https://app.brandingpioneers.in'
}

/**
 * Build URL with query parameters
 */
function buildUrl(path: string, params: Record<string, string | boolean | undefined>): string {
  const url = new URL(path, getBaseUrl())

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      url.searchParams.set(key, String(value))
    }
  })

  return url.toString()
}

/**
 * Generate embed URL with all options applied
 */
export function generateEmbedUrl(formKey: string, options: EmbedOptions = {}): string {
  const form = EMBEDDABLE_FORMS[formKey]
  if (!form) {
    throw new Error(`Unknown form: ${formKey}`)
  }

  const params: Record<string, string | boolean | undefined> = {
    theme: options.theme || 'dark',
    color: options.color || 'indigo',
    source: options.source,
    whitelabel: options.whiteLabel ? 'true' : undefined,
    redirect: options.redirectUrl,
    clientId: options.clientId,
    projectId: options.projectId,
  }

  return buildUrl(form.embedPath, params)
}

/**
 * Generate standalone shareable link
 */
export function generateShareableLink(
  formKey: string,
  params: Record<string, string> = {}
): string | null {
  const form = EMBEDDABLE_FORMS[formKey]
  if (!form || !form.standalonePath) {
    return null
  }

  return buildUrl(form.standalonePath, params)
}

/**
 * Generate basic iframe embed code
 */
export function generateIframeCode(formKey: string, options: EmbedOptions = {}): string {
  const form = EMBEDDABLE_FORMS[formKey]
  if (!form) {
    throw new Error(`Unknown form: ${formKey}`)
  }

  const url = generateEmbedUrl(formKey, options)
  const width = options.width || '100%'
  const height = options.height || `${form.defaultHeight}px`

  return `<iframe
  src="${url}"
  width="${width}"
  height="${height}"
  frameborder="0"
  style="border: none; border-radius: 16px;"
  allow="clipboard-write"
></iframe>`
}

/**
 * Generate responsive iframe embed code
 */
export function generateResponsiveIframeCode(formKey: string, options: EmbedOptions = {}): string {
  const url = generateEmbedUrl(formKey, options)

  return `<!-- Responsive Embed -->
<div style="position: relative; padding-bottom: 75%; height: 0; overflow: hidden; border-radius: 16px;">
  <iframe
    src="${url}"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
    allow="clipboard-write"
  ></iframe>
</div>`
}

/**
 * Generate auto-resizing script embed code
 */
export function generateScriptEmbed(formKey: string, options: EmbedOptions = {}): string {
  const form = EMBEDDABLE_FORMS[formKey]
  if (!form) {
    throw new Error(`Unknown form: ${formKey}`)
  }

  const url = generateEmbedUrl(formKey, options)
  const height = options.height || `${form.defaultHeight}`
  const redirectUrl = options.redirectUrl || ''

  return `<!-- Auto-resize Script Embed -->
<div id="bp-form-${form.id}"></div>
<script>
(function() {
  var container = document.getElementById('bp-form-${form.id}');
  var iframe = document.createElement('iframe');
  iframe.src = '${url}';
  iframe.style.cssText = 'width:100%;border:none;border-radius:16px;min-height:${height}px;';
  container.appendChild(iframe);

  window.addEventListener('message', function(e) {
    if (e.data.type === 'EMBED_RESIZE' && e.source === iframe.contentWindow) {
      iframe.style.height = e.data.height + 'px';
    }
    if (e.data.type === 'FORM_SUBMITTED') {
      ${redirectUrl ? `window.location.href = '${redirectUrl}';` : '// Handle submission'}
    }
  });
})();
</script>`
}

/**
 * Generate the external JS loader script reference
 */
export function generateJsLoaderEmbed(formKey: string, options: EmbedOptions = {}): string {
  const baseUrl = getBaseUrl()
  const form = EMBEDDABLE_FORMS[formKey]
  if (!form) {
    throw new Error(`Unknown form: ${formKey}`)
  }

  const dataAttrs = [
    `data-form="${form.id}"`,
    options.theme ? `data-theme="${options.theme}"` : '',
    options.color ? `data-color="${options.color}"` : '',
    options.source ? `data-source="${options.source}"` : '',
    options.whiteLabel ? 'data-whitelabel="true"' : '',
    options.redirectUrl ? `data-redirect="${options.redirectUrl}"` : '',
  ]
    .filter(Boolean)
    .join('\n  ')

  return `<!-- Branding Pioneers Form Embed -->
<div id="bp-form-container"></div>
<script
  src="${baseUrl}/embed.js"
  ${dataAttrs}
></script>`
}

/**
 * Get all forms by category
 */
export function getFormsByCategory(category: EmbeddableForm['category']): EmbeddableForm[] {
  return Object.values(EMBEDDABLE_FORMS).filter((form) => form.category === category)
}

/**
 * Get all available form keys
 */
export function getFormKeys(): string[] {
  return Object.keys(EMBEDDABLE_FORMS)
}

/**
 * Check if a form exists
 */
export function formExists(formKey: string): boolean {
  return formKey in EMBEDDABLE_FORMS
}

/**
 * Validate embed options
 */
export function validateEmbedOptions(options: EmbedOptions): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (options.theme && !['dark', 'light'].includes(options.theme)) {
    errors.push('Invalid theme. Must be "dark" or "light".')
  }

  if (
    options.color &&
    !['indigo', 'purple', 'blue', 'emerald', 'orange'].includes(options.color)
  ) {
    errors.push('Invalid color. Must be one of: indigo, purple, blue, emerald, orange.')
  }

  if (options.redirectUrl && !options.redirectUrl.startsWith('http')) {
    errors.push('Redirect URL must be a valid URL starting with http:// or https://.')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

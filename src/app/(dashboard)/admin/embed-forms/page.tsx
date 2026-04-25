'use client'

import { useState } from 'react'

// Comprehensive forms registry
const FORMS = [
  {
    id: 'rfp',
    name: 'RFP Form',
    description: 'Request for proposal form for leads',
    icon: '📋',
    embedPath: '/embed/rfp',
    standalonePath: '/rfp',
    category: 'lead',
  },
  {
    id: 'client-onboarding',
    name: 'Client Onboarding',
    description: 'Comprehensive client intake form',
    icon: '👤',
    embedPath: '/embed/client-onboarding',
    standalonePath: '/client-onboarding/v3',
    category: 'client',
  },
  {
    id: 'support',
    name: 'Support Request',
    description: 'Client support ticket submission',
    icon: '🎫',
    embedPath: '/embed/support',
    standalonePath: null,
    category: 'support',
  },
  {
    id: 'bug-report',
    name: 'Bug Report',
    description: 'Technical bug reporting form',
    icon: '🐛',
    embedPath: '/embed/bug-report',
    standalonePath: null,
    category: 'support',
  },
  {
    id: 'careers',
    name: 'Careers Application',
    description: 'Job application form',
    icon: '💼',
    embedPath: '/embed/careers',
    standalonePath: '/careers',
    category: 'hr',
  },
]

const THEMES = [
  { id: 'dark', label: 'Dark', icon: '🌙', preview: 'bg-slate-900' },
  { id: 'light', label: 'Light', icon: '☀️', preview: 'bg-white' },
]

const COLORS = [
  { id: 'indigo', label: 'Indigo', hex: '#6366f1' },
  { id: 'purple', label: 'Purple', hex: '#a855f7' },
  { id: 'blue', label: 'Blue', hex: '#3b82f6' },
  { id: 'emerald', label: 'Emerald', hex: '#10b981' },
  { id: 'orange', label: 'Orange', hex: '#f97316' },
]

const PREVIEW_SIZES = [
  { id: 'desktop', label: 'Desktop', width: '100%', icon: '🖥️' },
  { id: 'tablet', label: 'Tablet', width: '768px', icon: '📱' },
  { id: 'mobile', label: 'Mobile', width: '375px', icon: '📲' },
]

type EmbedType = 'iframe' | 'responsive' | 'script'

export default function EmbedFormsPage() {
  const [selectedForm, setSelectedForm] = useState(FORMS[0])
  const [theme, setTheme] = useState('dark')
  const [color, setColor] = useState('indigo')
  const [source, setSource] = useState('website')
  const [whiteLabel, setWhiteLabel] = useState(false)
  const [redirectUrl, setRedirectUrl] = useState('')
  const [width, setWidth] = useState('100%')
  const [height, setHeight] = useState('700')
  const [previewSize, setPreviewSize] = useState('desktop')
  const [embedType, setEmbedType] = useState<EmbedType>('iframe')
  const [copied, setCopied] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'generator' | 'links'>('generator')

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://app.brandingpioneers.in'

  // Build embed URL with params
  const buildEmbedUrl = () => {
    const params = new URLSearchParams()
    params.set('theme', theme)
    params.set('color', color)
    if (source) params.set('source', source)
    if (whiteLabel) params.set('whitelabel', 'true')
    if (redirectUrl) params.set('redirect', redirectUrl)
    return `${baseUrl}${selectedForm.embedPath}?${params.toString()}`
  }

  const embedUrl = buildEmbedUrl()
  const standaloneUrl = selectedForm.standalonePath ? `${baseUrl}${selectedForm.standalonePath}` : null

  // Generate different embed code types
  const generateEmbedCode = (type: EmbedType): string => {
    switch (type) {
      case 'iframe':
        return `<iframe
  src="${embedUrl}"
  width="${width}"
  height="${height}px"
  frameborder="0"
  style="border: none; border-radius: 16px;"
  allow="clipboard-write"
></iframe>`

      case 'responsive':
        return `<!-- Responsive Embed -->
<div style="position: relative; padding-bottom: 75%; height: 0; overflow: hidden; border-radius: 16px;">
  <iframe
    src="${embedUrl}"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
    allow="clipboard-write"
  ></iframe>
</div>`

      case 'script':
        return `<!-- Auto-resize Script Embed -->
<div id="bp-form-${selectedForm.id}"></div>
<script>
(function() {
  var container = document.getElementById('bp-form-${selectedForm.id}');
  var iframe = document.createElement('iframe');
  iframe.src = '${embedUrl}';
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
  }

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  const selectedPreviewSize = PREVIEW_SIZES.find(s => s.id === previewSize)

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
            <span className="text-2xl">🔗</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Embed Forms Manager</h1>
            <p className="text-slate-400">Generate embed codes and shareable links for all forms</p>
          </div>
        </div>
      </div>

      {/* Form Selection Cards */}
      <div className="mb-8">
        <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Select Form</h2>
        <div className="grid grid-cols-5 gap-3">
          {FORMS.map(form => (
            <button
              key={form.id}
              onClick={() => setSelectedForm(form)}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedForm.id === form.id
                  ? 'bg-indigo-500/10 border-indigo-500 ring-2 ring-indigo-500/20'
                  : 'bg-slate-800/50 border-white/10 hover:border-white/20'
              }`}
            >
              <span className="text-2xl block mb-2">{form.icon}</span>
              <p className="font-medium text-white text-sm">{form.name}</p>
              <p className="text-xs text-slate-400 mt-1 line-clamp-1">{form.description}</p>
              <div className="flex gap-1 mt-2">
                {form.embedPath && (
                  <span className="px-1.5 py-0.5 text-[10px] rounded bg-indigo-500/20 text-indigo-400">embed</span>
                )}
                {form.standalonePath && (
                  <span className="px-1.5 py-0.5 text-[10px] rounded bg-emerald-500/20 text-emerald-400">standalone</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('generator')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'generator'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-800/50 text-slate-400 hover:text-white'
          }`}
        >
          Embed Generator
        </button>
        <button
          onClick={() => setActiveTab('links')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'links'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-800/50 text-slate-400 hover:text-white'
          }`}
        >
          Quick Links
        </button>
      </div>

      {activeTab === 'generator' ? (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Configuration Panel */}
          <div className="space-y-4">
            {/* Theme & Color */}
            <div className="bg-slate-800/50 backdrop-blur border border-white/10 rounded-xl p-5">
              <h3 className="font-medium text-white mb-4 flex items-center gap-2">
                <span>🎨</span> Appearance
              </h3>

              {/* Theme Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">Theme</label>
                <div className="grid grid-cols-2 gap-2">
                  {THEMES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                        theme === t.id
                          ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/20'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg ${t.preview} border border-white/20`} />
                      <div className="text-left">
                        <span className="text-sm font-medium text-white">{t.label}</span>
                        <span className="text-xs text-slate-400 block">{t.icon}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Accent Color</label>
                <div className="flex gap-2">
                  {COLORS.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setColor(c.id)}
                      className={`p-2 rounded-xl border flex items-center gap-2 transition-all ${
                        color === c.id
                          ? 'border-white/30 bg-white/5 ring-2 ring-white/10'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                      title={c.label}
                    >
                      <span
                        className="w-6 h-6 rounded-full ring-2 ring-white/20"
                        style={{ backgroundColor: c.hex }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Customization */}
            <div className="bg-slate-800/50 backdrop-blur border border-white/10 rounded-xl p-5">
              <h3 className="font-medium text-white mb-4 flex items-center gap-2">
                <span>⚙️</span> Customization
              </h3>

              <div className="space-y-4">
                {/* Source */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Source Identifier</label>
                  <input
                    type="text"
                    value={source}
                    onChange={e => setSource(e.target.value)}
                    placeholder="e.g., homepage, landing-page"
                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                  <p className="text-xs text-slate-500 mt-1">Track where leads come from</p>
                </div>

                {/* White Label Toggle */}
                <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl">
                  <div>
                    <span className="text-sm font-medium text-white">White Label Mode</span>
                    <p className="text-xs text-slate-500">Hide branding from form</p>
                  </div>
                  <button
                    onClick={() => setWhiteLabel(!whiteLabel)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      whiteLabel ? 'bg-indigo-500' : 'bg-slate-600'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        whiteLabel ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Redirect URL */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Success Redirect URL</label>
                  <input
                    type="url"
                    value={redirectUrl}
                    onChange={e => setRedirectUrl(e.target.value)}
                    placeholder="https://yoursite.com/thank-you"
                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Dimensions */}
            <div className="bg-slate-800/50 backdrop-blur border border-white/10 rounded-xl p-5">
              <h3 className="font-medium text-white mb-4 flex items-center gap-2">
                <span>📐</span> Dimensions
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Width</label>
                  <input
                    type="text"
                    value={width}
                    onChange={e => setWidth(e.target.value)}
                    placeholder="100%"
                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Min Height (px)</label>
                  <input
                    type="text"
                    value={height}
                    onChange={e => setHeight(e.target.value)}
                    placeholder="700"
                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preview & Code */}
          <div className="space-y-4">
            {/* Live Preview */}
            <div className="bg-slate-800/50 backdrop-blur border border-white/10 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-white flex items-center gap-2">
                  <span>👁️</span> Live Preview
                </h3>
                <div className="flex gap-1">
                  {PREVIEW_SIZES.map(size => (
                    <button
                      key={size.id}
                      onClick={() => setPreviewSize(size.id)}
                      className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                        previewSize === size.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-700 text-slate-400 hover:text-white'
                      }`}
                      title={size.label}
                    >
                      {size.icon}
                    </button>
                  ))}
                </div>
              </div>
              <div
                className="mx-auto rounded-xl overflow-hidden border border-white/10 transition-all"
                style={{
                  width: selectedPreviewSize?.width || '100%',
                  height: `${Math.min(parseInt(height), 500)}px`,
                  backgroundColor: theme === 'dark' ? '#0B0E14' : '#f8fafc'
                }}
              >
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  style={{ border: 'none' }}
                />
              </div>
              <div className="flex justify-center mt-3">
                <a
                  href={embedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  Open in new tab
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Embed Code Tabs */}
            <div className="bg-slate-800/50 backdrop-blur border border-white/10 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-white flex items-center gap-2">
                  <span>📝</span> Embed Code
                </h3>
                <div className="flex gap-1 bg-slate-900/50 rounded-lg p-0.5">
                  {(['iframe', 'responsive', 'script'] as EmbedType[]).map(type => (
                    <button
                      key={type}
                      onClick={() => setEmbedType(type)}
                      className={`px-3 py-1 text-xs rounded-md transition-colors capitalize ${
                        embedType === type
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <pre className="bg-slate-900 text-slate-300 p-4 rounded-xl overflow-x-auto text-xs font-mono max-h-64">
                  <code>{generateEmbedCode(embedType)}</code>
                </pre>
                <button
                  onClick={() => handleCopy(generateEmbedCode(embedType), embedType)}
                  className={`absolute top-2 right-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    copied === embedType
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {copied === embedType ? '✓ Copied!' : 'Copy'}
                </button>
              </div>

              {/* Embed Type Description */}
              <div className="mt-3 p-3 bg-slate-900/50 rounded-lg">
                <p className="text-xs text-slate-400">
                  {embedType === 'iframe' && 'Basic iframe embed. Simple to implement but fixed height.'}
                  {embedType === 'responsive' && 'Responsive embed that maintains aspect ratio on all screen sizes.'}
                  {embedType === 'script' && 'Auto-resizing script that adjusts height based on form content.'}
                </p>
              </div>
            </div>

            {/* Quick Copy URLs */}
            <div className="bg-slate-800/50 backdrop-blur border border-white/10 rounded-xl p-5">
              <h3 className="font-medium text-white mb-4 flex items-center gap-2">
                <span>🔗</span> Quick Copy URLs
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={embedUrl}
                    className="flex-1 px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-sm text-slate-300 font-mono"
                  />
                  <button
                    onClick={() => handleCopy(embedUrl, 'embed-url')}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      copied === 'embed-url'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-700 text-white hover:bg-slate-600'
                    }`}
                  >
                    {copied === 'embed-url' ? '✓' : 'Copy'}
                  </button>
                </div>
                {standaloneUrl && (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={standaloneUrl}
                      className="flex-1 px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-sm text-slate-300 font-mono"
                    />
                    <button
                      onClick={() => handleCopy(standaloneUrl, 'standalone-url')}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        copied === 'standalone-url'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-slate-700 text-white hover:bg-slate-600'
                      }`}
                    >
                      {copied === 'standalone-url' ? '✓' : 'Copy'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Quick Links Tab */
        <div className="space-y-6">
          {/* All Forms Table */}
          <div className="bg-slate-800/50 backdrop-blur border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-sm font-medium text-slate-400">Form</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-400">Embed URL</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-400">Standalone URL</th>
                  <th className="text-right p-4 text-sm font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {FORMS.map(form => (
                  <tr key={form.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{form.icon}</span>
                        <div>
                          <p className="font-medium text-white">{form.name}</p>
                          <p className="text-xs text-slate-400">{form.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <code className="text-xs text-slate-400 bg-slate-900/50 px-2 py-1 rounded">
                        {form.embedPath}
                      </code>
                    </td>
                    <td className="p-4">
                      {form.standalonePath ? (
                        <code className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                          {form.standalonePath}
                        </code>
                      ) : (
                        <span className="text-xs text-slate-500">—</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleCopy(`${baseUrl}${form.embedPath}`, `embed-${form.id}`)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            copied === `embed-${form.id}`
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          {copied === `embed-${form.id}` ? '✓ Copied' : 'Copy Embed'}
                        </button>
                        {form.standalonePath && (
                          <button
                            onClick={() => handleCopy(`${baseUrl}${form.standalonePath}`, `standalone-${form.id}`)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              copied === `standalone-${form.id}`
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}
                          >
                            {copied === `standalone-${form.id}` ? '✓ Copied' : 'Copy Link'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Instructions */}
          <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-6">
            <h3 className="font-semibold text-indigo-300 mb-3 flex items-center gap-2">
              <span>💡</span> Usage Tips
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-indigo-200/80">
              <div>
                <h4 className="font-medium text-indigo-300 mb-1">Embed URLs</h4>
                <p>Use embed URLs in iframes on your website. They have minimal UI optimized for embedding.</p>
              </div>
              <div>
                <h4 className="font-medium text-indigo-300 mb-1">Standalone URLs</h4>
                <p>Share these links directly with clients/leads. Full-page forms with complete branding.</p>
              </div>
              <div>
                <h4 className="font-medium text-indigo-300 mb-1">Tracking</h4>
                <p>Add <code className="bg-indigo-500/20 px-1 rounded">?source=homepage</code> to track lead sources.</p>
              </div>
              <div>
                <h4 className="font-medium text-indigo-300 mb-1">Theming</h4>
                <p>Add <code className="bg-indigo-500/20 px-1 rounded">?theme=dark</code> or <code className="bg-indigo-500/20 px-1 rounded">?theme=light</code></p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

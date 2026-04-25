'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'

interface Document {
  id: string
  name: string
  type: string
  category: string | null
  fileUrl: string
  fileSize: number | null
  mimeType: string | null
  clientId: string | null
  client: { id: string; name: string } | null
  uploadedBy: { id: string; firstName: string; lastName: string | null }
  createdAt: string
}

interface Stats {
  totalFiles: number
  totalSize: number
  clientCount: number
  recentCount: number
}

const typeIcons: Record<string, { iconType: string; color: string }> = {
  CONTRACT: { iconType: 'document', color: 'bg-blue-500/20 text-blue-400' },
  REPORT: { iconType: 'chart', color: 'bg-green-500/20 text-green-400' },
  ASSET: { iconType: 'palette', color: 'bg-purple-500/20 text-purple-400' },
  BRAND: { iconType: 'briefcase', color: 'bg-pink-500/20 text-pink-400' },
  INVOICE: { iconType: 'currency', color: 'bg-yellow-500/20 text-yellow-400' },
  OTHER: { iconType: 'folder', color: 'bg-slate-800/50 text-slate-200' },
}

const categories = ['All', 'Branding', 'Ads Creatives', 'Reports', 'Contracts', 'Assets', 'Other']
const documentTypes = ['CONTRACT', 'REPORT', 'ASSET', 'BRAND', 'INVOICE', 'OTHER']

const renderFileIcon = (iconType: string, className: string = "w-6 h-6") => {
  switch (iconType) {
    case 'document':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
    case 'chart':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
    case 'palette':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
    case 'briefcase':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
    case 'currency':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    case 'folder':
    default:
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
  }
}

export default function FilesPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [stats, setStats] = useState<Stats>({ totalFiles: 0, totalSize: 0, clientCount: 0, recentCount: 0 })
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadForm, setUploadForm] = useState({
    name: '',
    type: 'OTHER',
    category: '',
    fileUrl: '',
  })
  useEffect(() => {
    fetchDocuments()
  }, [selectedCategory])

  async function fetchDocuments() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedCategory !== 'All') params.set('category', selectedCategory)

      const res = await fetch(`/api/documents?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch documents')

      const data = await res.json()
      setDocuments(data.documents || [])
      setStats(data.stats || { totalFiles: 0, totalSize: 0, clientCount: 0, recentCount: 0 })
    } catch (error) {
      console.error('Failed to fetch documents:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpload() {
    if (!uploadForm.name) {
      toast.error('Please provide a name')
      return
    }

    if (!selectedFile && !uploadForm.fileUrl) {
      toast.error('Please select a file or provide a URL')
      return
    }

    try {
      setUploading(true)
      let finalFileUrl = uploadForm.fileUrl

      if (selectedFile) {
        const formData = new FormData()
        formData.append('file', selectedFile)
        formData.append('folder', 'pioneer-os/documents')

        const uploadRes = await fetch('/api/upload/cloudinary', {
          method: 'POST',
          body: formData,
        })

        if (!uploadRes.ok) throw new Error('Cloudinary upload failed')
        const { url } = await uploadRes.json()
        finalFileUrl = url
      }

      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...uploadForm, fileUrl: finalFileUrl }),
      })

      if (!res.ok) throw new Error('Failed to upload document record')

      setShowUploadModal(false)
      setUploadForm({ name: '', type: 'OTHER', category: '', fileUrl: '' })
      setSelectedFile(null)
      fetchDocuments()
      toast.success('File uploaded successfully!')
    } catch (error) {
      console.error('Upload failed:', error)
      toast.error('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this file?')) return

    try {
      const res = await fetch(`/api/documents?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      fetchDocuments()
    } catch (error) {
      console.error('Delete failed:', error)
      toast.error('Delete failed. Please try again.')
    }
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">File Vault</h1>
          <p className="text-slate-400 mt-1">Secure document storage and management</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload Files
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-white">{stats.totalFiles}</p>
          <p className="text-sm text-slate-400">Total Files</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-blue-400">
            {(stats.totalSize / (1024 * 1024)).toFixed(1)} MB
          </p>
          <p className="text-sm text-slate-400">Storage Used</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-green-400">{stats.clientCount}</p>
          <p className="text-sm text-slate-400">Client Folders</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-purple-400">{stats.recentCount}</p>
          <p className="text-sm text-slate-400">Uploaded This Week</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar - Categories */}
        <div className="lg:col-span-1">
          <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <h3 className="font-semibold text-white">Categories</h3>
            </div>
            <div className="p-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${selectedCategory === category
                      ? 'bg-blue-500/10 text-blue-400'
                      : 'hover:bg-slate-900/40 text-slate-200'
                    }`}
                >
                  <span className="text-slate-300">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </span>
                  <span className="text-sm">{category}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content - File Grid */}
        <div className="lg:col-span-3">
          <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-semibold text-white">
                {selectedCategory === 'All' ? 'All Files' : selectedCategory}
              </h3>
            </div>
            <div className="p-4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-400">Loading files...</p>
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <svg className="w-12 h-12 mx-auto mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  <p>No files uploaded yet</p>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="mt-4 text-blue-400 hover:underline"
                  >
                    Upload your first file
                  </button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {documents.map((doc) => {
                    const config = typeIcons[doc.type] || typeIcons.OTHER
                    return (
                      <div
                        key={doc.id}
                        className="p-4 border border-white/10 rounded-xl hover:shadow-none transition-shadow group relative"
                      >
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <div className={`w-12 h-12 ${config.color} rounded-xl flex items-center justify-center mb-3`}>
                            {renderFileIcon(config.iconType)}
                          </div>
                          <h4 className="font-medium text-white truncate group-hover:text-blue-400">
                            {doc.name}
                          </h4>
                          <p className="text-xs text-slate-400 mt-1">
                            {doc.client?.name || 'General'}
                          </p>
                          <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
                            <span>{doc.fileSize ? `${(doc.fileSize / 1024).toFixed(0)} KB` : '-'}</span>
                            <span>
                              {new Date(doc.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </span>
                          </div>
                        </a>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Upload File</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  File Name *
                </label>
                <input
                  type="text"
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                  placeholder="e.g., Client Contract 2024"
                  className="w-full px-3 py-2 border border-white/20 rounded-lg text-white glass-card focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  Upload File or Paste URL *
                </label>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) setSelectedFile(file)
                      }}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 px-4 py-2 border border-white/20 border-dashed rounded-lg text-slate-300 hover:bg-slate-900/40 transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      {selectedFile ? selectedFile.name : 'Select File to Upload'}
                    </button>
                    {selectedFile && (
                      <button type="button" onClick={() => setSelectedFile(null)} className="p-2 text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="flex-1 h-px bg-white/10"></span>
                    <span>OR</span>
                    <span className="flex-1 h-px bg-white/10"></span>
                  </div>

                  <input
                    type="url"
                    value={uploadForm.fileUrl}
                    onChange={(e) => setUploadForm({ ...uploadForm, fileUrl: e.target.value })}
                    disabled={!!selectedFile}
                    placeholder="https://drive.google.com/..."
                    className="w-full px-3 py-2 border border-white/20 rounded-lg text-white glass-card focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Upload directly or paste an external link from Google Drive, Dropbox, etc.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">
                    Type
                  </label>
                  <select
                    value={uploadForm.type}
                    onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg text-white glass-card focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {documentTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0) + type.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">
                    Category
                  </label>
                  <select
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg text-white glass-card focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select category</option>
                    {categories.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowUploadModal(false)
                  setSelectedFile(null)
                  setUploadForm({ name: '', type: 'OTHER', category: '', fileUrl: '' })
                }}
                className="flex-1 px-4 py-2 border border-white/20 text-slate-200 rounded-lg hover:bg-slate-900/40 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || !uploadForm.name || (!uploadForm.fileUrl && !selectedFile)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

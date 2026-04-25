'use client'

import { useState, useEffect } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { DOCUMENT_CATEGORIES } from '@/shared/constants/portal'
import PageGuide from '@/client/components/ui/PageGuide'
import PortalPageSkeleton from '@/client/components/portal/PortalPageSkeleton'

interface Document {
  id: string
  name: string
  description: string | null
  category: string
  fileUrl: string
  fileType: string
  fileSize: number
  isPublic: boolean
  allowDownload: boolean
  expiresAt: string | null
  createdAt: string
  uploadedBy: { name: string } | null
}

export default function PortalDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<string>('all')
  const [viewDocument, setViewDocument] = useState<Document | null>(null)

  useEffect(() => {
    fetchDocuments()
  }, [category])

  const fetchDocuments = async () => {
    try {
      const url = category === 'all' ? '/api/client-portal/documents' : `/api/client-portal/documents?category=${category}`
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setDocuments(data.documents)
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return (
        <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zm-3 9v6H8v-6h2zm4 0v6h-2v-6h2zm4 0v6h-2v-6h2z"/>
        </svg>
      )
    }
    if (fileType.includes('image') || ['png', 'jpg', 'jpeg', 'gif', 'webp'].some(t => fileType.includes(t))) {
      return (
        <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    }
    if (fileType.includes('video')) {
      return (
        <svg className="w-8 h-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )
    }
    if (['doc', 'docx', 'word'].some(t => fileType.includes(t))) {
      return (
        <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM7 17v-6h2l1.5 4 1.5-4h2v6h-1.5v-4l-1.5 3.5h-1L8.5 13v4H7z"/>
        </svg>
      )
    }
    if (['xls', 'xlsx', 'excel', 'csv'].some(t => fileType.includes(t))) {
      return (
        <svg className="w-8 h-8 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM7 17v-6h1.5l1 2.5 1-2.5H12v6h-1.5v-3.5l-1 2.5h-1l-1-2.5V17H7z"/>
        </svg>
      )
    }
    return (
      <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    )
  }

  const categories = ['all', ...Object.keys(DOCUMENT_CATEGORIES)]

  if (loading) {
    return <PortalPageSkeleton titleWidth="w-36" statCards={0} listItems={5} />
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageGuide
        pageKey="portal-documents"
        title="Shared Documents"
        description="Access all documents shared between you and our team"
        steps={[
          { label: 'Browse by category', description: 'Use the filter tabs to find documents by type such as contracts, reports, or brand assets' },
          { label: 'Download files', description: 'Click the download icon on any document to save it locally' },
          { label: 'Request new documents', description: 'Contact your account manager if you need additional documents shared here' },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Documents</h1>
          <p className="text-slate-300">Access shared files and resources from your team</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              category === cat
                ? 'bg-blue-600 text-white'
                : 'glass-card text-slate-300 border border-white/10 hover:bg-slate-900/40'
            }`}
          >
            {cat === 'all' ? 'All Documents' : DOCUMENT_CATEGORIES[cat]}
          </button>
        ))}
      </div>

      {/* Documents Grid */}
      {documents.length === 0 ? (
        <div className="glass-card rounded-xl border border-white/10 p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-medium text-white mb-2">No documents yet</h3>
          <p className="text-slate-400">Documents shared with you will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="glass-card rounded-xl border border-white/10 p-4 hover:shadow-none transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {getFileIcon(doc.fileType)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white truncate">{doc.name}</h3>
                  <p className="text-sm text-slate-400 truncate">{DOCUMENT_CATEGORIES[doc.category]}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {formatFileSize(doc.fileSize)} • {doc.fileType.toUpperCase()}
                  </p>
                </div>
              </div>

              {doc.description && (
                <p className="text-sm text-slate-300 mt-3 line-clamp-2">{doc.description}</p>
              )}

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                <span className="text-xs text-slate-400">
                  {formatDateDDMMYYYY(doc.createdAt)}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewDocument(doc)}
                    className="p-2 text-slate-300 hover:bg-slate-800/50 rounded-lg transition-colors"
                    title="View details"
                    aria-label="View details"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  {doc.allowDownload && (
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                      title="Download"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>

              {doc.expiresAt && new Date(doc.expiresAt) < new Date() && (
                <div className="mt-2 px-2 py-1 bg-red-500/10 border border-red-100 rounded text-xs text-red-400">
                  This document has expired
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* View Document Modal */}
      {viewDocument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                {getFileIcon(viewDocument.fileType)}
                <div>
                  <h2 className="text-lg font-semibold text-white">{viewDocument.name}</h2>
                  <p className="text-sm text-slate-400">{DOCUMENT_CATEGORIES[viewDocument.category]}</p>
                </div>
              </div>
              <button
                onClick={() => setViewDocument(null)}
                aria-label="Close"
                className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {viewDocument.description && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-slate-200 mb-1">Description</h3>
                <p className="text-sm text-slate-300">{viewDocument.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <span className="text-slate-400">File Size:</span>
                <span className="ml-2 text-white">{formatFileSize(viewDocument.fileSize)}</span>
              </div>
              <div>
                <span className="text-slate-400">Type:</span>
                <span className="ml-2 text-white">{viewDocument.fileType.toUpperCase()}</span>
              </div>
              <div>
                <span className="text-slate-400">Uploaded:</span>
                <span className="ml-2 text-white">{formatDateDDMMYYYY(viewDocument.createdAt)}</span>
              </div>
              {viewDocument.uploadedBy && (
                <div>
                  <span className="text-slate-400">By:</span>
                  <span className="ml-2 text-white">{viewDocument.uploadedBy.name}</span>
                </div>
              )}
              {viewDocument.expiresAt && (
                <div className="col-span-2">
                  <span className="text-slate-400">Expires:</span>
                  <span className="ml-2 text-white">{formatDateDDMMYYYY(viewDocument.expiresAt)}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              {viewDocument.allowDownload && (
                <a
                  href={viewDocument.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </a>
              )}
              <button
                onClick={() => setViewDocument(null)}
                className="px-4 py-2 border border-white/10 rounded-lg hover:bg-slate-900/40 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

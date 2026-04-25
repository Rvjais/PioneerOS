'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface ProfilePictureProps {
  src?: string | null
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  editable?: boolean
  onEdit?: (newUrl: string) => void
  type?: 'user' | 'client'
  className?: string
}

// Stock avatar images for employees
const STOCK_AVATARS = [
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face',
]

// Stock company logos for clients
const STOCK_LOGOS = [
  'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&h=150&fit=crop',
]

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-24 h-24 text-3xl',
}

const editIconSizes = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-5 h-5',
  xl: 'w-6 h-6',
  '2xl': 'w-8 h-8',
}

// Generate a consistent stock image based on name hash
function getStockImage(name: string, type: 'user' | 'client'): string {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const images = type === 'user' ? STOCK_AVATARS : STOCK_LOGOS
  return images[hash % images.length]
}

// Get initials from name
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Generate a color based on name
function getBackgroundColor(name: string): string {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-teal-500',
    'bg-indigo-500',
    'bg-rose-500',
  ]
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

export function ProfilePicture({
  src,
  name,
  size = 'md',
  editable = false,
  onEdit,
  type = 'user',
  className = '',
}: ProfilePictureProps) {
  const [showModal, setShowModal] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [imageError, setImageError] = useState(false)
  const [loading, setLoading] = useState(false)

  // Reset imageError when src changes (e.g., after update)
  useEffect(() => {
    setImageError(false)
  }, [src])

  const displayUrl = src && !imageError ? src : null
  const stockImage = getStockImage(name, type)

  const handleSave = () => {
    if (imageUrl.trim() && onEdit) {
      setLoading(true)
      onEdit(imageUrl.trim())
      setShowModal(false)
      setImageUrl('')
      setLoading(false)
    }
  }

  const handleRemove = () => {
    if (onEdit) {
      onEdit('')
      setShowModal(false)
    }
  }

  return (
    <>
      <div className={`relative inline-block ${className}`}>
        <div
          className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center ${
            displayUrl ? '' : getBackgroundColor(name)
          } ${editable ? 'cursor-pointer' : ''}`}
          onClick={() => editable && setShowModal(true)}
        >
          {displayUrl ? (
            <Image
              src={displayUrl}
              alt={name}
              width={96}
              height={96}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <span className="text-white font-medium">{getInitials(name)}</span>
          )}
        </div>

        {editable && (
          <button
            onClick={() => setShowModal(true)}
            className={`absolute bottom-0 right-0 ${editIconSizes[size]} glass-card dark:bg-zinc-800 rounded-full shadow-none flex items-center justify-center border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors`}
            title="Edit picture"
          >
            <svg
              className="w-3 h-3 text-zinc-600 dark:text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-xl shadow-none max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">
                {type === 'user' ? 'Change Profile Picture' : 'Change Logo'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Current Picture */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-800/50">
                {displayUrl ? (
                  <Image
                    src={displayUrl}
                    alt={name}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image
                    src={stockImage}
                    alt={name}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover opacity-50"
                  />
                )}
              </div>
            </div>

            {/* URL Input */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/your-image.jpg"
                  className="w-full px-3 py-2 border border-white/20 rounded-lg glass-card text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Paste a URL to any publicly accessible image
                </p>
              </div>

              {/* Preview */}
              {imageUrl && (
                <div className="p-3 bg-slate-900/40 rounded-lg">
                  <p className="text-xs text-slate-400 mb-2">Preview:</p>
                  <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-white/10">
                      <Image
                        src={imageUrl}
                        alt="Preview"
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                        onError={() => {}}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Stock Images Suggestions */}
              <div>
                <p className="text-xs text-slate-400 mb-2">Or choose a default:</p>
                <div className="flex gap-2 flex-wrap">
                  {(type === 'user' ? STOCK_AVATARS : STOCK_LOGOS).slice(0, 4).map((url, idx) => (
                    <button
                      key={url}
                      onClick={() => setImageUrl(url)}
                      className={`w-10 h-10 rounded-full overflow-hidden border-2 ${
                        imageUrl === url ? 'border-blue-500' : 'border-transparent'
                      } hover:border-blue-400 transition-colors`}
                    >
                      <Image
                        src={url}
                        alt={`Stock ${idx + 1}`}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              {displayUrl && (
                <button
                  onClick={handleRemove}
                  className="px-4 py-2 text-sm text-red-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  Remove
                </button>
              )}
              <div className="flex-1" />
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!imageUrl.trim() || loading}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Simple avatar display without edit functionality
export function Avatar({
  src,
  name,
  size = 'md',
  className = '',
}: {
  src?: string | null
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
}) {
  return <ProfilePicture src={src} name={name} size={size} className={className} editable={false} />
}

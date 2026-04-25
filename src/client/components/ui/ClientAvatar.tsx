'use client'

import { useState, useEffect } from 'react'
import { Avatar } from './Avatar'
import { ProfilePreviewModal } from './ProfilePreviewModal'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

export interface ClientData {
  id: string
  name: string
  brandName?: string | null
  logoUrl?: string | null
  email?: string | null
  phone?: string | null
  industry?: string | null
  status?: string
  monthlyFee?: number | null
}

interface ClientAvatarProps {
  client: ClientData
  size?: AvatarSize
  showPreview?: boolean
  className?: string
  /** Use square corners instead of round (better for logos) */
  square?: boolean
}

/**
 * ClientAvatar - Unified avatar component for clients
 *
 * Features:
 * - Displays logo from client.logoUrl
 * - Falls back to initials with consistent color
 * - Clickable to open profile preview modal (optional)
 * - Square variant for logos
 *
 * Usage:
 * <ClientAvatar client={client} size="md" showPreview />
 */
export function ClientAvatar({
  client,
  size = 'md',
  showPreview = true,
  className,
  square = false
}: ClientAvatarProps) {
  const [showModal, setShowModal] = useState(false)
  const [imgError, setImgError] = useState(false)

  // Reset image error when logoUrl changes
  useEffect(() => {
    setImgError(false)
  }, [client.logoUrl])

  const displayName = client.brandName || client.name
  const logoUrl = client.logoUrl || null
  const showImage = logoUrl && !imgError

  const sizeClasses: Record<AvatarSize, string> = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  }

  const handleClick = () => {
    if (showPreview) {
      setShowModal(true)
    }
  }

  // Generate initials
  const initials = displayName
    .split(' ')
    .map(part => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  // Generate consistent color
  const colors = [
    'from-blue-500 to-purple-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-pink-500 to-rose-600',
    'from-cyan-500 to-blue-600',
    'from-violet-500 to-purple-600',
    'from-indigo-500 to-blue-600',
    'from-red-500 to-pink-600',
  ]
  let hash = 0
  for (let i = 0; i < displayName.length; i++) {
    hash = displayName.charCodeAt(i) + ((hash << 5) - hash)
  }
  const gradientColor = colors[Math.abs(hash) % colors.length]

  return (
    <>
      <div
        className={`relative inline-flex items-center justify-center overflow-hidden flex-shrink-0 ${
          square ? 'rounded-lg' : 'rounded-full'
        } ${sizeClasses[size]} ${showPreview ? 'cursor-pointer' : ''} ${className || ''}`}
        onClick={showPreview ? handleClick : undefined}
      >
        {showImage ? (
          <img
            src={logoUrl}
            alt={displayName}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center font-medium text-white bg-gradient-to-br ${gradientColor}`}
          >
            {initials || (
              <svg className="w-1/2 h-1/2 opacity-75" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
              </svg>
            )}
          </div>
        )}
      </div>

      {showPreview && (
        <ProfilePreviewModal
          open={showModal}
          onClose={() => setShowModal(false)}
          type="client"
          data={{
            id: client.id,
            name: displayName,
            image: logoUrl,
            subtitle: client.industry,
            email: client.email,
            phone: client.phone,
            status: client.status,
            monthlyFee: client.monthlyFee,
          }}
        />
      )}
    </>
  )
}

export default ClientAvatar

'use client'

import { useState } from 'react'
import { Avatar } from './Avatar'
import { ProfilePreviewModal } from './ProfilePreviewModal'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

export interface UserData {
  id: string
  firstName: string
  lastName?: string | null
  email?: string | null
  phone?: string | null
  role?: string | null
  department?: string | null
  empId?: string | null
  profile?: {
    profilePicture?: string | null
  } | null
}

interface UserAvatarProps {
  user: UserData
  size?: AvatarSize
  showPreview?: boolean
  className?: string
}

/**
 * UserAvatar - Unified avatar component for employees
 *
 * Features:
 * - Displays profile picture from user.profile.profilePicture
 * - Falls back to initials with consistent color
 * - Clickable to open profile preview modal (optional)
 * - Consistent rendering across the entire app
 *
 * Usage:
 * <UserAvatar user={user} size="md" showPreview />
 */
export function UserAvatar({
  user,
  size = 'md',
  showPreview = true,
  className
}: UserAvatarProps) {
  const [showModal, setShowModal] = useState(false)

  const fullName = `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
  const profilePicture = user.profile?.profilePicture || null

  const handleClick = () => {
    if (showPreview) {
      setShowModal(true)
    }
  }

  return (
    <>
      <Avatar
        src={profilePicture}
        name={fullName}
        size={size}
        onClick={showPreview ? handleClick : undefined}
        className={className}
      />

      {showPreview && (
        <ProfilePreviewModal
          open={showModal}
          onClose={() => setShowModal(false)}
          type="user"
          data={{
            id: user.id,
            name: fullName,
            image: profilePicture,
            subtitle: user.role || user.department,
            email: user.email,
            phone: user.phone,
            department: user.department,
            role: user.role,
            empId: user.empId,
          }}
        />
      )}
    </>
  )
}

/**
 * UserAvatarGroup - Display multiple user avatars with overflow
 */
interface UserAvatarGroupProps {
  users: UserData[]
  max?: number
  size?: AvatarSize
  showPreview?: boolean
  className?: string
}

export function UserAvatarGroup({
  users,
  max = 4,
  size = 'md',
  showPreview = true,
  className
}: UserAvatarGroupProps) {
  const visibleUsers = users.slice(0, max)
  const remainingCount = users.length - max

  const sizeClasses: Record<AvatarSize, string> = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  }

  return (
    <div className={`flex -space-x-2 ${className || ''}`}>
      {visibleUsers.map((user) => (
        <div key={user.id} className="ring-2 ring-white dark:ring-slate-900 rounded-full">
          <UserAvatar user={user} size={size} showPreview={showPreview} />
        </div>
      ))}
      {remainingCount > 0 && (
        <div
          className={`relative inline-flex items-center justify-center rounded-full bg-white/10 dark:bg-slate-700 text-slate-300 dark:text-slate-300 font-medium ring-2 ring-white dark:ring-slate-900 ${sizeClasses[size]}`}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  )
}

export default UserAvatar

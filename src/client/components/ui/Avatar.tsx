'use client'

import { ReactNode, useState } from 'react'
import { cn } from '@/shared/utils/cn'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
type AvatarStatus = 'online' | 'offline' | 'away' | 'busy' | 'none'

interface AvatarProps {
  src?: string | null
  alt?: string
  name?: string
  size?: AvatarSize
  status?: AvatarStatus
  className?: string
  fallbackClassName?: string
  onClick?: () => void
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-20 h-20 text-2xl',
}

const statusSizeClasses: Record<AvatarSize, string> = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
  xl: 'w-4 h-4',
  '2xl': 'w-5 h-5',
}

const statusColors: Record<Exclude<AvatarStatus, 'none'>, string> = {
  online: 'bg-emerald-500',
  offline: 'bg-slate-400',
  away: 'bg-amber-500',
  busy: 'bg-red-500',
}

/**
 * Get initials from a name
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

/**
 * Generate a consistent color based on name
 */
function getColorFromName(name: string): string {
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
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }

  return colors[Math.abs(hash) % colors.length]
}

/**
 * Avatar component for displaying user avatars
 */
export function Avatar({
  src,
  alt,
  name = '',
  size = 'md',
  status = 'none',
  className,
  fallbackClassName,
  onClick,
}: AvatarProps) {
  const [imgError, setImgError] = useState(false)
  const showImage = src && !imgError
  const initials = getInitials(name)
  const gradientColor = getColorFromName(name || 'user')

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full overflow-hidden flex-shrink-0',
        sizeClasses[size],
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt || name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className={cn(
            'w-full h-full flex items-center justify-center font-medium text-white bg-gradient-to-br',
            gradientColor,
            fallbackClassName
          )}
        >
          {initials || (
            <svg className="w-1/2 h-1/2 opacity-75" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          )}
        </div>
      )}

      {status !== 'none' && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full ring-2 ring-white dark:ring-slate-900',
            statusSizeClasses[size],
            statusColors[status]
          )}
        />
      )}
    </div>
  )
}

interface AvatarGroupProps {
  children: ReactNode
  max?: number
  size?: AvatarSize
  className?: string
}

/**
 * Avatar group for displaying multiple avatars
 */
export function AvatarGroup({ children, max = 4, size = 'md', className }: AvatarGroupProps) {
  const childrenArray = Array.isArray(children) ? children : [children]
  const visibleChildren = childrenArray.slice(0, max)
  const remainingCount = childrenArray.length - max

  return (
    <div className={cn('flex -space-x-2', className)}>
      {visibleChildren}
      {remainingCount > 0 && (
        <div
          className={cn(
            'relative inline-flex items-center justify-center rounded-full bg-white/10 dark:bg-slate-700 text-slate-300 dark:text-slate-300 font-medium ring-2 ring-white dark:ring-slate-900',
            sizeClasses[size]
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  )
}

interface AvatarWithTextProps extends AvatarProps {
  title: string
  subtitle?: string
  rightContent?: ReactNode
}

/**
 * Avatar with text for user cards/lists
 */
export function AvatarWithText({
  title,
  subtitle,
  rightContent,
  ...avatarProps
}: AvatarWithTextProps) {
  return (
    <div className="flex items-center gap-3">
      <Avatar {...avatarProps} name={avatarProps.name || title} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white dark:text-white truncate">{title}</p>
        {subtitle && (
          <p className="text-sm text-slate-400 dark:text-slate-400 truncate">{subtitle}</p>
        )}
      </div>
      {rightContent && <div className="flex-shrink-0">{rightContent}</div>}
    </div>
  )
}

export default Avatar

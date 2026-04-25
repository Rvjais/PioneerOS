'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { ProfilePicture } from '@/client/components/ui/ProfilePicture'

interface ProfileHeaderProps {
  userId: string
  firstName: string
  lastName: string
  empId: string
  department: string
  role: string
  status: string
  profilePicture?: string | null
}

export function ProfileHeader({
  userId,
  firstName,
  lastName,
  empId,
  department,
  role,
  status,
  profilePicture,
}: ProfileHeaderProps) {
  const { update: updateSession } = useSession()
  const [currentPicture, setCurrentPicture] = useState(profilePicture)
  const [saving, setSaving] = useState(false)

  const handleUpdatePicture = async (newUrl: string) => {
    setSaving(true)
    try {
      const res = await fetch('/api/users/profile-picture', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profilePicture: newUrl }),
      })

      if (res.ok) {
        setCurrentPicture(newUrl || null)
        // Update the NextAuth session so the header reflects the change
        await updateSession({ profilePicture: newUrl || null })
      } else {
        console.error('Failed to update profile picture')
      }
    } catch (error) {
      console.error('Error updating profile picture:', error)
    } finally {
      setSaving(false)
    }
  }

  const fullName = `${firstName} ${lastName || ''}`.trim()

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
      <div className="flex items-center gap-6">
        <div className="relative">
          <ProfilePicture
            src={currentPicture}
            name={fullName}
            size="2xl"
            editable
            onEdit={handleUpdatePicture}
            type="user"
            className="border-4 border-white/30"
          />
          {saving && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
              <svg className="w-6 h-6 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold">{fullName}</h1>
          <p className="text-blue-100 mt-1">{empId} • {department}</p>
          <div className="flex items-center gap-3 mt-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              status === 'ACTIVE' ? 'bg-green-500/20 text-green-100' :
              status === 'PROBATION' ? 'bg-amber-500/20 text-amber-100' :
              'bg-red-500/20 text-red-100'
            }`}>
              {status}
            </span>
            <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm">
              {role.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

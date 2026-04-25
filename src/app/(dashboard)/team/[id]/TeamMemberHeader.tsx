'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { ProfilePicture } from '@/client/components/ui/ProfilePicture'

interface TeamMemberHeaderProps {
  userId: string
  firstName: string
  lastName: string | null
  empId: string
  department: string
  role: string
  status: string
  profilePicture: string | null
  isOwnProfile: boolean
}

export function TeamMemberHeader({
  userId,
  firstName,
  lastName,
  empId,
  department,
  role,
  status,
  profilePicture,
  isOwnProfile,
}: TeamMemberHeaderProps) {
  const { update: updateSession } = useSession()
  const [currentPicture, setCurrentPicture] = useState(profilePicture)
  const fullName = `${firstName} ${lastName || ''}`.trim()

  const handleUpdatePicture = async (newUrl: string) => {
    if (!isOwnProfile) return

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
      }
    } catch (error) {
      console.error('Failed to update profile picture:', error)
    }
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
      <div className="flex items-center gap-6">
        <ProfilePicture
          src={currentPicture}
          name={fullName}
          size="2xl"
          editable={isOwnProfile}
          onEdit={handleUpdatePicture}
          type="user"
          className="border-4 border-white/30"
        />
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{fullName}</h1>
          <p className="text-blue-100 mt-1">{empId} • {department}</p>
          <div className="flex flex-wrap items-center gap-3 mt-3">
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

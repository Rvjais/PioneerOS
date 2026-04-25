'use client'

import { useState } from 'react'
import { EditProfileModal } from './EditProfileModal'

interface EditProfileButtonProps {
  user: {
    id: string
    firstName: string
    lastName: string | null
    email: string | null
    phone: string
    role: string
    department: string
    status: string
    capacity: number
  }
}

export function EditProfileButton({ user }: EditProfileButtonProps) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-sm hover:bg-white/20 transition-colors"
      >
        Edit Profile
      </button>

      {showModal && (
        <EditProfileModal user={user} onClose={() => setShowModal(false)} />
      )}
    </>
  )
}

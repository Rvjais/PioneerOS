'use client'

import { useState } from 'react'

interface TaskCheckboxProps {
  taskId: string
  initialChecked?: boolean
}

export function TaskCheckbox({ taskId, initialChecked = false }: TaskCheckboxProps) {
  const [checked, setChecked] = useState(initialChecked)
  const [loading, setLoading] = useState(false)

  const toggleTask = async () => {
    setLoading(true)
    try {
      const newStatus = checked ? 'PENDING' : 'DONE'
      const res = await fetch(`/api/sales/daily-tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setChecked(!checked)
      }
    } catch (error) {
      console.error('Error toggling task:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={toggleTask}
      disabled={loading}
      className="mt-1 w-4 h-4 rounded border-white/20 text-orange-500 focus:ring-orange-500 cursor-pointer disabled:opacity-50"
    />
  )
}

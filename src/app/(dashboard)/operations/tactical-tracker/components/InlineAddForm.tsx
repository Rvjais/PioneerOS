'use client'

import { useState } from 'react'

interface Category {
  id: string
  label: string
}

interface InlineAddFormProps {
  categories: Category[]
  onAdd: (data: { category: string; workItem: string; proofUrl: string }) => Promise<void>
  disabled?: boolean
}

export function InlineAddForm({ categories, onAdd, disabled }: InlineAddFormProps) {
  const [category, setCategory] = useState('')
  const [workItem, setWorkItem] = useState('')
  const [proofUrl, setProofUrl] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!category || !workItem) return

    setSaving(true)
    try {
      await onAdd({ category, workItem, proofUrl })
      setCategory('')
      setWorkItem('')
      setProofUrl('')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-xl border border-white/10 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">+</span>
        <span className="font-medium text-white">Quick Add Work Item</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={disabled || saving}
          className="px-3 py-2 border border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white glass-card disabled:bg-slate-800/50"
        >
          <option value="">Category...</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.label}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={workItem}
          onChange={(e) => setWorkItem(e.target.value)}
          placeholder="Item name (e.g., Reel 1)"
          disabled={disabled || saving}
          className="px-3 py-2 border border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white disabled:bg-slate-800/50"
        />

        <input
          type="url"
          value={proofUrl}
          onChange={(e) => setProofUrl(e.target.value)}
          placeholder="Proof URL (optional)"
          disabled={disabled || saving}
          className="px-3 py-2 border border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white disabled:bg-slate-800/50"
        />

        <button
          type="submit"
          disabled={disabled || saving || !category || !workItem}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Adding...' : 'Add'}
        </button>
      </div>
    </form>
  )
}

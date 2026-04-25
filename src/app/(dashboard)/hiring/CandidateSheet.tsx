'use client'

import { useState } from 'react'

interface Candidate {
    id: string
    name: string
    email: string
    phone: string | null
    position: string
    department: string
    resumeUrl: string | null
    portfolioUrl: string | null
    linkedInUrl: string | null
    source: string | null
    status: string
    experience: number | null
    notes: string | null
    testTaskScore: number | null
}

// Prefilled dropdown options
const POSITIONS = [
    'SEO Specialist',
    'Content Writer',
    'Ads Manager',
    'Social Media Manager',
    'Web Developer',
    'Graphic Designer',
    'Video Editor',
    'Account Manager',
    'Business Development',
    'HR Executive',
    'Operations',
]

const DEPARTMENTS = [
    'SEO',
    'Content',
    'Ads',
    'Social Media',
    'Web Development',
    'Design',
    'Video',
    'Accounts',
    'HR',
    'Operations',
    'Sales',
]

const SOURCES = [
    'LinkedIn',
    'Naukri',
    'Indeed',
    'Referral',
    'Direct Application',
    'Campus',
    'Other',
]

const STATUS_OPTIONS = [
    { value: 'APPLICATION', label: 'Application', color: 'bg-slate-800/50 text-slate-200' },
    { value: 'SCREENING', label: 'Screening', color: 'bg-blue-500/20 text-blue-400' },
    { value: 'INTERVIEW', label: 'Interview', color: 'bg-purple-500/20 text-purple-400' },
    { value: 'TEST_TASK', label: 'Test Task', color: 'bg-yellow-500/20 text-yellow-400' },
    { value: 'OFFER', label: 'Offer', color: 'bg-emerald-500/20 text-emerald-400' },
    { value: 'JOINED', label: 'Joined', color: 'bg-green-500/20 text-green-400' },
    { value: 'REJECTED', label: 'Rejected', color: 'bg-red-500/20 text-red-400' },
]

const EXPERIENCE_OPTIONS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10+']

interface CandidateSheetProps {
    initialCandidates: Candidate[]
}

export function CandidateSheet({ initialCandidates }: CandidateSheetProps) {
    const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates)
    const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null)
    const [isAdding, setIsAdding] = useState(false)
    const [newCandidate, setNewCandidate] = useState<Partial<Candidate>>({
        status: 'APPLICATION',
    })

    const handleCellEdit = async (id: string, field: string, value: string | number | null) => {
        // Optimistic update
        setCandidates(prev =>
            prev.map(c => (c.id === id ? { ...c, [field]: value } : c))
        )
        setEditingCell(null)

        try {
            await fetch(`/api/hiring/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [field]: value }),
            })
        } catch (error) {
            console.error('Failed to update:', error)
        }
    }

    const handleAddCandidate = async () => {
        if (!newCandidate.name || !newCandidate.email || !newCandidate.position || !newCandidate.department) {
            return
        }

        try {
            const res = await fetch('/api/hiring', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCandidate),
            })

            if (res.ok) {
                const candidate = await res.json()
                setCandidates(prev => [candidate, ...prev])
                setNewCandidate({ status: 'APPLICATION' })
                setIsAdding(false)
            }
        } catch (error) {
            console.error('Failed to add candidate:', error)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this candidate?')) return

        try {
            const res = await fetch(`/api/hiring/${id}`, { method: 'DELETE' })
            if (res.ok) {
                setCandidates(prev => prev.filter(c => c.id !== id))
            }
        } catch (error) {
            console.error('Failed to delete:', error)
        }
    }

    const renderCell = (candidate: Candidate, field: keyof Candidate) => {
        const isEditing = editingCell?.id === candidate.id && editingCell?.field === field
        const value = candidate[field]

        // Status dropdown
        if (field === 'status') {
            const statusOption = STATUS_OPTIONS.find(s => s.value === value)
            if (isEditing) {
                return (
                    <select
                        autoFocus
                        className="w-full px-2 py-1 text-xs border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={value as string}
                        onChange={(e) => handleCellEdit(candidate.id, field, e.target.value)}
                        onBlur={() => setEditingCell(null)}
                    >
                        {STATUS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                )
            }
            return (
                <span
                    className={`px-2 py-0.5 rounded text-xs font-medium cursor-pointer ${statusOption?.color}`}
                    onClick={() => setEditingCell({ id: candidate.id, field })}
                >
                    {statusOption?.label || value}
                </span>
            )
        }

        // Position dropdown
        if (field === 'position') {
            if (isEditing) {
                return (
                    <select
                        autoFocus
                        className="w-full px-2 py-1 text-xs border border-blue-300 rounded focus:outline-none"
                        value={value as string}
                        onChange={(e) => handleCellEdit(candidate.id, field, e.target.value)}
                        onBlur={() => setEditingCell(null)}
                    >
                        <option value="">Select...</option>
                        {POSITIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                )
            }
            return (
                <span
                    className="text-xs text-slate-200 cursor-pointer hover:bg-slate-800/50 px-1 py-0.5 rounded"
                    onClick={() => setEditingCell({ id: candidate.id, field })}
                >
                    {value || '-'}
                </span>
            )
        }

        // Department dropdown
        if (field === 'department') {
            if (isEditing) {
                return (
                    <select
                        autoFocus
                        className="w-full px-2 py-1 text-xs border border-blue-300 rounded focus:outline-none"
                        value={value as string}
                        onChange={(e) => handleCellEdit(candidate.id, field, e.target.value)}
                        onBlur={() => setEditingCell(null)}
                    >
                        <option value="">Select...</option>
                        {DEPARTMENTS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                )
            }
            return (
                <span
                    className="text-xs text-slate-200 cursor-pointer hover:bg-slate-800/50 px-1 py-0.5 rounded"
                    onClick={() => setEditingCell({ id: candidate.id, field })}
                >
                    {value || '-'}
                </span>
            )
        }

        // Source dropdown
        if (field === 'source') {
            if (isEditing) {
                return (
                    <select
                        autoFocus
                        className="w-full px-2 py-1 text-xs border border-blue-300 rounded focus:outline-none"
                        value={(value as string) || ''}
                        onChange={(e) => handleCellEdit(candidate.id, field, e.target.value || null)}
                        onBlur={() => setEditingCell(null)}
                    >
                        <option value="">Select...</option>
                        {SOURCES.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                )
            }
            return (
                <span
                    className="text-xs text-slate-400 cursor-pointer hover:bg-slate-800/50 px-1 py-0.5 rounded"
                    onClick={() => setEditingCell({ id: candidate.id, field })}
                >
                    {value || '-'}
                </span>
            )
        }

        // Experience dropdown
        if (field === 'experience') {
            if (isEditing) {
                return (
                    <select
                        autoFocus
                        className="w-full px-2 py-1 text-xs border border-blue-300 rounded focus:outline-none"
                        value={value !== null ? String(value) : ''}
                        onChange={(e) => handleCellEdit(candidate.id, field, e.target.value ? parseInt(e.target.value) : null)}
                        onBlur={() => setEditingCell(null)}
                    >
                        <option value="">-</option>
                        {EXPERIENCE_OPTIONS.map(opt => (
                            <option key={opt} value={opt === '10+' ? '10' : opt}>{opt} yrs</option>
                        ))}
                    </select>
                )
            }
            return (
                <span
                    className="text-xs text-slate-300 cursor-pointer hover:bg-slate-800/50 px-1 py-0.5 rounded"
                    onClick={() => setEditingCell({ id: candidate.id, field })}
                >
                    {value !== null ? `${value} yrs` : '-'}
                </span>
            )
        }

        // Test task score
        if (field === 'testTaskScore') {
            if (isEditing) {
                return (
                    <input
                        type="number"
                        autoFocus
                        className="w-16 px-2 py-1 text-xs border border-blue-300 rounded focus:outline-none"
                        value={value !== null ? String(value) : ''}
                        min={0}
                        max={100}
                        onChange={(e) => handleCellEdit(candidate.id, field, e.target.value ? parseFloat(e.target.value) : null)}
                        onBlur={() => setEditingCell(null)}
                    />
                )
            }
            return (
                <span
                    className={`text-xs cursor-pointer hover:bg-slate-800/50 px-1 py-0.5 rounded ${value !== null && Number(value) >= 70 ? 'text-green-400 font-medium' : 'text-slate-400'}`}
                    onClick={() => setEditingCell({ id: candidate.id, field })}
                >
                    {value !== null ? `${value}/100` : '-'}
                </span>
            )
        }

        // Default text input
        if (isEditing) {
            return (
                <input
                    type="text"
                    autoFocus
                    className="w-full px-2 py-1 text-xs border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue={(value as string) || ''}
                    onBlur={(e) => handleCellEdit(candidate.id, field, e.target.value || null)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleCellEdit(candidate.id, field, (e.target as HTMLInputElement).value || null)
                        } else if (e.key === 'Escape') {
                            setEditingCell(null)
                        }
                    }}
                />
            )
        }

        return (
            <span
                className="text-xs text-slate-200 cursor-pointer hover:bg-slate-800/50 px-1 py-0.5 rounded block truncate"
                onClick={() => setEditingCell({ id: candidate.id, field })}
                title={value as string}
            >
                {value || '-'}
            </span>
        )
    }

    return (
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">{candidates.length} candidates</span>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Candidate
                </button>
            </div>

            {/* Sheet/Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-slate-900/40 sticky top-0">
                        <tr>
                            <th className="text-left px-3 py-2 text-xs font-medium text-slate-400 uppercase w-40">Name</th>
                            <th className="text-left px-3 py-2 text-xs font-medium text-slate-400 uppercase w-44">Email</th>
                            <th className="text-left px-3 py-2 text-xs font-medium text-slate-400 uppercase w-28">Phone</th>
                            <th className="text-left px-3 py-2 text-xs font-medium text-slate-400 uppercase w-32">Position</th>
                            <th className="text-left px-3 py-2 text-xs font-medium text-slate-400 uppercase w-28">Department</th>
                            <th className="text-left px-3 py-2 text-xs font-medium text-slate-400 uppercase w-24">Exp</th>
                            <th className="text-left px-3 py-2 text-xs font-medium text-slate-400 uppercase w-28">Source</th>
                            <th className="text-left px-3 py-2 text-xs font-medium text-slate-400 uppercase w-28">Status</th>
                            <th className="text-left px-3 py-2 text-xs font-medium text-slate-400 uppercase w-20">Score</th>
                            <th className="text-left px-3 py-2 text-xs font-medium text-slate-400 uppercase w-12"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {/* Add New Row */}
                        {isAdding && (
                            <tr className="bg-blue-500/10">
                                <td className="px-3 py-2">
                                    <input
                                        type="text"
                                        placeholder="Full Name *"
                                        className="w-full px-2 py-1 text-xs border border-white/20 rounded focus:border-blue-500 focus:outline-none"
                                        value={newCandidate.name || ''}
                                        onChange={(e) => setNewCandidate(prev => ({ ...prev, name: e.target.value }))}
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <input
                                        type="email"
                                        placeholder="Email *"
                                        className="w-full px-2 py-1 text-xs border border-white/20 rounded focus:border-blue-500 focus:outline-none"
                                        value={newCandidate.email || ''}
                                        onChange={(e) => setNewCandidate(prev => ({ ...prev, email: e.target.value }))}
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <input
                                        type="tel"
                                        placeholder="Phone"
                                        className="w-full px-2 py-1 text-xs border border-white/20 rounded focus:border-blue-500 focus:outline-none"
                                        value={newCandidate.phone || ''}
                                        onChange={(e) => setNewCandidate(prev => ({ ...prev, phone: e.target.value }))}
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <select
                                        className="w-full px-2 py-1 text-xs border border-white/20 rounded focus:border-blue-500 focus:outline-none"
                                        value={newCandidate.position || ''}
                                        onChange={(e) => setNewCandidate(prev => ({ ...prev, position: e.target.value }))}
                                    >
                                        <option value="">Position *</option>
                                        {POSITIONS.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-3 py-2">
                                    <select
                                        className="w-full px-2 py-1 text-xs border border-white/20 rounded focus:border-blue-500 focus:outline-none"
                                        value={newCandidate.department || ''}
                                        onChange={(e) => setNewCandidate(prev => ({ ...prev, department: e.target.value }))}
                                    >
                                        <option value="">Dept *</option>
                                        {DEPARTMENTS.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-3 py-2">
                                    <select
                                        className="w-full px-2 py-1 text-xs border border-white/20 rounded focus:border-blue-500 focus:outline-none"
                                        value={newCandidate.experience !== undefined ? String(newCandidate.experience) : ''}
                                        onChange={(e) => setNewCandidate(prev => ({ ...prev, experience: e.target.value ? parseInt(e.target.value) : null }))}
                                    >
                                        <option value="">Exp</option>
                                        {EXPERIENCE_OPTIONS.map(opt => (
                                            <option key={opt} value={opt === '10+' ? '10' : opt}>{opt}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-3 py-2">
                                    <select
                                        className="w-full px-2 py-1 text-xs border border-white/20 rounded focus:border-blue-500 focus:outline-none"
                                        value={newCandidate.source || ''}
                                        onChange={(e) => setNewCandidate(prev => ({ ...prev, source: e.target.value }))}
                                    >
                                        <option value="">Source</option>
                                        {SOURCES.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-3 py-2">
                                    <select
                                        className="w-full px-2 py-1 text-xs border border-white/20 rounded focus:border-blue-500 focus:outline-none"
                                        value={newCandidate.status || 'APPLICATION'}
                                        onChange={(e) => setNewCandidate(prev => ({ ...prev, status: e.target.value }))}
                                    >
                                        {STATUS_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-3 py-2">-</td>
                                <td className="px-3 py-2">
                                    <div className="flex gap-1">
                                        <button
                                            onClick={handleAddCandidate}
                                            className="p-1 text-green-400 hover:bg-green-500/10 rounded"
                                            title="Save"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsAdding(false)
                                                setNewCandidate({ status: 'APPLICATION' })
                                            }}
                                            className="p-1 text-slate-400 hover:bg-slate-800/50 rounded"
                                            title="Cancel"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}

                        {/* Existing Candidates */}
                        {candidates.map(candidate => (
                            <tr key={candidate.id} className="hover:bg-slate-900/40">
                                <td className="px-3 py-2">{renderCell(candidate, 'name')}</td>
                                <td className="px-3 py-2">{renderCell(candidate, 'email')}</td>
                                <td className="px-3 py-2">{renderCell(candidate, 'phone')}</td>
                                <td className="px-3 py-2">{renderCell(candidate, 'position')}</td>
                                <td className="px-3 py-2">{renderCell(candidate, 'department')}</td>
                                <td className="px-3 py-2">{renderCell(candidate, 'experience')}</td>
                                <td className="px-3 py-2">{renderCell(candidate, 'source')}</td>
                                <td className="px-3 py-2">{renderCell(candidate, 'status')}</td>
                                <td className="px-3 py-2">{renderCell(candidate, 'testTaskScore')}</td>
                                <td className="px-3 py-2">
                                    <button
                                        onClick={() => handleDelete(candidate.id)}
                                        className="p-1 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded"
                                        title="Delete"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {candidates.length === 0 && !isAdding && (
                            <tr>
                                <td colSpan={10} className="px-3 py-8 text-center text-slate-400">
                                    No candidates yet. Click "Add Candidate" to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

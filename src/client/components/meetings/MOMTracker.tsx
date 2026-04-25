'use client'

import { useState } from 'react'

interface Meeting {
  id: string
  date: string
  clientName: string
  attendees: string
  keyPoints: string
  actionItems: string
  nextSteps: string
  status: string
  momRecorded: boolean
}

interface Props {
  clientId: string
  meetings: Meeting[]
  onUpdate: () => void
}

const MEETING_STATUS = [
  { value: 'SCHEDULED', label: 'Scheduled', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-green-500/20 text-green-400' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-500/20 text-red-400' },
  { value: 'RESCHEDULED', label: 'Rescheduled', color: 'bg-amber-500/20 text-amber-400' },
]

const DEFAULT_ATTENDEES = [
  'Client POC',
  'Account Manager',
  'SEO Lead',
  'Ads Lead',
  'Social Lead',
  'Web Lead',
  'Content Writer',
]

export function MOMTracker({ clientId, meetings: initialMeetings, onUpdate }: Props) {
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Meeting>>({})
  const [isAdding, setIsAdding] = useState(false)
  const [newMeeting, setNewMeeting] = useState<Partial<Meeting>>({
    date: new Date().toISOString().split('T')[0],
    clientName: '',
    attendees: '',
    keyPoints: '',
    actionItems: '',
    nextSteps: '',
    status: 'SCHEDULED',
    momRecorded: false,
  })
  const [saving, setSaving] = useState(false)

  const handleEdit = (meeting: Meeting) => {
    setEditingId(meeting.id)
    setEditData(meeting)
  }

  const handleSave = async (id: string) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/meetings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyPointers: editData.keyPoints,
          actionItems: JSON.stringify([editData.actionItems]),
          notes: editData.nextSteps,
          status: editData.status,
          momRecorded: editData.momRecorded,
        }),
      })
      if (res.ok) {
        setMeetings(prev => prev.map(m => m.id === id ? { ...m, ...editData } : m))
        setEditingId(null)
        onUpdate()
      }
    } catch (error) {
      console.error('Failed to save:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleAddMeeting = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Client Meeting - ${newMeeting.date}`,
          type: 'CLIENT_CALL',
          category: 'GENERAL',
          date: new Date(newMeeting.date!),
          clientId,
          keyPointers: newMeeting.keyPoints,
          notes: newMeeting.nextSteps,
          status: newMeeting.status,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setMeetings(prev => [{ ...newMeeting, id: data.id } as Meeting, ...prev])
        setIsAdding(false)
        setNewMeeting({
          date: new Date().toISOString().split('T')[0],
          clientName: '',
          attendees: '',
          keyPoints: '',
          actionItems: '',
          nextSteps: '',
          status: 'SCHEDULED',
          momRecorded: false,
        })
        onUpdate()
      }
    } catch (error) {
      console.error('Failed to add meeting:', error)
    } finally {
      setSaving(false)
    }
  }

  const getStatusColor = (status: string) => {
    return MEETING_STATUS.find(s => s.value === status)?.color || 'bg-slate-800/50 text-slate-200'
  }

  return (
    <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 bg-slate-900/40 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white">Minutes of Meeting (MOM)</h3>
          <p className="text-xs text-slate-400">Track client meeting discussions and action items</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Meeting
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/50 border-b border-white/10">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-slate-300 whitespace-nowrap">Date</th>
              <th className="px-3 py-2 text-left font-medium text-slate-300 whitespace-nowrap">Attendees</th>
              <th className="px-3 py-2 text-left font-medium text-slate-300 min-w-[200px]">Key Discussion Points</th>
              <th className="px-3 py-2 text-left font-medium text-slate-300 min-w-[180px]">Action Items</th>
              <th className="px-3 py-2 text-left font-medium text-slate-300 min-w-[150px]">Next Steps</th>
              <th className="px-3 py-2 text-left font-medium text-slate-300 whitespace-nowrap">Status</th>
              <th className="px-3 py-2 text-left font-medium text-slate-300 whitespace-nowrap">MOM</th>
              <th className="px-3 py-2 text-center font-medium text-slate-300 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {/* Add new meeting row */}
            {isAdding && (
              <tr className="bg-blue-500/10">
                <td className="px-3 py-2">
                  <input
                    type="date"
                    value={newMeeting.date}
                    onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                    className="w-full px-2 py-1 border border-white/20 rounded text-white text-xs"
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    multiple
                    value={newMeeting.attendees?.split(', ') || []}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, opt => opt.value)
                      setNewMeeting({ ...newMeeting, attendees: selected.join(', ') })
                    }}
                    className="w-full px-2 py-1 border border-white/20 rounded text-white text-xs h-20"
                  >
                    {DEFAULT_ATTENDEES.map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <textarea
                    value={newMeeting.keyPoints}
                    onChange={(e) => setNewMeeting({ ...newMeeting, keyPoints: e.target.value })}
                    placeholder="Key discussion points..."
                    className="w-full px-2 py-1 border border-white/20 rounded text-white text-xs resize-none h-20"
                  />
                </td>
                <td className="px-3 py-2">
                  <textarea
                    value={newMeeting.actionItems}
                    onChange={(e) => setNewMeeting({ ...newMeeting, actionItems: e.target.value })}
                    placeholder="Action items..."
                    className="w-full px-2 py-1 border border-white/20 rounded text-white text-xs resize-none h-20"
                  />
                </td>
                <td className="px-3 py-2">
                  <textarea
                    value={newMeeting.nextSteps}
                    onChange={(e) => setNewMeeting({ ...newMeeting, nextSteps: e.target.value })}
                    placeholder="Next steps..."
                    className="w-full px-2 py-1 border border-white/20 rounded text-white text-xs resize-none h-20"
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    value={newMeeting.status}
                    onChange={(e) => setNewMeeting({ ...newMeeting, status: e.target.value })}
                    className="w-full px-2 py-1 border border-white/20 rounded text-white text-xs"
                  >
                    {MEETING_STATUS.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={newMeeting.momRecorded}
                    onChange={(e) => setNewMeeting({ ...newMeeting, momRecorded: e.target.checked })}
                    className="w-4 h-4 text-blue-400 rounded"
                  />
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-1 justify-center">
                    <button
                      onClick={handleAddMeeting}
                      disabled={saving}
                      className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
                    >
                      {saving ? '...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setIsAdding(false)}
                      className="px-2 py-1 bg-white/10 text-slate-300 rounded text-xs hover:bg-white/20"
                    >
                      Cancel
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {/* Existing meetings */}
            {meetings.length === 0 && !isAdding ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                  No meetings recorded yet. Click &quot;Add Meeting&quot; to start tracking.
                </td>
              </tr>
            ) : (
              meetings.map((meeting) => (
                <tr key={meeting.id} className="hover:bg-slate-900/40">
                  <td className="px-3 py-2 text-white whitespace-nowrap">
                    {editingId === meeting.id ? (
                      <input
                        type="date"
                        value={editData.date?.split('T')[0] || meeting.date.split('T')[0]}
                        onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                        className="w-full px-2 py-1 border border-white/20 rounded text-xs"
                      />
                    ) : (
                      new Date(meeting.date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    )}
                  </td>
                  <td className="px-3 py-2 text-slate-300 text-xs max-w-[150px]">
                    {editingId === meeting.id ? (
                      <select
                        multiple
                        value={editData.attendees?.split(', ') || meeting.attendees.split(', ')}
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions, opt => opt.value)
                          setEditData({ ...editData, attendees: selected.join(', ') })
                        }}
                        className="w-full px-2 py-1 border border-white/20 rounded text-xs h-16"
                      >
                        {DEFAULT_ATTENDEES.map(a => (
                          <option key={a} value={a}>{a}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="truncate" title={meeting.attendees}>
                        {meeting.attendees || '-'}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-slate-300 text-xs">
                    {editingId === meeting.id ? (
                      <textarea
                        value={editData.keyPoints ?? meeting.keyPoints}
                        onChange={(e) => setEditData({ ...editData, keyPoints: e.target.value })}
                        className="w-full px-2 py-1 border border-white/20 rounded text-xs resize-none h-16"
                      />
                    ) : (
                      <div className="whitespace-pre-wrap line-clamp-3">{meeting.keyPoints || '-'}</div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-slate-300 text-xs">
                    {editingId === meeting.id ? (
                      <textarea
                        value={editData.actionItems ?? meeting.actionItems}
                        onChange={(e) => setEditData({ ...editData, actionItems: e.target.value })}
                        className="w-full px-2 py-1 border border-white/20 rounded text-xs resize-none h-16"
                      />
                    ) : (
                      <div className="whitespace-pre-wrap line-clamp-3">{meeting.actionItems || '-'}</div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-slate-300 text-xs">
                    {editingId === meeting.id ? (
                      <textarea
                        value={editData.nextSteps ?? meeting.nextSteps}
                        onChange={(e) => setEditData({ ...editData, nextSteps: e.target.value })}
                        className="w-full px-2 py-1 border border-white/20 rounded text-xs resize-none h-16"
                      />
                    ) : (
                      <div className="whitespace-pre-wrap line-clamp-3">{meeting.nextSteps || '-'}</div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {editingId === meeting.id ? (
                      <select
                        value={editData.status || meeting.status}
                        onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                        className="w-full px-2 py-1 border border-white/20 rounded text-xs"
                      >
                        {MEETING_STATUS.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                        {MEETING_STATUS.find(s => s.value === meeting.status)?.label || meeting.status}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {editingId === meeting.id ? (
                      <input
                        type="checkbox"
                        checked={editData.momRecorded ?? meeting.momRecorded}
                        onChange={(e) => setEditData({ ...editData, momRecorded: e.target.checked })}
                        className="w-4 h-4 text-blue-400 rounded"
                      />
                    ) : (
                      meeting.momRecorded ? (
                        <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-slate-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1 justify-center">
                      {editingId === meeting.id ? (
                        <>
                          <button
                            onClick={() => handleSave(meeting.id)}
                            disabled={saving}
                            className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
                          >
                            {saving ? '...' : 'Save'}
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-2 py-1 bg-white/10 text-slate-300 rounded text-xs hover:bg-white/20"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleEdit(meeting)}
                          className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs hover:bg-blue-200"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {meetings.length > 0 && (
        <div className="px-4 py-3 border-t border-white/10 bg-slate-900/40 text-xs text-slate-400">
          Total: {meetings.length} meeting(s) •
          Completed: {meetings.filter(m => m.status === 'COMPLETED').length} •
          MOM Recorded: {meetings.filter(m => m.momRecorded).length}
        </div>
      )}
    </div>
  )
}

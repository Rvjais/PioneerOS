import {
  TASK_PRIORITIES,
} from '@/shared/constants/departmentActivities'
import type { Task, Client } from './types'

interface EditTaskModalProps {
  editingTask: Task
  setEditingTask: (task: Task | null) => void
  activities: Array<{ id: string; label: string }>
  clientsList: Client[]
  loading: boolean
  onSave: () => void
}

export function EditTaskModal({
  editingTask,
  setEditingTask,
  activities,
  clientsList,
  loading,
  onSave,
}: EditTaskModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="glass-card rounded-xl shadow-2xl w-full max-w-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">Edit Task</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Client</label>
            <select
              value={editingTask.clientId || ''}
              onChange={e => setEditingTask({ ...editingTask, clientId: e.target.value || null })}
              className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
            >
              <option value="">No Client (Internal)</option>
              {clientsList.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Activity Type *</label>
            <select
              value={editingTask.activityType}
              onChange={e => setEditingTask({ ...editingTask, activityType: e.target.value })}
              className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
            >
              {activities.map(a => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Description *</label>
            <input
              type="text"
              value={editingTask.description}
              onChange={e => setEditingTask({ ...editingTask, description: e.target.value })}
              className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Planned Start Time</label>
              <input
                type="time"
                value={editingTask.plannedStartTime || ''}
                onChange={e => setEditingTask({ ...editingTask, plannedStartTime: e.target.value })}
                className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Estimated Hours</label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={editingTask.plannedHours}
                onChange={e => setEditingTask({ ...editingTask, plannedHours: parseFloat(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Priority</label>
            <select
              value={editingTask.priority}
              onChange={e => setEditingTask({ ...editingTask, priority: e.target.value })}
              className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
            >
              {TASK_PRIORITIES.map(p => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Deadline</label>
              <input
                type="datetime-local"
                value={editingTask.deadline ? new Date(editingTask.deadline).toISOString().slice(0, 16) : ''}
                onChange={e => setEditingTask({ ...editingTask, deadline: e.target.value })}
                className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Deliverable</label>
              <input
                type="text"
                value={editingTask.deliverable || ''}
                onChange={e => setEditingTask({ ...editingTask, deliverable: e.target.value })}
                placeholder="What will be delivered?"
                className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
            <textarea
              value={editingTask.notes || ''}
              onChange={e => setEditingTask({ ...editingTask, notes: e.target.value })}
              className="w-full px-3 py-2 border border-white/20 rounded-lg text-white h-16"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Remarks</label>
            <input
              type="text"
              value={editingTask.remarks || ''}
              onChange={e => setEditingTask({ ...editingTask, remarks: e.target.value })}
              placeholder="Any remarks about the task..."
              className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setEditingTask(null)}
            className="px-4 py-2 text-slate-300 hover:bg-slate-800/50 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={loading || !editingTask.activityType || !editingTask.description}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

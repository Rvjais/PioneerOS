import type { Task, CompleteFormState } from './types'
import { BREAKDOWN_REASONS } from './types'

interface CompleteTaskModalProps {
  completingTask: Task
  completeForm: CompleteFormState
  setCompleteForm: (form: CompleteFormState) => void
  loading: boolean
  onComplete: () => void
  onCancel: () => void
}

export function CompleteTaskModal({
  completingTask,
  completeForm,
  setCompleteForm,
  loading,
  onComplete,
  onCancel,
}: CompleteTaskModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="glass-card rounded-xl shadow-2xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-white mb-4">Complete Task</h3>
        <p className="text-sm text-slate-300 mb-4">{completingTask.description}</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Actual Hours Spent</label>
            <input
              type="number"
              min="0.25"
              step="0.25"
              value={completeForm.actualHours}
              onChange={e => setCompleteForm({ ...completeForm, actualHours: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
            />
            <p className="text-xs text-slate-400 mt-1">Planned: {completingTask.plannedHours}h</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Deliverable (What was delivered?)</label>
            <input
              type="text"
              value={completeForm.deliverable}
              onChange={e => setCompleteForm({ ...completeForm, deliverable: e.target.value })}
              placeholder="e.g., Report submitted, Blog published..."
              className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Proof URL (Sheet/Doc/Drive link) <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={completeForm.proofUrl}
              onChange={e => setCompleteForm({ ...completeForm, proofUrl: e.target.value })}
              placeholder="https://docs.google.com/spreadsheets/..."
              className={`w-full px-3 py-2 border rounded-lg text-white glass-card ${
                !completeForm.proofUrl.trim() ? 'border-red-300' : 'border-white/20'
              }`}
              required
            />
            {!completeForm.proofUrl.trim() ? (
              <p className="text-xs text-red-500 mt-1">Proof URL is required to complete task</p>
            ) : (
              <p className="text-xs text-slate-400 mt-1">Add a link to the deliverable proof</p>
            )}
          </div>

          {completingTask?.clientId && (
            <div className="bg-blue-500/10 border border-blue-200 rounded-lg p-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={completeForm.clientVisible}
                  onChange={e => setCompleteForm({ ...completeForm, clientVisible: e.target.checked })}
                  className="rounded border-blue-300 text-blue-400 focus:ring-blue-500"
                />
                <span className="text-sm text-blue-800 font-medium">Make visible to client</span>
              </label>
              <p className="text-xs text-blue-400 mt-1 ml-6">Client will see this deliverable in their portal</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Rate Your Work</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setCompleteForm({ ...completeForm, rateTask: star })}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <svg
                    className={`w-8 h-8 ${star <= completeForm.rateTask ? 'text-amber-400' : 'text-slate-200'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {completeForm.rateTask === 1 && 'Could be better'}
              {completeForm.rateTask === 2 && 'Fair'}
              {completeForm.rateTask === 3 && 'Good work'}
              {completeForm.rateTask === 4 && 'Great job!'}
              {completeForm.rateTask === 5 && 'Excellent!'}
            </p>
          </div>

          <div className="border-t border-white/10 pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={completeForm.isBreakdown}
                onChange={e => setCompleteForm({ ...completeForm, isBreakdown: e.target.checked })}
                className="rounded border-white/20 text-red-500 focus:ring-red-500"
              />
              <span className="text-sm text-slate-200">Mark as Breakdown (not fully completed)</span>
            </label>
          </div>

          {completeForm.isBreakdown && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Breakdown Reason</label>
              <select
                value={completeForm.breakdownReason}
                onChange={e => setCompleteForm({ ...completeForm, breakdownReason: e.target.value })}
                className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
              >
                <option value="">Select reason...</option>
                {BREAKDOWN_REASONS.map(r => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-slate-300 hover:bg-slate-800/50 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onComplete}
            disabled={loading || completeForm.actualHours <= 0 || (completeForm.isBreakdown && !completeForm.breakdownReason) || (!completeForm.isBreakdown && !completeForm.proofUrl.trim())}
            className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
              completeForm.isBreakdown ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
            }`}
            title={!completeForm.proofUrl.trim() && !completeForm.isBreakdown ? 'Proof URL is required to complete task' : ''}
          >
            {loading ? 'Saving...' : completeForm.isBreakdown ? 'Mark as Breakdown' : 'Complete Task'}
          </button>
        </div>
      </div>
    </div>
  )
}

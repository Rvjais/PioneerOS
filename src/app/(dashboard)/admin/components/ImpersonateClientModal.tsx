import { ClientUser } from './types'

interface ImpersonateClientModalProps {
  clientUser: ClientUser
  clientName: string
  impersonateReason: string
  onReasonChange: (reason: string) => void
  onClose: () => void
  onImpersonate: () => void
  impersonating: boolean
}

export default function ImpersonateClientModal({
  clientUser,
  clientName,
  impersonateReason,
  onReasonChange,
  onClose,
  onImpersonate,
  impersonating,
}: ImpersonateClientModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="glass-card rounded-xl shadow-none w-full max-w-md mx-4">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-semibold text-white">Impersonate Client User</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-300"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div className="bg-amber-500/10 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-amber-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-amber-800">Security Notice</p>
                <p className="text-xs text-amber-400">
                  All actions during impersonation are logged for audit purposes. Only use this feature for legitimate support purposes.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/40 rounded-lg p-3">
            <p className="text-sm text-slate-300">You will view the portal as:</p>
            <p className="font-semibold text-white mt-1">{clientUser.name}</p>
            <p className="text-sm text-slate-400">{clientUser.email}</p>
            <p className="text-xs text-slate-400 mt-1">Client: {clientName}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Reason for impersonation *
            </label>
            <textarea
              value={impersonateReason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder="E.g., Helping client with report access, Debugging dashboard issue..."
              rows={3}
              className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>
        <div className="p-4 border-t border-white/10 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-300 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={onImpersonate}
            disabled={impersonating || !impersonateReason.trim()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
          >
            {impersonating ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Starting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Start Impersonation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

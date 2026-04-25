import type { TaskMessageData } from './types'

interface CommunicateModalProps {
  taskMessageData: TaskMessageData
  editedMessage: string
  setEditedMessage: (message: string) => void
  loading: boolean
  onSendExternal: () => void
  onSendInternal: () => void
  onOpenGroup: (joinLink: string) => void
  onCopyMessage: () => void
  onSkip: () => void
}

export function CommunicateModal({
  taskMessageData,
  editedMessage,
  setEditedMessage,
  loading,
  onSendExternal,
  onSendInternal,
  onOpenGroup,
  onCopyMessage,
  onSkip,
}: CommunicateModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="glass-card rounded-xl shadow-2xl w-full max-w-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Communicate to Client?</h3>
            <p className="text-sm text-slate-400">Share this update with {taskMessageData.clientName}</p>
          </div>
        </div>

        <div className="bg-slate-900/40 rounded-lg p-3 mb-4">
          <p className="text-xs font-medium text-slate-400 mb-1">COMPLETED TASK</p>
          <p className="text-sm text-slate-200">{taskMessageData.taskDescription}</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-300 mb-2">Message Preview</label>
          <textarea
            value={editedMessage}
            onChange={e => setEditedMessage(e.target.value)}
            className="w-full px-3 py-2 border border-white/20 rounded-lg text-white h-40 text-sm"
            placeholder="Edit message before sending..."
          />
        </div>

        {/* WhatsApp Groups */}
        {taskMessageData.whatsAppGroups.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-slate-300 mb-2">Client WhatsApp Groups</p>
            <div className="space-y-2">
              {taskMessageData.whatsAppGroups.map(group => (
                <button
                  key={group.id}
                  onClick={() => onOpenGroup(group.joinLink)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-green-500/10 border border-green-200 rounded-lg text-sm text-green-400 hover:bg-green-500/20 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.211l4.309-1.391A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.14 0-4.163-.666-5.849-1.904l-.42-.248-2.551.823.842-2.479-.272-.432A9.936 9.936 0 012 12c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10z"/>
                    </svg>
                    {group.name}
                  </span>
                  <span className="text-xs bg-green-200 px-2 py-0.5 rounded">{group.groupType}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <button
            onClick={onCopyMessage}
            className="px-3 py-2 text-slate-300 hover:bg-slate-800/50 rounded-lg transition-colors text-sm flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onSkip}
              className="px-4 py-2 text-slate-300 hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              Skip
            </button>
            {taskMessageData.clientPhone ? (
              taskMessageData.canSendInternal ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={onSendInternal}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                    title="Send via Pioneer system"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    </svg>
                    {loading ? 'Sending...' : 'Send Now'}
                  </button>
                  <button
                    onClick={onSendExternal}
                    className="px-3 py-2 bg-white/10 text-slate-200 rounded-lg hover:bg-white/20 transition-colors text-sm"
                    title="Open in WhatsApp app"
                  >
                    Open App
                  </button>
                </div>
              ) : (
                <button
                  onClick={onSendExternal}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  </svg>
                  Open WhatsApp
                </button>
              )
            ) : (
              <button
                onClick={onCopyMessage}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Copy & Send Manually
              </button>
            )}
          </div>
        </div>

        {!taskMessageData.clientPhone && (
          <p className="text-xs text-amber-400 mt-3 text-center">
            No WhatsApp number found for this client. Copy the message and send manually.
          </p>
        )}
        {taskMessageData.canSendInternal && taskMessageData.clientPhone && (
          <p className="text-xs text-green-400 mt-3 text-center">
            Message will be sent via your department&apos;s official WhatsApp number.
          </p>
        )}
      </div>
    </div>
  )
}

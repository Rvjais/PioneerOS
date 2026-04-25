'use client'

import { ACCOUNTS_TASK_TYPES, COMPLIANCE_TYPES } from '@/shared/constants/departmentActivities'

interface AccountsTaskTypeDropdownProps {
  selectedTaskType: string | null
  selectedComplianceType: string | null
  onTaskTypeSelect: (taskType: string | null) => void
  onComplianceTypeSelect: (complianceType: string | null) => void
  disabled?: boolean
}

export function AccountsTaskTypeDropdown({
  selectedTaskType,
  selectedComplianceType,
  onTaskTypeSelect,
  onComplianceTypeSelect,
  disabled = false,
}: AccountsTaskTypeDropdownProps) {
  const selectedType = ACCOUNTS_TASK_TYPES.find(t => t.id === selectedTaskType)
  const showComplianceDropdown = selectedTaskType === 'COMPLIANCE'

  return (
    <div className="space-y-3">
      {/* Task Type */}
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">Accounts Task Type</label>
        <select
          value={selectedTaskType || ''}
          onChange={(e) => {
            const value = e.target.value || null
            onTaskTypeSelect(value)
            // Clear compliance type if not compliance task
            if (value !== 'COMPLIANCE') {
              onComplianceTypeSelect(null)
            }
          }}
          disabled={disabled}
          className={`w-full px-3 py-2 border rounded-lg ${
            disabled ? 'bg-slate-800/50 cursor-not-allowed' : 'glass-card hover:border-slate-400'
          } border-white/10 focus:outline-none focus:ring-1 focus:ring-blue-500`}
        >
          <option value="">Select task type...</option>
          {ACCOUNTS_TASK_TYPES.map(type => (
            <option key={type.id} value={type.id}>{type.label}</option>
          ))}
        </select>
        {selectedType && (
          <div className="mt-1 flex items-center gap-2">
            <span className={`px-2 py-0.5 text-xs rounded ${selectedType.color}`}>
              {selectedType.label}
            </span>
            {'notifyClient' in selectedType && selectedType.notifyClient && (
              <span className="text-[10px] text-blue-400">
                Client will be notified
              </span>
            )}
          </div>
        )}
      </div>

      {/* Compliance Type (conditional) */}
      {showComplianceDropdown && (
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Compliance Type</label>
          <select
            value={selectedComplianceType || ''}
            onChange={(e) => onComplianceTypeSelect(e.target.value || null)}
            disabled={disabled}
            className={`w-full px-3 py-2 border rounded-lg ${
              disabled ? 'bg-slate-800/50 cursor-not-allowed' : 'glass-card hover:border-slate-400'
            } border-white/10 focus:outline-none focus:ring-1 focus:ring-blue-500`}
          >
            <option value="">Select compliance type...</option>
            {COMPLIANCE_TYPES.map(type => (
              <option key={type.id} value={type.id}>{type.label}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}

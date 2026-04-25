'use client'

import { DEPARTMENT_LIST } from '@/shared/constants/departmentActivities'

interface DepartmentDropdownProps {
  selectedDepartment: string | null
  onSelect: (departmentId: string | null) => void
  disabled?: boolean
  label?: string
}

export function DepartmentDropdown({
  selectedDepartment,
  onSelect,
  disabled = false,
  label = 'Target Department',
}: DepartmentDropdownProps) {
  const selectedDept = DEPARTMENT_LIST.find(d => d.id === selectedDepartment)

  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
      <select
        value={selectedDepartment || ''}
        onChange={(e) => onSelect(e.target.value || null)}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-lg ${
          disabled ? 'bg-slate-800/50 cursor-not-allowed' : 'glass-card hover:border-slate-400'
        } border-white/10 focus:outline-none focus:ring-1 focus:ring-blue-500`}
        style={{ colorScheme: 'dark' }}
      >
        <option value="" className="bg-slate-800 text-white">Select department...</option>
        {DEPARTMENT_LIST.map(dept => (
          <option key={dept.id} value={dept.id} className="bg-slate-800 text-white">{dept.label}</option>
        ))}
      </select>
    </div>
  )
}

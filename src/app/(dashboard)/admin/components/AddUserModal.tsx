import { ROLES, DEPARTMENTS } from './types'

interface NewUserData {
  empId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: string
  department: string
  employeeType: string
}

interface AddUserModalProps {
  newUser: NewUserData
  onNewUserChange: (user: NewUserData) => void
  onClose: () => void
  onAdd: () => void
  saving: boolean
}

export default function AddUserModal({ newUser, onNewUserChange, onClose, onAdd, saving }: AddUserModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="glass-card rounded-xl shadow-none w-full max-w-lg mx-4">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-semibold text-white">Add New User</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-300">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div className="bg-blue-500/10 border border-blue-200 rounded-lg p-3 text-sm text-blue-400">
            Default password will be the employee&apos;s phone number. They will be prompted to complete their profile on first login.
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Employee ID *</label>
            <input
              type="text"
              value={newUser.empId}
              onChange={(e) => onNewUserChange({ ...newUser, empId: e.target.value.toUpperCase() })}
              placeholder="BP-XXX"
              className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white glass-card"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">First Name *</label>
              <input
                type="text"
                value={newUser.firstName}
                onChange={(e) => onNewUserChange({ ...newUser, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white glass-card"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Last Name</label>
              <input
                type="text"
                value={newUser.lastName}
                onChange={(e) => onNewUserChange({ ...newUser, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white glass-card"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Phone *</label>
            <input
              type="tel"
              value={newUser.phone}
              onChange={(e) => onNewUserChange({ ...newUser, phone: e.target.value })}
              placeholder="10-digit phone number"
              className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white glass-card"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Email</label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => onNewUserChange({ ...newUser, email: e.target.value })}
              className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white glass-card"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Role</label>
              <select
                value={newUser.role}
                onChange={(e) => onNewUserChange({ ...newUser, role: e.target.value })}
                className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white glass-card"
                style={{ colorScheme: 'dark' }}
              >
                {ROLES.map(role => (
                  <option key={role} value={role} className="bg-slate-800 text-white">{role}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Department</label>
              <select
                value={newUser.department}
                onChange={(e) => onNewUserChange({ ...newUser, department: e.target.value })}
                className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white glass-card"
                style={{ colorScheme: 'dark' }}
              >
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept} className="bg-slate-800 text-white">{dept}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Employee Type</label>
            <select
              value={newUser.employeeType}
              onChange={(e) => onNewUserChange({ ...newUser, employeeType: e.target.value })}
              className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white glass-card"
              style={{ colorScheme: 'dark' }}
            >
              <option value="FULL_TIME" className="bg-slate-800 text-white">Full Time</option>
              <option value="PART_TIME" className="bg-slate-800 text-white">Part Time</option>
              <option value="CONTRACT" className="bg-slate-800 text-white">Contract</option>
              <option value="INTERN" className="bg-slate-800 text-white">Intern</option>
              <option value="FREELANCER" className="bg-slate-800 text-white">Freelancer</option>
            </select>
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
            onClick={onAdd}
            disabled={saving || !newUser.empId || !newUser.firstName || !newUser.phone}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Create User'}
          </button>
        </div>
      </div>
    </div>
  )
}

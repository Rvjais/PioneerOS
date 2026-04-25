import { User, ROLES, DEPARTMENTS, STATUSES } from './types'

interface EditUserModalProps {
  editingUser: User
  onEditingUserChange: (user: User | null) => void
  onSave: () => void
  saving: boolean
}

export default function EditUserModal({ editingUser, onEditingUserChange, onSave, saving }: EditUserModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="glass-card rounded-xl shadow-none w-full max-w-lg mx-4">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-semibold text-white">Edit User</h3>
          <button onClick={() => onEditingUserChange(null)} className="text-slate-400 hover:text-slate-300">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">First Name</label>
              <input
                type="text"
                value={editingUser.firstName}
                onChange={(e) => onEditingUserChange({ ...editingUser, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white glass-card"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Last Name</label>
              <input
                type="text"
                value={editingUser.lastName || ''}
                onChange={(e) => onEditingUserChange({ ...editingUser, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white glass-card"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Email</label>
            <input
              type="email"
              value={editingUser.email || ''}
              onChange={(e) => onEditingUserChange({ ...editingUser, email: e.target.value })}
              className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white glass-card"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Phone</label>
            <input
              type="tel"
              value={editingUser.phone}
              onChange={(e) => onEditingUserChange({ ...editingUser, phone: e.target.value })}
              className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white glass-card"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Role</label>
              <select
                value={editingUser.role}
                onChange={(e) => onEditingUserChange({ ...editingUser, role: e.target.value })}
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
                value={editingUser.department}
                onChange={(e) => onEditingUserChange({ ...editingUser, department: e.target.value })}
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
            <label className="block text-sm font-medium text-slate-200 mb-1">Status</label>
            <select
              value={editingUser.status}
              onChange={(e) => onEditingUserChange({ ...editingUser, status: e.target.value })}
              className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white glass-card"
              style={{ colorScheme: 'dark' }}
            >
              {STATUSES.map(status => (
                <option key={status} value={status} className="bg-slate-800 text-white">{status}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="p-4 border-t border-white/10 flex items-center justify-end gap-3">
          <button
            onClick={() => onEditingUserChange(null)}
            className="px-4 py-2 text-slate-300 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

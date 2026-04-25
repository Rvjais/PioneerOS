import { User, ROLES, STATUSES, roleColors, statusColors, formatDate } from './types'

interface UsersTabProps {
  users: User[]
  filteredUsers: User[]
  searchQuery: string
  onSearchQueryChange: (query: string) => void
  roleFilter: string
  onRoleFilterChange: (role: string) => void
  statusFilter: string
  onStatusFilterChange: (status: string) => void
  selectedUsers: string[]
  onSelectedUsersChange: (users: string[]) => void
  bulkAction: string
  bulkLoading: boolean
  onBulkActionChange: (action: string) => void
  onBulkAction: () => void
  onShowAddUser: () => void
  onEditUser: (user: User) => void
  onImpersonate: (userId: string, userName: string) => void
}

export default function UsersTab({
  users,
  filteredUsers,
  searchQuery,
  onSearchQueryChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  selectedUsers,
  onSelectedUsersChange,
  bulkAction,
  bulkLoading,
  onBulkActionChange,
  onBulkAction,
  onShowAddUser,
  onEditUser,
  onImpersonate,
}: UsersTabProps) {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="glass-card rounded-xl border border-white/10 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <button
            onClick={onShowAddUser}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add User
          </button>
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900/40 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => onRoleFilterChange(e.target.value)}
            className="px-4 py-2 bg-slate-900/40 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ colorScheme: 'dark' }}
          >
            <option value="" className="bg-slate-800 text-white">All Roles</option>
            {ROLES.map(role => (
              <option key={role} value={role} className="bg-slate-800 text-white">{role}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="px-4 py-2 bg-slate-900/40 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ colorScheme: 'dark' }}
          >
            <option value="" className="bg-slate-800 text-white">All Status</option>
            {STATUSES.map(status => (
              <option key={status} value={status} className="bg-slate-800 text-white">{status}</option>
            ))}
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/5">
            <span className="text-sm text-slate-300">{selectedUsers.length} selected</span>
            <select
              value={bulkAction}
              onChange={(e) => onBulkActionChange(e.target.value)}
              className="px-3 py-1.5 bg-slate-900/40 border border-white/10 rounded-lg text-sm"
              style={{ colorScheme: 'dark' }}
            >
              <option value="" className="bg-slate-800 text-white">Bulk Action...</option>
              <option value="activate" className="bg-slate-800 text-white">Activate</option>
              <option value="deactivate" className="bg-slate-800 text-white">Deactivate</option>
            </select>
            <button
              onClick={onBulkAction}
              disabled={!bulkAction || bulkLoading}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
            >
              {bulkLoading ? (
                <>
                  <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Working...
                </>
              ) : 'Apply'}
            </button>
            <button
              onClick={() => onSelectedUsersChange([])}
              className="px-3 py-1.5 text-slate-300 text-sm hover:text-white"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900/40 border-b border-white/10">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onSelectedUsersChange(filteredUsers.map(u => u.id))
                      } else {
                        onSelectedUsersChange([])
                      }
                    }}
                    className="rounded border-white/20"
                  />
                </th>
                <th className="text-left px-4 py-3 font-medium text-slate-300">Employee</th>
                <th className="text-left px-4 py-3 font-medium text-slate-300">Contact</th>
                <th className="text-left px-4 py-3 font-medium text-slate-300">Role</th>
                <th className="text-left px-4 py-3 font-medium text-slate-300">Department</th>
                <th className="text-left px-4 py-3 font-medium text-slate-300">Status</th>
                <th className="text-left px-4 py-3 font-medium text-slate-300">Joined</th>
                <th className="text-right px-4 py-3 font-medium text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-900/40">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          onSelectedUsersChange([...selectedUsers, user.id])
                        } else {
                          onSelectedUsersChange(selectedUsers.filter(id => id !== user.id))
                        }
                      }}
                      className="rounded border-white/20"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-slate-400">{user.empId}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-slate-300">{user.email || '-'}</p>
                    <p className="text-xs text-slate-400">{user.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${roleColors[user.role] || 'bg-slate-800/50 text-slate-300'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{user.department}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${statusColors[user.status] || 'bg-slate-800/50 text-slate-300'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{formatDate(user.joiningDate)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEditUser(user)}
                        className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      {user.role !== 'SUPER_ADMIN' && (
                        <button
                          onClick={() => onImpersonate(user.id, `${user.firstName} ${user.lastName || ''}`)}
                          className="p-1.5 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded"
                          title="Impersonate"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-slate-900/40 border-t border-white/10 text-sm text-slate-300">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>
    </div>
  )
}

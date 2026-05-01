'use client'

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
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50
    }}>
      <div style={{
        backgroundColor: '#1e293b',
        borderRadius: '12px',
        padding: '24px',
        width: '100%',
        maxWidth: '32rem',
        margin: '16px',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h3 style={{ color: 'white', fontSize: '18px', fontWeight: 600 }}>Add New User</h3>
          <button
            onClick={onClose}
            style={{ color: '#94a3b8', cursor: 'pointer', background: 'none', border: 'none' }}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            border: '1px solid rgba(37, 99, 235, 0.2)',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '14px',
            color: '#60a5fa'
          }}>
            Default password will be the employee&apos;s phone number. They will be prompted to complete their profile on first login.
          </div>

          <div>
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '14px', marginBottom: '4px' }}>Employee ID *</label>
            <input
              type="text"
              value={newUser.empId}
              onChange={(e) => onNewUserChange({ ...newUser, empId: e.target.value.toUpperCase() })}
              placeholder="BP-XXX"
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: '#334155',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '14px', marginBottom: '4px' }}>First Name *</label>
              <input
                type="text"
                value={newUser.firstName}
                onChange={(e) => onNewUserChange({ ...newUser, firstName: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: '#334155',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '14px', marginBottom: '4px' }}>Last Name</label>
              <input
                type="text"
                value={newUser.lastName}
                onChange={(e) => onNewUserChange({ ...newUser, lastName: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: '#334155',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '14px', marginBottom: '4px' }}>Phone *</label>
            <input
              type="tel"
              value={newUser.phone}
              onChange={(e) => onNewUserChange({ ...newUser, phone: e.target.value })}
              placeholder="10-digit phone number"
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: '#334155',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '14px', marginBottom: '4px' }}>Email</label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => onNewUserChange({ ...newUser, email: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: '#334155',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '14px', marginBottom: '4px' }}>Role</label>
              <select
                value={newUser.role}
                onChange={(e) => onNewUserChange({ ...newUser, role: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: '#334155',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px'
                }}
              >
                {ROLES.map(role => (
                  <option key={role} value={role} style={{ backgroundColor: '#1e293b' }}>{role}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '14px', marginBottom: '4px' }}>Department</label>
              <select
                value={newUser.department}
                onChange={(e) => onNewUserChange({ ...newUser, department: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: '#334155',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px'
                }}
              >
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept} style={{ backgroundColor: '#1e293b' }}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '14px', marginBottom: '4px' }}>Employee Type</label>
            <select
              value={newUser.employeeType}
              onChange={(e) => onNewUserChange({ ...newUser, employeeType: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: '#334155',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px'
              }}
            >
              <option value="FULL_TIME" style={{ backgroundColor: '#1e293b' }}>Full Time</option>
              <option value="PART_TIME" style={{ backgroundColor: '#1e293b' }}>Part Time</option>
              <option value="CONTRACT" style={{ backgroundColor: '#1e293b' }}>Contract</option>
              <option value="INTERN" style={{ backgroundColor: '#1e293b' }}>Intern</option>
              <option value="FREELANCER" style={{ backgroundColor: '#1e293b' }}>Freelancer</option>
            </select>
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              color: '#cbd5e1',
              fontSize: '14px',
              cursor: 'pointer',
              background: 'none',
              border: 'none'
            }}
          >
            Cancel
          </button>
          <button
            onClick={onAdd}
            disabled={saving || !newUser.empId || !newUser.firstName || !newUser.phone}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2563eb',
              color: 'white',
              fontSize: '14px',
              borderRadius: '8px',
              cursor: (saving || !newUser.empId || !newUser.firstName || !newUser.phone) ? 'not-allowed' : 'pointer',
              opacity: (saving || !newUser.empId || !newUser.firstName || !newUser.phone) ? 0.5 : 1,
              border: 'none'
            }}
          >
            {saving ? 'Creating...' : 'Create User'}
          </button>
        </div>
      </div>
    </div>
  )
}


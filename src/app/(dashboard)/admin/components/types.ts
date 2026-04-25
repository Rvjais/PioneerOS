export interface AdminStats {
  totalUsers: number
  activeUsers: number
  usersByRole: { role: string; count: number }[]
  usersByDepartment: { department: string; count: number }[]
  recentLogins: {
    id: string
    userName: string
    empId: string
    loginAt: string
    ipAddress: string | null
    city: string | null
    country: string | null
    browser: string | null
    device: string | null
    isActive: boolean
    isSuspicious: boolean
  }[]
  activeSessionsCount: number
  suspiciousLogins: number
  totalClients: number
  activeClients: number
  pendingLeads: number
  totalIssues: number
  openIssues: number
}

export interface User {
  id: string
  empId: string
  firstName: string
  lastName: string | null
  email: string | null
  phone: string
  role: string
  department: string
  employeeType: string
  status: string
  joiningDate: string
  createdAt: string
}

export interface SystemSettings {
  entities: {
    id: string
    code: string
    name: string
    tradeName: string | null
    isPrimary: boolean
  }[]
}

export interface ClientUser {
  id: string
  name: string
  email: string
  phone: string | null
  role: string
  isActive: boolean
  lastLoginAt: string | null
}

export interface Client {
  id: string
  name: string
  email: string | null
  status: string
  lifecycleStage: string
  clientUsers: ClientUser[]
  accountManager: string | null
}

export const ROLES = ['SUPER_ADMIN', 'MANAGER', 'OM', 'EMPLOYEE', 'SALES', 'ACCOUNTS', 'HR', 'FREELANCER', 'INTERN']
export const DEPARTMENTS = ['OPERATIONS', 'SEO', 'SOCIAL', 'DESIGN', 'ADS', 'WEB', 'SALES', 'ACCOUNTS', 'HR', 'CONTENT']
export const STATUSES = ['ACTIVE', 'PROBATION', 'PIP', 'INACTIVE']

export const roleColors: Record<string, string> = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-700',
  MANAGER: 'bg-blue-100 text-blue-700',
  OM: 'bg-indigo-100 text-indigo-700',
  EMPLOYEE: 'bg-green-100 text-green-700',
  SALES: 'bg-amber-100 text-amber-700',
  ACCOUNTS: 'bg-cyan-100 text-cyan-700',
  HR: 'bg-pink-100 text-pink-700',
  FREELANCER: 'bg-orange-100 text-orange-700',
  INTERN: 'bg-rose-100 text-rose-700',
}

export const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  PROBATION: 'bg-amber-100 text-amber-700',
  PIP: 'bg-red-100 text-red-700',
  INACTIVE: 'bg-slate-100 text-slate-500',
}

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, type ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { useMobileNav } from './MobileNavContext'

const navigation = [
  {
    category: 'Main',
    items: [
      { name: 'Dashboard', href: '/', icon: 'home' },
      { name: 'My Profile', href: '/profile', icon: 'users' },
      { name: 'Blended Workspace', href: '/blended', icon: 'blended' },
      { name: 'Team Chat', href: '/mash', icon: 'mash' },
      { name: 'Daily Planner', href: '/tasks/daily', icon: 'planner' },
      { name: 'My Tasks', href: '/tasks', icon: 'tasks' },
      { name: 'Calendar', href: '/calendar', icon: 'calendar' },
    ]
  },
  {
    category: 'Admin',
    items: [
      { name: 'Admin Dashboard', href: '/admin', icon: 'admin' },
      { name: 'Users', href: '/admin/users', icon: 'users' },
      { name: 'Roles & Permissions', href: '/admin/roles', icon: 'key' },
      { name: 'Departments', href: '/admin/departments', icon: 'departments' },
      { name: 'Custom Roles', href: '/admin/custom-roles', icon: 'key' },
      { name: 'Company Entities', href: '/admin/entities', icon: 'entities' },
      { name: 'API Management', href: '/admin/api-management', icon: 'api' },
      { name: 'Settings', href: '/admin/settings', icon: 'settings' },
      { name: 'Audit Log', href: '/admin/audit-log', icon: 'audit' },
      { name: 'Notifications', href: '/admin/notifications', icon: 'notifications' },
      { name: 'Client Assignments', href: '/admin/client-assignments', icon: 'assignments' },
      { name: 'All Access', href: '/all-access', icon: 'lock' },
    ]
  },
  {
    category: 'Freelancer',
    items: [
      { name: 'My Day', href: '/my-day', icon: 'planner' },
      { name: 'Freelancer Home', href: '/freelancer', icon: 'home' },
      { name: 'Work Reports', href: '/freelancer/work-reports', icon: 'reports' },
      { name: 'Payments', href: '/freelancer/payments', icon: 'payments' },
    ]
  },
  {
    category: 'Intern',
    items: [
      { name: 'My Day', href: '/my-day', icon: 'planner' },
      { name: 'Intern Home', href: '/intern', icon: 'home' },
      { name: 'Handbook', href: '/intern/handbook', icon: 'policies' },
    ]
  },
  {
    category: 'Workspace',
    items: [
      { name: 'Clients', href: '/clients', icon: 'clients' },
      { name: 'Comm. Charter', href: '/communication-charter', icon: 'communication' },
      { name: 'Client Guidelines', href: '/clients/guidelines', icon: 'policies' },
      { name: 'Reports', href: '/reports', icon: 'reports' },
      { name: 'Meetings', href: '/meetings', icon: 'meetings' },
      { name: 'Tactical Meeting', href: '/meetings/tactical', icon: 'tactical' },
      { name: 'My KPIs', href: '/meetings/department-tactical', icon: 'leaderboard' },
      { name: 'Ops KPIs', href: '/meetings/ops-tactical', icon: 'tactical' },
      { name: 'KPI Sheet', href: '/meetings/tactical-sheet', icon: 'tactical' },
      { name: 'Strategic Meeting', href: '/meetings/strategic', icon: 'strategic' },
      { name: 'Goal Hierarchy', href: '/goals', icon: 'goals' },
      { name: 'Issues', href: '/issues', icon: 'issues' },
    ]
  },
  {
    category: 'People',
    items: [
      { name: 'Org Chart', href: '/team/org-chart', icon: 'orgchart' },
      { name: 'Team', href: '/team', icon: 'users' },
      { name: 'Directory', href: '/directory', icon: 'users' },
      { name: 'HR Portal', href: '/hr', icon: 'hr' },
      { name: 'Client Feedback', href: '/hr/client-feedback', icon: 'feedback' },
      { name: 'Attendance Calendar', href: '/hr/attendance/calendar', icon: 'calendar' },
      { name: 'Onboarding', href: '/hr/onboarding-checklist', icon: 'checklist' },
      { name: 'Vendor Onboarding', href: '/hr/vendor-onboarding', icon: 'verification' },
      { name: 'Verifications', href: '/hr/verifications', icon: 'verification' },
      { name: 'Candidate Screening', href: '/hr/assessment-pipeline', icon: 'checklist' },
      { name: 'Employee Onboarding', href: '/hr/employee-onboarding', icon: 'checklist' },
      { name: 'Hiring', href: '/hiring', icon: 'hiring' },
      { name: 'Training', href: '/hr/training', icon: 'training' },
      { name: 'Appraisals', href: '/hr/appraisals', icon: 'appraisal' },
      { name: 'My Appraisal', href: '/hr/appraisals/self', icon: 'appraisal' },
      { name: 'Devices', href: '/hr/forms/device-allocation', icon: 'devices' },
      { name: 'Exit Process', href: '/hr/forms/exit', icon: 'exit' },
    ]
  },
  {
    category: 'Performance',
    items: [
      { name: 'Leaderboard', href: '/performance', icon: 'leaderboard' },
      { name: 'My Goals', href: '/performance/goals', icon: 'goals' },
      { name: 'Achievements', href: '/performance/achievements', icon: 'achievements' },
    ]
  },
  {
    category: 'Finance',
    items: [
      { name: 'Overview', href: '/finance/overview', icon: 'finance' },
      { name: 'Invoices', href: '/finance/invoices', icon: 'invoices' },
      { name: 'Accounts', href: '/accounts', icon: 'accounts' },
      { name: 'Payment Onboarding', href: '/accounts/payment-onboarding', icon: 'payments' },
      { name: 'Client Onboarding', href: '/accounts/client-onboarding', icon: 'checklist' },
      { name: 'Contracts', href: '/accounts/contracts', icon: 'contracts' },
      { name: 'Expenses', href: '/accounts/expenses', icon: 'expenses' },
      { name: 'Recurring Expenses', href: '/accounts/expenses/recurring', icon: 'expenses' },
      { name: 'Budget Alerts', href: '/accounts/budget-alerts', icon: 'alert' },
    ]
  },
  {
    category: 'Growth',
    items: [
      { name: 'Sales Dashboard', href: '/sales', icon: 'sales' },
      { name: 'CRM Pipeline', href: '/crm', icon: 'crm' },
      { name: 'RFP Submissions', href: '/clients/rfp', icon: 'rfp' },
      { name: 'Analytics', href: '/analytics', icon: 'analytics' },
      { name: 'Profitability', href: '/analytics/profitability', icon: 'finance' },
    ]
  },
  {
    category: 'Culture',
    items: [
      { name: 'Network', href: '/network', icon: 'network' },
      { name: 'Arcade', href: '/arcade', icon: 'arcade' },
      { name: 'Ideas', href: '/ideas', icon: 'ideas' },
      { name: 'Recognition', href: '/recognition', icon: 'recognition' },
    ]
  },
  {
    category: 'Knowledge',
    items: [
      { name: 'Learning', href: '/learning', icon: 'learning' },
      { name: 'Knowledge Base', href: '/knowledge', icon: 'knowledge' },
      { name: 'SOP Library', href: '/sop', icon: 'sop' },
      { name: 'Policies', href: '/policies', icon: 'policies' },
      { name: 'Learning Resources', href: '/learning/resources', icon: 'learning' },
      { name: 'Company Tools', href: '/internal-tools', icon: 'tools' },
      { name: 'File Vault', href: '/files', icon: 'files' },
    ]
  },
]

// Role-based navigation visibility
// Each role has access to specific categories. Individual items are further restricted by itemRoleRestrictions.
const roleMenuConfig: Record<string, string[]> = {
  // Full access roles
  SUPER_ADMIN: ['Main', 'Admin', 'Workspace', 'People', 'Performance', 'Finance', 'Growth', 'Culture', 'Knowledge'],
  MANAGER: ['Main', 'Workspace', 'People', 'Performance', 'Finance', 'Growth', 'Culture', 'Knowledge'],
  OPERATIONS_HEAD: ['Main', 'Workspace', 'People', 'Performance', 'Finance', 'Growth', 'Culture', 'Knowledge'],

  // Blended role: HR + Social access
  OM: ['Main', 'Workspace', 'People', 'Performance', 'Finance', 'Culture', 'Knowledge'],

  // Department-specific roles - all have access to People for org chart/team directory
  HR: ['Main', 'People', 'Performance', 'Culture', 'Knowledge'],
  SALES: ['Main', 'People', 'Growth', 'Performance', 'Culture', 'Knowledge'],
  ACCOUNTS: ['Main', 'People', 'Finance', 'Performance', 'Culture', 'Knowledge'],

  // Web management role
  WEB_MANAGER: ['Main', 'Workspace', 'People', 'Performance', 'Culture', 'Knowledge'],

  // Regular employees (work on clients, have Workspace access) - includes People for org chart
  EMPLOYEE: ['Main', 'Workspace', 'People', 'Performance', 'Culture', 'Knowledge'],

  // Limited access roles - includes People for basic org chart/team visibility
  FREELANCER: ['Main', 'Freelancer', 'People', 'Culture'], // Dashboard, Tasks, Freelancer Portal, Org Chart, Network
  INTERN: ['Main', 'Intern', 'People', 'Culture', 'Knowledge'], // Learning-focused with social access + org chart
}

// Department to category mapping for custom roles
const departmentCategoryMapping: Record<string, string[]> = {
  HR: ['People'],
  SOCIAL: ['Workspace', 'Growth'],
  OPERATIONS: ['Workspace', 'Finance'],
  DESIGN: ['Workspace', 'Culture'],
  WEB: ['Workspace'],
  SALES: ['Growth'],
  ACCOUNTS: ['Finance'],
  MARKETING: ['Growth', 'Workspace'],
}

// Item-level role restrictions for sensitive routes
// If an item is listed here, only the specified roles can see it
const itemRoleRestrictions: Record<string, string[]> = {
  // HR sensitive items
  '/hr': ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'HR'],
  '/hr/client-feedback': ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'HR'],
  '/hr/attendance/calendar': ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'HR'],
  '/hr/onboarding-checklist': ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'HR'],
  '/hr/vendor-onboarding': ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'HR'],
  '/hr/verifications': ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'HR'],
  '/hr/appraisals': ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'HR'],
  '/hr/appraisals/self': ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'HR', 'EMPLOYEE'],
  '/hr/forms/device-allocation': ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'HR'],
  '/hr/forms/exit': ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'HR'],
  '/hr/assessment-pipeline': ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'HR'],
  '/hr/employee-onboarding': ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'HR'],
  // Finance sensitive items - RESTRICT ALL FROM REGULAR EMPLOYEES
  '/finance/overview': ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'],
  '/finance/invoices': ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'],
  '/finance/reports': ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'],
  '/accounts': ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'],
  '/accounts/contracts': ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'],
  '/accounts/payment-onboarding': ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'],
  '/accounts/client-onboarding-form': ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'],
  '/accounts/expenses/recurring': ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'],
  '/accounts/budget-alerts': ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'],
  '/accounts/finance-overview': ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'],
  '/accounts/analytics': ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'],
  '/accounts/roi': ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'],
  '/accounts/reports': ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'],
  '/accounts/client-lifecycle': ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'ACCOUNTS'],
  '/expenses': ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'],
  // Analytics/Profitability - financial reports
  '/analytics': ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD'],
  '/analytics/profitability': ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'],
  // Reports - agency level
  '/reports': ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD'],
  // Sales/CRM sensitive items
  '/crm': ['SUPER_ADMIN', 'MANAGER', 'SALES'],
  '/sales': ['SUPER_ADMIN', 'MANAGER', 'SALES'],
  // Admin items
  '/admin': ['SUPER_ADMIN'],
  '/admin/users': ['SUPER_ADMIN'],
  '/admin/roles': ['SUPER_ADMIN'],
  '/admin/departments': ['SUPER_ADMIN'],
  '/admin/custom-roles': ['SUPER_ADMIN'],
  '/admin/entities': ['SUPER_ADMIN'],
  '/admin/api-management': ['SUPER_ADMIN'],
  '/admin/settings': ['SUPER_ADMIN'],
  '/admin/audit-log': ['SUPER_ADMIN'],
  '/admin/notifications': ['SUPER_ADMIN'],
  '/admin/client-assignments': ['SUPER_ADMIN'],
  '/all-access': ['SUPER_ADMIN'],

  // Workspace items - NOT for freelancers or interns (these are client-facing work items)
  '/clients': ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE', 'HR', 'SALES', 'ACCOUNTS'],
  '/clients/lifecycle': ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'ACCOUNTS'],
  '/clients/guidelines': ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE'],
  '/clients/rfp': ['SUPER_ADMIN', 'MANAGER', 'SALES'],
  '/operations/tactical-tracker': ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD'],
  '/communication-charter': ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE'],
  '/projects': ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD'],
  '/meetings': ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE'],
  '/meetings/tactical': ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE'],
  '/meetings/department-tactical': ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE'],
  '/meetings/ops-tactical': ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD'],
  '/meetings/tactical-sheet': ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD'],
  '/meetings/strategic': ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD'],
  '/goals': ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE'],
  '/issues': ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE'],

  // Culture items - Freelancers can see Network and Recognition only
  '/arcade': ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE', 'HR', 'SALES', 'ACCOUNTS', 'INTERN'],
  '/ideas': ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE', 'HR', 'SALES', 'ACCOUNTS', 'INTERN'],

  // Performance items - Employees and above (not freelancers)
  '/performance': ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE', 'HR', 'SALES', 'ACCOUNTS'],
  '/performance/goals': ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE', 'HR', 'SALES', 'ACCOUNTS'],
  '/performance/achievements': ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE', 'HR', 'SALES', 'ACCOUNTS'],

  // People items - Team, Directory, Org Chart viewable by all employees
  '/team/org-chart': ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'OPERATIONS', 'EMPLOYEE', 'HR', 'SALES', 'ACCOUNTS', 'FREELANCER', 'INTERN'],
  '/team': ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'OPERATIONS', 'EMPLOYEE', 'HR', 'SALES', 'ACCOUNTS', 'FREELANCER', 'INTERN'],
  '/directory': ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'OPERATIONS', 'EMPLOYEE', 'HR', 'SALES', 'ACCOUNTS', 'FREELANCER', 'INTERN'],
  '/hiring': ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'HR'],
  '/hr/training': ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'HR', 'EMPLOYEE'],

  // Main items - Restrict some for freelancers (they have their own Freelancer Home)
  '/blended': ['BLENDED_USER'], // Special marker - handled separately in canSeeItem
  '/mash': ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE', 'HR', 'SALES', 'ACCOUNTS', 'INTERN'],
  '/tasks/daily': ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE', 'HR', 'SALES', 'ACCOUNTS', 'INTERN'],
  '/calendar': ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE', 'HR', 'SALES', 'ACCOUNTS', 'INTERN', 'WEB_MANAGER', 'WEB_DEVELOPER', 'WEB_DESIGNER', 'QA_TESTER', 'CONTENT_WRITER'],

  // Knowledge items - Full-time employees only
  '/knowledge': ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE', 'HR', 'SALES', 'ACCOUNTS', 'INTERN'],
  '/sop': ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE', 'HR', 'SALES', 'ACCOUNTS', 'INTERN'],
  '/policies': ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE', 'HR', 'SALES', 'ACCOUNTS', 'INTERN'],
  '/learning/resources': ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE', 'HR', 'SALES', 'ACCOUNTS', 'INTERN'],
  '/internal-tools': ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE', 'HR', 'SALES', 'ACCOUNTS', 'INTERN'],
  '/files': ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE', 'HR', 'SALES', 'ACCOUNTS', 'INTERN'],
}

// Check if user can see an item based on role restrictions
function canSeeItem(href: string, userRole: string, customRoles: Array<{ baseRoles: string[]; departments: string[] }>): boolean {
  const allowedRoles = itemRoleRestrictions[href]
  if (!allowedRoles) return true // No restriction, everyone can see

  // Special handling for Blended Workspace - only show for users with multi-department custom roles
  if (href === '/blended') {
    for (const customRole of customRoles) {
      if (customRole.departments && customRole.departments.length > 1) {
        return true
      }
    }
    return false
  }

  // Check if user's role is allowed
  if (allowedRoles.includes(userRole)) return true

  // Freelancers and Interns have strict access - no custom role inheritance for item access
  if (strictAccessRoles.includes(userRole)) {
    return false
  }

  // Check if any custom role has a base role that's allowed
  for (const customRole of customRoles) {
    for (const baseRole of customRole.baseRoles) {
      if (allowedRoles.includes(baseRole)) return true
    }
  }

  return false
}

// Roles that should NOT inherit department-based or custom role-based category access
// These roles have strict, limited access regardless of department assignment
const strictAccessRoles = ['FREELANCER', 'INTERN']

// Helper to get combined categories for a user with custom roles
function getEffectiveCategories(
  baseRole: string,
  customRoles?: Array<{
    baseRoles: string[];
    departments: string[];
    permissions?: Record<string, boolean> | null;
  }>,
  department?: string
): string[] {
  // Start with base role categories
  const categories = new Set(roleMenuConfig[baseRole] || roleMenuConfig.EMPLOYEE);

  // Freelancers and Interns have strict access - don't add anything from department or custom roles
  if (strictAccessRoles.includes(baseRole)) {
    return Array.from(categories);
  }

  // If user is in OPERATIONS department (even with EMPLOYEE role), give them OM access
  if (department === 'OPERATIONS') {
    const opCategories = roleMenuConfig.OPERATIONS_HEAD || [];
    opCategories.forEach(cat => categories.add(cat));
  }

  // Add categories from user's department mapping
  if (department && departmentCategoryMapping[department]) {
    departmentCategoryMapping[department].forEach(cat => categories.add(cat));
  }

  // Add categories from custom roles
  if (customRoles && customRoles.length > 0) {
    for (const customRole of customRoles) {
      // Add categories from base roles in custom role
      for (const role of customRole.baseRoles) {
        const roleCategories = roleMenuConfig[role];
        if (roleCategories) {
          roleCategories.forEach(cat => categories.add(cat));
        }
      }

      // Add categories from departments
      for (const dept of customRole.departments) {
        const deptCategories = departmentCategoryMapping[dept];
        if (deptCategories) {
          deptCategories.forEach(cat => categories.add(cat));
        }
      }
    }
  }

  return Array.from(categories);
}

const icons: Record<string, ReactNode> = {
  home: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  orgchart: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
  blended: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>,
  mash: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
  whatsapp: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>,
  planner: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
  tasks: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
  calendar: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  clients: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  lifecycle: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  communication: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
  projects: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>,
  reports: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  meetings: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
  issues: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  users: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  key: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>,
  api: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
  admin: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  entities: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  departments: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>,
  settings: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  audit: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  notifications: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
  assignments: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  hr: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  verification: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  hiring: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>,
  training: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  finance: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  invoices: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" /></svg>,
  accounts: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
  contracts: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  payments: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  expenses: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  sales: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  tactical: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  strategic: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>,
  crm: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  analytics: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  automations: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  network: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>,
  arcade: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
  ideas: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
  recognition: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
  sop: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  policies: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  files: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" /></svg>,
  appraisal: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
  devices: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  exit: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  learning: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>,
  tools: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  knowledge: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
  feedback: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
  rfp: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  checklist: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
  leaderboard: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  goals: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>,
  achievements: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
  deliverables: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
  alert: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
  lock: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
}

export function DashboardNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const { isOpen, close } = useMobileNav()

  const userRole = session?.user?.role as string || 'EMPLOYEE'
  const userDepartment = session?.user?.department as string || ''
  const customRoles = session?.user?.customRoles || []

  // Get effective categories combining base role, department, and custom roles
  const allowedCategories = getEffectiveCategories(userRole, customRoles, userDepartment)

  const toggleCategory = (category: string) => {
    setCollapsed(prev => ({ ...prev, [category]: !prev[category] }))
  }

  // Close mobile drawer on route change
  useEffect(() => {
    close()
  }, [pathname, close])

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Filter navigation based on role and custom roles
  const filteredNavigation = navigation
    .filter(section => allowedCategories.includes(section.category))
    .map(section => ({
      ...section,
      // Filter individual items based on role restrictions
      items: section.items.filter(item => canSeeItem(item.href, userRole, customRoles))
    }))
    // Remove empty categories after item filtering
    .filter(section => section.items.length > 0)

  // Shared nav content renderer
  const renderNavContent = (onItemClick?: () => void) => (
    <>
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {filteredNavigation.map((section) => (
          <div key={section.category} className="space-y-1">
            <button
              onClick={() => toggleCategory(section.category)}
              className="flex items-center justify-between w-full px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-700 transition-colors"
            >
              {section.category}
              <svg
                className={`w-3 h-3 transition-transform duration-300 ${collapsed[section.category] ? '' : 'rotate-180'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${collapsed[section.category] ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'}`}>
              <div className="space-y-1 mt-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onItemClick}
                      className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm relative ${isActive
                        ? 'text-slate-900 bg-slate-100 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-slate-900 rounded-r-full" />
                      )}
                      <span className={`relative z-10 flex-shrink-0 transition-colors duration-200 ${isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'}`}>
                        {icons[item.icon]}
                      </span>
                      <span className="relative z-10 font-medium truncate">{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        ))}
      </nav>

      {/* External Forms - Quick Links */}
      {(userRole === 'SUPER_ADMIN' || customRoles.some(cr => cr.baseRoles.some(br => ['SUPER_ADMIN'].includes(br)))) && (
        <div className="shrink-0 p-3 border-t border-slate-200 bg-white">
          <p className="text-[10px] uppercase tracking-widest text-orange-400/60 font-semibold mb-2 px-1">External Forms</p>
          <div className="grid grid-cols-3 gap-2">
            <Link
              href="/hr/employee-onboarding"
              onClick={onItemClick}
              className="flex flex-col items-center gap-1 px-1 py-2 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Hire
            </Link>
            <Link
              href="/accounts/onboarding/create"
              onClick={onItemClick}
              className="flex flex-col items-center gap-1 px-1 py-2 text-[10px] font-semibold text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-lg hover:bg-orange-500/20 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Client
            </Link>
            <Link
              href="/sales/rfp-manager"
              onClick={onItemClick}
              className="flex flex-col items-center gap-1 px-1 py-2 text-[10px] font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              RFP
            </Link>
            <Link
              href="/careers"
              target="_blank"
              onClick={onItemClick}
              className="flex flex-col items-center gap-1 px-1 py-2 text-[10px] font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Careers
            </Link>
            <Link
              href="/hr/assessment-pipeline"
              onClick={onItemClick}
              className="flex flex-col items-center gap-1 px-1 py-2 text-[10px] font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-lg hover:bg-cyan-500/20 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Assess
            </Link>
            <Link
              href="/join"
              target="_blank"
              onClick={onItemClick}
              className="flex flex-col items-center gap-1 px-1 py-2 text-[10px] font-semibold text-pink-400 bg-pink-500/10 border border-pink-500/20 rounded-lg hover:bg-pink-500/20 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Join
            </Link>
          </div>
        </div>
      )}
    </>
  )

  return (
    <>
      {/* Desktop sidebar — structural flex child */}
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 sticky top-[73px] self-start h-[calc(100vh-73px)] bg-white border-r border-slate-200 z-30">
        {renderNavContent()}
      </aside>

      {/* Mobile drawer overlay */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={close}
        />

        {/* Drawer panel */}
        <aside
          className={`absolute left-0 top-0 h-full w-72 bg-white border-r border-slate-200 overflow-y-auto transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          {/* Drawer header with close button */}
          <div className="flex items-center justify-between px-4 h-[73px] border-b border-slate-200">
            <span className="text-lg font-bold text-slate-900 tracking-tight">
              PioneerOS
            </span>
            <button
              onClick={close}
              className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              aria-label="Close navigation menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {renderNavContent(close)}
        </aside>
      </div>
    </>
  )
}

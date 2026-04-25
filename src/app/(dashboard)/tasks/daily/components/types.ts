export interface Client {
  id: string
  name: string
}

export interface Task {
  id: string
  clientId: string | null
  client: Client | null
  clientName: string | null
  activityType: string
  description: string
  plannedStartTime: string | null
  plannedHours: number
  actualStartTime: string | null
  actualEndTime: string | null
  actualHours: number | null
  addedAt: string
  startedAt: string | null
  completedAt: string | null
  status: string
  isBreakdown: boolean
  isBreakthrough?: boolean
  breakdownReason: string | null
  priority: string
  sortOrder: number
  notes: string | null
  clientCommunicated?: boolean
  communicatedAt?: string | null
  communicatedVia?: string | null
  allocatedById?: string | null
  allocatedBy?: { id: string; firstName: string; lastName: string | null } | null
  deadline?: string | null
  deliverable?: string | null
  remarks?: string | null
  rateTask?: number | null
  leadId?: string | null | undefined
  lead?: { id: string; companyName: string; contactName: string; stage?: string } | null | undefined
  departmentTarget?: string | null
  employeeTargetId?: string | null
  candidateTargetId?: string | null
  accountsTaskType?: string | null
  complianceType?: string | null
  paymentReceivedDate?: string | null
  invoiceNotifiedAt?: string | null
}

export interface WhatsAppGroup {
  id: string
  name: string
  groupType: string
  joinLink: string
}

export interface TaskMessageData {
  taskId: string
  clientId: string
  clientName: string
  clientPhone: string | null
  whatsAppGroups: WhatsAppGroup[]
  message: string
  taskDescription: string
  activityType: string
  canSendInternal?: boolean
  accountId?: string
}

export interface Plan {
  id: string
  date: string
  status: string
  submittedAt: string | null
  submittedBeforeHuddle: boolean
  totalPlannedHours: number
  totalActualHours: number
  hasUnder4Hours: boolean
  tasks: Task[]
}

export interface TeamPlan extends Plan {
  user: { id: string; firstName: string; lastName: string | null; department: string }
}

export interface Escalation {
  underFourHours: Array<{ id: string; user: { firstName: string; lastName: string | null } }>
  breakdowns: Array<{
    id: string
    description: string
    client: { name: string } | null
    plan: { user: { firstName: string; lastName: string | null } }
  }>
}

export interface Lead {
  id: string
  companyName: string
  contactName: string
  stage: string
  value: number | null
  nextFollowUp: string | null
  lastContactedAt: string | null
}

export interface HRPipelineTask {
  id: string
  userId: string
  candidateId?: string
  employeeId?: string
  taskType: string
  title: string
  description?: string
  startDate: string
  endDate?: string | null
  duration?: number
  progress: number
  dependencies?: string
  status: string
}

export interface PendingReviewTask {
  id: string
  description: string
  activityType: string
  status: string
  plannedHours: number
  actualHours: number | null
  proofUrl: string | null
  deliverable: string | null
  clientName: string | null
  completedAt: string | null
  managerReviewed: boolean
  managerRating: number | null
  managerFeedback: string | null
  user: {
    id: string
    firstName: string
    lastName: string | null
  }
}

export type ViewType = 'default' | 'bd' | 'hr' | 'ops'

export interface CompleteFormState {
  actualHours: number
  isBreakdown: boolean
  breakdownReason: string
  rateTask: number
  deliverable: string
  proofUrl: string
  clientVisible: boolean
}

export interface NewTaskState {
  clientId: string
  activityType: string
  description: string
  plannedStartTime: string
  plannedHours: number
  priority: string
  notes: string
  deadline: string
  deliverable: string
  remarks: string
  leadId: string
  departmentTarget: string
  employeeTargetId: string
  candidateTargetId: string
  accountsTaskType: string
  complianceType: string
  paymentReceivedDate: string
  assignToId: string
}

export const BREAKDOWN_REASONS = [
  { id: 'BLOCKED', label: 'Blocked by dependency' },
  { id: 'SCOPE_CHANGE', label: 'Scope changed' },
  { id: 'PRIORITY_SHIFT', label: 'Priority shifted' },
  { id: 'CLIENT_DELAY', label: 'Client delay' },
  { id: 'UNDERESTIMATED', label: 'Underestimated effort' },
  { id: 'URGENT_WORK', label: 'Urgent work came up' },
  { id: 'OTHER', label: 'Other' },
]

export const NEW_TASK_INITIAL_STATE: NewTaskState = {
  clientId: '',
  activityType: '',
  description: '',
  plannedStartTime: '',
  plannedHours: 1,
  priority: 'MEDIUM',
  notes: '',
  deadline: '',
  deliverable: '',
  remarks: '',
  leadId: '',
  departmentTarget: '',
  employeeTargetId: '',
  candidateTargetId: '',
  accountsTaskType: '',
  complianceType: '',
  paymentReceivedDate: '',
  assignToId: '',
}

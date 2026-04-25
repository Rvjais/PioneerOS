// Shared types for reporting components

export interface Account {
  id: string
  platform: string
  accountId: string
  accountName: string
  accessType: string
  isActive: boolean
  lastSyncAt: string | null
  lastSyncStatus: string | null
  syncError: string | null
  metricsCount: number
  createdAt: string
}

export interface ImportBatch {
  id: string
  platform: string
  importType: string
  status: string
  totalRows: number
  successRows: number
  failedRows: number
  createdAt: string
  errorLog: Array<{ row: number; message: string }> | null
}

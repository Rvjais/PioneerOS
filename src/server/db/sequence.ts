import { prisma } from './prisma'

/**
 * Atomically get the next value for a sequence.
 * Uses upsert + increment to avoid race conditions.
 */
export async function getNextSequenceValue(
  sequenceId: string,
  initialValue: number = 1000
): Promise<number> {
  // Use a transaction to ensure atomicity
  const result = await prisma.$transaction(async (tx) => {
    // Try to increment existing sequence
    const existing = await tx.sequence.findUnique({
      where: { id: sequenceId },
    })

    if (existing) {
      const updated = await tx.sequence.update({
        where: { id: sequenceId },
        data: { value: { increment: 1 } },
      })
      return updated.value
    }

    // Create new sequence with initial value
    const created = await tx.sequence.create({
      data: { id: sequenceId, value: initialValue + 1 },
    })
    return created.value
  })

  return result
}

/**
 * Generate a unique client ID atomically.
 * Format: CLT{number} where number starts at 1001
 */
export async function generateClientId(): Promise<string> {
  const num = await getNextSequenceValue('CLIENT', 1000)
  return `CLT${num}`
}

/**
 * Generate a unique invoice number atomically.
 * Format: INV-{year}-{sequence} (e.g., INV-2025-0001)
 */
export async function generateInvoiceNumber(year?: number): Promise<string> {
  const y = year || new Date().getFullYear()
  const seq = await getNextSequenceValue(`INVOICE_${y}`, 0)
  return `INV-${y}-${String(seq).padStart(4, '0')}`
}

/**
 * Generate a unique proforma invoice number atomically.
 * Format: PI-{year}-{sequence} (e.g., PI-2025-0001)
 */
export async function generateProformaNumber(year?: number): Promise<string> {
  const y = year || new Date().getFullYear()
  const seq = await getNextSequenceValue(`PROFORMA_${y}`, 0)
  return `PI-${y}-${String(seq).padStart(4, '0')}`
}

/**
 * Generate a unique credit note number atomically.
 * Format: CN-{year}-{sequence}
 */
export async function generateCreditNoteNumber(year?: number): Promise<string> {
  const y = year || new Date().getFullYear()
  const seq = await getNextSequenceValue(`CREDIT_NOTE_${y}`, 0)
  return `CN-${y}-${String(seq).padStart(4, '0')}`
}

/**
 * Generate a unique employee ID atomically.
 * Format: BP-{number} where number starts at 001
 * Auto-syncs with existing employee IDs to prevent duplicates.
 */
export async function generateEmployeeId(): Promise<string> {
  const num = await prisma.$transaction(async (tx) => {
    // Check if we need to sync the sequence with existing data
    const maxExisting = await tx.user.findFirst({
      where: {
        empId: { startsWith: 'BP-' }
      },
      orderBy: { empId: 'desc' },
      select: { empId: true }
    })

    let startValue = 0
    if (maxExisting?.empId) {
      const match = maxExisting.empId.match(/BP-(\d+)/)
      if (match) {
        startValue = parseInt(match[1], 10)
      }
    }

    // Get or update sequence to be at least as high as existing IDs
    const currentSeq = await tx.sequence.findUnique({
      where: { id: 'EMPLOYEE' }
    })

    if (!currentSeq || currentSeq.value <= startValue) {
      await tx.sequence.upsert({
        where: { id: 'EMPLOYEE' },
        create: { id: 'EMPLOYEE', value: startValue + 1 },
        update: { value: startValue + 1 }
      })
    }

    // Atomically increment and return the next value
    const existing = await tx.sequence.findUnique({
      where: { id: 'EMPLOYEE' },
    })

    if (existing) {
      const updated = await tx.sequence.update({
        where: { id: 'EMPLOYEE' },
        data: { value: { increment: 1 } },
      })
      return updated.value
    }

    const created = await tx.sequence.create({
      data: { id: 'EMPLOYEE', value: startValue + 1 },
    })
    return created.value
  }, { isolationLevel: 'Serializable' })

  return `BP-${String(num).padStart(3, '0')}`
}

/**
 * Generate a simple invoice number atomically.
 * Format: INV-{sequence} (e.g., INV-0001)
 */
export async function generateSimpleInvoiceNumber(): Promise<string> {
  const seq = await getNextSequenceValue('INVOICE_SIMPLE', 0)
  return `INV-${String(seq).padStart(4, '0')}`
}

/**
 * Generate a unique ticket number atomically.
 * Format: TKT-{sequence} (e.g., TKT-00001)
 */
export async function generateTicketNumber(): Promise<string> {
  const seq = await getNextSequenceValue('TICKET', 0)
  return `TKT-${String(seq).padStart(5, '0')}`
}

/**
 * Generate a unique issue number atomically.
 * Format: ISS-{sequence} (e.g., ISS-001)
 */
export async function generateIssueNumber(): Promise<string> {
  const seq = await getNextSequenceValue('ISSUE', 0)
  return `ISS-${String(seq).padStart(3, '0')}`
}

/**
 * Generate a unique asset tag atomically.
 * Format: BP-ASSET-{sequence} (e.g., BP-ASSET-0001)
 */
export async function generateAssetTag(): Promise<string> {
  const seq = await getNextSequenceValue('ASSET', 0)
  return `BP-ASSET-${String(seq).padStart(4, '0')}`
}

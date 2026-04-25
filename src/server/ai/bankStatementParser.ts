/**
 * Bank Statement Parser
 *
 * Parses bank statement data from pasted text (copied from PDF/website)
 * Much cheaper and more reliable than OCR/Vision APIs
 *
 * Supports multiple formats:
 * - Tab-separated (Excel copy)
 * - Comma-separated (CSV)
 * - Space-separated (PDF copy)
 * - Common bank statement formats (HDFC, ICICI, SBI, Axis, etc.)
 */

import { prisma } from '@/server/db/prisma'
import { RECONCILIATION_CONFIG } from '@/shared/constants/config/accounts'

export interface ParsedTransaction {
  date: Date
  description: string
  reference?: string
  type: 'CREDIT' | 'DEBIT'
  amount: number
  balance?: number
  rawLine: string
}

export interface MatchedTransaction extends ParsedTransaction {
  matchStatus: 'AUTO_MATCHED' | 'SUGGESTED' | 'UNMATCHED'
  matchConfidence: number
  suggestedClientId?: string
  suggestedClientName?: string
  suggestedInvoiceId?: string
  suggestedCategory?: string
}

export interface ParseResult {
  success: boolean
  transactions: MatchedTransaction[]
  summary: {
    totalTransactions: number
    credits: number
    debits: number
    totalCredits: number
    totalDebits: number
    autoMatched: number
    suggested: number
    unmatched: number
  }
  errors: string[]
}

// Common date formats in Indian bank statements
const DATE_FORMATS = [
  /(\d{2})[-\/](\d{2})[-\/](\d{4})/,      // DD-MM-YYYY or DD/MM/YYYY
  /(\d{2})[-\/](\d{2})[-\/](\d{2})/,      // DD-MM-YY or DD/MM/YY
  /(\d{4})[-\/](\d{2})[-\/](\d{2})/,      // YYYY-MM-DD
  /(\d{2})-([A-Za-z]{3})-(\d{4})/,        // DD-MMM-YYYY (e.g., 15-Jan-2024)
  /(\d{2})-([A-Za-z]{3})-(\d{2})/,        // DD-MMM-YY
]

const MONTH_MAP: Record<string, number> = {
  'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
  'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
}

/**
 * Parse date from various formats
 */
function parseDate(dateStr: string): Date | null {
  const cleaned = dateStr.trim()

  // Try each format
  for (const format of DATE_FORMATS) {
    const match = cleaned.match(format)
    if (match) {
      let day: number, month: number, year: number

      if (format.source.includes('[A-Za-z]')) {
        // Month name format
        day = parseInt(match[1])
        month = MONTH_MAP[match[2].toLowerCase()] ?? 0
        year = parseInt(match[3])
        if (year < 100) year += 2000
      } else if (match[1].length === 4) {
        // YYYY-MM-DD
        year = parseInt(match[1])
        month = parseInt(match[2]) - 1
        day = parseInt(match[3])
      } else {
        // DD-MM-YYYY or DD-MM-YY
        day = parseInt(match[1])
        month = parseInt(match[2]) - 1
        year = parseInt(match[3])
        if (year < 100) year += 2000
      }

      const date = new Date(year, month, day)
      if (!isNaN(date.getTime())) {
        return date
      }
    }
  }

  return null
}

/**
 * Parse amount from string (handles Indian format with commas and lakhs)
 */
function parseAmount(amountStr: string): number {
  if (!amountStr) return 0

  // Remove currency symbols, spaces, and handle negative
  let cleaned = amountStr.replace(/[₹$€£\s]/g, '').trim()

  const isNegative = cleaned.includes('-') || cleaned.includes('(') || cleaned.toLowerCase().includes('dr')
  cleaned = cleaned.replace(/[-()DR]/gi, '')

  // Remove commas (Indian: 1,00,000 or Western: 100,000)
  cleaned = cleaned.replace(/,/g, '')

  const amount = parseFloat(cleaned)
  return isNaN(amount) ? 0 : (isNegative ? -Math.abs(amount) : amount)
}

/**
 * Detect transaction type from description or amount
 */
function detectTransactionType(description: string, amount: number, debitCol?: string, creditCol?: string): 'CREDIT' | 'DEBIT' {
  const desc = description.toLowerCase()

  // Check explicit columns
  if (creditCol && parseAmount(creditCol) > 0) return 'CREDIT'
  if (debitCol && parseAmount(debitCol) > 0) return 'DEBIT'

  // Check keywords
  const creditKeywords = ['credit', 'cr', 'deposit', 'received', 'refund', 'cashback', 'interest credit', 'neft cr', 'imps cr', 'upi cr']
  const debitKeywords = ['debit', 'dr', 'withdrawal', 'payment', 'transfer to', 'neft dr', 'imps dr', 'upi dr', 'emi', 'charge']

  for (const keyword of creditKeywords) {
    if (desc.includes(keyword)) return 'CREDIT'
  }
  for (const keyword of debitKeywords) {
    if (desc.includes(keyword)) return 'DEBIT'
  }

  // Fallback to amount sign
  return amount >= 0 ? 'CREDIT' : 'DEBIT'
}

/**
 * Extract reference number from description
 */
function extractReference(description: string): string | undefined {
  // Common patterns for UTR, transaction ref, cheque number
  const patterns = [
    /UTR[:\s]*([A-Z0-9]+)/i,
    /REF[:\s]*([A-Z0-9]+)/i,
    /TXN[:\s]*([A-Z0-9]+)/i,
    /CHQ[:\s]*(\d+)/i,
    /NEFT\/([A-Z0-9]+)/i,
    /IMPS\/([A-Z0-9]+)/i,
    /UPI\/([A-Z0-9]+)/i,
    /(\d{12,16})/,  // Long number sequences (likely ref)
  ]

  for (const pattern of patterns) {
    const match = description.match(pattern)
    if (match) return match[1]
  }

  return undefined
}

/**
 * Parse pasted text into transactions
 * Handles various formats automatically
 */
export function parseTransactionText(text: string): ParsedTransaction[] {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)
  const transactions: ParsedTransaction[] = []
  const errors: string[] = []

  // Detect format by analyzing first few lines
  const isCSV = lines.some(l => l.split(',').length >= 3)
  const isTSV = lines.some(l => l.split('\t').length >= 3)

  for (const line of lines) {
    try {
      // Skip header-like lines
      if (line.toLowerCase().includes('date') && line.toLowerCase().includes('description')) {
        continue
      }
      if (line.toLowerCase().includes('opening balance') || line.toLowerCase().includes('closing balance')) {
        continue
      }

      let columns: string[]
      if (isTSV) {
        columns = line.split('\t').map(c => c.trim())
      } else if (isCSV) {
        // Handle CSV with quoted fields
        columns = line.match(/(".*?"|[^,]+)/g)?.map(c => c.replace(/"/g, '').trim()) || []
      } else {
        // Space-separated (PDF copy) - harder to parse
        columns = line.split(/\s{2,}/).map(c => c.trim())
      }

      if (columns.length < 3) continue

      // Try to identify columns
      let dateStr = '', description = '', amount = 0, balance: number | undefined
      let debitCol = '', creditCol = ''

      // First column is usually date
      const dateCandidate = parseDate(columns[0])
      if (dateCandidate) {
        dateStr = columns[0]

        // Common formats:
        // Date | Description | Debit | Credit | Balance
        // Date | Description | Amount | Balance
        // Date | Narration | Withdrawal | Deposit | Balance

        if (columns.length >= 5) {
          // 5+ columns: Date | Desc | Debit | Credit | Balance
          description = columns[1]
          debitCol = columns[2]
          creditCol = columns[3]
          balance = parseAmount(columns[4]) || undefined

          const debitAmt = parseAmount(debitCol)
          const creditAmt = parseAmount(creditCol)

          if (creditAmt > 0) {
            amount = creditAmt
          } else if (debitAmt > 0) {
            amount = -debitAmt
          }
        } else if (columns.length >= 4) {
          // 4 columns: Date | Desc | Amount | Balance
          description = columns[1]
          amount = parseAmount(columns[2])
          balance = parseAmount(columns[3]) || undefined
        } else {
          // 3 columns: Date | Desc | Amount
          description = columns[1]
          amount = parseAmount(columns[2])
        }

        if (description && amount !== 0) {
          const type = detectTransactionType(description, amount, debitCol, creditCol)

          transactions.push({
            date: dateCandidate,
            description,
            reference: extractReference(description),
            type,
            amount: Math.abs(amount),
            balance,
            rawLine: line
          })
        }
      }
    } catch (err) {
      errors.push(`Failed to parse line: ${line.substring(0, 50)}...`)
    }
  }

  return transactions
}

/**
 * Match transactions with existing clients and invoices
 */
export async function matchTransactionsWithClients(
  transactions: ParsedTransaction[]
): Promise<MatchedTransaction[]> {
  // Get all active clients for matching
  const clients = await prisma.client.findMany({
    where: { status: 'ACTIVE' },
    select: {
      id: true,
      name: true,
      contactName: true,
      monthlyFee: true,
      invoices: {
        where: { status: { in: ['SENT', 'DRAFT'] } },
        select: { id: true, invoiceNumber: true, total: true, dueDate: true },
        orderBy: { dueDate: 'desc' },
        take: 5
      }
    }
  })

  const matched: MatchedTransaction[] = []

  for (const txn of transactions) {
    let matchStatus: 'AUTO_MATCHED' | 'SUGGESTED' | 'UNMATCHED' = 'UNMATCHED'
    let matchConfidence = 0
    let suggestedClientId: string | undefined
    let suggestedClientName: string | undefined
    let suggestedInvoiceId: string | undefined
    let suggestedCategory: string | undefined

    // Only match credits (incoming payments)
    if (txn.type === 'CREDIT') {
      const descLower = txn.description.toLowerCase()

      for (const client of clients) {
        const clientNameLower = client.name.toLowerCase()
        const contactNameLower = client.contactName?.toLowerCase() || ''

        // Check if client name appears in description
        const nameMatch = descLower.includes(clientNameLower) ||
          (contactNameLower && descLower.includes(contactNameLower))

        // Check amount match with invoices
        let amountMatch = false
        let matchingInvoice: typeof client.invoices[0] | undefined

        for (const invoice of client.invoices) {
          const amountTolerance = invoice.total * RECONCILIATION_CONFIG.DUPLICATE_AMOUNT_TOLERANCE
          if (Math.abs(txn.amount - invoice.total) <= amountTolerance) {
            amountMatch = true
            matchingInvoice = invoice
            break
          }
        }

        // Check monthly fee match
        const feeMatch = client.monthlyFee &&
          Math.abs(txn.amount - client.monthlyFee) <= (client.monthlyFee * 0.05)

        // Calculate confidence
        let confidence = 0
        if (nameMatch) confidence += 0.5
        if (amountMatch) confidence += 0.35
        if (feeMatch && !amountMatch) confidence += 0.25

        if (confidence > matchConfidence) {
          matchConfidence = confidence
          suggestedClientId = client.id
          suggestedClientName = client.name
          suggestedInvoiceId = matchingInvoice?.id
          suggestedCategory = 'CLIENT_PAYMENT'
        }
      }

      // Determine match status based on confidence
      if (matchConfidence >= RECONCILIATION_CONFIG.AUTO_MATCH_THRESHOLD) {
        matchStatus = 'AUTO_MATCHED'
      } else if (matchConfidence >= RECONCILIATION_CONFIG.SUGGEST_MATCH_THRESHOLD) {
        matchStatus = 'SUGGESTED'
      }
    } else {
      // For debits, categorize based on keywords
      const descLower = txn.description.toLowerCase()

      if (descLower.includes('salary') || descLower.includes('payroll')) {
        suggestedCategory = 'SALARY'
      } else if (descLower.includes('gst') || descLower.includes('tax')) {
        suggestedCategory = 'TAX_PAYMENT'
      } else if (descLower.includes('rent') || descLower.includes('office')) {
        suggestedCategory = 'OFFICE_EXPENSE'
      } else if (descLower.includes('subscription') || descLower.includes('saas')) {
        suggestedCategory = 'TOOLS_SUBSCRIPTION'
      } else {
        suggestedCategory = 'OTHER'
      }
    }

    matched.push({
      ...txn,
      matchStatus,
      matchConfidence,
      suggestedClientId,
      suggestedClientName,
      suggestedInvoiceId,
      suggestedCategory
    })
  }

  return matched
}

/**
 * Main function to parse and match transactions from pasted text
 * Called by the process API route
 */
export async function parseAndMatchTransactions(
  statementId: string,
  rawText: string
): Promise<ParseResult> {
  const errors: string[] = []

  try {
    // Parse the text
    const parsed = parseTransactionText(rawText)

    if (parsed.length === 0) {
      return {
        success: false,
        transactions: [],
        summary: {
          totalTransactions: 0,
          credits: 0,
          debits: 0,
          totalCredits: 0,
          totalDebits: 0,
          autoMatched: 0,
          suggested: 0,
          unmatched: 0
        },
        errors: ['No transactions could be parsed from the provided text. Please check the format.']
      }
    }

    // Match with clients
    const matched = await matchTransactionsWithClients(parsed)

    // Create bank transactions in database
    for (const txn of matched) {
      await prisma.bankTransaction.create({
        data: {
          statementId,
          transactionDate: txn.date,
          description: txn.description,
          reference: txn.reference,
          type: txn.type,
          amount: txn.amount,
          balance: txn.balance,
          matchStatus: txn.matchStatus,
          matchConfidence: txn.matchConfidence,
          clientId: txn.matchStatus === 'AUTO_MATCHED' ? txn.suggestedClientId : undefined,
          category: txn.suggestedCategory,
          aiParsedData: JSON.stringify({
            rawLine: txn.rawLine,
            suggestedClientId: txn.suggestedClientId,
            suggestedClientName: txn.suggestedClientName,
            suggestedInvoiceId: txn.suggestedInvoiceId
          })
        }
      })
    }

    // Calculate summary
    const credits = matched.filter(t => t.type === 'CREDIT')
    const debits = matched.filter(t => t.type === 'DEBIT')

    const summary = {
      totalTransactions: matched.length,
      credits: credits.length,
      debits: debits.length,
      totalCredits: credits.reduce((sum, t) => sum + t.amount, 0),
      totalDebits: debits.reduce((sum, t) => sum + t.amount, 0),
      autoMatched: matched.filter(t => t.matchStatus === 'AUTO_MATCHED').length,
      suggested: matched.filter(t => t.matchStatus === 'SUGGESTED').length,
      unmatched: matched.filter(t => t.matchStatus === 'UNMATCHED').length
    }

    // Update statement with summary
    await prisma.bankStatement.update({
      where: { id: statementId },
      data: {
        status: 'PROCESSED',
        processedAt: new Date(),
        matchedCount: summary.autoMatched,
        unmatchedCount: summary.unmatched + summary.suggested,
        totalCredits: summary.totalCredits,
        totalDebits: summary.totalDebits,
        aiParsingResult: JSON.stringify({
          summary,
          totalTransactions: matched.length,
          processedAt: new Date().toISOString()
        })
      }
    })

    return {
      success: true,
      transactions: matched,
      summary,
      errors
    }
  } catch (error) {
    console.error('Failed to parse transactions:', error)
    return {
      success: false,
      transactions: [],
      summary: {
        totalTransactions: 0,
        credits: 0,
        debits: 0,
        totalCredits: 0,
        totalDebits: 0,
        autoMatched: 0,
        suggested: 0,
        unmatched: 0
      },
      errors: [error instanceof Error ? error.message : 'Unknown error']
    }
  }
}

/**
 * Helper to validate and clean pasted text
 */
export function validateStatementText(text: string): { valid: boolean; message: string } {
  if (!text || text.trim().length === 0) {
    return { valid: false, message: 'Please paste your bank statement data' }
  }

  if (text.length < 50) {
    return { valid: false, message: 'The pasted text seems too short. Please paste the full transaction data.' }
  }

  const lines = text.split('\n').filter(l => l.trim().length > 0)
  if (lines.length < 2) {
    return { valid: false, message: 'Please paste multiple transaction lines, not just one.' }
  }

  // Check if any line contains a date
  const hasDate = lines.some(line => DATE_FORMATS.some(fmt => fmt.test(line)))
  if (!hasDate) {
    return { valid: false, message: 'No valid dates found. Make sure your data includes transaction dates.' }
  }

  return { valid: true, message: 'Data looks valid' }
}

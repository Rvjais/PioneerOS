/**
 * Lazy Loading Utilities for Heavy Components
 *
 * Use these to reduce initial bundle size and RAM usage.
 * Heavy libraries are only loaded when actually needed.
 */

import dynamic from 'next/dynamic'

/**
 * Lazy load chart components (recharts is ~150KB)
 */
export const LazyLineChart = dynamic(
  () => import('recharts').then((mod) => mod.LineChart),
  { ssr: false }
)

export const LazyBarChart = dynamic(
  () => import('recharts').then((mod) => mod.BarChart),
  { ssr: false }
)

export const LazyPieChart = dynamic(
  () => import('recharts').then((mod) => mod.PieChart),
  { ssr: false }
)

export const LazyAreaChart = dynamic(
  () => import('recharts').then((mod) => mod.AreaChart),
  { ssr: false }
)

/**
 * Lazy load PDF generation (jspdf is ~300KB)
 */
export async function generatePDF(
  title: string,
  content: { headers: string[]; data: (string | number)[][] }
) {
  const { default: jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default

  const doc = new jsPDF()
  doc.text(title, 14, 15)

  autoTable(doc, {
    head: [content.headers],
    body: content.data,
    startY: 25,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [59, 130, 246] },
  })

  return doc
}

/**
 * Lazy load Excel generation (xlsx is ~3.5MB!)
 */
export async function generateExcel(
  sheetName: string,
  data: Record<string, unknown>[]
) {
  const XLSX = await import('xlsx')
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  return XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' })
}

/**
 * Lazy load date-fns functions (import only what you need)
 */
export async function formatDate(date: Date, formatStr: string) {
  const { format } = await import('date-fns')
  return format(date, formatStr)
}

export async function parseDate(dateStr: string, formatStr: string) {
  const { parse } = await import('date-fns')
  return parse(dateStr, formatStr, new Date())
}

export async function getRelativeTime(date: Date) {
  const { formatDistanceToNow } = await import('date-fns')
  return formatDistanceToNow(date, { addSuffix: true })
}

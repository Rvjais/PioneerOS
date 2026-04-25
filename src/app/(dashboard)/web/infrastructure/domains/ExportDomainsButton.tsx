'use client'

import { downloadCSV } from '@/client/utils/downloadCSV'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'

interface Domain {
  domainName: string
  registrar: string
  expiryDate: string
  sslStatus: string
  sslExpiryDate: string | null
  autoRenew: boolean
  client: { name: string } | null
}

export function ExportDomainsButton({ domains }: { domains: Domain[] }) {
  return (
    <button
      onClick={() => downloadCSV(domains.map(d => ({
        'Domain Name': d.domainName,
        Client: d.client?.name || '',
        Registrar: d.registrar,
        'Expiry Date': formatDateDDMMYYYY(d.expiryDate),
        'Auto Renew': d.autoRenew ? 'Yes' : 'No',
        'SSL Status': d.sslStatus,
        'SSL Expiry': d.sslExpiryDate ? formatDateDDMMYYYY(d.sslExpiryDate) : '',
      })), 'domains.csv')}
      className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300 hover:bg-white/10 transition"
    >
      Export CSV
    </button>
  )
}

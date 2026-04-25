import { redirect } from 'next/navigation'

// Redirect /crm/leads to /crm (main CRM page has all leads)
export default function LeadsPage() {
  redirect('/crm')
}

import { redirect } from 'next/navigation'

// RFP forms should be sent to leads, not filled internally
// Redirect to the Send RFP page which generates a link for leads to fill
export default function NewRFPPage() {
  redirect('/sales/rfp/send')
}

import { redirect } from 'next/navigation'

// Redirect /hr/leaves (plural) to /hr/leave (singular)
export default function LeavesPage() {
  redirect('/hr/leave')
}

import { redirect } from 'next/navigation'

// Redirect /tools to /internal-tools where the real database-backed tools directory lives
export default function ToolsRedirectPage() {
  redirect('/internal-tools')
}

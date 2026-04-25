import Link from 'next/link'
import { FileQuestion, ArrowLeft } from 'lucide-react'

export default function ProposalNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
        <FileQuestion className="w-8 h-8 text-gray-400" />
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">Proposal Not Found</h2>
      <p className="text-gray-400 mb-6">
        The proposal you&apos;re looking for doesn&apos;t exist or has been deleted.
      </p>
      <Link
        href="/accounts/onboarding"
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Onboarding
      </Link>
    </div>
  )
}

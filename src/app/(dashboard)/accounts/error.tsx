'use client'

function sanitizeErrorMessage(message: string | undefined): string {
  if (!message) return 'An unexpected error occurred'
  // Strip HTML tags and limit length to prevent XSS
  return message.replace(/<[^>]*>/g, '').slice(0, 200)
}

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-6 text-center">
      <div className="text-4xl mb-4">&#9888;&#65039;</div>
      <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
      <p className="text-slate-400 mb-6">{sanitizeErrorMessage(error.message)}</p>
      <button onClick={reset} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">Try Again</button>
    </div>
  )
}

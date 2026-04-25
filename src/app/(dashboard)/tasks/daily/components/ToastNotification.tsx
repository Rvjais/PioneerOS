interface ToastNotificationProps {
  toast: { message: string; type: 'success' | 'error' } | null
}

export function ToastNotification({ toast }: ToastNotificationProps) {
  if (!toast) return null

  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-none ${
      toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white flex items-center gap-2 animate-in slide-in-from-right`}>
      {toast.type === 'success' ? (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      {toast.message}
    </div>
  )
}

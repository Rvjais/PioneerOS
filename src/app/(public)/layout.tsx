import '../globals.css'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="glass-card border-b border-white/10 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
              BP
            </div>
            <div>
              <h1 className="font-semibold text-white">Branding Pioneers</h1>
              <p className="text-xs text-slate-400">Digital Marketing Excellence</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 glass-card px-6 py-4 mt-auto">
        <div className="max-w-4xl mx-auto text-center text-sm text-slate-400">
          &copy; {new Date().getFullYear()} Branding Pioneers. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

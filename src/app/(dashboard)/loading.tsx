export default function Loading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-8 bg-white/10 rounded w-48" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={`skeleton-${i}`} className="h-24 bg-white/5 rounded-xl" />
        ))}
      </div>
      <div className="h-64 bg-white/5 rounded-xl" />
    </div>
  )
}

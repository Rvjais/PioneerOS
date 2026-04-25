interface SectionLabelProps {
  title: string
  type: 'view' | 'action'
  description?: string
}

export default function SectionLabel({ title, type, description }: SectionLabelProps) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
        type === 'action'
          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
          : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
      }`}>
        {type === 'action' ? '✎ Input' : '👁 View Only'}
      </span>
      <h3 className="text-white font-semibold">{title}</h3>
      {description && <span className="text-slate-500 text-sm">— {description}</span>}
    </div>
  )
}

'use client'
import Link from 'next/link'
interface BreadcrumbItem { label: string; href?: string }
export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-slate-400 mb-4">
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center gap-2">
          {i > 0 && <span>/</span>}
          {item.href ? <Link href={item.href} className="hover:text-white transition-colors">{item.label}</Link> : <span className="text-slate-200">{item.label}</span>}
        </span>
      ))}
    </nav>
  )
}

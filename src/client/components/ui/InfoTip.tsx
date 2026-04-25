'use client'
import { useState } from 'react'

interface InfoTipProps {
  text: string
  type?: 'info' | 'action' | 'view'
}

export default function InfoTip({ text, type = 'info' }: InfoTipProps) {
  const [show, setShow] = useState(false)

  const colors = {
    info: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    action: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    view: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
  }

  return (
    <span className="relative inline-flex ml-1.5" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold cursor-help border ${colors[type]}`}>
        {type === 'action' ? '✎' : type === 'view' ? '👁' : 'i'}
      </span>
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-xs text-slate-200 whitespace-nowrap z-50 shadow-xl max-w-xs">
          {type === 'action' && <span className="text-orange-400 font-semibold mr-1">Input:</span>}
          {type === 'view' && <span className="text-slate-500 font-semibold mr-1">View:</span>}
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-slate-800" />
        </span>
      )}
    </span>
  )
}

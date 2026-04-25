'use client'

import { useState } from 'react'
import { formatStatusLabel } from '@/shared/utils/utils'

interface Client {
  id: string
  name: string
  paymentStatus: string
  paymentDueDay: number | null
  bankAccount: string | null
  advanceAmount: number | null
  pendingAmount: number | null
  tier: string
}

interface PaymentStatusProps {
  clients: Client[]
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  PARTIAL: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  OVERDUE: 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]',
}

export function PaymentStatus({ clients }: PaymentStatusProps) {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  if (clients.length === 0) {
    return null
  }

  return (
    <>
      <div className="glass-card rounded-2xl border border-white/5 overflow-hidden relative group">
        <div className="absolute left-1/2 top-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-emerald-500/10 transition-colors -translate-x-1/2"></div>

        <div className="p-6 border-b border-white/5 bg-black/20 flex items-center justify-between relative z-10">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Revenue Matrix
            </h2>
            <p className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider mt-1">Accounts Receivable & Due Streams</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              {clients.filter(c => c.paymentStatus === 'OVERDUE').length} Overdue
            </span>
          </div>
        </div>

        <div className="overflow-x-auto relative z-10 bg-[#141A25]/30">
          <table className="w-full">
            <thead>
              <tr className="bg-black/40 border-b border-white/5 text-left">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Client Alias</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Day</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Routing</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">State Vector</th>
                <th className="text-right px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Retained (₹)</th>
                <th className="text-right px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Outstanding (₹)</th>
                <th className="text-center px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedClient(client)}
                      className="text-sm font-bold text-slate-200 group-hover:text-emerald-400 transition-colors flex items-center gap-2"
                    >
                      {client.name}
                    </button>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1 block px-2 py-0.5 bg-white/5 backdrop-blur-sm border border-white/5 w-fit rounded">
                      {client.tier}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-400">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 font-bold text-slate-300">
                      {client.paymentDueDay || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-400 tracking-wider">
                    {client.bankAccount || <span className="text-slate-300 italic">Unlinked</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${statusColors[client.paymentStatus] || statusColors['PENDING']}`}>
                      {formatStatusLabel(client.paymentStatus)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-300 text-right tracking-tight">
                    {client.advanceAmount ? client.advanceAmount.toLocaleString('en-IN') : '-'}
                  </td>
                  <td className={`px-6 py-4 text-sm font-bold text-right tracking-tight ${client.paymentStatus === 'OVERDUE' ? 'text-red-400' : 'text-slate-300'
                    }`}>
                    {client.pendingAmount ? client.pendingAmount.toLocaleString('en-IN') : '-'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all active:scale-95 whitespace-nowrap">
                      Ping Client
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Details Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="glass-card rounded-2xl w-full max-w-md shadow-2xl border border-white/10 overflow-hidden relative transform transition-all scale-100">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none"></div>

            <div className="p-6 border-b border-white/10 bg-black/40 flex items-center justify-between relative z-10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </span>
                Financial Dossier
              </h3>
              <button
                onClick={() => setSelectedClient(null)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-5 bg-[#141A25]/80 relative z-10">
              <div className="space-y-4 bg-black/30 p-5 rounded-xl border border-white/5">
                <div className="flex justify-between items-center group">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Entity</span>
                  <span className="font-bold text-slate-200">{selectedClient.name}</span>
                </div>
                <div className="flex justify-between items-center group">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Classification</span>
                  <span className="font-bold text-slate-200 text-xs px-2 py-0.5 bg-white/5 backdrop-blur-sm rounded border border-white/10">{selectedClient.tier}</span>
                </div>
                <div className="flex justify-between items-center group">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Routing Number</span>
                  <span className="font-medium text-slate-300 font-mono text-sm tracking-wider">{selectedClient.bankAccount || 'Unregistered'}</span>
                </div>
                <div className="flex justify-between items-center group">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Target Cycle</span>
                  <span className="font-bold text-slate-300">{selectedClient.paymentDueDay ? `Day ${selectedClient.paymentDueDay}` : 'Unscheduled'}</span>
                </div>
              </div>

              <div className="space-y-4 bg-gradient-to-br from-slate-900 to-black p-5 rounded-xl border border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-emerald-500/5 mix-blend-overlay"></div>

                <div className="flex justify-between items-end relative z-10">
                  <span className="text-xs font-semibold text-emerald-400/70 uppercase tracking-widest">Retained Assets</span>
                  <span className="font-black text-xl text-emerald-400 tracking-tight">
                    {selectedClient.advanceAmount ? `₹${selectedClient.advanceAmount.toLocaleString('en-IN')}` : '₹0'}
                  </span>
                </div>

                <div className="flex justify-between items-end relative z-10 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${selectedClient.paymentStatus === 'OVERDUE' ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-amber-500'}`}></span>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Outstanding Debt</span>
                  </div>
                  <span className={`font-black text-2xl tracking-tight ${selectedClient.paymentStatus === 'OVERDUE' ? 'text-red-400' : 'text-amber-400'}`}>
                    {selectedClient.pendingAmount ? `₹${selectedClient.pendingAmount.toLocaleString('en-IN')}` : '₹0'}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold tracking-widest uppercase text-xs rounded-xl transition-all shadow-none shadow-emerald-500/20 border border-emerald-400/20 active:scale-[0.98]">
                  Execute Payment Protocol
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

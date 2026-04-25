'use client'

import { useState, useEffect } from 'react'

interface BankAccount {
  id: string
  bankName: string
  accountName: string
  accountNumber: string
  ifscCode: string | null
  accountType: string
  currency: string
  displayName: string | null
  isPrimary: boolean
}

interface PaymentGateway {
  id: string
  provider: string
  displayName: string | null
  merchantId: string | null
  mode: string
  defaultCurrency: string
  feePercentage: number | null
  isPrimary: boolean
}

interface CompanyEntity {
  id: string
  code: string
  name: string
  tradeName: string | null
  type: string
  country: string
  gstNumber: string | null
  panNumber: string | null
  cinNumber: string | null
  email: string | null
  phone: string | null
  website: string | null
  invoicePrefix: string | null
  city: string | null
  state: string | null
  isPrimary: boolean
  isActive: boolean
  bankAccounts: BankAccount[]
  paymentGateways: PaymentGateway[]
}

const ENTITY_TYPES = ['PVT_LTD', 'LLC', 'LLP', 'PROPRIETORSHIP', 'PARTNERSHIP']
const COUNTRIES = [
  { code: 'IN', name: 'India' },
  { code: 'US', name: 'United States' },
  { code: 'UK', name: 'United Kingdom' },
  { code: 'AE', name: 'UAE' },
  { code: 'SG', name: 'Singapore' },
]
const BANKS = ['HDFC', 'AXIS', 'KOTAK', 'ICICI', 'SBI', 'YES', 'IDFC', 'RBL', 'FEDERAL', 'OTHER']
const GATEWAYS = ['RAZORPAY', 'STRIPE', 'PAYPAL', 'PAYU', 'CASHFREE', 'PHONEPE']

export default function EntitiesPage() {
  const [entities, setEntities] = useState<CompanyEntity[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [addingBankFor, setAddingBankFor] = useState<string | null>(null)
  const [addingGatewayFor, setAddingGatewayFor] = useState<string | null>(null)

  const [newEntity, setNewEntity] = useState({
    code: '',
    name: '',
    tradeName: '',
    type: 'PVT_LTD',
    country: 'IN',
    gstNumber: '',
    panNumber: '',
    cinNumber: '',
    email: '',
    phone: '',
    invoicePrefix: '',
    city: '',
    state: '',
    isPrimary: false,
  })

  const [newBank, setNewBank] = useState({
    bankName: 'HDFC',
    accountName: '',
    accountNumber: '',
    ifscCode: '',
    accountType: 'CURRENT',
    displayName: '',
    isPrimary: false,
  })

  const [newGateway, setNewGateway] = useState({
    provider: 'RAZORPAY',
    displayName: '',
    merchantId: '',
    mode: 'LIVE',
    defaultCurrency: 'INR',
    feePercentage: '',
    isPrimary: false,
  })

  useEffect(() => {
    fetchEntities()
  }, [])

  const fetchEntities = async () => {
    try {
      const res = await fetch('/api/admin/entities')
      if (res.ok) {
        const data = await res.json()
        setEntities(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Failed to fetch entities:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddEntity = async () => {
    if (!newEntity.code || !newEntity.name) return

    try {
      const res = await fetch('/api/admin/entities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntity),
      })

      if (res.ok) {
        const created = await res.json()
        setEntities([...entities, { ...created, bankAccounts: [], paymentGateways: [] }])
        setNewEntity({
          code: '', name: '', tradeName: '', type: 'PVT_LTD', country: 'IN',
          gstNumber: '', panNumber: '', cinNumber: '', email: '', phone: '',
          invoicePrefix: '', city: '', state: '', isPrimary: false,
        })
        setIsAdding(false)
      }
    } catch (error) {
      console.error('Failed to add entity:', error)
    }
  }

  const handleDeleteEntity = async (id: string) => {
    if (!confirm('Delete this entity and all associated bank accounts and payment gateways?')) return

    try {
      const res = await fetch(`/api/admin/entities/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setEntities(entities.filter(e => e.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete entity:', error)
    }
  }

  const handleAddBankAccount = async (entityId: string) => {
    if (!newBank.accountName || !newBank.accountNumber) return

    try {
      const res = await fetch(`/api/admin/entities/${entityId}/bank-accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBank),
      })

      if (res.ok) {
        const created = await res.json()
        setEntities(entities.map(e =>
          e.id === entityId ? { ...e, bankAccounts: [...e.bankAccounts, created] } : e
        ))
        setNewBank({
          bankName: 'HDFC', accountName: '', accountNumber: '', ifscCode: '',
          accountType: 'CURRENT', displayName: '', isPrimary: false,
        })
        setAddingBankFor(null)
      }
    } catch (error) {
      console.error('Failed to add bank account:', error)
    }
  }

  const handleDeleteBankAccount = async (entityId: string, accountId: string) => {
    if (!confirm('Delete this bank account?')) return

    try {
      const res = await fetch(`/api/admin/entities/${entityId}/bank-accounts?accountId=${accountId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setEntities(entities.map(e =>
          e.id === entityId ? { ...e, bankAccounts: e.bankAccounts.filter(b => b.id !== accountId) } : e
        ))
      }
    } catch (error) {
      console.error('Failed to delete bank account:', error)
    }
  }

  const handleAddPaymentGateway = async (entityId: string) => {
    if (!newGateway.provider) return

    try {
      const res = await fetch(`/api/admin/entities/${entityId}/payment-gateways`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGateway),
      })

      if (res.ok) {
        const created = await res.json()
        setEntities(entities.map(e =>
          e.id === entityId ? { ...e, paymentGateways: [...e.paymentGateways, created] } : e
        ))
        setNewGateway({
          provider: 'RAZORPAY', displayName: '', merchantId: '', mode: 'LIVE',
          defaultCurrency: 'INR', feePercentage: '', isPrimary: false,
        })
        setAddingGatewayFor(null)
      }
    } catch (error) {
      console.error('Failed to add payment gateway:', error)
    }
  }

  const handleDeletePaymentGateway = async (entityId: string, gatewayId: string) => {
    if (!confirm('Delete this payment gateway?')) return

    try {
      const res = await fetch(`/api/admin/entities/${entityId}/payment-gateways?gatewayId=${gatewayId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setEntities(entities.map(e =>
          e.id === entityId ? { ...e, paymentGateways: e.paymentGateways.filter(g => g.id !== gatewayId) } : e
        ))
      }
    } catch (error) {
      console.error('Failed to delete payment gateway:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Company Entities</h1>
          <p className="text-sm text-slate-400">Manage legal entities, bank accounts, and payment gateways</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Entity
        </button>
      </div>

      {/* Add Entity Form */}
      {isAdding && (
        <div className="bg-blue-500/10 border border-blue-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-white">Add New Entity</h3>
            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-300">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Entity Code *"
              value={newEntity.code}
              onChange={(e) => setNewEntity({ ...newEntity, code: e.target.value.toUpperCase().replace(/\s/g, '_') })}
              className="px-3 py-2 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Legal Name *"
              value={newEntity.name}
              onChange={(e) => setNewEntity({ ...newEntity, name: e.target.value })}
              className="px-3 py-2 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Trade Name"
              value={newEntity.tradeName}
              onChange={(e) => setNewEntity({ ...newEntity, tradeName: e.target.value })}
              className="px-3 py-2 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={newEntity.type}
              onChange={(e) => setNewEntity({ ...newEntity, type: e.target.value })}
              className="px-3 py-2 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ENTITY_TYPES.map(t => (
                <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-5 gap-3">
            <select
              value={newEntity.country}
              onChange={(e) => setNewEntity({ ...newEntity, country: e.target.value })}
              className="px-3 py-2 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {COUNTRIES.map(c => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="GST Number"
              value={newEntity.gstNumber}
              onChange={(e) => setNewEntity({ ...newEntity, gstNumber: e.target.value })}
              className="px-3 py-2 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="PAN Number"
              value={newEntity.panNumber}
              onChange={(e) => setNewEntity({ ...newEntity, panNumber: e.target.value.toUpperCase() })}
              className="px-3 py-2 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="CIN Number"
              value={newEntity.cinNumber}
              onChange={(e) => setNewEntity({ ...newEntity, cinNumber: e.target.value })}
              className="px-3 py-2 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Invoice Prefix"
              value={newEntity.invoicePrefix}
              onChange={(e) => setNewEntity({ ...newEntity, invoicePrefix: e.target.value.toUpperCase() })}
              className="px-3 py-2 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-5 gap-3">
            <input
              type="email"
              placeholder="Email"
              value={newEntity.email}
              onChange={(e) => setNewEntity({ ...newEntity, email: e.target.value })}
              className="px-3 py-2 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={newEntity.phone}
              onChange={(e) => setNewEntity({ ...newEntity, phone: e.target.value })}
              className="px-3 py-2 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="City"
              value={newEntity.city}
              onChange={(e) => setNewEntity({ ...newEntity, city: e.target.value })}
              className="px-3 py-2 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="State"
              value={newEntity.state}
              onChange={(e) => setNewEntity({ ...newEntity, state: e.target.value })}
              className="px-3 py-2 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newEntity.isPrimary}
                  onChange={(e) => setNewEntity({ ...newEntity, isPrimary: e.target.checked })}
                  className="rounded border-white/20"
                />
                <span className="text-sm text-slate-300">Primary</span>
              </label>
              <button
                onClick={handleAddEntity}
                disabled={!newEntity.code || !newEntity.name}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-white/20 disabled:cursor-not-allowed transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Entities List */}
      <div className="space-y-4">
        {entities.length === 0 ? (
          <div className="glass-card rounded-lg border border-white/10 p-12 text-center text-slate-400">
            No entities found. Add your first company entity to get started.
          </div>
        ) : (
          entities.map((entity) => (
            <div key={entity.id} className="glass-card rounded-lg border border-white/10 overflow-hidden">
              {/* Entity Header */}
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-900/40"
                onClick={() => setExpandedId(expandedId === entity.id ? null : entity.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                    entity.isPrimary ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800/50 text-slate-300'
                  }`}>
                    {entity.code.substring(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-white">{entity.name}</h3>
                      {entity.isPrimary && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-500/20 text-blue-400">Primary</span>
                      )}
                      <span className="px-2 py-0.5 text-xs font-medium rounded bg-slate-800/50 text-slate-300">
                        {entity.type.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">
                      {entity.code} | {COUNTRIES.find(c => c.code === entity.country)?.name}
                      {entity.gstNumber && ` | GST: ${entity.gstNumber}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-sm">
                    <p className="text-slate-300">{entity.bankAccounts.length} bank accounts</p>
                    <p className="text-slate-400">{entity.paymentGateways.length} gateways</p>
                  </div>
                  <svg className={`w-5 h-5 text-slate-400 transition-transform ${expandedId === entity.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedId === entity.id && (
                <div className="border-t border-white/10 p-4 space-y-4">
                  {/* Bank Accounts */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-slate-200">Bank Accounts</h4>
                      <button
                        onClick={() => setAddingBankFor(addingBankFor === entity.id ? null : entity.id)}
                        className="text-sm text-blue-400 hover:text-blue-400"
                      >
                        {addingBankFor === entity.id ? 'Cancel' : '+ Add Bank'}
                      </button>
                    </div>

                    {addingBankFor === entity.id && (
                      <div className="bg-slate-900/40 rounded-lg p-3 mb-3 grid grid-cols-6 gap-2">
                        <select
                          value={newBank.bankName}
                          onChange={(e) => setNewBank({ ...newBank, bankName: e.target.value })}
                          className="px-2 py-1.5 text-sm border border-white/20 rounded"
                        >
                          {BANKS.map(b => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Account Name"
                          value={newBank.accountName}
                          onChange={(e) => setNewBank({ ...newBank, accountName: e.target.value })}
                          className="px-2 py-1.5 text-sm border border-white/20 rounded"
                        />
                        <input
                          type="text"
                          placeholder="Account Number"
                          value={newBank.accountNumber}
                          onChange={(e) => setNewBank({ ...newBank, accountNumber: e.target.value })}
                          className="px-2 py-1.5 text-sm border border-white/20 rounded"
                        />
                        <input
                          type="text"
                          placeholder="IFSC Code"
                          value={newBank.ifscCode}
                          onChange={(e) => setNewBank({ ...newBank, ifscCode: e.target.value.toUpperCase() })}
                          className="px-2 py-1.5 text-sm border border-white/20 rounded"
                        />
                        <input
                          type="text"
                          placeholder="Display Name"
                          value={newBank.displayName}
                          onChange={(e) => setNewBank({ ...newBank, displayName: e.target.value })}
                          className="px-2 py-1.5 text-sm border border-white/20 rounded"
                        />
                        <button
                          onClick={() => handleAddBankAccount(entity.id)}
                          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          Add
                        </button>
                      </div>
                    )}

                    {entity.bankAccounts.length === 0 ? (
                      <p className="text-sm text-slate-400">No bank accounts added</p>
                    ) : (
                      <div className="space-y-2">
                        {entity.bankAccounts.map((bank) => (
                          <div key={bank.id} className="flex items-center justify-between bg-slate-900/40 rounded-lg px-3 py-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-green-500/20 text-green-400 flex items-center justify-center text-xs font-bold">
                                {bank.bankName.substring(0, 2)}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-200">
                                  {bank.displayName || bank.bankName}
                                  {bank.isPrimary && <span className="ml-2 text-xs text-green-400">(Primary)</span>}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {'****' + bank.accountNumber.slice(-4)} | {bank.ifscCode || 'No IFSC'}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteBankAccount(entity.id, bank.id)}
                              className="p-1 text-slate-400 hover:text-red-400"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Payment Gateways */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-slate-200">Payment Gateways</h4>
                      <button
                        onClick={() => setAddingGatewayFor(addingGatewayFor === entity.id ? null : entity.id)}
                        className="text-sm text-blue-400 hover:text-blue-400"
                      >
                        {addingGatewayFor === entity.id ? 'Cancel' : '+ Add Gateway'}
                      </button>
                    </div>

                    {addingGatewayFor === entity.id && (
                      <div className="bg-slate-900/40 rounded-lg p-3 mb-3 grid grid-cols-6 gap-2">
                        <select
                          value={newGateway.provider}
                          onChange={(e) => setNewGateway({ ...newGateway, provider: e.target.value })}
                          className="px-2 py-1.5 text-sm border border-white/20 rounded"
                        >
                          {GATEWAYS.map(g => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Display Name"
                          value={newGateway.displayName}
                          onChange={(e) => setNewGateway({ ...newGateway, displayName: e.target.value })}
                          className="px-2 py-1.5 text-sm border border-white/20 rounded"
                        />
                        <input
                          type="text"
                          placeholder="Merchant ID"
                          value={newGateway.merchantId}
                          onChange={(e) => setNewGateway({ ...newGateway, merchantId: e.target.value })}
                          className="px-2 py-1.5 text-sm border border-white/20 rounded"
                        />
                        <select
                          value={newGateway.mode}
                          onChange={(e) => setNewGateway({ ...newGateway, mode: e.target.value })}
                          className="px-2 py-1.5 text-sm border border-white/20 rounded"
                        >
                          <option value="LIVE">LIVE</option>
                          <option value="TEST">TEST</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Fee %"
                          value={newGateway.feePercentage}
                          onChange={(e) => setNewGateway({ ...newGateway, feePercentage: e.target.value })}
                          className="px-2 py-1.5 text-sm border border-white/20 rounded"
                        />
                        <button
                          onClick={() => handleAddPaymentGateway(entity.id)}
                          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          Add
                        </button>
                      </div>
                    )}

                    {entity.paymentGateways.length === 0 ? (
                      <p className="text-sm text-slate-400">No payment gateways added</p>
                    ) : (
                      <div className="space-y-2">
                        {entity.paymentGateways.map((gateway) => (
                          <div key={gateway.id} className="flex items-center justify-between bg-slate-900/40 rounded-lg px-3 py-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">
                                {gateway.provider.substring(0, 2)}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-200">
                                  {gateway.displayName || gateway.provider}
                                  {gateway.isPrimary && <span className="ml-2 text-xs text-purple-400">(Primary)</span>}
                                  <span className={`ml-2 text-xs ${gateway.mode === 'LIVE' ? 'text-green-400' : 'text-amber-400'}`}>
                                    ({gateway.mode})
                                  </span>
                                </p>
                                <p className="text-xs text-slate-400">
                                  {gateway.merchantId ? '****' + gateway.merchantId.slice(-4) : 'No Merchant ID'} | {gateway.defaultCurrency}
                                  {gateway.feePercentage && ` | ${gateway.feePercentage}% fee`}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeletePaymentGateway(entity.id, gateway.id)}
                              className="p-1 text-slate-400 hover:text-red-400"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Delete Entity */}
                  <div className="pt-3 border-t border-white/10 flex justify-end">
                    <button
                      onClick={() => handleDeleteEntity(entity.id)}
                      className="px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg"
                    >
                      Delete Entity
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { ProfileData, getServiceLabel, formatDate } from './types'

interface CompanyInfoSectionProps {
  client: ProfileData['client']
  isPrimaryUser: boolean
  onCompanySaved: () => void
}

export default function CompanyInfoSection({ client, isPrimaryUser, onCompanySaved }: CompanyInfoSectionProps) {
  const [showCompanyEdit, setShowCompanyEdit] = useState(false)
  const [companyForm, setCompanyForm] = useState({
    name: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    whatsapp: '',
    websiteUrl: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gstNumber: '',
    businessType: '',
    industry: '',
  })
  const [savingCompany, setSavingCompany] = useState(false)
  const [companySuccess, setCompanySuccess] = useState(false)

  useEffect(() => {
    if (client) {
      setCompanyForm({
        name: client.name || '',
        contactName: client.contactName || '',
        contactEmail: client.contactEmail || '',
        contactPhone: client.contactPhone || '',
        whatsapp: client.whatsapp || '',
        websiteUrl: client.websiteUrl || '',
        address: client.address || '',
        city: client.city || '',
        state: client.state || '',
        pincode: client.pincode || '',
        gstNumber: client.gstNumber || '',
        businessType: client.businessType || '',
        industry: client.industry || '',
      })
    }
  }, [client])

  const handleSaveCompany = async () => {
    setSavingCompany(true)
    setCompanySuccess(false)
    try {
      const res = await fetch('/api/client-portal/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyForm),
      })
      if (res.ok) {
        setCompanySuccess(true)
        setShowCompanyEdit(false)
        onCompanySaved()
        setTimeout(() => setCompanySuccess(false), 3000)
      }
    } catch (error) {
      console.error('Failed to save company info:', error)
    } finally {
      setSavingCompany(false)
    }
  }

  return (
    <div className="glass-card rounded-xl shadow-none border border-white/10 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Company Information</h3>
        {isPrimaryUser && !showCompanyEdit && (
          <button
            onClick={() => setShowCompanyEdit(true)}
            className="text-sm text-blue-400 hover:underline flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
        )}
      </div>

      {companySuccess && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-200 rounded-lg flex items-center gap-2 text-green-400 text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Company information updated successfully!
        </div>
      )}

      {showCompanyEdit ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Company Name</label>
              <input
                type="text"
                value={companyForm.name}
                onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Industry</label>
              <input
                type="text"
                value={companyForm.industry}
                onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Contact Person</label>
              <input
                type="text"
                value={companyForm.contactName}
                onChange={(e) => setCompanyForm({ ...companyForm, contactName: e.target.value })}
                className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Business Type</label>
              <input
                type="text"
                value={companyForm.businessType}
                onChange={(e) => setCompanyForm({ ...companyForm, businessType: e.target.value })}
                className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Email</label>
              <input
                type="email"
                value={companyForm.contactEmail}
                onChange={(e) => setCompanyForm({ ...companyForm, contactEmail: e.target.value })}
                className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Phone</label>
              <input
                type="tel"
                value={companyForm.contactPhone}
                onChange={(e) => setCompanyForm({ ...companyForm, contactPhone: e.target.value })}
                className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">WhatsApp</label>
              <input
                type="tel"
                value={companyForm.whatsapp}
                onChange={(e) => setCompanyForm({ ...companyForm, whatsapp: e.target.value })}
                className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Website</label>
              <input
                type="url"
                value={companyForm.websiteUrl}
                onChange={(e) => setCompanyForm({ ...companyForm, websiteUrl: e.target.value })}
                className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Address</label>
            <input
              type="text"
              value={companyForm.address}
              onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
              className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">City</label>
              <input
                type="text"
                value={companyForm.city}
                onChange={(e) => setCompanyForm({ ...companyForm, city: e.target.value })}
                className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">State</label>
              <input
                type="text"
                value={companyForm.state}
                onChange={(e) => setCompanyForm({ ...companyForm, state: e.target.value })}
                className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Pincode</label>
              <input
                type="text"
                value={companyForm.pincode}
                onChange={(e) => setCompanyForm({ ...companyForm, pincode: e.target.value })}
                className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">GST Number</label>
            <input
              type="text"
              value={companyForm.gstNumber}
              onChange={(e) => setCompanyForm({ ...companyForm, gstNumber: e.target.value })}
              className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowCompanyEdit(false)}
              className="px-4 py-2 text-sm font-medium text-slate-200 bg-slate-800/50 rounded-lg hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveCompany}
              disabled={savingCompany || !companyForm.name.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {savingCompany && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              Save Changes
            </button>
          </div>
        </div>
      ) : (
      <div className="space-y-4">
        {client.contactName && (
          <div>
            <p className="text-sm text-slate-400">Contact Person</p>
            <p className="font-medium text-white">{client.contactName}</p>
          </div>
        )}
        {client.contactEmail && (
          <div>
            <p className="text-sm text-slate-400">Email</p>
            <p className="font-medium text-white">{client.contactEmail}</p>
          </div>
        )}
        {client.contactPhone && (
          <div>
            <p className="text-sm text-slate-400">Phone</p>
            <p className="font-medium text-white">{client.contactPhone}</p>
          </div>
        )}
        {client.websiteUrl && (
          <div>
            <p className="text-sm text-slate-400">Website</p>
            <a
              href={client.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-400 hover:underline"
            >
              {client.websiteUrl}
            </a>
          </div>
        )}
        {(client.address || client.city || client.state) && (
          <div>
            <p className="text-sm text-slate-400">Address</p>
            <p className="font-medium text-white">
              {[client.address, client.city, client.state, client.pincode].filter(Boolean).join(', ')}
            </p>
          </div>
        )}
        {client.gstNumber && (
          <div>
            <p className="text-sm text-slate-400">GST Number</p>
            <p className="font-medium text-white">{client.gstNumber}</p>
          </div>
        )}
        {client.businessType && (
          <div>
            <p className="text-sm text-slate-400">Business Type</p>
            <p className="font-medium text-white">{client.businessType}</p>
          </div>
        )}
        {client.services.length > 0 && (
          <div>
            <p className="text-sm text-slate-400">Active Services</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {client.services.map((service) => (
                <span
                  key={getServiceLabel(service)}
                  className="px-2 py-1 text-xs font-medium rounded bg-blue-500/20 text-blue-400"
                >
                  {getServiceLabel(service)}
                </span>
              ))}
            </div>
          </div>
        )}
        {client.startDate && (
          <div>
            <p className="text-sm text-slate-400">Client Since</p>
            <p className="font-medium text-white">{formatDate(client.startDate)}</p>
          </div>
        )}
      </div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { toast } from 'sonner'
import Link from 'next/link'
import {
  DEVICE_REQUEST_TYPES,
  DEVICE_REQUEST_REASONS,
  DEVICE_RETURN_REASONS,
  ASSET_CONDITIONS,
  ASSET_BRANDS,
  getLabelForValue,
} from '@/shared/constants/formConstants'

interface Device {
  id: string
  type: string
  brand: string
  model: string
  serialNumber: string
  assetTag: string
  condition: string
  allocatedTo?: string
  allocatedDate?: string
  notes?: string
}

interface AllocationRequest {
  deviceType: string
  reason: string
  urgency: 'low' | 'medium' | 'high'
  preferredBrand?: string
  additionalNotes?: string
}

// Use centralized device types with icon mapping
const deviceTypeIcons: Record<string, string> = {
  LAPTOP: 'laptop',
  DESKTOP: 'laptop',
  MONITOR: 'monitor',
  KEYBOARD: 'keyboard',
  MOUSE: 'mouse',
  HEADSET: 'headset',
  WEBCAM: 'camera',
  PHONE: 'mobile',
  CHARGER: 'box',
  OTHER: 'box',
}

const renderDeviceIcon = (iconType: string, className: string = "w-6 h-6") => {
  switch (iconType) {
    case 'laptop':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
    case 'monitor':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
    case 'keyboard':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2zm2 4h.01M8 10h.01M10 10h.01M12 10h.01M14 10h.01M8 13h8" /></svg>
    case 'mouse':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
    case 'headset':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
    case 'camera':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    case 'mobile':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
    case 'box':
    default:
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
  }
}

export default function DeviceAllocationPage() {
  const [activeTab, setActiveTab] = useState<'my-devices' | 'request' | 'return'>('my-devices')
  const [allocatedDevices, setAllocatedDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [request, setRequest] = useState<AllocationRequest>({
    deviceType: '',
    reason: '',
    urgency: 'medium',
    preferredBrand: '',
    additionalNotes: '',
  })
  const [returnDevice, setReturnDevice] = useState({
    deviceId: '',
    reason: '',
    condition: 'GOOD',
    notes: '',
  })

  useEffect(() => {
    fetchMyDevices()
  }, [])

  const fetchMyDevices = async () => {
    try {
      const res = await fetch('/api/hr/devices/my')
      if (res.ok) {
        const data = await res.json()
        setAllocatedDevices(data)
      }
    } catch (error) {
      console.error('Failed to fetch devices:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch('/api/hr/devices/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      })

      if (res.ok) {
        toast.success('Device request submitted successfully! HR will review and process your request.')
        setRequest({ deviceType: '', reason: '', urgency: 'medium', preferredBrand: '', additionalNotes: '' })
      } else {
        toast.error('Failed to submit request. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting request:', error)
      toast.error('Failed to submit request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch('/api/hr/devices/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(returnDevice)
      })

      if (res.ok) {
        toast.success('Device return request submitted! Please coordinate with HR for handover.')
        setReturnDevice({ deviceId: '', reason: '', condition: 'good', notes: '' })
        fetchMyDevices()
      } else {
        toast.error('Failed to submit return request. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting return:', error)
      toast.error('Failed to submit return request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link href="/hr" className="text-sm text-blue-400 hover:underline mb-2 inline-block">
          &larr; Back to HR
        </Link>
        <h1 className="text-2xl font-bold text-white">Device Allocation</h1>
        <p className="text-slate-400">Manage your allocated devices and request new equipment</p>
      </div>

      {/* Tabs */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('my-devices')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'my-devices'
                ? 'bg-blue-500/10 text-blue-400 border-b-2 border-blue-600'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            My Devices
          </button>
          <button
            onClick={() => setActiveTab('request')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'request'
                ? 'bg-blue-500/10 text-blue-400 border-b-2 border-blue-600'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Request Device
          </button>
          <button
            onClick={() => setActiveTab('return')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'return'
                ? 'bg-blue-500/10 text-blue-400 border-b-2 border-blue-600'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Return Device
          </button>
        </div>

        {/* My Devices */}
        {activeTab === 'my-devices' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white">Currently Allocated Devices</h2>
              <span className="text-sm text-slate-400">{allocatedDevices.length} devices</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : allocatedDevices.length > 0 ? (
              <div className="space-y-4">
                {allocatedDevices.map((device) => {
                  const iconType = deviceTypeIcons[device.type] || 'box'
                  return (
                    <div
                      key={device.id}
                      className="flex items-center gap-4 p-4 bg-slate-900/40 rounded-lg"
                    >
                      <div className="w-12 h-12 glass-card rounded-lg flex items-center justify-center border border-white/10 text-slate-300">
                        {renderDeviceIcon(iconType, "w-6 h-6")}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-white">{device.brand} {device.model}</h3>
                          <span className={`px-2 py-0.5 text-xs rounded ${
                            device.condition === 'new' ? 'bg-green-500/20 text-green-400' :
                            device.condition === 'good' ? 'bg-blue-500/20 text-blue-400' :
                            device.condition === 'fair' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {device.condition.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                          <span>Asset: {device.assetTag}</span>
                          <span>S/N: {device.serialNumber}</span>
                          {device.allocatedDate && <span>Since: {formatDateDDMMYYYY(device.allocatedDate)}</span>}
                        </div>
                      </div>
                      <button className="px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10 rounded transition-colors">
                        Report Issue
                      </button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-medium text-white mb-1">No Devices Allocated</h3>
                <p className="text-sm text-slate-400 mb-4">
                  You don&apos;t have any devices allocated yet.
                </p>
                <button
                  onClick={() => setActiveTab('request')}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                >
                  Request a Device
                </button>
              </div>
            )}

            <div className="mt-6 p-4 bg-amber-500/10 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Important:</strong> All devices remain the property of the company.
                You are responsible for maintaining devices in good condition and returning them upon separation.
              </p>
            </div>
          </div>
        )}

        {/* Request Device */}
        {activeTab === 'request' && (
          <form onSubmit={handleRequestSubmit} className="p-6 space-y-6">
            <h2 className="font-semibold text-white mb-4">Request New Device</h2>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Device Type *
              </label>
              <div className="grid grid-cols-4 gap-3">
                {DEVICE_REQUEST_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setRequest(prev => ({ ...prev, deviceType: type.value }))}
                    className={`p-3 rounded-lg border-2 text-center transition-colors ${
                      request.deviceType === type.value
                        ? 'border-blue-600 bg-blue-500/10'
                        : 'border-white/10 hover:border-blue-300'
                    }`}
                  >
                    <span className="flex justify-center mb-1 text-slate-300">{renderDeviceIcon(deviceTypeIcons[type.value] || 'box', "w-6 h-6")}</span>
                    <span className="text-xs text-slate-300">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Reason for Request *
              </label>
              <select
                value={request.reason}
                onChange={(e) => setRequest(prev => ({ ...prev, reason: e.target.value }))}
                className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                required
              >
                <option value="">Select a reason</option>
                {DEVICE_REQUEST_REASONS.map((reason) => (
                  <option key={reason.value} value={reason.value}>
                    {reason.label} - {reason.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Urgency Level
              </label>
              <div className="flex gap-3">
                {(['low', 'medium', 'high'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setRequest(prev => ({ ...prev, urgency: level }))}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 text-sm font-medium transition-colors ${
                      request.urgency === level
                        ? level === 'high' ? 'border-red-600 bg-red-500/10 text-red-400' :
                          level === 'medium' ? 'border-amber-600 bg-amber-500/10 text-amber-400' :
                          'border-green-600 bg-green-500/10 text-green-400'
                        : 'border-white/10 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Preferred Brand (Optional)
              </label>
              <select
                value={request.preferredBrand}
                onChange={(e) => setRequest(prev => ({ ...prev, preferredBrand: e.target.value }))}
                className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              >
                <option value="">No preference</option>
                {ASSET_BRANDS.map((brand) => (
                  <option key={brand.value} value={brand.value}>{brand.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Additional Notes
              </label>
              <textarea
                value={request.additionalNotes}
                onChange={(e) => setRequest(prev => ({ ...prev, additionalNotes: e.target.value }))}
                placeholder="Any specific requirements or specifications..."
                rows={3}
                className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !request.deviceType || !request.reason}
              className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-white/20 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        )}

        {/* Return Device */}
        {activeTab === 'return' && (
          <form onSubmit={handleReturnSubmit} className="p-6 space-y-6">
            <h2 className="font-semibold text-white mb-4">Return Device</h2>

            {allocatedDevices.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400">You have no devices to return.</p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Select Device to Return *
                  </label>
                  <select
                    value={returnDevice.deviceId}
                    onChange={(e) => setReturnDevice(prev => ({ ...prev, deviceId: e.target.value }))}
                    className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a device</option>
                    {allocatedDevices.map((device) => (
                      <option key={device.id} value={device.id}>
                        {device.brand} {device.model} ({device.assetTag})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Reason for Return *
                  </label>
                  <select
                    value={returnDevice.reason}
                    onChange={(e) => setReturnDevice(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    required
                  >
                    <option value="">Select a reason</option>
                    {DEVICE_RETURN_REASONS.map((reason) => (
                      <option key={reason.value} value={reason.value}>{reason.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Current Condition *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ASSET_CONDITIONS.map((condition) => (
                      <button
                        key={condition.value}
                        type="button"
                        onClick={() => setReturnDevice(prev => ({ ...prev, condition: condition.value }))}
                        className={`py-2 px-4 rounded-lg border-2 text-sm font-medium transition-colors ${
                          returnDevice.condition === condition.value
                            ? 'border-blue-600 bg-blue-500/10 text-blue-400'
                            : 'border-white/10 text-slate-300 hover:border-white/20'
                        }`}
                      >
                        {condition.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={returnDevice.notes}
                    onChange={(e) => setReturnDevice(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any damage, missing accessories, or other notes..."
                    rows={3}
                    className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Return Process</h4>
                  <ol className="text-sm text-blue-400 space-y-1 list-decimal list-inside">
                    <li>Submit this return request</li>
                    <li>HR will schedule a handover appointment</li>
                    <li>Bring all accessories (charger, cables, box if available)</li>
                    <li>Device will be inspected and you&apos;ll receive confirmation</li>
                  </ol>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !returnDevice.deviceId || !returnDevice.reason}
                  className="w-full py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:bg-white/20 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Return Request'}
                </button>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'

interface Asset {
    id: string
    assetTag: string
    name: string
    type: string
    brand: string | null
    model: string | null
    serialNumber: string | null
    purchasePrice: number | null
    condition: string
    status: string
    assignedTo?: {
        id: string
        firstName: string
        lastName: string | null
        department: string
    } | null
}

// Prefilled dropdown options
const ASSET_TYPES = [
    'LAPTOP',
    'MONITOR',
    'KEYBOARD',
    'MOUSE',
    'HEADSET',
    'PHONE',
    'WEBCAM',
    'CHARGER',
    'HDD',
    'OTHER',
]

const BRANDS = [
    'Apple',
    'Dell',
    'HP',
    'Lenovo',
    'Asus',
    'Acer',
    'Samsung',
    'LG',
    'Logitech',
    'Microsoft',
    'Realme',
    'boAt',
    'Other',
]

const CONDITIONS = [
    { value: 'NEW', label: 'New', color: 'bg-emerald-500/20 text-emerald-400' },
    { value: 'GOOD', label: 'Good', color: 'bg-blue-500/20 text-blue-400' },
    { value: 'FAIR', label: 'Fair', color: 'bg-amber-500/20 text-amber-400' },
    { value: 'POOR', label: 'Poor', color: 'bg-orange-500/20 text-orange-400' },
    { value: 'DAMAGED', label: 'Damaged', color: 'bg-red-500/20 text-red-400' },
]

const STATUSES = [
    { value: 'AVAILABLE', label: 'Available', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-200' },
    { value: 'ASSIGNED', label: 'Assigned', color: 'bg-blue-500/20 text-blue-400 border-blue-200' },
    { value: 'MAINTENANCE', label: 'Maintenance', color: 'bg-amber-500/20 text-amber-400 border-amber-200' },
    { value: 'RETIRED', label: 'Retired', color: 'bg-slate-800/50 text-slate-200 border-white/10' },
]

interface AssetSheetProps {
    initialAssets: Asset[]
}

export function AssetSheet({ initialAssets }: AssetSheetProps) {
    const [assets, setAssets] = useState<Asset[]>(initialAssets)
    const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null)
    const [isAdding, setIsAdding] = useState(false)
    const [newAsset, setNewAsset] = useState<Partial<Asset>>({
        condition: 'GOOD',
        status: 'AVAILABLE',
    })

    const handleCellEdit = async (id: string, field: string, value: string | number | null) => {
        // Optimistic update
        setAssets(prev =>
            prev.map(a => (a.id === id ? { ...a, [field]: value } : a))
        )
        setEditingCell(null)

        try {
            await fetch(`/api/assets/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [field]: value }),
            })
        } catch (error) {
            console.error('Failed to update:', error)
        }
    }

    const handleAddAsset = async () => {
        if (!newAsset.name || !newAsset.type) {
            return
        }

        try {
            const res = await fetch('/api/assets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAsset),
            })

            if (res.ok) {
                const asset = await res.json()
                setAssets(prev => [{ ...asset, assignedTo: null }, ...prev])
                setNewAsset({ condition: 'GOOD', status: 'AVAILABLE' })
                setIsAdding(false)
            }
        } catch (error) {
            console.error('Failed to add asset:', error)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this asset?')) return

        try {
            const res = await fetch(`/api/assets/${id}`, { method: 'DELETE' })
            if (res.ok) {
                setAssets(prev => prev.filter(a => a.id !== id))
            }
        } catch (error) {
            console.error('Failed to delete:', error)
        }
    }

    const renderCell = (asset: Asset, field: keyof Asset) => {
        const isEditing = editingCell?.id === asset.id && editingCell?.field === field
        const value = asset[field]

        // Handle assignedTo specially (it's an object)
        if (field === 'assignedTo') {
            const assignee = asset.assignedTo
            return (
                <span className="text-xs text-slate-300">
                    {assignee ? `${assignee.firstName} ${assignee.lastName || ''}`.trim() : '-'}
                </span>
            )
        }

        // Type dropdown
        if (field === 'type') {
            if (isEditing) {
                return (
                    <select
                        autoFocus
                        className="w-full px-2 py-1 text-xs border border-blue-300 rounded focus:outline-none"
                        value={value as string}
                        onChange={(e) => handleCellEdit(asset.id, field, e.target.value)}
                        onBlur={() => setEditingCell(null)}
                    >
                        {ASSET_TYPES.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                )
            }
            return (
                <span
                    className="text-xs text-slate-200 cursor-pointer hover:bg-slate-800/50 px-1 py-0.5 rounded"
                    onClick={() => setEditingCell({ id: asset.id, field })}
                >
                    {String(value ?? '-')}
                </span>
            )
        }

        // Brand dropdown
        if (field === 'brand') {
            if (isEditing) {
                return (
                    <select
                        autoFocus
                        className="w-full px-2 py-1 text-xs border border-blue-300 rounded focus:outline-none"
                        value={(value as string) || ''}
                        onChange={(e) => handleCellEdit(asset.id, field, e.target.value || null)}
                        onBlur={() => setEditingCell(null)}
                    >
                        <option value="">Select...</option>
                        {BRANDS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                )
            }
            return (
                <span
                    className="text-xs text-slate-300 cursor-pointer hover:bg-slate-800/50 px-1 py-0.5 rounded"
                    onClick={() => setEditingCell({ id: asset.id, field })}
                >
                    {String(value ?? '-')}
                </span>
            )
        }

        // Condition dropdown
        if (field === 'condition') {
            const condOption = CONDITIONS.find(c => c.value === value)
            if (isEditing) {
                return (
                    <select
                        autoFocus
                        className="w-full px-2 py-1 text-xs border border-blue-300 rounded focus:outline-none"
                        value={value as string}
                        onChange={(e) => handleCellEdit(asset.id, field, e.target.value)}
                        onBlur={() => setEditingCell(null)}
                    >
                        {CONDITIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                )
            }
            return (
                <span
                    className={`px-2 py-0.5 rounded text-xs cursor-pointer ${condOption?.color}`}
                    onClick={() => setEditingCell({ id: asset.id, field })}
                >
                    {condOption?.label || String(value)}
                </span>
            )
        }

        // Status dropdown
        if (field === 'status') {
            const statusOption = STATUSES.find(s => s.value === value)
            if (isEditing) {
                return (
                    <select
                        autoFocus
                        className="w-full px-2 py-1 text-xs border border-blue-300 rounded focus:outline-none"
                        value={value as string}
                        onChange={(e) => handleCellEdit(asset.id, field, e.target.value)}
                        onBlur={() => setEditingCell(null)}
                    >
                        {STATUSES.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                )
            }
            return (
                <span
                    className={`px-2 py-0.5 rounded text-xs font-medium border cursor-pointer ${statusOption?.color}`}
                    onClick={() => setEditingCell({ id: asset.id, field })}
                >
                    {statusOption?.label || String(value)}
                </span>
            )
        }

        // Purchase price
        if (field === 'purchasePrice') {
            if (isEditing) {
                return (
                    <input
                        type="number"
                        autoFocus
                        className="w-20 px-2 py-1 text-xs border border-blue-300 rounded focus:outline-none"
                        defaultValue={value !== null ? String(value) : ''}
                        onBlur={(e) => handleCellEdit(asset.id, field, e.target.value ? parseFloat(e.target.value) : null)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleCellEdit(asset.id, field, (e.target as HTMLInputElement).value ? parseFloat((e.target as HTMLInputElement).value) : null)
                            } else if (e.key === 'Escape') {
                                setEditingCell(null)
                            }
                        }}
                    />
                )
            }
            return (
                <span
                    className="text-xs text-slate-300 cursor-pointer hover:bg-slate-800/50 px-1 py-0.5 rounded"
                    onClick={() => setEditingCell({ id: asset.id, field })}
                >
                    {value !== null ? `₹${(value as number).toLocaleString()}` : '-'}
                </span>
            )
        }

        // Default text input
        if (isEditing) {
            return (
                <input
                    type="text"
                    autoFocus
                    className="w-full px-2 py-1 text-xs border border-blue-300 rounded focus:outline-none"
                    defaultValue={(value as string) || ''}
                    onBlur={(e) => handleCellEdit(asset.id, field, e.target.value || null)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleCellEdit(asset.id, field, (e.target as HTMLInputElement).value || null)
                        } else if (e.key === 'Escape') {
                            setEditingCell(null)
                        }
                    }}
                />
            )
        }

        const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value ?? '-')
        return (
            <span
                className="text-xs text-slate-200 cursor-pointer hover:bg-slate-800/50 px-1 py-0.5 rounded block truncate"
                onClick={() => setEditingCell({ id: asset.id, field })}
                title={displayValue}
            >
                {displayValue}
            </span>
        )
    }

    return (
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">{assets.length} assets</span>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Asset
                </button>
            </div>

            {/* Sheet/Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-slate-900/40 sticky top-0">
                        <tr>
                            <th className="text-left px-3 py-2 text-xs font-medium text-slate-400 uppercase w-28">Asset Tag</th>
                            <th className="text-left px-3 py-2 text-xs font-medium text-slate-400 uppercase w-40">Name</th>
                            <th className="text-left px-3 py-2 text-xs font-medium text-slate-400 uppercase w-24">Type</th>
                            <th className="text-left px-3 py-2 text-xs font-medium text-slate-400 uppercase w-24">Brand</th>
                            <th className="text-left px-3 py-2 text-xs font-medium text-slate-400 uppercase w-32">Model</th>
                            <th className="text-left px-3 py-2 text-xs font-medium text-slate-400 uppercase w-32">Serial No.</th>
                            <th className="text-left px-3 py-2 text-xs font-medium text-slate-400 uppercase w-24">Price</th>
                            <th className="text-left px-3 py-2 text-xs font-medium text-slate-400 uppercase w-24">Condition</th>
                            <th className="text-left px-3 py-2 text-xs font-medium text-slate-400 uppercase w-36">Assigned To</th>
                            <th className="text-left px-3 py-2 text-xs font-medium text-slate-400 uppercase w-24">Status</th>
                            <th className="text-left px-3 py-2 text-xs font-medium text-slate-400 uppercase w-12"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {/* Add New Row */}
                        {isAdding && (
                            <tr className="bg-blue-500/10">
                                <td className="px-3 py-2 text-xs text-slate-400">Auto-generated</td>
                                <td className="px-3 py-2">
                                    <input
                                        type="text"
                                        placeholder="Name *"
                                        className="w-full px-2 py-1 text-xs border border-white/20 rounded focus:border-blue-500 focus:outline-none"
                                        value={newAsset.name || ''}
                                        onChange={(e) => setNewAsset(prev => ({ ...prev, name: e.target.value }))}
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <select
                                        className="w-full px-2 py-1 text-xs border border-white/20 rounded focus:border-blue-500 focus:outline-none"
                                        value={newAsset.type || ''}
                                        onChange={(e) => setNewAsset(prev => ({ ...prev, type: e.target.value }))}
                                    >
                                        <option value="">Type *</option>
                                        {ASSET_TYPES.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-3 py-2">
                                    <select
                                        className="w-full px-2 py-1 text-xs border border-white/20 rounded focus:border-blue-500 focus:outline-none"
                                        value={newAsset.brand || ''}
                                        onChange={(e) => setNewAsset(prev => ({ ...prev, brand: e.target.value }))}
                                    >
                                        <option value="">Brand</option>
                                        {BRANDS.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-3 py-2">
                                    <input
                                        type="text"
                                        placeholder="Model"
                                        className="w-full px-2 py-1 text-xs border border-white/20 rounded focus:border-blue-500 focus:outline-none"
                                        value={newAsset.model || ''}
                                        onChange={(e) => setNewAsset(prev => ({ ...prev, model: e.target.value }))}
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <input
                                        type="text"
                                        placeholder="Serial"
                                        className="w-full px-2 py-1 text-xs border border-white/20 rounded focus:border-blue-500 focus:outline-none"
                                        value={newAsset.serialNumber || ''}
                                        onChange={(e) => setNewAsset(prev => ({ ...prev, serialNumber: e.target.value }))}
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <input
                                        type="number"
                                        placeholder="Price"
                                        className="w-full px-2 py-1 text-xs border border-white/20 rounded focus:border-blue-500 focus:outline-none"
                                        value={newAsset.purchasePrice || ''}
                                        onChange={(e) => setNewAsset(prev => ({ ...prev, purchasePrice: e.target.value ? parseFloat(e.target.value) : null }))}
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <select
                                        className="w-full px-2 py-1 text-xs border border-white/20 rounded focus:border-blue-500 focus:outline-none"
                                        value={newAsset.condition || 'GOOD'}
                                        onChange={(e) => setNewAsset(prev => ({ ...prev, condition: e.target.value }))}
                                    >
                                        {CONDITIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-3 py-2 text-xs text-slate-400">-</td>
                                <td className="px-3 py-2">
                                    <select
                                        className="w-full px-2 py-1 text-xs border border-white/20 rounded focus:border-blue-500 focus:outline-none"
                                        value={newAsset.status || 'AVAILABLE'}
                                        onChange={(e) => setNewAsset(prev => ({ ...prev, status: e.target.value }))}
                                    >
                                        {STATUSES.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-3 py-2">
                                    <div className="flex gap-1">
                                        <button
                                            onClick={handleAddAsset}
                                            className="p-1 text-green-400 hover:bg-green-500/10 rounded"
                                            title="Save"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsAdding(false)
                                                setNewAsset({ condition: 'GOOD', status: 'AVAILABLE' })
                                            }}
                                            className="p-1 text-slate-400 hover:bg-slate-800/50 rounded"
                                            title="Cancel"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}

                        {/* Existing Assets */}
                        {assets.map(asset => (
                            <tr key={asset.id} className="hover:bg-slate-900/40">
                                <td className="px-3 py-2">
                                    <span className="text-xs font-mono text-slate-300">{asset.assetTag}</span>
                                </td>
                                <td className="px-3 py-2">{renderCell(asset, 'name')}</td>
                                <td className="px-3 py-2">{renderCell(asset, 'type')}</td>
                                <td className="px-3 py-2">{renderCell(asset, 'brand')}</td>
                                <td className="px-3 py-2">{renderCell(asset, 'model')}</td>
                                <td className="px-3 py-2">{renderCell(asset, 'serialNumber')}</td>
                                <td className="px-3 py-2">{renderCell(asset, 'purchasePrice')}</td>
                                <td className="px-3 py-2">{renderCell(asset, 'condition')}</td>
                                <td className="px-3 py-2">
                                    <span className="text-xs text-slate-300">
                                        {asset.assignedTo
                                            ? `${asset.assignedTo.firstName} ${asset.assignedTo.lastName || ''}`
                                            : '-'}
                                    </span>
                                </td>
                                <td className="px-3 py-2">{renderCell(asset, 'status')}</td>
                                <td className="px-3 py-2">
                                    <button
                                        onClick={() => handleDelete(asset.id)}
                                        className="p-1 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded"
                                        title="Delete"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {assets.length === 0 && !isAdding && (
                            <tr>
                                <td colSpan={11} className="px-3 py-8 text-center text-slate-400">
                                    No assets registered yet. Click "Add Asset" to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

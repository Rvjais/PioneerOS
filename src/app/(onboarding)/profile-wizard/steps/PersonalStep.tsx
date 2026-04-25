'use client'

import { FileUpload } from '@/client/components/ui/FileUpload'

interface Props {
  data: {
    firstName: string
    lastName: string
    email: string
    phone: string
    dateOfBirth: string
    bloodGroup: string
    address: string
    emergencyContactName: string
    emergencyContactPhone: string
    profilePicture: string
  }
  onChange: (data: Partial<Props['data']>) => void
}

export function PersonalStep({ data, onChange }: Props) {
  return (
    <div className="space-y-6">
      {/* Profile Picture Upload - Mandatory */}
      <div className="flex flex-col items-center pb-6 border-b border-white/10">
        <label className="block text-sm font-medium text-slate-200 mb-4 text-center">
          Profile Picture <span className="text-red-500">*</span>
          <span className="block text-xs text-slate-400 font-normal mt-1">Upload your profile photo</span>
        </label>

        <FileUpload
          value={data.profilePicture}
          onChange={(url) => onChange({ profilePicture: url })}
          variant="avatar"
          folder="pioneer-os/profile-pictures"
          maxSizeMB={5}
          hint="JPG, PNG or WebP. Max 5MB."
        />

        {!data.profilePicture && (
          <p className="mt-3 text-xs text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-full">
            Profile photo is required to continue
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.firstName}
            onChange={(e) => onChange({ firstName: e.target.value })}
            className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Enter first name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Last Name
          </label>
          <input
            type="text"
            value={data.lastName}
            onChange={(e) => onChange({ lastName: e.target.value })}
            className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Enter last name"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
            className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Phone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-slate-900/40"
            placeholder="+91 XXXXXXXXXX"
            readOnly
          />
          <p className="mt-1 text-xs text-slate-400">Phone number cannot be changed</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={data.dateOfBirth ? data.dateOfBirth.split('T')[0] : ''}
            onChange={(e) => onChange({ dateOfBirth: e.target.value })}
            className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Blood Group <span className="text-red-500">*</span>
          </label>
          <select
            value={data.bloodGroup}
            onChange={(e) => onChange({ bloodGroup: e.target.value })}
            className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            required
          >
            <option value="">Select blood group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200 mb-2">
          Current Address <span className="text-red-500">*</span>
        </label>
        <textarea
          value={data.address}
          onChange={(e) => onChange({ address: e.target.value })}
          className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          rows={3}
          placeholder="Enter your current residential address"
          required
        />
      </div>

      <div className="border-t border-white/10 pt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Emergency Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Contact Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.emergencyContactName}
              onChange={(e) => onChange({ emergencyContactName: e.target.value })}
              className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Parent/Guardian name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Contact Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={data.emergencyContactPhone}
              onChange={(e) => onChange({ emergencyContactPhone: e.target.value })}
              className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="+91 XXXXXXXXXX"
              required
            />
          </div>
        </div>
      </div>
    </div>
  )
}
